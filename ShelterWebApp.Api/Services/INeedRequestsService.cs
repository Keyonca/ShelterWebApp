using ShelterCoordinationSystem.Dtos.NeedRequests;

namespace ShelterCoordinationSystem.Services
{
    public interface INeedRequestsService
    {
        Task<IEnumerable<NeedCategoryDto>> GetCategoriesAsync();
        Task<IEnumerable<NeedRequestResponseDto>> GetAllAsync(int? categoryId, string? status);
        Task<NeedRequestResponseDto?> GetByIdAsync(int id);
        Task<NeedRequestResponseDto> CreateAsync(CreateNeedRequestDto dto, int shelterId);
        Task<NeedRequestResponseDto> UpdateAsync(int id, UpdateNeedRequestDto dto, int shelterId);
        Task<bool> DeleteAsync(int id, int shelterId);
        Task<bool> TakeRequestAsync(int id, int volunteerId);
        Task<bool> CloseRequestAsync(int id, int shelterId);
        Task<DashboardStatsDto> GetDashboardStatsAsync();
    }
}
