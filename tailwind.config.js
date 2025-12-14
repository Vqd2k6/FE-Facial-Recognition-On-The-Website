/** @type {import('tailwindcss').Config} */
export default {
    // Chỉ định các file cần Tailwind quét để sinh mã CSS
    content: [
        "./index.html",
        "./register.html",
        "./dashboard.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            // Định nghĩa bảng màu thương hiệu (Brand Colors)
            colors: {
                'brand-bg': '#107a7e',        // Màu nền đậm
                'brand-primary': '#0d9488',   // Màu chủ đạo (Teal)
                'brand-light': '#ccfbf1',     // Màu nền nhạt
                'brand-red': '#dc2626',       // Màu cảnh báo/tiêu đề
                'brand-gray': '#9ca3af',      // Màu xám tùy chỉnh
            },
            // Định nghĩa Font chữ mặc định
            fontFamily: {
                roboto: ['Roboto', 'sans-serif'],
            },
            // Định nghĩa ảnh nền tùy chỉnh
            backgroundImage: {
                // Lưu ý: File ảnh phải nằm trong thư mục /public/images/
                'uth-bg': "url('/images/back_ground_uth.png')",
            }
        },
    },
    plugins: [],
}