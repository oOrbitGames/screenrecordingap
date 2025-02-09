const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const previewContainer = document.getElementById("previewContainer");
const preview = document.getElementById("preview");

let mediaRecorder;
let recordedChunks = [];

startButton.addEventListener("click", async () => {
    try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: false,
        });

        preview.srcObject = stream;
        previewContainer.classList.remove("hidden");

        recordedChunks = [];
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: "video/webm" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "orbit.recording.webm";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };

        mediaRecorder.start();
    } catch (error) {
        console.error("Error accessing screen sharing: ", error);
    }
});

stopButton.addEventListener("click", () => {
    mediaRecorder.stop();
    preview.srcObject.getTracks().forEach(track => track.stop());
    previewContainer.classList.add("hidden");
});
