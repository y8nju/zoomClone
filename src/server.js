import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import express from "express";

const app = express();

// console.log(__dirname); //C:\ARU\zoomClone\src
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname+ "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:8000`);

// app.listen(8000, handleListen);

const server = http.createServer(app);
const wss = new WebSocketServer({server});

wss.on("connection", (socket) => {
	console.log('Connected to Browser ✅'); // Browser Connected
	socket.on("close", () => {
		console.log("Disconnected from Browser ❌"); // Browser Disconnected
	});
	socket.on("message", (message) => {
		console.log(message.toString());	// message from browser
	})
	socket.send("Hello"); // send message to browser
});

server.listen(8000, handleListen);