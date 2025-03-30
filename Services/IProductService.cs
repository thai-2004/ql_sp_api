using ProductsAPI.Models;
using ProductsAPI.Models.DTOs;

namespace ProductsAPI.Services
{
    public interface IProductService
    {
        Task<(List<Product> Products, int TotalCount)> GetProductsAsync(ProductParameters parameters);
        Task<IEnumerable<Product>> GetAllProductsAsync();
        Task<Product?> GetProductByIdAsync(int id);
        Task<Product> CreateProductAsync(CreateProductDTO product);
        Task<Product?> UpdateProductAsync(int id, UpdateProductDTO product);
        Task<bool> DeleteProductAsync(int id);
    }
} 