namespace ShelterCoordinationSystem.Dtos.Auth
{
    public class UpdateProfileDto
    {
        public string Name { get; set; } = string.Empty;
        public string? LegalAddress { get; set; }
        public string? PhysicalAddress { get; set; }
        public string? Phone { get; set; }
        public string Email { get; set; } = string.Empty;
    }
}
