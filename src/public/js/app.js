const socket = io();
const call = document.getElementById("call");
const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const selectCamera = document.getElementById("selectCamera");

call.hidden = true;
let myStream;
let muted = false;
let cameraOff = false;
let myPeerConnection;

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks()[0];
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.label = camera.label;
      if (currentCamera.label === camera.label) {
        option.selected = true;
      }
      selectCamera.appendChild(option);
    });
  } catch (error) {
    console.log(error);
  }
}
async function getMedia(deviceId) {
  const initialConstraints = { audio: true, video: { facingMode: "user" } };
  const cameraConstraints = {
    audio: true,
    video: { deviceId: { exact: deviceId } },
  };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstraints : initialConstraints
    );
    myFace.srcObject = myStream;
    if (!deviceId) {
      await getCameras();
    }
  } catch (error) {
    console.log(error);
  }
}

function handleMute() {
  myStream.getAudioTracks().forEach((track) => {
    track.enabled = !track.enabled;
  });
  if (!muted) {
    muteBtn.innerText = "unMute";
    muted = true;
  } else {
    muteBtn.innerText = "Mute";
    muted = false;
  }
}
function handleCamera() {
  myStream.getVideoTracks().forEach((track) => {
    track.enabled = !track.enabled;
  });
  if (!cameraOff) {
    cameraBtn.innerText = "Turn On";
    cameraOff = true;
  } else {
    cameraBtn.innerText = "Turn Off";
    cameraOff = false;
  }
}
async function changeCamera() {
  await getMedia(selectCamera.value);
  if (myPeerConnection) {
    const videoTrack = myStream.getVideoTracks()[0];
    const videoSender = myPeerConnection.getSenders().find((sender) => {
      sender.track.kind === "video";
      videoSender.replaceTrack(videoTrack);
    });
  }
}

muteBtn.addEventListener("click", handleMute);
cameraBtn.addEventListener("click", handleCamera);
selectCamera.addEventListener("input", changeCamera);

// Welcome Form (choose room name)
const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

let roomName;

async function startVideo() {
  welcome.hidden = true;
  call.hidden = false;
  const h2 = call.querySelector("h2");
  h2.innerText = roomName;
  await getMedia();
  makeConnection();
}

async function handleRoomName(event) {
  event.preventDefault();
  const input = welcomeForm.querySelector("input");
  roomName = input.value;
  await startVideo();
  socket.emit("join_room", input.value);
  input.value = "";
}

welcomeForm.addEventListener("submit", handleRoomName);

// socket function
socket.on("newbi", async () => {
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);
  socket.emit("offer", offer, roomName);
  console.log("send offer");
});

socket.on("offer", async (offer) => {
  myPeerConnection.setRemoteDescription(offer);
  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setLocalDescription(answer);
  socket.emit("answer", answer, roomName);
  console.log("get offer");
  console.log("send answer");
});
socket.on("answer", (answer) => {
  myPeerConnection.setRemoteDescription(answer);
  console.log("get answer");
});
socket.on("ice", (candidate) => {
  myPeerConnection.addIceCandidate(candidate);
  console.log("received candidate");
});

// RTC function
const peerFace = document.getElementById("peerFace");

function makeConnection() {
  myPeerConnection = new RTCPeerConnection();
  myPeerConnection.addEventListener("icecandidate", handleIce);
  myPeerConnection.addEventListener("addstream", handleAddStream);
  myStream.getTracks().forEach((track) => {
    myPeerConnection.addTrack(track, myStream);
  });
}
function handleIce(data) {
  socket.emit("ice", data.candidate, roomName);
  console.log("send candidate");
}
function handleAddStream(data) {
  console.log("got stream from Peer");
  peerFace.srcObject = data.stream;
}
