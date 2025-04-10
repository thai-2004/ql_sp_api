let currentPage = 1;
let pageSize = 10;
let totalPages = 1;
let token = localStorage.getItem('token');

// Hàm đăng nhập
async function login(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const loginData = {
        username: formData.get('username'),
        password: formData.get('password')
    };
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });
        
        if (response.ok) {
            const data = await response.json();
            token = data.token;
            localStorage.setItem('token', token);
            alert('Đăng nhập thành công!');
            location.reload();
        } else {
            const error = await response.json();
            alert(`Lỗi: ${error.message || 'Đăng nhập thất bại'}`);
        }
    } catch (error) {
        console.error('Error logging in:', error);
        alert('Có lỗi xảy ra khi đăng nhập');
    }
}

// Hàm đăng xuất
function logout() {
    localStorage.removeItem('token');
    token = null;
    location.reload();
}

// Hàm kiểm tra trạng thái đăng nhập
function checkLoginStatus() {
    const loginForm = document.getElementById('login-form');
    const logoutButton = document.getElementById('logout-button');
    const addProductSection = document.querySelector('.add-product-section');
    
    if (token) {
        if (loginForm) loginForm.style.display = 'none';
        if (logoutButton) logoutButton.style.display = 'block';
        if (addProductSection) addProductSection.style.display = 'block';
    } else {
        if (loginForm) loginForm.style.display = 'block';
        if (logoutButton) logoutButton.style.display = 'none';
        if (addProductSection) addProductSection.style.display = 'none';
    }
}

// Hàm lấy danh sách sản phẩm với phân trang
async function getProducts(page = 1, size = 10) {
    try {
        const response = await fetch(`/api/products?pageNumber=${page}&pageSize=${size}`);
        
        // Lấy thông tin phân trang từ header
        const totalCount = response.headers.get('X-Total-Count');
        const pageNumber = response.headers.get('X-Page-Number');
        const pageSize = response.headers.get('X-Page-Size');
        totalPages = response.headers.get('X-Total-Pages');
        
        const products = await response.json();
        displayProducts(products);
        updatePagination(pageNumber, totalPages);
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

// Hàm hiển thị danh sách sản phẩm
function displayProducts(products) {
    const productsContainer = document.getElementById('products-container');
    productsContainer.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <h3>${product.name}</h3>
            <p>${product.description || 'Không có mô tả'}</p>
            <p>Giá: ${product.price.toLocaleString()} VNĐ</p>
            <p>Giảm giá: ${product.discount_price ? product.discount_price.toLocaleString() + ' VNĐ' : 'Không'}</p>
            <p>Tồn kho: ${product.stock}</p>
            <p>Danh mục: ${product.category}</p>
            <button onclick="editProduct(${product.product_id})">Sửa</button>
            <button onclick="deleteProduct(${product.product_id})">Xóa</button>
        `;
        productsContainer.appendChild(productCard);
    });
}

// Hàm cập nhật phân trang
function updatePagination(currentPage, totalPages) {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';
    
    // Nút Previous
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Trước';
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => getProducts(currentPage - 1, pageSize);
    paginationContainer.appendChild(prevButton);
    
    // Các nút trang
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.className = currentPage === i ? 'active' : '';
        pageButton.onclick = () => getProducts(i, pageSize);
        paginationContainer.appendChild(pageButton);
    }
    
    // Nút Next
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Sau';
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = () => getProducts(currentPage + 1, pageSize);
    paginationContainer.appendChild(nextButton);
}

// Hàm thêm sản phẩm mới
async function addProduct(event) {
    event.preventDefault();
    
    if (!token) {
        alert('Vui lòng đăng nhập để thêm sản phẩm');
        return;
    }
    
    const formData = new FormData(event.target);
    const productData = {
        name: formData.get('name'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price')),
        discount_price: formData.get('discount_price') ? parseFloat(formData.get('discount_price')) : null,
        stock: parseInt(formData.get('stock')),
        category: formData.get('category'),
        image: formData.get('image')
    };
    
    try {
        const response = await fetch('/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(productData)
        });
        
        if (response.ok) {
            alert('Thêm sản phẩm thành công!');
            event.target.reset();
            getProducts(currentPage, pageSize);
        } else {
            const error = await response.json();
            alert(`Lỗi: ${error.message || 'Không thể thêm sản phẩm'}`);
        }
    } catch (error) {
        console.error('Error adding product:', error);
        alert('Có lỗi xảy ra khi thêm sản phẩm');
    }
}

// Hàm xóa sản phẩm
async function deleteProduct(id) {
    if (!token) {
        alert('Vui lòng đăng nhập để xóa sản phẩm');
        return;
    }
    
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/products/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            alert('Xóa sản phẩm thành công!');
            getProducts(currentPage, pageSize);
        } else {
            const error = await response.json();
            alert(`Lỗi: ${error.message || 'Không thể xóa sản phẩm'}`);
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Có lỗi xảy ra khi xóa sản phẩm');
    }
}

// Hàm sửa sản phẩm
async function editProduct(id) {
    if (!token) {
        alert('Vui lòng đăng nhập để sửa sản phẩm');
        return;
    }
    
    try {
        // Lấy thông tin sản phẩm
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) {
            throw new Error('Không thể lấy thông tin sản phẩm');
        }
        
        const product = await response.json();
        
        // Hiển thị form sửa
        const form = document.createElement('form');
        form.className = 'edit-form';
        form.innerHTML = `
            <h3>Sửa sản phẩm</h3>
            <div class="form-group">
                <label for="edit-name">Tên sản phẩm:</label>
                <input type="text" id="edit-name" name="name" value="${product.name}" required>
            </div>
            
            <div class="form-group">
                <label for="edit-description">Mô tả:</label>
                <textarea id="edit-description" name="description">${product.description || ''}</textarea>
            </div>
            
            <div class="form-group">
                <label for="edit-price">Giá:</label>
                <input type="number" id="edit-price" name="price" value="${product.price}" min="0" step="0.01" required>
            </div>
            
            <div class="form-group">
                <label for="edit-discount_price">Giá giảm:</label>
                <input type="number" id="edit-discount_price" name="discount_price" value="${product.discount_price || ''}" min="0" step="0.01">
            </div>
            
            <div class="form-group">
                <label for="edit-stock">Số lượng tồn kho:</label>
                <input type="number" id="edit-stock" name="stock" value="${product.stock}" min="0" required>
            </div>
            
            <div class="form-group">
                <label for="edit-category">Danh mục:</label>
                <input type="text" id="edit-category" name="category" value="${product.category}" required>
            </div>
            
            <div class="form-group">
                <label for="edit-image">URL hình ảnh:</label>
                <input type="url" id="edit-image" name="image" value="${product.image || ''}">
            </div>
            
            <div class="form-group">
                <label for="edit-is_active">Trạng thái:</label>
                <input type="checkbox" id="edit-is_active" name="is_active" ${product.is_active ? 'checked' : ''}>
            </div>
            
            <button type="submit">Lưu thay đổi</button>
            <button type="button" onclick="closeEditForm()">Hủy</button>
        `;
        
        // Thêm form vào modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.appendChild(form);
        document.body.appendChild(modal);
        
        // Xử lý submit form
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const productData = {
                name: formData.get('name'),
                description: formData.get('description'),
                price: parseFloat(formData.get('price')),
                discount_price: formData.get('discount_price') ? parseFloat(formData.get('discount_price')) : null,
                stock: parseInt(formData.get('stock')),
                category: formData.get('category'),
                image: formData.get('image'),
                is_active: formData.get('is_active') === 'on'
            };
            
            try {
                const updateResponse = await fetch(`/api/products/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(productData)
                });
                
                if (updateResponse.ok) {
                    alert('Cập nhật sản phẩm thành công!');
                    closeEditForm();
                    getProducts(currentPage, pageSize);
                } else {
                    const error = await updateResponse.json();
                    alert(`Lỗi: ${error.message || 'Không thể cập nhật sản phẩm'}`);
                }
            } catch (error) {
                console.error('Error updating product:', error);
                alert('Có lỗi xảy ra khi cập nhật sản phẩm');
            }
        });
    } catch (error) {
        console.error('Error editing product:', error);
        alert('Có lỗi xảy ra khi lấy thông tin sản phẩm');
    }
}

// Hàm đóng form sửa
function closeEditForm() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

// Khởi tạo khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
    getProducts(currentPage, pageSize);
    
    // Thêm sự kiện submit cho form thêm sản phẩm
    const addProductForm = document.getElementById('add-product-form');
    if (addProductForm) {
        addProductForm.addEventListener('submit', addProduct);
    }
    
    // Thêm sự kiện submit cho form đăng nhập
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', login);
    }
    
    // Thêm sự kiện click cho nút đăng xuất
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }
}); 