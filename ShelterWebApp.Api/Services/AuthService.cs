using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ShelterCoordinationSystem.Data;
using ShelterCoordinationSystem.Data.Entities;
using ShelterCoordinationSystem.Dtos.Auth;

namespace ShelterCoordinationSystem.Services
{
    public interface IAuthService
    {
        string GenerateJwtToken(int userId, string email, string role);
        Task<bool> RegisterVolunteerAsync(RegisterVolunteerDto dto);
        Task<bool> RegisterShelterAsync(RegisterShelterDto dto);
        Task<string?> LoginAsync(LoginDto dto);
        Task<string?> AdminLoginAsync(AdminLoginDto dto);
        Task<object?> GetProfileAsync(int userId, string role);
        Task<bool> UpdateProfileAsync(int userId, string role, UpdateProfileDto dto);
        Task<bool> UploadShelterDocumentAsync(int shelterId, IFormFile document);
    }

    public class AuthService : IAuthService
    {
        private readonly IConfiguration _config;
        private readonly ApplicationDbContext _context;

        public AuthService(IConfiguration config, ApplicationDbContext context)
        {
            _config = config;
            _context = context;
        }

        public async Task<bool> RegisterVolunteerAsync(RegisterVolunteerDto dto)
        {
            if (await EmailExistsAsync(dto.Email))
            {
                throw new ArgumentException("Пользователь с таким Email уже зарегистрирован");
            }

            var volunteer = new Volunteer
            {
                Name = dto.Name,
                Email = dto.Email,
                PhoneNumber = dto.PhoneNumber,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Volunteers.Add(volunteer);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RegisterShelterAsync(RegisterShelterDto dto)
        {
            if (await EmailExistsAsync(dto.Email))
            {
                throw new ArgumentException("Пользователь с таким Email уже зарегистрирован");
            }

            byte[]? documentData = null;
            if (dto.Document != null)
            {
                using var ms = new MemoryStream();
                await dto.Document.CopyToAsync(ms);
                documentData = ms.ToArray();
            }

            var shelter = new Shelter
            {
                Name = dto.Name,
                LegalAddress = dto.LegalAddress,
                ActualAddress = dto.ActualAddress,
                PhoneNumber = dto.PhoneNumber,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                IsVerified = false,
                RegistrationDocumentsData = documentData,
                RegistrationDocumentFileName = dto.Document?.FileName,
                RegistrationDocumentContentType = dto.Document?.ContentType,
                CreatedAt = DateTime.UtcNow
            };

            _context.Shelters.Add(shelter);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<string?> LoginAsync(LoginDto dto)
        {
            var volunteer = await _context.Volunteers.FirstOrDefaultAsync(v => v.Email == dto.Email);
            if (volunteer != null && BCrypt.Net.BCrypt.Verify(dto.Password, volunteer.PasswordHash))
            {
                return GenerateJwtToken(volunteer.Id, volunteer.Email, "Volunteer");
            }

            var shelter = await _context.Shelters.FirstOrDefaultAsync(s => s.Email == dto.Email);
            if (shelter != null && BCrypt.Net.BCrypt.Verify(dto.Password, shelter.PasswordHash))
            {
                return GenerateJwtToken(shelter.Id, shelter.Email, "Shelter");
            }

            throw new ArgumentException("Неверный Email или пароль");
        }

        public async Task<string?> AdminLoginAsync(AdminLoginDto dto)
        {
            var admin = await _context.Admins.FirstOrDefaultAsync(a => a.Login == dto.Login);
            if (admin == null || !BCrypt.Net.BCrypt.Verify(dto.Password, admin.PasswordHash))
            {
                throw new ArgumentException("Неверный логин или пароль администратора");
            }

            return GenerateJwtToken(admin.Id, admin.Login, "Admin");
        }

        public string GenerateJwtToken(int userId, string email, string role)
        {
            var jwtSettings = _config.GetSection("JwtSettings");
            var secretKey = Encoding.ASCII.GetBytes(jwtSettings["SecretKey"]!);
            var tokenHandler = new JwtSecurityTokenHandler();
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                    new Claim(ClaimTypes.Email, email),
                    new Claim(ClaimTypes.Role, role)
                }),
                Expires = DateTime.UtcNow.AddMinutes(double.Parse(jwtSettings["ExpiryMinutes"]!)),
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(secretKey), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private async Task<bool> EmailExistsAsync(string email)
        {
            var emailLower = email.ToLower();
            return await _context.Volunteers.AnyAsync(v => v.Email.ToLower() == emailLower) ||
                   await _context.Shelters.AnyAsync(s => s.Email.ToLower() == emailLower);
        }

        public async Task<object?> GetProfileAsync(int userId, string role)
        {
            if (role == "Volunteer")
            {
                var v = await _context.Volunteers.FirstOrDefaultAsync(x => x.Id == userId);
                if (v == null) return null;

                var reqs = await _context.NeedRequests
                    .Include(r => r.Category)
                    .Include(r => r.Shelter)
                    .Include(r => r.HelpReports)
                    .Where(r => r.VolunteerId == userId)
                    .ToListAsync();

                var activeRequests = reqs.Select(r => {
                    var latestReport = r.HelpReports.OrderByDescending(x => x.CreatedAt).FirstOrDefault();
                    return new
                    {
                        Id = r.Id,
                        Category = r.Category != null ? r.Category.Name : string.Empty,
                        ShelterName = r.Shelter != null ? r.Shelter.Name : string.Empty,
                        ShelterPhone = r.Shelter != null ? r.Shelter.PhoneNumber : string.Empty,
                        ShelterAddress = r.Shelter != null ? r.Shelter.ActualAddress : string.Empty,
                        Status = r.Status,
                        Date = r.UpdatedAt.ToString("dd.MM.yyyy"),
                        RejectionReason = latestReport?.RejectionReason
                    };
                }).ToList();

                return new
                {
                    Name = v.Name,
                    Email = v.Email,
                    Phone = v.PhoneNumber,
                    IsActive = v.IsActive,
                    TotalHelped = v.TotalHelped,
                    ActiveRequests = activeRequests
                };
            }
            else if (role == "Shelter")
            {
                var s = await _context.Shelters.FirstOrDefaultAsync(x => x.Id == userId);
                if (s == null) return null;
                return new
                {
                    Name = s.Name,
                    LegalAddress = s.LegalAddress,
                    PhysicalAddress = s.ActualAddress,
                    Phone = s.PhoneNumber,
                    Email = s.Email,
                    IsVerified = s.IsVerified,
                    HasDocument = s.RegistrationDocumentFileName != null
                };
            }
            else if (role == "Admin")
            {
                var a = await _context.Admins.FirstOrDefaultAsync(x => x.Id == userId);
                if (a == null) return null;
                return new
                {
                    Name = a.Name,
                    Email = a.Login
                };
            }
            return null;
        }

        public async Task<bool> UpdateProfileAsync(int userId, string role, UpdateProfileDto dto)
        {
            if (role == "Volunteer")
            {
                var v = await _context.Volunteers.FirstOrDefaultAsync(x => x.Id == userId);
                if (v == null) return false;
                v.Name = dto.Name;
                v.PhoneNumber = dto.Phone ?? string.Empty;
                v.Email = dto.Email;
                
                if (!string.IsNullOrEmpty(dto.Password))
                {
                    v.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
                }
                
                await _context.SaveChangesAsync();
                return true;
            }
            else if (role == "Shelter")
            {
                var s = await _context.Shelters.FirstOrDefaultAsync(x => x.Id == userId);
                if (s == null) return false;
                s.Name = dto.Name;
                s.LegalAddress = dto.LegalAddress ?? string.Empty;
                s.ActualAddress = dto.PhysicalAddress ?? string.Empty;
                s.PhoneNumber = dto.Phone ?? string.Empty;
                s.Email = dto.Email;
                
                if (!string.IsNullOrEmpty(dto.Password))
                {
                    s.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
                }
                
                await _context.SaveChangesAsync();
                return true;
            }
            return false;
        }

        public async Task<bool> UploadShelterDocumentAsync(int shelterId, IFormFile document)
        {
            var shelter = await _context.Shelters.FirstOrDefaultAsync(s => s.Id == shelterId);
            if (shelter == null) return false;

            using var ms = new MemoryStream();
            await document.CopyToAsync(ms);
            
            shelter.RegistrationDocumentsData = ms.ToArray();
            shelter.RegistrationDocumentFileName = document.FileName;
            shelter.RegistrationDocumentContentType = document.ContentType;
            
            shelter.IsVerified = false;

            await _context.SaveChangesAsync();
            return true;
        }
    }
}