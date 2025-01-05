document.getElementById('start-btn').addEventListener('click', async () => {
  try {
    console.log("Initializing webcam...");
    const videoElement = document.createElement('video');
    videoElement.style.width = "100%";
    videoElement.style.height = "auto";
    document.body.appendChild(videoElement);

    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoElement.srcObject = stream;
    videoElement.play();
    console.log("Webcam initialized successfully.");

    document.getElementById('score').innerText = "Analyzing...";
    console.log("Loading PoseNet model...");

    try {
      const net = await posenet.load();
      console.log("PoseNet model loaded successfully.");

      videoElement.addEventListener('loadeddata', async () => {
        try {
          const pose = await net.estimateSinglePose(videoElement, { flipHorizontal: false });
          console.log("Pose estimation completed:", pose);

          const score = calculatePostureScore(pose);
          document.getElementById('score').innerText = `Posture Score: ${score}`;
        } catch (poseError) {
          console.error("Error estimating pose:", poseError);
          document.getElementById('score').innerText = "Error analyzing posture.";
        }
      });
    } catch (loadError) {
      console.error("Error loading PoseNet model:", loadError);
      document.getElementById('score').innerText = "Error loading PoseNet.";
    }
  } catch (error) {
    console.error("Error accessing webcam or initializing PoseNet:", error);
    if (error.name === "NotAllowedError") {
      document.getElementById('score').innerText = "Camera access denied.";
    } else if (error.name === "NotFoundError") {
      document.getElementById('score').innerText = "No camera found.";
    } else {
      document.getElementById('score').innerText = "An unexpected error occurred.";
    }
  }
});

// Placeholder function
function calculatePostureScore(pose) {
  const nose = pose.keypoints.find(k => k.part === "nose");
  return nose ? Math.round(nose.score * 100) : 0;
}
