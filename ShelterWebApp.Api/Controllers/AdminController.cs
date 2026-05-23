using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShelterCoordinationSystem.Dtos.Admin;
using ShelterCoordinationSystem.Services;

namespace ShelterCoordinationSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        [HttpGet("unverified-shelters")]
        public async Task<IActionResult> GetUnverifiedShelters()
        {
            var shelters = await _adminService.GetUnverifiedSheltersAsync();
            return Ok(shelters);
        }

        [HttpGet("shelters/{id}/document")]
        public async Task<IActionResult> GetShelterDocument(int id)
        {
            var doc = await _adminService.GetShelterDocumentAsync(id);
            if (doc == null)
            {
                return NotFound(new { Message = "Документы приюта не найдены" });
            }

            return File(doc.Value.Data, doc.Value.ContentType, doc.Value.FileName);
        }

        [HttpPost("shelters/{id}/verify")]
        public async Task<IActionResult> VerifyShelter(int id, [FromBody] VerifyShelterDto dto)
        {
            var success = await _adminService.VerifyShelterAsync(id, dto.Approve);
            if (!success)
            {
                return NotFound(new { Message = "Приют не найден" });
            }

            return Ok(new { Message = dto.Approve ? "Приют верифицирован" : "Приют отклонен, документы удалены" });
        }
    }
}
