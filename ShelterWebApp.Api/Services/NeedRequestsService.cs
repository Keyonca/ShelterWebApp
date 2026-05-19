using Microsoft.EntityFrameworkCore;
using ShelterCoordinationSystem.Data;
using ShelterCoordinationSystem.Data.Entities;
using ShelterCoordinationSystem.Dtos.NeedRequests;

namespace ShelterCoordinationSystem.Services
{
    public class NeedRequestsService : INeedRequestsService
    {
        private readonly ApplicationDbContext _context;

        public NeedRequestsService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<NeedCategoryDto>> GetCategoriesAsync()
        {
            return await _context.NeedCategories
                .Select(c => new NeedCategoryDto
                {
                    Id = c.Id,
                    Name = c.Name
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<NeedRequestResponseDto>> GetAllAsync(int? categoryId, string? status)
        {
            var query = _context.NeedRequests
                .Include(r => r.Shelter)
                .Include(r => r.Category)
                .Include(r => r.Volunteer)
                .AsQueryable();

            if (categoryId.HasValue)
            {
                query = query.Where(r => r.CategoryId == categoryId.Value);
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(r => r.Status == status);
            }

            return await query
                .Select(r => new NeedRequestResponseDto
                {
                    Id = r.Id,
                    ShelterName = r.Shelter != null ? r.Shelter.Name : string.Empty,
                    CategoryName = r.Category != null ? r.Category.Name : string.Empty,
                    Title = r.Title,
                    Description = r.Description,
                    Quantity = r.Quantity,
                    ExpiryDate = r.ExpiryDate,
                    Status = r.Status,
                    VolunteerName = r.Volunteer != null ? r.Volunteer.Name : null
                })
                .ToListAsync();
        }

        public async Task<NeedRequestResponseDto?> GetByIdAsync(int id)
        {
            var r = await _context.NeedRequests
                .Include(r => r.Shelter)
                .Include(r => r.Category)
                .Include(r => r.Volunteer)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (r == null) return null;

            return new NeedRequestResponseDto
            {
                Id = r.Id,
                ShelterName = r.Shelter != null ? r.Shelter.Name : string.Empty,
                CategoryName = r.Category != null ? r.Category.Name : string.Empty,
                Title = r.Title,
                Description = r.Description,
                Quantity = r.Quantity,
                ExpiryDate = r.ExpiryDate,
                Status = r.Status,
                VolunteerName = r.Volunteer != null ? r.Volunteer.Name : null
            };
        }

        public async Task<NeedRequestResponseDto> CreateAsync(CreateNeedRequestDto dto, int shelterId)
        {
            var request = new NeedRequest
            {
                ShelterId = shelterId,
                CategoryId = dto.CategoryId,
                Title = dto.Title,
                Description = dto.Description,
                Quantity = dto.Quantity,
                ExpiryDate = dto.ExpiryDate.Kind == DateTimeKind.Unspecified 
                    ? DateTime.SpecifyKind(dto.ExpiryDate, DateTimeKind.Utc) 
                    : dto.ExpiryDate.ToUniversalTime(),
                Status = "Open",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.NeedRequests.Add(request);
            await _context.SaveChangesAsync();

            var created = await _context.NeedRequests
                .Include(r => r.Shelter)
                .Include(r => r.Category)
                .FirstOrDefaultAsync(r => r.Id == request.Id);

            return new NeedRequestResponseDto
            {
                Id = request.Id,
                ShelterName = created?.Shelter?.Name ?? string.Empty,
                CategoryName = created?.Category?.Name ?? string.Empty,
                Title = request.Title,
                Description = request.Description,
                Quantity = request.Quantity,
                ExpiryDate = request.ExpiryDate,
                Status = request.Status
            };
        }

        public async Task<NeedRequestResponseDto> UpdateAsync(int id, UpdateNeedRequestDto dto, int shelterId)
        {
            var request = await _context.NeedRequests
                .FirstOrDefaultAsync(r => r.Id == id && r.ShelterId == shelterId);

            if (request == null)
            {
                throw new KeyNotFoundException("Заявка не найдена или у вас нет прав на её изменение");
            }

            request.Title = dto.Title;
            request.Description = dto.Description;
            request.Quantity = dto.Quantity;
            request.ExpiryDate = dto.ExpiryDate.Kind == DateTimeKind.Unspecified
                ? DateTime.SpecifyKind(dto.ExpiryDate, DateTimeKind.Utc)
                : dto.ExpiryDate.ToUniversalTime();
            request.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var updated = await _context.NeedRequests
                .Include(r => r.Shelter)
                .Include(r => r.Category)
                .FirstOrDefaultAsync(r => r.Id == request.Id);

            return new NeedRequestResponseDto
            {
                Id = request.Id,
                ShelterName = updated?.Shelter?.Name ?? string.Empty,
                CategoryName = updated?.Category?.Name ?? string.Empty,
                Title = request.Title,
                Description = request.Description,
                Quantity = request.Quantity,
                ExpiryDate = request.ExpiryDate,
                Status = request.Status
            };
        }

        public async Task<bool> DeleteAsync(int id, int shelterId)
        {
            var request = await _context.NeedRequests
                .FirstOrDefaultAsync(r => r.Id == id && r.ShelterId == shelterId);

            if (request == null)
            {
                return false;
            }

            _context.NeedRequests.Remove(request);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> TakeRequestAsync(int id, int volunteerId)
        {
            var request = await _context.NeedRequests.FirstOrDefaultAsync(r => r.Id == id);
            if (request == null)
            {
                throw new KeyNotFoundException("Заявка не найдена");
            }

            if (request.Status != "Open")
            {
                throw new ArgumentException("Заявка уже взята в работу или закрыта");
            }

            request.VolunteerId = volunteerId;
            request.Status = "InProgress";
            request.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> CloseRequestAsync(int id, int shelterId)
        {
            var request = await _context.NeedRequests
                .FirstOrDefaultAsync(r => r.Id == id && r.ShelterId == shelterId);

            if (request == null)
            {
                throw new KeyNotFoundException("Заявка не найдена или у вас нет прав на её изменение");
            }

            request.Status = "Closed";
            request.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
