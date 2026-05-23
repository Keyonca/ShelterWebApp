using ShelterCoordinationSystem.Dtos.Admin;

namespace ShelterCoordinationSystem.Services
{
    public interface IAdminService
    {
        Task<IEnumerable<UnverifiedShelterDto>> GetUnverifiedSheltersAsync();
        Task<(byte[] Data, string ContentType, string FileName)?> GetShelterDocumentAsync(int shelterId);
        Task<bool> VerifyShelterAsync(int shelterId, bool approve);
    }
}
