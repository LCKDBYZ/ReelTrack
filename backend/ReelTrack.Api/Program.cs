using Microsoft.EntityFrameworkCore;
using ReelTrack.Api.Data;
using ReelTrack.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddControllers();

builder.Services.AddCors(options => {
    options.AddPolicy("Frontend", policy => {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddHttpClient<TmdbService>(client => {
    client.BaseAddress = new Uri("https://api.themoviedb.org/3/");
});

// Register the database context
builder.Services.AddDbContext<ReelTrackContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")
    )
);

var app = builder.Build();
// Apply pending database migrations in production
if (!app.Environment.IsDevelopment()) {
    using var scope = app.Services.CreateScope();

    var dbContext = scope.ServiceProvider
        .GetRequiredService<ReelTrackContext>();

    dbContext.Database.Migrate();
}
app.UseCors("Frontend");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment()) {
    app.MapOpenApi();
}

if (app.Environment.IsDevelopment()) {
    app.UseHttpsRedirection();
}

app.MapControllers();
app.Run();
