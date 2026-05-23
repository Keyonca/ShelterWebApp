namespace ShelterCoordinationSystem.Dtos.Reports
{
    public class SubmitReportDto
    {
        public int NeedRequestId { get; set; }
        public IFormFile? Photo { get; set; }
        public string? Comment { get; set; }
    }
}

