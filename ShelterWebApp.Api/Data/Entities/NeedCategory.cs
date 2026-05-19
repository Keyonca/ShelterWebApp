namespace ShelterCoordinationSystem.Data.Entities
{
    public class NeedCategory
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;

        public ICollection<NeedRequest> NeedRequests { get; set; } = new List<NeedRequest>();
    }
}