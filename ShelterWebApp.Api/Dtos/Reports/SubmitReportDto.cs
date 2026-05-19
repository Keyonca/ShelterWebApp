namespace ShelterCoordinationSystem.Dtos.Reports
{
    public class SubmitReportDto
    {
        public IFormFile? Photo { get; set; }
        public string? Comment { get; set; }
    }
}
