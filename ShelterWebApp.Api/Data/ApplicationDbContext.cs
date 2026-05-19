using Microsoft.EntityFrameworkCore;
using ShelterCoordinationSystem.Data.Entities;
using ShelterCoordinationSystem.Data.Configurations;
using System.Collections.Generic;
using System.Reflection.Emit;

namespace ShelterCoordinationSystem.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) { }

        public DbSet<Volunteer> Volunteers { get; set; }
        public DbSet<Shelter> Shelters { get; set; }
        public DbSet<Admin> Admins { get; set; }
        public DbSet<NeedCategory> NeedCategories { get; set; }
        public DbSet<NeedRequest> NeedRequests { get; set; }
        public DbSet<HelpReport> HelpReports { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Применяем конфигурации сущностей из сборки (через интерфейс IEntityTypeConfiguration)
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
        }
    }
}
