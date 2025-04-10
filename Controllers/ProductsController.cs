using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProductsAPI.Models;
using ProductsAPI.Models.DTOs;
using ProductsAPI.Services;

namespace ProductsAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductsController(IProductService productService)
        {
            _productService = productService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts([FromQuery] ProductParameters parameters)
        {
            var (products, totalCount) = await _productService.GetProductsAsync(parameters);

            // Thêm thông tin phân trang vào header sử dụng Append thay vì Add
            Response.Headers.Append("X-Total-Count", totalCount.ToString());
            Response.Headers.Append("X-Page-Number", parameters.PageNumber.ToString());
            Response.Headers.Append("X-Page-Size", parameters.PageSize.ToString());
            Response.Headers.Append("X-Total-Pages", ((int)Math.Ceiling(totalCount / (double)parameters.PageSize)).ToString());

            return Ok(products);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product = await _productService.GetProductByIdAsync(id);
            if (product == null)
                return NotFound(new { message = $"Không tìm thấy sản phẩm với ID: {id}" });

            return Ok(product);
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Product>> CreateProduct(CreateProductDTO productDto)
        {
            var product = await _productService.CreateProductAsync(productDto);
            return CreatedAtAction(nameof(GetProduct), new { id = product.product_id }, product);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult<Product>> UpdateProduct(int id, UpdateProductDTO productDto)
        {
            var product = await _productService.UpdateProductAsync(id, productDto);
            if (product == null)
                return NotFound(new { message = $"Không tìm thấy sản phẩm với ID: {id}" });

            return Ok(product);
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var result = await _productService.DeleteProductAsync(id);
            if (!result)
                return NotFound(new { message = $"Không tìm thấy sản phẩm với ID: {id}" });

            return NoContent();
        }
    }
} 