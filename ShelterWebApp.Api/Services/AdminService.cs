using Microsoft.EntityFrameworkCore;
using ShelterCoordinationSystem.Data;
using ShelterCoordinationSystem.Dtos.Admin;

namespace ShelterCoordinationSystem.Services
{
    public class AdminService : IAdminService
    {
        private readonly ApplicationDbContext _context;

        public AdminService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<UnverifiedShelterDto>> GetUnverifiedSheltersAsync()
        {
            return await _context.Shelters
                .Where(s => !s.IsVerified && s.RegistrationDocumentFileName != null)
                .Select(s => new UnverifiedShelterDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    Email = s.Email,
                    PhoneNumber = s.PhoneNumber,
                    LegalAddress = s.LegalAddress,
                    ActualAddress = s.ActualAddress,
                    DocumentFileName = s.RegistrationDocumentFileName
                })
                .ToListAsync();
        }

        public async Task<(byte[] Data, string ContentType, string FileName)?> GetShelterDocumentAsync(int shelterId)
        {
            var shelter = await _context.Shelters.FindAsync(shelterId);
            if (shelter == null || shelter.RegistrationDocumentsData == null)
            {
                return null;
            }

            return (
                shelter.RegistrationDocumentsData,
                shelter.RegistrationDocumentContentType ?? "application/octet-stream",
                shelter.RegistrationDocumentFileName ?? "document"
            );
        }

        public async Task<bool> VerifyShelterAsync(int shelterId, bool approve)
        {
            var shelter = await _context.Shelters.FindAsync(shelterId);
            if (shelter == null)
            {
                return false;
            }

            if (approve)
            {
                shelter.IsVerified = true;
            }
            else
            {
                // Clear loaded documents so they can re-upload
                shelter.RegistrationDocumentsData = null;
                shelter.RegistrationDocumentFileName = null;
                shelter.RegistrationDocumentContentType = null;
            }

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
