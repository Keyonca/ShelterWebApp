using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShelterCoordinationSystem.Data.Entities;

namespace ShelterCoordinationSystem.Data.Configurations
{
    public class ShelterConfiguration : IEntityTypeConfiguration<Shelter>
    {
        public void Configure(EntityTypeBuilder<Shelter> builder)
        {
            builder.ToTable("Shelters");
            builder.HasKey(s => s.Id);
            builder.HasIndex(s => s.Email).IsUnique();
            builder.Property(s => s.Email).IsRequired().HasMaxLength(256);
            builder.Property(s => s.PasswordHash).IsRequired();
            builder.Property(s => s.Name).IsRequired().HasMaxLength(200);
            builder.Property(s => s.LegalAddress).HasMaxLength(500);
            builder.Property(s => s.ActualAddress).HasMaxLength(500);
            builder.Property(s => s.PhoneNumber).HasMaxLength(20);
            builder.Property(s => s.IsVerified).HasDefaultValue(false);
            builder.Property(s => s.CreatedAt).HasDefaultValueSql("NOW()");
        }
    }
}