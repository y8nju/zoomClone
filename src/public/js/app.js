const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");
const call = document.getElementById("call");

call.hidden = true;


let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;

async function getCameras() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === "videoinput");
        const currentCamera = myStream.getVideoTracks()[0];
        cameras.forEach(camera => {
            const option = document.createElement("option");
            option.value = camera.deviceId;
            option.innerText = camera.label;
            if(currentCamera.label === camera.label) {
                option.selected = true;
            }
            camerasSelect.appendChild(option);
        });
    } catch(e) {
        console.log(e);
    }
}

async function getMedia(deviceId) {
    const initalConstrains = {
        audio: true, 
        video: {facingMode: "user"}
    }
    const cameraConstrains = {
        audio: true,
        video: {
            deviceId: {
                exact: deviceId
            }
        }
    }
    try {
        // 요청된 미디어 유형을 포함하는 트랙 을 생성하는 미디어 입력을 사용할 수 있는 권한을 사용자에게 요청
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId ? cameraConstrains : initalConstrains
        );
        // console.log(myStream);
        myFace.srcObject = myStream;
        if(!deviceId) {
            await getCameras();
        }
    } catch (e) {
        console.log(e);
    }
}

function handleMuteClick(){
    // console.log(myStream.getAudioTracks());
    myStream.getAudioTracks()
        .forEach(track => track.enabled = !track.enabled);
    if(!muted) {
        muteBtn.innerText = "Unmute";
        muted = true;
    } else {
        muteBtn.innerText = "Mute";
        muted = false;
    }
}
function handleCameraClick(){
    console.log(myStream.getVideoTracks());
    myStream.getVideoTracks()
        .forEach(track => track.enabled = !track.enabled);
    if(cameraOff) {
        cameraBtn.innerText = "Turn Camera Off";
        cameraOff = false;
    } else {
        cameraBtn.innerText = "Turn Camera On";
        cameraOff = true;
    }
}
async function handleCameraChange() {
    await getMedia(camerasSelect.value);
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);

// Welcome Form (Join a room)
const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

async function initCall() {
    welcome.hidden = true;
    call.hidden = false;
    await getMedia();
    makeConnection();
}

async function handleWelcomeSubmit(event) {
    event.preventDefault();
    const input = welcomeForm.querySelector("input");
    await initCall();
    socket.emit("join_room", input.value);
    roomName = input.value;
    input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// Socket Code

// A peer / Offer send
socket.on("welcome", async () =>{
    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer);
    console.log("sent the offer");
    socket.emit("offer", offer, roomName);
});

// B peer / Answer send
socket.on("offer", async (offer) => {
    console.log("recived the offer");
    myPeerConnection.setRemoteDescription(offer);
    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer);
    socket.emit("answer", answer, roomName);
    console.log("sent the answer");
});

// A peer / Answer receive
socket.on("answer", answer => {
    console.log("recived the answer");
    myPeerConnection.setRemoteDescription(answer);
})

socket.on("ice", ice => {
    console.log("recived candidate");
    myPeerConnection.addIceCandidate(ice);
    // A peer: candidate send
    // B peer: IceCandidate Add
});

// RTC Code
function makeConnection() {
    myPeerConnection = new RTCPeerConnection();
    myPeerConnection.addEventListener("icecandidate", handleIce);
    myPeerConnection.addEventListener("addstream", handleAddStream);
    myStream.getTracks()
        .forEach(track => myPeerConnection.addTrack(track, myStream));
}

function handleIce(data) {
    console.log("sent candidate");
    socket.emit("ice", data.candidate, roomName);	// 두 peer가 서로 데이터를 주고 받음
}

function handleAddStream(data) {
    const peersFace = document.getElementById("peersFace");
    peersFace.srcObject = data.stream;
    // 나의 브라우저 화면에 상대 peer의 video를 띄움
}