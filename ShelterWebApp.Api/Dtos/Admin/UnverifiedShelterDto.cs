namespace ShelterCoordinationSystem.Dtos.Admin
{
    public class UnverifiedShelterDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string LegalAddress { get; set; } = string.Empty;
        public string ActualAddress { get; set; } = string.Empty;
        public string? DocumentFileName { get; set; }
    }
}
