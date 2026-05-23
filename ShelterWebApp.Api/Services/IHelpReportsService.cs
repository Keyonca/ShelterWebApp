using ShelterCoordinationSystem.Dtos.Reports;

namespace ShelterCoordinationSystem.Services
{
    public interface IHelpReportsService
    {
        Task<bool> SubmitReportAsync(int volunteerId, SubmitReportDto dto);
        Task<IEnumerable<PendingReportDto>> GetPendingReportsForShelterAsync(int shelterId);
        Task<(byte[] Data, string ContentType)?> GetReportPhotoAsync(int reportId);
        Task<bool> ReviewReportAsync(int shelterId, int reportId, ReviewReportDto dto);
    }
}
