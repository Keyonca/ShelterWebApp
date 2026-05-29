using System.ComponentModel.DataAnnotations;

namespace ShelterCoordinationSystem.Data.Entities
{
    public class Volunteer
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public int TotalHelped { get; set; }
        public bool IsActive { get; set; }
        public byte[]? AvatarData { get; set; }
        public string? AvatarContentType { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation properties
        public ICollection<NeedRequest> NeedRequests { get; set; } = new List<NeedRequest>();
        public ICollection<HelpReport> HelpReports { get; set; } = new List<HelpReport>();
    }
}