let video;
let poseNet;

/**
 * TODO - Make this configurable depending on the desired trade off between
 * response time and CPU usage.
 */
let poseInterval = 0.25;

let postIntervalId;
var started = false;

function setup() {
  const canvas = createCanvas(640, 480); // or use to make fullscreen canvas window.innerWidth, window.innerHeight, but you should to change the formula in changeFontSize()
  canvas.parent('videoContainer');

  // Video capture 
  video = createCapture({
    video: {
      mandatory: {
        minWidth: width,
        minHeight: height
      },
      optional: [{ maxFrameRate: 1/poseInterval }]
    },
    audio: false
  });
  
  if (video == true) {console.log('true');}

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(modelReady);
  
  // Listen for 'pose' events
  poseNet.on('pose', function(results) {
    image(video, 0, 0, width, height);
    drawEyes(results);
  });
  
  // Hide the video element, and just show the canvas
  video.hide();
  noLoop();
}

// This function turns on AI
function startOrStop() {
  let html;
  if(!started){
    started = true;
    html = 'stop';
    poseIntervalId = setInterval(() => {
      poseNet.singlePose(video)
    }, poseInterval*1000)
  }
  else{
    removeBlur();
    started = false;
    html = 'start';
    clearInterval(poseIntervalId)
  }

  select('#start-or-stop-button').html(html);
}

function modelReady(){
  // select('#text').html('Hmm... What is it? It’s time to move! AI has turned on. You can insert your text here.')
}

var rightEye, leftEye, rightShoulder, leftShoulder, rightWrist, leftWrist, rightKnee,
    leftKnee, rightAnkle, leftAnkle, distanceEye, defaultRightEyePosition = [],
    defaultLeftEyePosition = [];
// A function to draw ellipses over the detected keypoints
function drawEyes(poses)  {
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i++) {
    // For each pose detected, loop through all the keypoints
    let pose = poses[i].pose;
    for (let j = 0; j < pose.keypoints.length; j++) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      let keypoint = pose.keypoints[j];
      rightEye = pose.keypoints[2].position;
      leftEye = pose.keypoints[1].position;
      rightShoulder = pose.keypoints[6].position;
      leftShoulder = pose.keypoints[5].position;
      rightWrist = pose.keypoints[10].position;
      leftWrist = pose.keypoints[9].position;
      rightKnee = pose.keypoints[14].position;
      leftKnee = pose.keypoints[13].position;
      rightAnkle = pose.keypoints[16].position;
      leftAnkle = pose.keypoints[15].position;
      
      
      //Position of eyes when a human opens experiment page. Start position.
      while(defaultRightEyePosition.length < 1) {
        defaultRightEyePosition.push(rightEye.y);
      }
      
      while(defaultLeftEyePosition.length < 1) {
        defaultLeftEyePosition.push(leftEye.y);
      }
      
      //Math.abs converts a negative number to a positive one
      if (Math.abs(rightEye.y - defaultRightEyePosition[0]) > 15) {
        blurScreen();
      }
      
      if (Math.abs(rightEye.y - defaultRightEyePosition[0]) < 15) {
        removeBlur();
      }
      
      
      // Only draw an eye is the pose probability is bigger than 0.2
      if (keypoint.score > 0.9 ) {
        fill(255, 0, 0);
        noStroke();
        ellipse(rightEye.x, rightEye.y, 10, 10);
        ellipse(leftEye.x, leftEye.y, 10, 10);
        console.log(Math.abs(rightEye.y - defaultRightEyePosition[0]));
      }
    }
  }
}

function blurScreen() { 
  document.body.style.filter = 'blur(10px)';
  document.body.style.transition= '0.9s';
}

function removeBlur() {
  document.body.style.filter = 'blur(0px)';
}