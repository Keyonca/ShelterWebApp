namespace ShelterCoordinationSystem.Data.Entities
{
    public class HelpReport
    {
        public int Id { get; set; }
        public int NeedRequestId { get; set; }
        public NeedRequest? NeedRequest { get; set; }
        public int VolunteerId { get; set; }
        public Volunteer? Volunteer { get; set; }
        public byte[]? PhotoData { get; set; }   // BYTEA
        public string? Comment { get; set; }
        public string Status { get; set; } = "Pending";
        public string? RejectionReason { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}