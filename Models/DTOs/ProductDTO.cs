using System.ComponentModel.DataAnnotations;

namespace ProductsAPI.Models.DTOs
{
    public class CreateProductDTO
    {
        [Required(ErrorMessage = "Tên sản phẩm là bắt buộc")]
        [StringLength(255)]
        public string name { get; set; } = string.Empty;

        public string? description { get; set; }

        [Required(ErrorMessage = "Giá sản phẩm là bắt buộc")]
        [Range(0, double.MaxValue, ErrorMessage = "Giá sản phẩm phải lớn hơn 0")]
        public decimal price { get; set; }

        public decimal? discount_price { get; set; }

        [Required(ErrorMessage = "Số lượng tồn kho là bắt buộc")]
        [Range(0, int.MaxValue)]
        public int stock { get; set; }

        [Required(ErrorMessage = "Danh mục sản phẩm là bắt buộc")]
        public string category { get; set; } = string.Empty;

        public string? image { get; set; }
    }

    public class UpdateProductDTO : CreateProductDTO
    {
        public bool is_active { get; set; }
    }
} 