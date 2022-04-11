using System;
using acme_order.Models;
using Microsoft.EntityFrameworkCore;

namespace acme_order.Db
{
    public class OrderContext : DbContext
    {
        public OrderContext(DbContextOptions<OrderContext> options)
            : base(options)
        {
        }

        public virtual DbSet<Order> Orders { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                optionsBuilder.UseNpgsql("Host=localhost;Database=acmefit;Username=root;Password=rootpassword");
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasPostgresExtension("uuid-ossp");
            modelBuilder.Entity<Order>(entity =>
            {
                entity.ToTable("order");

                entity.Property(e => e.Id)
                    .HasColumnName("id")
                    .HasColumnType("uuid")
                    .HasDefaultValueSql("uuid_generate_v4()")
                    .IsRequired();

                entity.Property(e => e.Address)
                    .HasColumnName("address")
                    .HasColumnType("json");

                entity.Property(e => e.Card)
                    .HasColumnName("card")
                    .HasColumnType("json");

                entity.Property(e => e.Cart)
                    .HasColumnName("cart")
                    .HasColumnType("json");

                entity.Property(e => e.Date)
                    .HasColumnName("date")
                    .HasDefaultValue(DateTime.UtcNow);

                entity.Property(e => e.Delivery)
                    .HasColumnName("delivery")
                    .HasMaxLength(1000);

                entity.Property(e => e.Email)
                    .HasColumnName("email")
                    .HasMaxLength(1000);

                entity.Property(e => e.Firstname)
                    .HasColumnName("firstname")
                    .HasMaxLength(1000);

                entity.Property(e => e.Lastname)
                    .HasColumnName("lastname")
                    .HasMaxLength(1000);

                entity.Property(e => e.Paid)
                    .HasColumnName("paid")
                    .HasMaxLength(1000);

                entity.Property(e => e.Total)
                    .HasColumnName("total")
                    .HasMaxLength(1000);

                entity.Property(e => e.UserId)
                    .HasColumnName("user_id")
                    .HasMaxLength(1000);
            });
        }
    }
}
