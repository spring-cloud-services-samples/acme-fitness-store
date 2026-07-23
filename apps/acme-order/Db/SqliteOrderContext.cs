using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;
using AcmeOrder.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace AcmeOrder.Db;

public class SqliteOrderContext : OrderContext
{
    private readonly JsonSerializerOptions _jsonSerializerOptions =
        new() { DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull };

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseSqlite("Data Source=sqlite.order.db");
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Capture options in a local so the expression trees in ValueComparer don't close over 'this'.
        var opts = _jsonSerializerOptions;
        var cartComparer = new ValueComparer<ICollection<Cart>>(
            (c1, c2) => JsonSerializer.Serialize(c1, opts) == JsonSerializer.Serialize(c2, opts),
            c => JsonSerializer.Serialize(c, opts).GetHashCode(),
            c => JsonSerializer.Deserialize<ICollection<Cart>>(JsonSerializer.Serialize(c, opts), opts)!);

        modelBuilder.Entity<Order>(entity =>
        {
            entity.ToTable("order");

            entity.Property(e => e.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd()
                .IsRequired();

            entity.Property(e => e.Address)
                .HasColumnName("address")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, _jsonSerializerOptions),
                    v => JsonSerializer.Deserialize<Address>(v, _jsonSerializerOptions));

            entity.Property(e => e.Card)
                .HasColumnName("card")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, _jsonSerializerOptions),
                    v => JsonSerializer.Deserialize<Card>(v, _jsonSerializerOptions));

            entity.Property(e => e.Cart)
                .HasColumnName("cart")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, _jsonSerializerOptions),
                    v => JsonSerializer.Deserialize<ICollection<Cart>>(v, _jsonSerializerOptions))
                .Metadata.SetValueComparer(cartComparer);

            entity.Property(e => e.Date)
                .HasColumnName("date")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

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
