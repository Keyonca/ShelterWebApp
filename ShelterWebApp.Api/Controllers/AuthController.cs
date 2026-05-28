using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using ShelterCoordinationSystem.Dtos.Auth;
using ShelterCoordinationSystem.Services;

namespace ShelterCoordinationSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register/volunteer")]
        public async Task<IActionResult> RegisterVolunteer([FromBody] RegisterVolunteerDto dto)
        {
            await _authService.RegisterVolunteerAsync(dto);
            return Ok(new { Message = "Волонтер успешно зарегистрирован" });
        }

        [HttpPost("register/shelter")]
        public async Task<IActionResult> RegisterShelter([FromForm] RegisterShelterDto dto)
        {
            await _authService.RegisterShelterAsync(dto);
            return Ok(new { Message = "Приют успешно зарегистрирован и отправлен на модерацию" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var token = await _authService.LoginAsync(dto);
            if (string.IsNullOrEmpty(token))
            {
                return BadRequest(new { Message = "Не удалось сгенерировать токен" });
            }

            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(token);
            var role = jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role || c.Type == "role")?.Value ?? "Volunteer";

            return Ok(new { Token = token, Role = role });
        }

        [HttpPost("login/admin")]
        public async Task<IActionResult> AdminLogin([FromBody] AdminLoginDto dto)
        {
            var token = await _authService.AdminLoginAsync(dto);
            return Ok(new { Token = token, Role = "Admin" });
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetMe()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || string.IsNullOrEmpty(roleClaim))
            {
                return Unauthorized(new { Message = "Пользователь не авторизован" });
            }

            var profile = await _authService.GetProfileAsync(int.Parse(userIdClaim), roleClaim);
            if (profile == null)
            {
                return NotFound(new { Message = "Профиль не найден" });
            }

            return Ok(profile);
        }

        [HttpPut("profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || string.IsNullOrEmpty(roleClaim))
            {
                return Unauthorized(new { Message = "Пользователь не авторизован" });
            }

            var result = await _authService.UpdateProfileAsync(int.Parse(userIdClaim), roleClaim, dto);
            if (!result)
            {
                return BadRequest(new { Message = "Не удалось обновить профиль" });
            }

            return Ok(new { Message = "Профиль успешно обновлен" });
        }

        [HttpPost("profile/document")]
        [Authorize(Roles = "Shelter")]
        public async Task<IActionResult> UploadDocument([FromForm] IFormFile document)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized(new { Message = "Пользователь не авторизован" });
            }

            if (document == null || document.Length == 0)
            {
                return BadRequest(new { Message = "Пожалуйста, выберите файл для загрузки" });
            }

            int shelterId = int.Parse(userIdClaim);
            var result = await _authService.UploadShelterDocumentAsync(shelterId, document);
            if (!result)
            {
                return BadRequest(new { Message = "Не удалось загрузить документ" });
            }

            return Ok(new { Message = "Документы успешно отправлены на проверку" });
        }
    }
}
