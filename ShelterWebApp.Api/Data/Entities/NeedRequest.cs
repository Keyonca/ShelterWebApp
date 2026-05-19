namespace ShelterCoordinationSystem.Data.Entities
{
    public class NeedRequest
    {
        public int Id { get; set; }
        public int ShelterId { get; set; }
        public Shelter? Shelter { get; set; }
        public int CategoryId { get; set; }
        public NeedCategory? Category { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Quantity { get; set; } = string.Empty;
        public DateTime ExpiryDate { get; set; }
        public string Status { get; set; } = "Open";
        public int? VolunteerId { get; set; }
        public Volunteer? Volunteer { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public ICollection<HelpReport> HelpReports { get; set; } = new List<HelpReport>();
    }
}
