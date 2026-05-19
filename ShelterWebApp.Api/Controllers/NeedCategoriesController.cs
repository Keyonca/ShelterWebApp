using Microsoft.AspNetCore.Mvc;
using ShelterCoordinationSystem.Services;

namespace ShelterCoordinationSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NeedCategoriesController : ControllerBase
    {
        private readonly INeedRequestsService _needRequestsService;

        public NeedCategoriesController(INeedRequestsService needRequestsService)
        {
            _needRequestsService = needRequestsService;
        }

        [HttpGet]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _needRequestsService.GetCategoriesAsync();
            return Ok(categories);
        }
    }
}
