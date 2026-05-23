using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using ShelterCoordinationSystem.Dtos.Reports;
using ShelterCoordinationSystem.Services;

namespace ShelterCoordinationSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HelpReportsController : ControllerBase
    {
        private readonly IHelpReportsService _reportsService;

        public HelpReportsController(IHelpReportsService reportsService)
        {
            _reportsService = reportsService;
        }

        [HttpPost("submit")]
        [Authorize(Roles = "Volunteer")]
        public async Task<IActionResult> SubmitReport([FromForm] SubmitReportDto dto)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr))
            {
                return Unauthorized(new { Message = "Пользователь не авторизован" });
            }

            int volunteerId = int.Parse(userIdStr);
            try
            {
                await _reportsService.SubmitReportAsync(volunteerId, dto);
                return Ok(new { Message = "Отчёт успешно отправлен на проверку" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpGet("pending")]
        [Authorize(Roles = "Shelter")]
        public async Task<IActionResult> GetPendingReports()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr))
            {
                return Unauthorized(new { Message = "Пользователь не авторизован" });
            }

            int shelterId = int.Parse(userIdStr);
            var reports = await _reportsService.GetPendingReportsForShelterAsync(shelterId);
            return Ok(reports);
        }

        [HttpGet("{id}/photo")]
        [Authorize]
        public async Task<IActionResult> GetReportPhoto(int id)
        {
            var photo = await _reportsService.GetReportPhotoAsync(id);
            if (photo == null)
            {
                return NotFound(new { Message = "Фотография отчета не найдена" });
            }

            return File(photo.Value.Data, photo.Value.ContentType);
        }

        [HttpPost("{id}/verify")]
        [Authorize(Roles = "Shelter")]
        public async Task<IActionResult> VerifyReport(int id, [FromBody] ReviewReportDto dto)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr))
            {
                return Unauthorized(new { Message = "Пользователь не авторизован" });
            }

            int shelterId = int.Parse(userIdStr);
            try
            {
                await _reportsService.ReviewReportAsync(shelterId, id, dto);
                return Ok(new { Message = dto.Approved ? "Отчёт успешно принят, заявка закрыта" : "Отчет отклонен, отправлен на доработку волонтеру" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
    }
}
