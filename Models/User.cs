using System.ComponentModel.DataAnnotations;

namespace YourNamespace.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }  // Auto-generate unique IDdotnet ef migrations

        public string? Name { get; set; }          // Nullable
        public string? Email { get; set; }         // Nullable
        public string GoogleId { get; set; }      // Nullable
        public string? Picture { get; set; }       // Nullable
    }
}
