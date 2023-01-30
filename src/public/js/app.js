const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;

let roomName;

function addMessage(message) {
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}

function handleMessageSubmit(event) {
    event.preventDefault();
    const input = room.querySelector("#messageForm input");
    const message = input.value;
    socket.emit("new_message", message, roomName, () => {
        // new_message 이벤트: 나에게 출력
        addMessage(`You: ${message}`);
    });
    input.value = "";
}

function showRoom() {
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;
    const messageForm = room.querySelector("#messageForm");
    messageForm.addEventListener("submit", handleMessageSubmit);
}

function handleRoomSubmit(event) {
    event.preventDefault();
    const roomNameInput = form.querySelector("#roomName");
    const nicknameInput = form.querySelector("#nickname");
    socket.emit("enter_room", roomNameInput.value, nicknameInput.value, showRoom);
    roomName = roomNameInput.value;
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user) => {
    addMessage(`${user} Joined!`);
});
socket.on("bye", (left) => {
    addMessage(`${left} left...`);
});
// new_message 이벤트: 다른 유저에게 출력
socket.on("new_message", addMessage);
// socket.on("room_change", (msg) => console.log(msg));
socket.on("room_change", (rooms) => {
    const roomList = welcome.querySelector("ul");
    roomList.innerText = "";
    if(rooms.length === 0) {
        return;
    };
    rooms.forEach(room => {
        const li = document.createElement("li");
        li.innerText = room;
        roomList.appendChild(li);
    });
});
