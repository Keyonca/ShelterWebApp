using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShelterCoordinationSystem.Data.Entities;

namespace ShelterCoordinationSystem.Data.Configurations
{
    public class AdminConfiguration : IEntityTypeConfiguration<Admin>
    {
        public void Configure(EntityTypeBuilder<Admin> builder)
        {
            builder.ToTable("Admins");
            builder.HasKey(a => a.Id);
            builder.HasIndex(a => a.Login).IsUnique();
            builder.Property(a => a.Login).IsRequired().HasMaxLength(100);
            builder.Property(a => a.PasswordHash).IsRequired();
            builder.Property(a => a.Name).HasMaxLength(100);
            builder.Property(a => a.CreatedAt).HasDefaultValueSql("NOW()");
        }
    }
}