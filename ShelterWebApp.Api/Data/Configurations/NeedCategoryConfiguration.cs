using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShelterCoordinationSystem.Data.Entities;

namespace ShelterCoordinationSystem.Data.Configurations
{
    public class NeedCategoryConfiguration : IEntityTypeConfiguration<NeedCategory>
    {
        public void Configure(EntityTypeBuilder<NeedCategory> builder)
        {
            builder.ToTable("NeedCategories");
            builder.HasKey(c => c.Id);
            builder.Property(c => c.Name).IsRequired().HasMaxLength(100);
        }
    }
}
