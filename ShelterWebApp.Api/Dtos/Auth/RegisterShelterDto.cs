using System.ComponentModel.DataAnnotations;

namespace ShelterCoordinationSystem.Dtos.Auth
{
    public class RegisterShelterDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string LegalAddress { get; set; } = string.Empty;

        [Required]
        public string ActualAddress { get; set; } = string.Empty;

        [Required, Phone]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required, MinLength(6)]
        public string Password { get; set; } = string.Empty;

        public IFormFile? Document { get; set; }
    }
}
