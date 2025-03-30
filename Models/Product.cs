using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProductsAPI.Models
{
    public class Product
    {
        [Key]
        public int product_id { get; set; }

        [Required(ErrorMessage = "Tên sản phẩm là bắt buộc")]
        [StringLength(255)]
        public string name { get; set; } = string.Empty;

        public string? description { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal price { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal? discount_price { get; set; }

        public int stock { get; set; }

        [StringLength(100)]
        public string category { get; set; } = string.Empty;

        [StringLength(255)]
        public string? image { get; set; }

        public DateTime created_at { get; set; }

        public bool is_active { get; set; }
    }
} 