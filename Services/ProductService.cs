using Microsoft.EntityFrameworkCore;
using ProductsAPI.Data;
using ProductsAPI.Models;
using ProductsAPI.Models.DTOs;

namespace ProductsAPI.Services
{
    public class ProductService : IProductService
    {
        private readonly ApplicationDbContext _context;

        public ProductService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<(List<Product> Products, int TotalCount)> GetProductsAsync(ProductParameters parameters)
        {
            var query = _context.Products.AsQueryable();

            // Tìm kiếm theo tên
            if (!string.IsNullOrWhiteSpace(parameters.SearchTerm))
            {
                query = query.Where(p => p.name.Contains(parameters.SearchTerm));
            }

            // Tìm kiếm theo danh mục
            if (!string.IsNullOrWhiteSpace(parameters.Category))
            {
                query = query.Where(p => p.category == parameters.Category);
            }

            // Đếm tổng số sản phẩm thỏa điều kiện
            var totalCount = await query.CountAsync();

            // Sắp xếp và phân trang
            var products = await query
                .OrderByDescending(p => p.created_at)
                .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                .Take(parameters.PageSize)
                .ToListAsync();

            return (products, totalCount);
        }

        public async Task<IEnumerable<Product>> GetAllProductsAsync()
        {
            return await _context.Products
                .OrderByDescending(p => p.created_at)
                .ToListAsync();
        }

        public async Task<Product?> GetProductByIdAsync(int id)
        {
            return await _context.Products.FindAsync(id);
        }

        public async Task<Product> CreateProductAsync(CreateProductDTO productDto)
        {
            var product = new Product
            {
                name = productDto.name,
                description = productDto.description,
                price = productDto.price,
                discount_price = productDto.discount_price,
                stock = productDto.stock,
                category = productDto.category,
                image = productDto.image,
                created_at = DateTime.UtcNow,
                is_active = true
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return product;
        }

        public async Task<Product?> UpdateProductAsync(int id, UpdateProductDTO productDto)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return null;

            product.name = productDto.name;
            product.description = productDto.description;
            product.price = productDto.price;
            product.discount_price = productDto.discount_price;
            product.stock = productDto.stock;
            product.category = productDto.category;
            product.image = productDto.image;
            product.is_active = productDto.is_active;

            await _context.SaveChangesAsync();
            return product;
        }

        public async Task<bool> DeleteProductAsync(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return false;

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return true;
        }
    }
} 