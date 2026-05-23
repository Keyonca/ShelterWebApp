namespace ShelterCoordinationSystem.Dtos.Reports
{
    public class PendingReportDto
    {
        public int Id { get; set; }
        public int NeedRequestId { get; set; }
        public string RequestTitle { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public string VolunteerName { get; set; } = string.Empty;
        public string? Comment { get; set; }
        public string CreatedAt { get; set; } = string.Empty;
    }
}
