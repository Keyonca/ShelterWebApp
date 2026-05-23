using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using ShelterCoordinationSystem.Dtos.NeedRequests;
using ShelterCoordinationSystem.Services;

namespace ShelterCoordinationSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NeedRequestsController : ControllerBase
    {
        private readonly INeedRequestsService _needRequestsService;

        public NeedRequestsController(INeedRequestsService needRequestsService)
        {
            _needRequestsService = needRequestsService;
        }

        [HttpGet]
        public async Task<IActionResult> GetRequests([FromQuery] int? categoryId, [FromQuery] string? status)
        {
            var requests = await _needRequestsService.GetAllAsync(categoryId, status);
            return Ok(requests);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetRequest(int id)
        {
            var request = await _needRequestsService.GetByIdAsync(id);
            if (request == null)
            {
                return NotFound(new { Message = "Заявка не найдена" });
            }
            return Ok(request);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateRequest([FromBody] CreateNeedRequestDto dto)
        {
            var userIdStr = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier || c.Type == "nameid")?.Value;
            var role = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role || c.Type == "role")?.Value;

            if (string.IsNullOrEmpty(userIdStr) || role != "Shelter")
            {
                return Forbid();
            }

            int shelterId = int.Parse(userIdStr);
            var request = await _needRequestsService.CreateAsync(dto, shelterId);
            return CreatedAtAction(nameof(GetRequest), new { id = request.Id }, request);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateRequest(int id, [FromBody] UpdateNeedRequestDto dto)
        {
            var userIdStr = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier || c.Type == "nameid")?.Value;
            var role = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role || c.Type == "role")?.Value;

            if (string.IsNullOrEmpty(userIdStr) || role != "Shelter")
            {
                return Forbid();
            }

            int shelterId = int.Parse(userIdStr);
            try
            {
                var request = await _needRequestsService.UpdateAsync(id, dto, shelterId);
                return Ok(request);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteRequest(int id)
        {
            var userIdStr = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier || c.Type == "nameid")?.Value;
            var role = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role || c.Type == "role")?.Value;

            if (string.IsNullOrEmpty(userIdStr) || role != "Shelter")
            {
                return Forbid();
            }

            int shelterId = int.Parse(userIdStr);
            var success = await _needRequestsService.DeleteAsync(id, shelterId);
            if (!success)
            {
                return NotFound(new { Message = "Заявка не найдена или у вас нет прав на её удаление" });
            }

            return Ok(new { Message = "Заявка успешно удалена" });
        }

        [HttpPost("{id}/take")]
        [Authorize]
        public async Task<IActionResult> TakeRequest(int id)
        {
            var userIdStr = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier || c.Type == "nameid")?.Value;
            var role = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role || c.Type == "role")?.Value;

            if (string.IsNullOrEmpty(userIdStr) || role != "Volunteer")
            {
                return Forbid();
            }

            int volunteerId = int.Parse(userIdStr);
            try
            {
                await _needRequestsService.TakeRequestAsync(id, volunteerId);
                return Ok(new { Message = "Вы успешно забронировали заявку" });
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

        [HttpPost("{id}/close")]
        [Authorize]
        public async Task<IActionResult> CloseRequest(int id)
        {
            var userIdStr = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier || c.Type == "nameid")?.Value;
            var role = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role || c.Type == "role")?.Value;

            if (string.IsNullOrEmpty(userIdStr) || role != "Shelter")
            {
                return Forbid();
            }

            int shelterId = int.Parse(userIdStr);
            try
            {
                await _needRequestsService.CloseRequestAsync(id, shelterId);
                return Ok(new { Message = "Заявка успешно закрыта" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var stats = await _needRequestsService.GetDashboardStatsAsync();
            return Ok(stats);
        }
    }
}
