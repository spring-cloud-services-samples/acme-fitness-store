using AcmeOrder.Models;
using Microsoft.EntityFrameworkCore;

namespace AcmeOrder.Db;

public abstract class OrderContext : DbContext
{
    protected OrderContext() { }

    protected OrderContext(DbContextOptions options) : base(options) { }

    public virtual DbSet<Order> Orders { get; set; }
}