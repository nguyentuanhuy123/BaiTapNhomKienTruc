# Tích hợp Dữ liệu Thật cho Admin Dashboard

## Tổng quan
Đã chuyển đổi các trang admin từ sử dụng dữ liệu cứng (hardcoded) sang sử dụng dữ liệu thật từ backend API.

## Các thay đổi đã thực hiện

### 1. Backend Changes

#### User Service
- **UserService.java**: Thêm method `getAllUsers()` để lấy danh sách tất cả users
- **UserServiceImpl.java**: Implement method `getAllUsers()`
- **UserController.java**: Thêm endpoint `GET /api/user` (Admin only)
- **UserResponse.java**: Thêm các trường `createdAt`, `role`, `status`

#### Order Service
- **OrderService.java**: Thêm method `getAllOrders()` để lấy danh sách tất cả orders
- **OrderServiceImpl.java**: Implement method `getAllOrders()`
- **OrderController.java**: Thêm endpoint `GET /api/order` (Admin only)
- **OrderResponse.java**: Thêm các trường `totalPrice`, `orderStatus`, `paymentMethod`, `createdAt`
- **Order.java**: Thêm các trường `paymentMethod` và `createdAt` với annotation `@CreationTimestamp`

### 2. Frontend Changes

#### New Service
- **adminService.js**: Service mới để gọi các API admin
  - `getAllUsers()`: Lấy danh sách tất cả users
  - `getUserById(userId)`: Lấy thông tin user theo ID
  - `getAllOrders()`: Lấy danh sách tất cả orders
  - `getOrderById(orderId)`: Lấy thông tin order theo ID
  - `updateOrderStatus(orderId, status)`: Cập nhật trạng thái order
  - `getDashboardStats()`: Lấy thống kê cho dashboard

#### Updated Pages
- **AdminUsersPage.jsx**: 
  - Sử dụng `useEffect` để fetch dữ liệu từ API
  - Hiển thị loading state
  - Xử lý lỗi với alert
  - Hiển thị dữ liệu thật từ backend

- **AdminOrdersPage.jsx**:
  - Fetch orders từ API
  - Transform dữ liệu backend sang format frontend
  - Cập nhật trạng thái order qua API
  - Hiển thị loading state và error handling

- **AdminDashboardPage.jsx**:
  - Fetch dashboard statistics từ API
  - Tính toán các metrics (total revenue, total orders, active users)
  - Hiển thị recent orders từ database
  - Format thời gian với function `getTimeAgo()`

## API Endpoints

### User Management
```
GET /api/user              - Lấy danh sách tất cả users (Admin only)
GET /api/user/{id}         - Lấy thông tin user theo ID
GET /api/user/me           - Lấy thông tin user hiện tại
```

### Order Management
```
GET /api/order             - Lấy danh sách tất cả orders (Admin only)
GET /api/order/{orderId}   - Lấy thông tin order theo ID (Admin only)
POST /api/order            - Tạo order mới (User)
PUT /api/order/{orderId}/status - Cập nhật trạng thái order (Admin only)
```

## Cách sử dụng

### 1. Khởi động Backend Services
```bash
# Khởi động các services theo thứ tự:
# 1. Discovery Server
# 2. API Gateway
# 3. User Service
# 4. Order Service
# 5. Các services khác
```

### 2. Khởi động Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Đăng nhập với tài khoản Admin
- Truy cập: http://localhost:5173/login
- Đăng nhập với tài khoản có role ADMIN
- Truy cập Admin Dashboard: http://localhost:5173/admin

## Lưu ý

### Authentication
- Tất cả API admin yêu cầu JWT token trong header: `Authorization: Bearer <token>`
- Token được lưu trong localStorage với key `token`
- Role ADMIN được kiểm tra ở cả frontend (routing) và backend (API endpoints)

### CORS Configuration
- API Gateway đã được cấu hình CORS cho phép frontend (http://localhost:5173)
- Allowed methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
- Credentials: true

### Data Transformation
- Backend trả về dữ liệu với format khác frontend
- Frontend service (`adminService.js`) transform dữ liệu để phù hợp với UI components
- Ví dụ: `orderStatus` từ backend được map sang display status trong frontend

### Error Handling
- Tất cả API calls đều có try-catch
- Lỗi được hiển thị qua AlertContext
- Loading states được hiển thị khi fetch dữ liệu

## Các tính năng đã hoàn thành

✅ Hiển thị danh sách users thật từ database
✅ Hiển thị danh sách orders thật từ database
✅ Dashboard statistics từ dữ liệu thật
✅ Recent orders với thời gian thực
✅ Loading states và error handling
✅ Authentication và authorization
✅ CORS configuration

## Các tính năng cần phát triển thêm

- [ ] Block/Unblock user functionality
- [ ] Pagination cho danh sách users và orders
- [ ] Search và filter nâng cao
- [ ] Export data to CSV/Excel
- [ ] Real-time updates với WebSocket
- [ ] Detailed analytics và charts
- [ ] Role management (thêm/xóa/sửa roles)
- [ ] Audit logs

## Troubleshooting

### Lỗi CORS
- Kiểm tra API Gateway có đang chạy không
- Kiểm tra CORS configuration trong `GatewaySecurityConfig.java`
- Đảm bảo frontend đang chạy trên port 5173

### Lỗi 401 Unauthorized
- Kiểm tra token trong localStorage
- Đảm bảo đã đăng nhập với tài khoản ADMIN
- Kiểm tra token expiration

### Không có dữ liệu
- Kiểm tra database có dữ liệu không
- Kiểm tra các services backend đang chạy
- Xem console logs để debug

## Liên hệ
Nếu có vấn đề, vui lòng tạo issue hoặc liên hệ team phát triển.
