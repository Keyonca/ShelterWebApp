using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ShelterCoordinationSystem.Data;
using ShelterCoordinationSystem.Data.Entities;
using ShelterCoordinationSystem.Services;
using ShelterCoordinationSystem.Middleware;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// PostgreSQL
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// JWT
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = Encoding.ASCII.GetBytes(jwtSettings["SecretKey"]!);
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(secretKey),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<INeedRequestsService, NeedRequestsService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<IHelpReportsService, HelpReportsService>();

var app = builder.Build();

app.UseMiddleware<GlobalExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapFallbackToFile("index.html");

// Seed database
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    dbContext.Database.Migrate();

    Console.WriteLine("====== [DIAGNOSTIC] SHELTERS IN DATABASE ======");
    foreach (var s in dbContext.Shelters.ToList())
    {
        Console.WriteLine($"[DIAGNOSTIC] ID: {s.Id} | Email: {s.Email} | Name: '{s.Name}' | Legal: '{s.LegalAddress}' | Actual: '{s.ActualAddress}' | Phone: '{s.PhoneNumber}'");
    }
    Console.WriteLine("===============================================");

    if (!dbContext.NeedCategories.Any())
    {
        dbContext.NeedCategories.AddRange(
            new NeedCategory { Name = "Корм" },
            new NeedCategory { Name = "Медикаменты" },
            new NeedCategory { Name = "Хозтовары" },
            new NeedCategory { Name = "Транспорт" },
            new NeedCategory { Name = "Руки/Выгул" }
        );
    }

    if (!dbContext.Admins.Any())
    {
        dbContext.Admins.Add(new Admin
        {
            Login = "admin",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123"),
            Name = "Главный администратор"
        });
    }

    dbContext.SaveChanges();
}

app.Run();
