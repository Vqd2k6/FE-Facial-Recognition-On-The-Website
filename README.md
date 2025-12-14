# Face Authentication App (Frontend)

## Mục lục

* [Giới thiệu](#giới-thiệu)
* [Vai trò Frontend](#vai-trò-frontend)
* [Công nghệ sử dụng](#công-nghệ-sử-dụng)
* [Luồng xử lý người dùng](#luồng-xử-lý-người-dùng)
* [Cấu trúc thư mục](#cấu-trúc-thư-mục)
* [Cài đặt & Chạy dự án](#cài-đặt--chạy-dự-án)
* [Tích hợp Backend](#tích-hợp-backend)
* [Trải nghiệm người dùng](#trải-nghiệm-người-dùng)
* [Hạn chế & Lưu ý](#hạn-chế--lưu-ý)
* [Hướng phát triển](#hướng-phát-triển)

---

## Giới thiệu

**Face Authentication App** là frontend web cho hệ thống xác thực khuôn mặt, cho phép người dùng **đăng ký và đăng nhập bằng webcam realtime**. Ứng dụng tập trung vào trải nghiệm người dùng, phản hồi trực quan và quy trình xác thực tự động.

---

## Vai trò Frontend

* Thu thập hình ảnh từ webcam
* Phát hiện khuôn mặt realtime
* Gửi dữ liệu Base64 sang backend
* Hiển thị trạng thái xác thực
* Điều hướng sau khi đăng nhập thành công

---

## Công nghệ sử dụng

* TypeScript
* Vite
* TailwindCSS
* face-api.js (TinyFaceDetector)
* HTML5 Canvas
* MediaDevices API

---

## Luồng xử lý người dùng

### Đăng ký

1. Nhập username và password
2. Mở camera và phát hiện khuôn mặt
3. Thu thập 5 ảnh hợp lệ
4. Gửi mảng ảnh Base64 lên backend
5. Thông báo kết quả đăng ký

### Đăng nhập

1. Nhập username và password
2. Mở camera
3. Phát hiện khuôn mặt realtime
4. Tự động gửi ảnh xác thực
5. Cho phép đăng nhập nếu thành công

---

## Cấu trúc thư mục

```
Frontend/
├── public/
│   ├── images/        # Logo, background
│   └── models/        # face-api models
│
├── src/
│   ├── api/           # Giao tiếp backend
│   ├── core/          # Camera, FaceDetector
│   ├── logic/         # Login / Register logic
│   └── types/         # TypeScript interfaces
│
├── index.html         # Login page
├── register.html      # Register page
├── dashboard.html     # Success page
└── tailwind.config.js
```

---

## Cài đặt & Chạy dự án

```bash
cd Frontend
npm install
npm run dev
```

Ứng dụng chạy mặc định tại:

```
http://localhost:5173
```

---

## Tích hợp Backend

File cấu hình API:

```
src/api/auth.ts
```

```ts
const BASE_URL = "http://localhost:8000/api/v1/auth";
```

Backend cần được chạy trước khi sử dụng frontend.

---

## Trải nghiệm người dùng

* Hiển thị khung nhận diện khuôn mặt realtime
* Phản hồi trạng thái rõ ràng (đang quét, đang xác thực, thành công, thất bại)
* Tự động hóa quy trình xác thực
* Giao diện tối giản, dễ sử dụng

---

## Hạn chế & Lưu ý

* Phụ thuộc vào webcam người dùng
* Chưa có xử lý liveness (chống giả mạo)
* Chỉ phù hợp demo / học tập

---

## Hướng phát triển

* Thêm liveness detection
* Cải thiện UX trên mobile
* Thêm loading animation chuyên nghiệp
* Tích hợp JWT / session
* Deploy frontend tách biệt (Vercel / Netlify)
