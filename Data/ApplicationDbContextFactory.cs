using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using System;
using System.IO;

namespace YourNamespace.Data
{
    public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
    {
        public ApplicationDbContext CreateDbContext(string[] args)
        {
            var basePath = Directory.GetCurrentDirectory();
            var builder = new ConfigurationBuilder()
                .SetBasePath(basePath)
                .AddJsonFile("appsettings.json", optional: true)
                .AddJsonFile("appsettings.Development.json", optional: true)
                .AddJsonFile("appsettings.Production.json", optional: true)
                .AddEnvironmentVariables();

            var config = builder.Build();

            // Always use SQLite
            var cs = config.GetConnectionString("DefaultConnection") ?? "Data Source=app.db";

            var options = new DbContextOptionsBuilder<ApplicationDbContext>();
            options.UseSqlite(cs);

            return new ApplicationDbContext(options.Options);
        }
    }
}
