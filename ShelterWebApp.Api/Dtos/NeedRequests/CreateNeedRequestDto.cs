using System.ComponentModel.DataAnnotations;

namespace ShelterCoordinationSystem.Dtos.NeedRequests
{
    public class CreateNeedRequestDto
    {
        [Required]
        public int CategoryId { get; set; }

        [Required, MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        public string Quantity { get; set; } = string.Empty;

        [Required]
        public DateTime ExpiryDate { get; set; }
    }
}