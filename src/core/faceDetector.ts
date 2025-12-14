import * as faceapi from 'face-api.js';

export class FaceDetector {
    private canvas: HTMLCanvasElement;
    private video: HTMLVideoElement;
    private isModelLoaded: boolean = false;

    constructor(video: HTMLVideoElement, canvas: HTMLCanvasElement) {
        this.video = video;
        this.canvas = canvas;
    }

    /**
     * Tải model TinyFaceDetector từ thư mục public.
     * Cần đảm bảo file shard và manifest đã có trong thư mục /models.
     * @throws Error nếu quá trình tải thất bại.
     */
    async loadModels(): Promise<void> {
        try {
            await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
            this.isModelLoaded = true;
            console.log("Đã tải xong Model nhận diện khuôn mặt");
        } catch (error) {
            console.error("Lỗi tải Model:", error);
            throw error;
        }
    }

    /**
     * Nhận diện khuôn mặt duy nhất trong luồng video hiện tại.
     * Sử dụng model TinyFaceDetector (nhẹ, phù hợp web).
     * @returns Kết quả nhận diện (Detection) hoặc undefined nếu không thấy.
     */
    async detect(): Promise<faceapi.FaceDetection | undefined> {
        if (!this.isModelLoaded) return undefined;

        const options = new faceapi.TinyFaceDetectorOptions({
            inputSize: 224,
            scoreThreshold: 0.5
        });

        const detection = await faceapi.detectSingleFace(this.video, options);
        this.draw(detection);
        return detection;
    }

    /**
     * Vẽ khung chữ nhật bao quanh khuôn mặt lên thẻ Canvas.
     * @param detection - Đối tượng kết quả nhận diện.
     */
    private draw(detection: faceapi.FaceDetection | undefined): void {
        const ctx = this.canvas.getContext('2d');
        // Xóa canvas cũ trước khi vẽ mới để tránh bị chồng hình
        if (ctx) ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (!detection) return;

        // Điều chỉnh kích thước vùng nhận diện khớp với kích thước video
        const displaySize = {
            width: this.video.videoWidth,
            height: this.video.videoHeight
        };

        faceapi.matchDimensions(this.canvas, displaySize);
        const resizedDetections = faceapi.resizeResults(detection, displaySize);
        const score = detection.score;

        // Logic màu sắc: > 0.7 là Tốt (Xanh), ngược lại là Chưa đạt (Đỏ)
        const boxColor = score > 0.7 ? '#10B981' : '#EF4444';

        const drawBox = new faceapi.draw.DrawBox(resizedDetections.box, {
            boxColor: boxColor,
            label: ' ' // Để trống để không hiển thị nhãn mặc định của thư viện
        });

        drawBox.draw(this.canvas);
    }
}