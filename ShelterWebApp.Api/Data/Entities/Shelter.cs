namespace ShelterCoordinationSystem.Data.Entities
{
    public class Shelter
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string LegalAddress { get; set; } = string.Empty;
        public string ActualAddress { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public bool IsVerified { get; set; }
        public byte[]? RegistrationDocumentsData { get; set; }
        public string? RegistrationDocumentFileName { get; set; }
        public string? RegistrationDocumentContentType { get; set; }
        public DateTime CreatedAt { get; set; }

        public ICollection<NeedRequest> NeedRequests { get; set; } = new List<NeedRequest>();
    }
}
