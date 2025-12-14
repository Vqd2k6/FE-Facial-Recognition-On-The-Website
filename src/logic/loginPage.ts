import { authApi } from '../api/auth';
import { Camera } from '../core/camera';
import { FaceDetector } from '../core/faceDetector';

// Khởi tạo các phần tử DOM
const videoEl = document.getElementById('video') as HTMLVideoElement;
const canvasEl = document.getElementById('canvas') as HTMLCanvasElement;
const btnStart = document.getElementById('btnStartCamera') as HTMLButtonElement;
const btnLogin = document.getElementById('btnLogin') as HTMLButtonElement;
const cameraSection = document.getElementById('cameraSection') as HTMLDivElement;
const loadingText = document.getElementById('loadingText') as HTMLDivElement;
const usernameInput = document.getElementById('username') as HTMLInputElement;
const passwordInput = document.getElementById('password') as HTMLInputElement;
const btnTogglePass = document.getElementById('btnTogglePass') as HTMLSpanElement;
const form = document.getElementById('loginForm') as HTMLFormElement;

// Khởi tạo các instance cốt lõi
const camera = new Camera(videoEl);
const detector = new FaceDetector(videoEl, canvasEl);

// Quản lý trạng thái (State Management)
let checkInterval: ReturnType<typeof setInterval> | null = null;
let timeoutRef: ReturnType<typeof setTimeout> | null = null;
let failCount: number = 0;
let isRequestPending: boolean = false;
let isAuthenticated: boolean = false;

/**
 * Xử lý sự kiện ẩn/hiện mật khẩu khi bấm vào icon mắt.
 * Chuyển đổi type của input giữa 'password' và 'text'.
 */
btnTogglePass.addEventListener('click', () => {
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        btnTogglePass.innerText = "visibility_off";
    } else {
        passwordInput.type = "password";
        btnTogglePass.innerText = "visibility";
    }
});

/**
 * Kiểm tra tính hợp lệ của dữ liệu đầu vào.
 * Chỉ kích hoạt nút "Bắt đầu xác thực" khi username và password không rỗng.
 */
function validateInputs(): void {
    if (usernameInput.value.trim() && passwordInput.value) {
        btnStart.disabled = false;
        btnStart.classList.remove('border-gray-300', 'bg-gray-100', 'text-gray-400', 'cursor-not-allowed');
        btnStart.classList.add('border-brand-primary', 'bg-brand-light', 'text-brand-primary', 'cursor-pointer', 'hover:bg-teal-100');
    } else {
        btnStart.disabled = true;
        btnStart.classList.add('border-gray-300', 'bg-gray-100', 'text-gray-400', 'cursor-not-allowed');
        btnStart.classList.remove('border-brand-primary', 'bg-brand-light', 'text-brand-primary', 'cursor-pointer', 'hover:bg-teal-100');
    }
}

// Gắn sự kiện kiểm tra input mỗi khi người dùng nhập liệu
[usernameInput, passwordInput].forEach(el => el.addEventListener('input', validateInputs));

/**
 * Khởi động Camera và bắt đầu quy trình nhận diện khuôn mặt.
 */
btnStart.addEventListener('click', async () => {
    failCount = 0;
    isRequestPending = false;
    isAuthenticated = false;

    // Cập nhật UI: Ẩn nút bắt đầu, hiện khung camera
    btnStart.classList.add('hidden');
    cameraSection.classList.remove('hidden');

    // Cập nhật UI: Vô hiệu hóa nút đăng nhập trong quá trình xác thực
    btnLogin.disabled = true;
    btnLogin.innerText = "ĐANG CHỜ XÁC THỰC...";
    btnLogin.classList.add('bg-[#80cbc4]', 'cursor-not-allowed');
    btnLogin.classList.remove('bg-brand-primary', 'hover:bg-teal-700', 'cursor-pointer');

    try {
        await camera.start();
        await detector.loadModels();

        loadingText.innerText = "Đang tìm khuôn mặt...";

        startAuthLoop();
        startTimeoutTimer();
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Lỗi không xác định";
        alert("Lỗi: " + errorMessage);
        resetToRetryState("Lỗi Camera");
    }
});

/**
 * Thiết lập giới hạn thời gian cho phiên xác thực (30 giây).
 * Nếu quá thời gian, hệ thống sẽ dừng lại và yêu cầu thử lại.
 */
function startTimeoutTimer(): void {
    if (timeoutRef) clearTimeout(timeoutRef);
    timeoutRef = setTimeout(() => {
        resetToRetryState("Quá thời gian. Thử lại?");
    }, 30000);
}

/**
 * Vòng lặp chính xử lý xác thực.
 * Định kỳ phát hiện khuôn mặt, chụp ảnh và gọi API đăng nhập.
 */
function startAuthLoop(): void {
    checkInterval = setInterval(async () => {
        // Nếu đang có request chờ phản hồi, tạm dừng gửi request mới
        if (isRequestPending) return;

        const detection = await detector.detect();

        // Điều kiện: Có khuôn mặt và độ tin cậy (score) > 0.7
        if (detection && detection.score > 0.7) {
            isRequestPending = true;
            loadingText.innerText = "Đang xác thực...";
            loadingText.style.color = "#fbbf24";

            try {
                const imgBase64 = camera.capture();

                // Gọi API xác thực
                await authApi.login({
                    username: usernameInput.value,
                    password: passwordInput.value,
                    image_base64: imgBase64
                });

                onLoginSuccess();
            } catch (error) {
                failCount++;
                if (failCount >= 5) {
                    resetToRetryState("Không thể nhận diện. Vui lòng thử lại.");
                } else {
                    // Nếu thất bại tạm thời, cho phép thử lại ở frame tiếp theo
                    loadingText.innerText = "Đang xác thực...";
                    loadingText.style.color = "#fbbf24";
                    isRequestPending = false;
                }
            }
        } else {
            loadingText.innerText = "Vui lòng giữ yên và nhìn thẳng...";
            loadingText.style.color = "white";
        }
    }, 200);
}

/**
 * Xử lý khi đăng nhập thành công.
 * Dừng camera, cập nhật trạng thái UI sang "Đã xác thực".
 */
function onLoginSuccess(): void {
    stopLoop();
    camera.stop();
    isAuthenticated = true;

    cameraSection.classList.add('hidden');
    btnStart.classList.remove('hidden');

    // Cập nhật trạng thái nút Start -> Thành công (Xanh lá)
    btnStart.innerHTML = `<span class="material-icons text-xl">check_circle</span> Đã xác thực khuôn mặt`;
    btnStart.classList.remove('border-brand-primary', 'bg-brand-light', 'text-brand-primary');
    btnStart.classList.add('border-green-500', 'bg-green-100', 'text-green-600', 'cursor-default');
    btnStart.disabled = true;

    // Kích hoạt nút Đăng nhập chính thức
    btnLogin.disabled = false;
    btnLogin.innerText = "ĐĂNG NHẬP";
    btnLogin.classList.remove('bg-[#80cbc4]', 'cursor-not-allowed');
    btnLogin.classList.add('bg-brand-primary', 'hover:bg-teal-700', 'cursor-pointer');
}

/**
 * Đặt lại UI về trạng thái "Thử lại" khi có lỗi hoặc hết thời gian.
 * @param msg - Thông báo lỗi hiển thị trên nút.
 */
function resetToRetryState(msg: string): void {
    stopLoop();
    camera.stop();

    cameraSection.classList.add('hidden');
    btnStart.classList.remove('hidden');

    // Cập nhật trạng thái nút Start -> Lỗi/Thử lại (Đỏ)
    btnStart.innerHTML = `<span class="material-icons text-xl">error_outline</span> ${msg}`;
    btnStart.classList.remove('bg-brand-light', 'text-brand-primary', 'border-brand-primary');
    btnStart.classList.add('bg-red-50', 'text-red-500', 'border-red-300');
}

/**
 * Hàm tiện ích: Xóa các bộ đếm thời gian (Interval/Timeout).
 */
function stopLoop(): void {
    if (checkInterval) clearInterval(checkInterval);
    if (timeoutRef) clearTimeout(timeoutRef);
}

/**
 * Xử lý sự kiện submit form.
 * Chỉ chuyển trang khi cờ isAuthenticated = true.
 */
form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (isAuthenticated) {
        window.location.href = "/dashboard.html";
    }
});