using Microsoft.EntityFrameworkCore;
using ShelterCoordinationSystem.Data;
using ShelterCoordinationSystem.Data.Entities;
using ShelterCoordinationSystem.Dtos.Reports;

namespace ShelterCoordinationSystem.Services
{
    public class HelpReportsService : IHelpReportsService
    {
        private readonly ApplicationDbContext _context;

        public HelpReportsService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> SubmitReportAsync(int volunteerId, SubmitReportDto dto)
        {
            var request = await _context.NeedRequests.FirstOrDefaultAsync(r => r.Id == dto.NeedRequestId);
            if (request == null)
            {
                throw new KeyNotFoundException("Заявка не найдена");
            }

            if (request.VolunteerId != volunteerId)
            {
                throw new ArgumentException("Эта заявка забронирована другим волонтером");
            }

            if (request.Status != "InProgress" && request.Status != "OnVerification")
            {
                throw new ArgumentException("Заявка должна быть в работе, чтобы по ней можно было отправить отчет");
            }

            if (dto.Photo == null || dto.Photo.Length == 0)
            {
                throw new ArgumentException("Пожалуйста, загрузите фотографию для отчета");
            }

            byte[] photoData;
            using (var ms = new MemoryStream())
            {
                await dto.Photo.CopyToAsync(ms);
                photoData = ms.ToArray();
            }

            // Создаем новый отчет
            var report = new HelpReport
            {
                NeedRequestId = dto.NeedRequestId,
                VolunteerId = volunteerId,
                PhotoData = photoData,
                Comment = dto.Comment,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            _context.HelpReports.Add(report);

            // Переводим заявку в статус "На проверке"
            request.Status = "OnVerification";
            request.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<PendingReportDto>> GetPendingReportsForShelterAsync(int shelterId)
        {
            return await _context.HelpReports
                .Include(r => r.NeedRequest)
                .ThenInclude(nr => nr!.Category)
                .Include(r => r.Volunteer)
                .Where(r => r.NeedRequest != null && r.NeedRequest.ShelterId == shelterId && r.Status == "Pending")
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new PendingReportDto
                {
                    Id = r.Id,
                    NeedRequestId = r.NeedRequestId,
                    RequestTitle = r.NeedRequest!.Title,
                    CategoryName = r.NeedRequest.Category != null ? r.NeedRequest.Category.Name : string.Empty,
                    VolunteerName = r.Volunteer != null ? r.Volunteer.Name : "Волонтер",
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt.ToString("dd.MM.yyyy HH:mm")
                })
                .ToListAsync();
        }

        public async Task<(byte[] Data, string ContentType)?> GetReportPhotoAsync(int reportId)
        {
            var report = await _context.HelpReports.FindAsync(reportId);
            if (report == null || report.PhotoData == null)
            {
                return null;
            }

            // По умолчанию отдаем как JPEG
            return (report.PhotoData, "image/jpeg");
        }

        public async Task<bool> ReviewReportAsync(int shelterId, int reportId, ReviewReportDto dto)
        {
            var report = await _context.HelpReports
                .Include(r => r.NeedRequest)
                .Include(r => r.Volunteer)
                .FirstOrDefaultAsync(r => r.Id == reportId);

            if (report == null || report.NeedRequest == null)
            {
                throw new KeyNotFoundException("Отчет не найден");
            }

            if (report.NeedRequest.ShelterId != shelterId)
            {
                throw new ArgumentException("У вас нет прав на проверку этого отчета");
            }

            if (dto.Approved)
            {
                report.Status = "Approved";
                report.NeedRequest.Status = "Closed";
                report.NeedRequest.UpdatedAt = DateTime.UtcNow;

                // Увеличиваем счетчик добрых дел у волонтера
                if (report.Volunteer != null)
                {
                    report.Volunteer.TotalHelped += 1;
                }
            }
            else
            {
                if (string.IsNullOrWhiteSpace(dto.RejectionReason))
                {
                    throw new ArgumentException("При отклонении отчета необходимо указать причину");
                }

                report.Status = "Rejected";
                report.RejectionReason = dto.RejectionReason;
                
                // Возвращаем заявку волонтеру в работу
                report.NeedRequest.Status = "InProgress";
                report.NeedRequest.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
