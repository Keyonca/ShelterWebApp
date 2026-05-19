using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShelterCoordinationSystem.Data.Entities;

namespace ShelterCoordinationSystem.Data.Configurations
{
    public class NeedRequestConfiguration : IEntityTypeConfiguration<NeedRequest>
    {
        public void Configure(EntityTypeBuilder<NeedRequest> builder)
        {
            builder.ToTable("NeedRequests");
            builder.HasKey(n => n.Id);
            builder.Property(n => n.Title).IsRequired().HasMaxLength(200);
            builder.Property(n => n.Description).HasMaxLength(2000);
            builder.Property(n => n.Status).IsRequired().HasMaxLength(50);
            builder.Property(n => n.CreatedAt).HasDefaultValueSql("NOW()");
            builder.Property(n => n.UpdatedAt).HasDefaultValueSql("NOW()");

            // Relationships
            builder.HasOne(n => n.Shelter)
                .WithMany(s => s.NeedRequests)
                .HasForeignKey(n => n.ShelterId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(n => n.Category)
                .WithMany(c => c.NeedRequests)
                .HasForeignKey(n => n.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(n => n.Volunteer)
                .WithMany(v => v.NeedRequests)
                .HasForeignKey(n => n.VolunteerId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
