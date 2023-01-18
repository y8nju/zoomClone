const socket = new WebSocket(`ws://${window.location.host}`);

// Connect
socket.addEventListener('open', () => {
    console.log('Connected to Server ✅');
});

// Sending
socket.addEventListener('message', (message) => {
    console.log("New message: ", message.data);
});

socket.addEventListener("close", () => {
    console.log("Disconnected from Server ❌");
});

socket.addEventListener("message", () => {
    socket.send("Hello from the Browser!");
});