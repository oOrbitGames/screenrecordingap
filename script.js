const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const preview = document.getElementById("preview");

let mediaRecorder;
let recordedChunks = [];
let canvas, ctx;

async function startRecording() {
    try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const webcamStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });

        canvas = document.createElement("canvas");
        ctx = canvas.getContext("2d");

        const screenTrack = screenStream.getVideoTracks()[0];
        const screenSettings = screenTrack.getSettings();
        canvas.width = screenSettings.width;
        canvas.height = screenSettings.height;

        const webcamVideo = document.createElement("video");
        webcamVideo.srcObject = webcamStream;
        webcamVideo.play();

        function draw() {
            ctx.drawImage(screenStream.getVideoTracks()[0], 0, 0, canvas.width, canvas.height);
            const webcamWidth = canvas.width / 5;
            const webcamHeight = canvas.height / 5;
            ctx.drawImage(webcamVideo, canvas.width - webcamWidth - 10, canvas.height - webcamHeight - 10, webcamWidth, webcamHeight);
            requestAnimationFrame(draw);
        }
        draw();

        const combinedStream = canvas.captureStream(30);
        preview.srcObject = combinedStream;

        recordedChunks = [];
        mediaRecorder = new MediaRecorder(combinedStream);

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
            a.download = "recording-with-webcam.webm";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };

        mediaRecorder.start();
        stopButton.classList.remove("hidden");
    } catch (error) {
        console.error("Error starting recording:", error);
    }
}

function stopRecording() {
    mediaRecorder.stop();
    const tracks = preview.srcObject.getTracks();
    tracks.forEach(track => track.stop());
    stopButton.classList.add("hidden");
}

startButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);
