// для списка 
namespace ShelterCoordinationSystem.Dtos.NeedRequests
{
    public class NeedRequestResponseDto
    {
        public int Id { get; set; }
        public string ShelterName { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Quantity { get; set; } = string.Empty;
        public DateTime ExpiryDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? VolunteerName { get; set; }
    }
}
