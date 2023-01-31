const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");

let myStream;
let muted = false;
let cameraOff = false;

async function getMedia() {
    try {
        myStream = await navigator.mediaDevices.getUserMedia(
            // 요청된 미디어 유형을 포함하는 트랙 을 생성하는 미디어 입력을 사용할 수 있는 권한을 사용자에게 요청
            {
                audio: true, 
                video: true
            }
        );
        // console.log(myStream);
        myFace.srcObject = myStream;
    } catch (e) {
        console.log(e);
    }
}
getMedia();

function handleMuteClick(){
    if(!muted) {
        muteBtn.innerText = "Unmute";
        muted = true;
    } else {
        muteBtn.innerText = "Mute";
        muted = false;
    }
}
function handleCameraClick(){
    if(cameraOff) {
        cameraBtn.innerText = "Turn Camera Off";
        cameraOff = false;
    } else {
        cameraBtn.innerText = "Turn Camera On";
        cameraOff = true;
    }
}
muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);