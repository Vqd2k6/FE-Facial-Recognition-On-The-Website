import { authApi } from '../api/auth';
import { Camera } from '../core/camera';
import { FaceDetector } from '../core/faceDetector';

// Khởi tạo các phần tử DOM
const videoEl = document.getElementById('video') as HTMLVideoElement;
const canvasEl = document.getElementById('canvas') as HTMLCanvasElement;
const btnOpenCam = document.getElementById('btnOpenCam') as HTMLButtonElement;
const btnSubmit = document.getElementById('btnSubmit') as HTMLButtonElement;
const statusText = document.getElementById('statusText') as HTMLDivElement;
const usernameInput = document.getElementById('username') as HTMLInputElement;
const passwordInput = document.getElementById('password') as HTMLInputElement;
const confirmPassInput = document.getElementById('confirmPassword') as HTMLInputElement;
const passError = document.getElementById('passError') as HTMLParagraphElement;
const form = document.getElementById('registerForm') as HTMLFormElement;
const cameraBoxWrapper = document.getElementById('cameraBoxWrapper') as HTMLDivElement;
const btnTogglePass = document.getElementById('btnTogglePass') as HTMLSpanElement;
const btnToggleConfirmPass = document.getElementById('btnToggleConfirmPass') as HTMLSpanElement;

// Khởi tạo các instance cốt lõi
const camera = new Camera(videoEl);
const detector = new FaceDetector(videoEl, canvasEl);

// Quản lý trạng thái (State Management)
let capturedImages: string[] = []; // Mảng chứa 5 ảnh khuôn mặt cần thu thập
let checkInterval: ReturnType<typeof setInterval> | null = null;
let lastCaptureTime: number = 0;

/**
 * Hàm tiện ích thiết lập sự kiện ẩn/hiện mật khẩu cho input.
 * @param btn - Nút icon con mắt.
 * @param input - Input mật khẩu tương ứng.
 */
function setupEyeIcon(btn: HTMLSpanElement, input: HTMLInputElement): void {
    btn.addEventListener('click', () => {
        if (input.type === "password") {
            input.type = "text";
            btn.innerText = "visibility_off";
        } else {
            input.type = "password";
            btn.innerText = "visibility";
        }
    });
}

// Gắn sự kiện cho cả 2 ô mật khẩu và xác nhận mật khẩu
setupEyeIcon(btnTogglePass, passwordInput);
setupEyeIcon(btnToggleConfirmPass, confirmPassInput);

/**
 * Kiểm tra tính hợp lệ của input.
 * Đảm bảo mật khẩu khớp nhau và các trường không được để trống.
 */
function validateInputs(): void {
    const user = usernameInput.value.trim();
    const pass = passwordInput.value;
    const confirm = confirmPassInput.value;
    const isMatch = pass === confirm && pass.length > 0;

    // Hiển thị thông báo lỗi nếu mật khẩu nhập lại không khớp
    if (confirm.length > 0 && !isMatch) passError.classList.remove('hidden');
    else passError.classList.add('hidden');

    // Chỉ cho phép mở camera khi dữ liệu hợp lệ
    if (user && pass && isMatch) {
        btnOpenCam.disabled = false;
        btnOpenCam.classList.remove('border-gray-300', 'bg-gray-100', 'text-gray-400', 'cursor-not-allowed');
        btnOpenCam.classList.add('border-brand-primary', 'bg-brand-light', 'text-brand-primary', 'cursor-pointer', 'hover:bg-teal-100');
    } else {
        btnOpenCam.disabled = true;
        btnOpenCam.classList.add('border-gray-300', 'bg-gray-100', 'text-gray-400', 'cursor-not-allowed');
        btnOpenCam.classList.remove('border-brand-primary', 'bg-brand-light', 'text-brand-primary', 'cursor-pointer', 'hover:bg-teal-100');
    }
}

// Gắn sự kiện lắng nghe input
[usernameInput, passwordInput, confirmPassInput].forEach(el => el.addEventListener('input', validateInputs));

/**
 * Mở camera và bắt đầu quá trình tải model, thu thập dữ liệu.
 */
btnOpenCam.addEventListener('click', async () => {
    // Reset lại mảng ảnh và bộ đếm
    capturedImages = [];
    if (checkInterval) clearInterval(checkInterval);

    // Vô hiệu hóa nút Đăng ký trong khi đang thu thập ảnh
    btnSubmit.disabled = true;
    btnSubmit.classList.add('cursor-not-allowed', 'opacity-50');

    // Cập nhật UI
    btnOpenCam.classList.add('hidden');
    cameraBoxWrapper.classList.remove('hidden');
    statusText.innerText = "Đang khởi động...";

    try {
        await camera.start();
        await detector.loadModels();
        statusText.innerText = "Đang tìm khuôn mặt...";
        startCollectionLoop();
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Lỗi không xác định";
        alert("Lỗi Camera: " + errorMessage);

        // Khôi phục UI nếu lỗi
        btnOpenCam.classList.remove('hidden');
        cameraBoxWrapper.classList.add('hidden');
    }
});

/**
 * Vòng lặp thu thập 5 ảnh khuôn mặt.
 * Chạy định kỳ để phát hiện và chụp ảnh tự động.
 */
function startCollectionLoop(): void {
    checkInterval = setInterval(async () => {
        const detection = await detector.detect();
        const now = Date.now();

        if (detection && detection.score > 0.7) {
            // Giới hạn tốc độ chụp: Chỉ chụp mỗi 200ms để tránh ảnh bị trùng lặp
            if (now - lastCaptureTime > 200) {
                const imgBase64 = camera.capture();
                capturedImages.push(imgBase64);
                lastCaptureTime = now;

                statusText.innerText = "Đang quét dữ liệu khuôn mặt...";
                statusText.style.color = "#fbbf24";

                // Đủ 5 ảnh thì dừng lại
                if (capturedImages.length >= 5) {
                    finishCollection();
                }
            }
        } else {
            statusText.innerText = "Vui lòng giữ yên và nhìn thẳng...";
            statusText.style.color = "white";
        }
    }, 100);
}

/**
 * Hoàn tất quá trình thu thập ảnh.
 * Dừng camera và cập nhật UI để sẵn sàng đăng ký.
 */
function finishCollection(): void {
    if (checkInterval) clearInterval(checkInterval);
    camera.stop();

    cameraBoxWrapper.classList.add('hidden');
    btnOpenCam.classList.remove('hidden');

    statusText.innerText = "Đã thu thập dữ liệu.";

    // Đổi nút Camera thành nút "Đăng ký lại"
    btnOpenCam.innerHTML = `<span class="material-icons text-xl">replay</span> Đăng ký lại khuôn mặt`;
    btnOpenCam.classList.remove('bg-brand-light', 'text-brand-primary');
    btnOpenCam.classList.add('bg-gray-100', 'text-gray-600', 'border-gray-400');

    // Kích hoạt nút Đăng ký
    btnSubmit.disabled = false;
    btnSubmit.classList.remove('cursor-not-allowed', 'opacity-50');
    btnSubmit.classList.add('hover:bg-teal-600');
}

/**
 * Xử lý sự kiện gửi form đăng ký lên Server.
 */
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (capturedImages.length < 5) {
        alert("Chưa thu thập đủ dữ liệu khuôn mặt!");
        return;
    }

    try {
        btnSubmit.innerText = "ĐANG XỬ LÝ...";

        const response = await authApi.register({
            username: usernameInput.value,
            password: passwordInput.value,
            images: capturedImages
        });

        alert(response.message);
        window.location.href = "/"; // Quay về trang đăng nhập
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Lỗi không xác định";
        alert("Lỗi: " + errorMessage);
        btnSubmit.innerText = "ĐĂNG KÝ";
    }
});