export class Camera {
    private videoElement: HTMLVideoElement;
    private stream: MediaStream | null = null;

    constructor(videoElement: HTMLVideoElement) {
        this.videoElement = videoElement;
    }

    /**
     * Yêu cầu quyền truy cập Camera và gán luồng video vào thẻ HTML.
     * @returns Promise hoàn thành khi video bắt đầu phát.
     */
    async start(): Promise<void> {
        try {
            // Cấu hình camera: Ưu tiên HD (640x480), camera trước (user)
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user',
                },
                audio: false, // Không thu âm thanh
            });

            this.videoElement.srcObject = this.stream;

            // Chờ video load xong metadata (kích thước, định dạng) mới play
            return new Promise((resolve) => {
                this.videoElement.onloadedmetadata = () => {
                    this.videoElement.play();
                    resolve();
                };
            });
        } catch (error) {
            console.error("Lỗi Camera:", error);
            throw new Error("Không thể truy cập Camera. Vui lòng cấp quyền sử dụng.");
        }
    }

    /**
     * Dừng Camera và giải phóng tài nguyên phần cứng.
     * Rất quan trọng để tránh đèn camera vẫn sáng khi rời trang.
     */
    stop(): void {
        if (this.stream) {
            this.stream.getTracks().forEach((track) => track.stop());
            this.stream = null;
            this.videoElement.srcObject = null;
        }
    }

    /**
     * Chụp một khung hình từ video và chuyển thành chuỗi Base64.
     * @returns Chuỗi ảnh định dạng JPEG.
     */
    capture(): string {
        // Tạo canvas ảo trong bộ nhớ (không hiển thị ra UI)
        const canvas = document.createElement('canvas');
        canvas.width = this.videoElement.videoWidth;
        canvas.height = this.videoElement.videoHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) throw new Error("Không thể khởi tạo Context 2D");

        // Xử lý hiệu ứng gương (Mirror): Lật ngược ảnh ngang
        // Bước 1: Dịch chuyển toạ độ sang phải
        ctx.translate(canvas.width, 0);
        // Bước 2: Lật ngược trục X
        ctx.scale(-1, 1);
        // Bước 3: Vẽ ảnh
        ctx.drawImage(this.videoElement, 0, 0);

        // Xuất ảnh ra dạng Base64 (Chất lượng 0.9 để giảm dung lượng mạng)
        return canvas.toDataURL('image/jpeg', 0.9);
    }
}