/**
 * Interface định nghĩa phản hồi từ Server (Backend).
 */
export interface AuthResponse {
    status: string;         // Trạng thái (ví dụ: "success", "error")
    message: string;        // Thông báo chi tiết cho người dùng
    similarity?: number;    // Độ tương đồng khuôn mặt (nếu có)
    detail?: string;        // Chi tiết lỗi (thường dùng cho FastAPI debug)
}

/**
 * Interface cho Request Đăng nhập.
 * Gửi 1 ảnh duy nhất để so khớp.
 */
export interface LoginRequest {
    username: string;       // Tên tài khoản
    password: string;       // Mật khẩu
    image_base64: string;   // Chuỗi ảnh Base64 từ Camera
}

/**
 * Interface cho Request Đăng ký.
 * Gửi danh sách 5 ảnh để huấn luyện/lưu trữ model.
 */
export interface RegisterRequest {
    username: string;       // Tên tài khoản mới
    password: string;       // Mật khẩu
    images: string[];       // Mảng chứa 5 chuỗi ảnh Base64
}