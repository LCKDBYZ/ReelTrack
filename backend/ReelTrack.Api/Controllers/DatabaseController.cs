
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.IO.Compression;
using System.Security.Cryptography;

namespace ReelTrack.Api.Controllers {
    [ApiController]
    [Route("api/[controller]")]
    public class DatabaseController : ControllerBase {
        private readonly IConfiguration configuration;
        private readonly IWebHostEnvironment environment;

        public DatabaseController(
            IConfiguration configuration,
            IWebHostEnvironment environment
        ) {
            this.configuration = configuration;
            this.environment = environment;
        }

        private string GetKeyDirectory() {
            return Path.Combine(environment.ContentRootPath, ".keys");
        }

        private void EnsureBackupKeys() {
            var keyDirectory = GetKeyDirectory();

            Directory.CreateDirectory(keyDirectory);

            var privateKeyPath = Path.Combine(
                keyDirectory,
                "backup-private.pem"
            );

            var publicKeyPath = Path.Combine(
                keyDirectory,
                "backup-public.pem"
            );

            var privateKeyExists = System.IO.File.Exists(privateKeyPath);
            var publicKeyExists = System.IO.File.Exists(publicKeyPath);

            if (!privateKeyExists && !publicKeyExists) {
                using var rsa = RSA.Create();
                rsa.KeySize = 3072;

                System.IO.File.WriteAllText(
                    privateKeyPath,
                    rsa.ExportPkcs8PrivateKeyPem()
                );

                System.IO.File.WriteAllText(
                    publicKeyPath,
                    rsa.ExportSubjectPublicKeyInfoPem()
                );

                return;
            }

            if (!privateKeyExists || !publicKeyExists) {
                throw new InvalidOperationException(
                    "Backup signing key files are incomplete."
                );
            }
        }

        // Export the complete PostgreSQL database as a signed ZIP backup

        [HttpGet("backup")]
        public async Task<IActionResult> Backup() {
            var connectionString =
                configuration.GetConnectionString("DefaultConnection");

            if (string.IsNullOrWhiteSpace(connectionString)) {
                return StatusCode(
                    500,
                    "Database connection string is missing."
                );
            }

            var connection =
                new Npgsql.NpgsqlConnectionStringBuilder(connectionString);

            if (
                string.IsNullOrWhiteSpace(connection.Username) ||
                string.IsNullOrWhiteSpace(connection.Database)
            ) {
                return BadRequest(
                    "Database username or name is missing."
                );
            }

            EnsureBackupKeys();


            ProcessStartInfo startInfo;

            if (environment.IsDevelopment()) {
                // Use Docker CLI during local development
                startInfo = new ProcessStartInfo {
                    FileName = "docker",
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                startInfo.ArgumentList.Add("exec");
                startInfo.ArgumentList.Add("-e");
                startInfo.ArgumentList.Add($"PGPASSWORD={connection.Password}");
                startInfo.ArgumentList.Add("reeltrack-postgres-1");
                startInfo.ArgumentList.Add("pg_dump");
            }
            else {
                // Connect directly to PostgreSQL inside Docker
                startInfo = new ProcessStartInfo {
                    FileName = "pg_dump",
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                startInfo.Environment["PGPASSWORD"] = connection.Password;
            }

            startInfo.ArgumentList.Add("-U");
            startInfo.ArgumentList.Add(connection.Username);
            startInfo.ArgumentList.Add("-d");
            startInfo.ArgumentList.Add(connection.Database);
            startInfo.ArgumentList.Add("--no-owner");
            startInfo.ArgumentList.Add("--no-acl");
            startInfo.ArgumentList.Add("--clean");
            startInfo.ArgumentList.Add("--if-exists");

            if (!environment.IsDevelopment()) {
                startInfo.ArgumentList.Add("-h");
                startInfo.ArgumentList.Add(connection.Host ?? "postgres");
                startInfo.ArgumentList.Add("-p");
                startInfo.ArgumentList.Add(connection.Port.ToString());
            }


            using var process = new Process {
                StartInfo = startInfo
            };

            process.Start();

            using var memoryStream = new MemoryStream();

            var outputTask =
                process.StandardOutput.BaseStream.CopyToAsync(memoryStream);

            var errorTask = process.StandardError.ReadToEndAsync();

            await Task.WhenAll(outputTask, errorTask);
            await process.WaitForExitAsync();

            if (process.ExitCode != 0) {
                return StatusCode(500, errorTask.Result);
            }

            var sqlBytes = memoryStream.ToArray();

            var privateKeyPath = Path.Combine(
                GetKeyDirectory(),
                "backup-private.pem"
            );

            byte[] signature;

            using (var rsa = RSA.Create()) {
                rsa.ImportFromPem(
                    System.IO.File.ReadAllText(privateKeyPath)
                );

                signature = rsa.SignData(
                    sqlBytes,
                    HashAlgorithmName.SHA256,
                    RSASignaturePadding.Pss
                );
            }

            using var zipStream = new MemoryStream();

            using (var archive = new ZipArchive(
                zipStream,
                ZipArchiveMode.Create,
                true
            )) {
                var sqlEntry = archive.CreateEntry(
                    "backup.sql",
                    CompressionLevel.Optimal
                );

                await using (var entryStream = sqlEntry.Open()) {
                    await entryStream.WriteAsync(sqlBytes);
                }

                var signatureEntry = archive.CreateEntry(
                    "backup.sig",
                    CompressionLevel.Optimal
                );

                await using (var entryStream = signatureEntry.Open()) {
                    await entryStream.WriteAsync(signature);
                }
            }

            return File(
                zipStream.ToArray(),
                "application/zip",
                $"reeltrack-database-backup-{DateTime.UtcNow:yyyyMMdd-HHmmss}.zip"
            );
        }

        // Restore the database from a signed ZIP backup

        [HttpPost("restore")]
        public async Task<IActionResult> Restore(
            [FromForm] IFormFile? file
        ) {
            if (file == null || file.Length == 0) {
                return BadRequest("Please select a backup file.");
            }

            if (!Path.GetExtension(file.FileName).Equals(
                ".zip",
                StringComparison.OrdinalIgnoreCase
            )) {
                return BadRequest(
                    "Only ZIP backup files are supported."
                );
            }

            byte[] sqlBytes;
            byte[] signature;

            try {
                using var inputStream = file.OpenReadStream();

                using var archive = new ZipArchive(
                    inputStream,
                    ZipArchiveMode.Read
                );

                if (archive.Entries.Count != 2) {
                    return BadRequest(
                        "Invalid backup archive contents."
                    );
                }

                var sqlEntry = archive.GetEntry("backup.sql");
                var signatureEntry = archive.GetEntry("backup.sig");

                if (sqlEntry == null || signatureEntry == null) {
                    return BadRequest(
                        "The backup archive is missing required files."
                    );
                }

                if (sqlEntry.Length == 0 || signatureEntry.Length == 0) {
                    return BadRequest(
                        "The backup archive contains an empty file."
                    );
                }

                await using (var sqlStream = sqlEntry.Open()) {
                    using var memoryStream = new MemoryStream();

                    await sqlStream.CopyToAsync(memoryStream);
                    sqlBytes = memoryStream.ToArray();
                }

                await using (var signatureStream = signatureEntry.Open()) {
                    using var memoryStream = new MemoryStream();

                    await signatureStream.CopyToAsync(memoryStream);
                    signature = memoryStream.ToArray();
                }
            }
            catch (InvalidDataException) {
                return BadRequest("The ZIP backup file is invalid.");
            }

            EnsureBackupKeys();

            var publicKeyPath = Path.Combine(
                GetKeyDirectory(),
                "backup-public.pem"
            );

            bool isValid;

            using (var rsa = RSA.Create()) {
                rsa.ImportFromPem(
                    System.IO.File.ReadAllText(publicKeyPath)
                );

                isValid = rsa.VerifyData(
                    sqlBytes,
                    signature,
                    HashAlgorithmName.SHA256,
                    RSASignaturePadding.Pss
                );
            }

            if (!isValid) {
                return BadRequest(
                    "Backup verification failed. The file may have been modified or was not created by this ReelTrack installation."
                );
            }

            var connectionString =
                configuration.GetConnectionString("DefaultConnection");

            if (string.IsNullOrWhiteSpace(connectionString)) {
                return StatusCode(
                    500,
                    "Database connection string is missing."
                );
            }

            var connection =
                new Npgsql.NpgsqlConnectionStringBuilder(connectionString);

            if (
                string.IsNullOrWhiteSpace(connection.Username) ||
                string.IsNullOrWhiteSpace(connection.Database)
            ) {
                return BadRequest(
                    "Database username or name is missing."
                );
            }


            ProcessStartInfo startInfo;

            if (environment.IsDevelopment()) {
                // Use Docker CLI during local development
                startInfo = new ProcessStartInfo {
                    FileName = "docker",
                    RedirectStandardInput = true,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                startInfo.ArgumentList.Add("exec");
                startInfo.ArgumentList.Add("-i");
                startInfo.ArgumentList.Add("-e");
                startInfo.ArgumentList.Add($"PGPASSWORD={connection.Password}");
                startInfo.ArgumentList.Add("reeltrack-postgres-1");
                startInfo.ArgumentList.Add("psql");
            }
            else {
                // Connect directly to PostgreSQL inside Docker
                startInfo = new ProcessStartInfo {
                    FileName = "psql",
                    RedirectStandardInput = true,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                startInfo.Environment["PGPASSWORD"] = connection.Password;

                startInfo.ArgumentList.Add("-h");
                startInfo.ArgumentList.Add(connection.Host ?? "postgres");
                startInfo.ArgumentList.Add("-p");
                startInfo.ArgumentList.Add(connection.Port.ToString());
            }

            startInfo.ArgumentList.Add("-U");
            startInfo.ArgumentList.Add(connection.Username);
            startInfo.ArgumentList.Add("-d");
            startInfo.ArgumentList.Add(connection.Database);
            startInfo.ArgumentList.Add("--set");
            startInfo.ArgumentList.Add("ON_ERROR_STOP=1");
            startInfo.ArgumentList.Add("--single-transaction");


            using var process = new Process {
                StartInfo = startInfo
            };

            process.Start();

            var outputTask = process.StandardOutput.ReadToEndAsync();
            var errorTask = process.StandardError.ReadToEndAsync();

            await process.StandardInput.BaseStream.WriteAsync(sqlBytes);

            await process.StandardInput.FlushAsync();

            process.StandardInput.Close();

            process.StandardInput.Close();

            await Task.WhenAll(outputTask, errorTask);
            await process.WaitForExitAsync();

            if (process.ExitCode != 0) {
                return StatusCode(500, new {
                    Message = "Database restore failed.",
                    Error = errorTask.Result
                });
            }

            return Ok(new {
                Message = "Database restored successfully."
            });
        }
    }
}
