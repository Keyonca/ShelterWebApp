using System.ComponentModel.DataAnnotations;

namespace ShelterCoordinationSystem.Dtos.Auth
{
    public class AdminLoginDto
    {
        [Required]
        public string Login { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }
}