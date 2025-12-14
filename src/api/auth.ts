import type { LoginRequest, RegisterRequest, AuthResponse } from '../types';

const BASE_URL = "http://localhost:8000/api/v1/auth";

export const authApi = {
    /**
     * Gửi yêu cầu đăng nhập lên Server.
     * @param data - Dữ liệu đăng nhập gồm username, password và 1 ảnh.
     * @returns Promise chứa phản hồi từ Server.
     */
    async login(data: LoginRequest): Promise<AuthResponse> {
        try {
            const response = await fetch(`${BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            // Nếu status code không phải 200-299, ném lỗi để catch bắt
            if (!response.ok) {
                throw new Error(result.detail || result.message || "Đăng nhập thất bại");
            }
            return result;
        } catch (error) {
            // Ném lỗi tiếp ra ngoài để logic layer (UI) xử lý hiển thị
            throw error;
        }
    },

    /**
     * Gửi yêu cầu đăng ký lên Server.
     * @param data - Dữ liệu đăng ký gồm username, password và 5 ảnh.
     * @returns Promise chứa phản hồi từ Server.
     */
    async register(data: RegisterRequest): Promise<AuthResponse> {
        try {
            const response = await fetch(`${BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.detail || result.message || "Đăng ký thất bại");
            }
            return result;
        } catch (error) {
            throw error;
        }
    },
};