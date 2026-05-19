using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShelterCoordinationSystem.Data.Entities;

namespace ShelterCoordinationSystem.Data.Configurations
{
    public class VolunteerConfiguration : IEntityTypeConfiguration<Volunteer>
    {
        public void Configure(EntityTypeBuilder<Volunteer> builder)
        {
            builder.ToTable("Volunteers");
            builder.HasKey(v => v.Id);
            builder.HasIndex(v => v.Email).IsUnique();
            builder.Property(v => v.Email).IsRequired().HasMaxLength(256);
            builder.Property(v => v.PasswordHash).IsRequired();
            builder.Property(v => v.Name).IsRequired().HasMaxLength(100);
            builder.Property(v => v.PhoneNumber).HasMaxLength(20);
            builder.Property(v => v.TotalHelped).HasDefaultValue(0);
            builder.Property(v => v.IsActive).HasDefaultValue(false);
            builder.Property(v => v.CreatedAt).HasDefaultValueSql("NOW()");
        }
    }
}
