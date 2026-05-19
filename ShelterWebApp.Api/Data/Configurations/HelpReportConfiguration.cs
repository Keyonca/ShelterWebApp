using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShelterCoordinationSystem.Data.Entities;

namespace ShelterCoordinationSystem.Data.Configurations
{
    public class HelpReportConfiguration : IEntityTypeConfiguration<HelpReport>
    {
        public void Configure(EntityTypeBuilder<HelpReport> builder)
        {
            builder.ToTable("HelpReports");
            builder.HasKey(h => h.Id);
            builder.Property(h => h.Status).IsRequired().HasMaxLength(50);
            builder.Property(h => h.CreatedAt).HasDefaultValueSql("NOW()");

            builder.HasOne(h => h.NeedRequest)
                .WithMany(n => n.HelpReports)
                .HasForeignKey(h => h.NeedRequestId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(h => h.Volunteer)
                .WithMany(v => v.HelpReports)
                .HasForeignKey(h => h.VolunteerId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
