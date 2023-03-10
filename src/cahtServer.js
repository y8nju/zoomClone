import http from "http";
// import WebSocket, { WebSocketServer } from "ws";
import express from "express";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";

function publicRoom() {
	const {sockets: {adapter: {sids, rooms}}} = wsServer;
	// const sids =  wsServer.sockets.adapter.sids;
	// const rooms =  wsServer.sockets.adapter.rooms;
	const publicRooms = [];
	rooms.forEach((_, key) => {
		if(sids.get(key) === undefined) {
			publicRooms.push(key);
		}
	});
	return publicRooms;
}

function changeRoom() {
	wsServer.sockets.emit("room_change", publicRoom(), countRoom());
}
function countRoom(roomName) {
	return wsServer.sockets.adapter.rooms.get(roomName)?.size
}

const app = express();

// console.log(__dirname); //C:\ARU\zoomClone\src
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname+ "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("*", (_, res) => res.redirect("/"));


const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
	cors: {
		origin: ["https://admin.socket.io"],
		credentials: true
	}
});
instrument(wsServer, {
	auth: false
});

wsServer.on('connection', (socket) => {
	changeRoom();
	socket["nickname"] = "Anon";
	socket.onAny((event, ...args) => {
		console.log(wsServer.sockets.adapter);
		console.log(`Socket Event: ${event}`);
	});
	socket.on("enter_room", (roomName, nickname, showRoom) => {
		socket.join(roomName);
		socket["nickname"] = nickname;
		showRoom(countRoom(roomName));
		socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
		changeRoom();
	});
	socket.on("disconnecting", () => {
		// 클라이언트가 서버와 연결이 끊어지기 전에 메세지 전송
		socket.rooms.forEach(room => socket.to(room).emit("bye", socket.nickname, countRoom(room)-1));
	});
	socket.on("disconnect", () => {
		// 클라이언트가 서버와 연결이 끊어지면 메세지 전송
		changeRoom();
	});
	socket.on("new_message", (msg, room, done) => {
		socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
		done();
	});
});

// app.listen(8000, handleListen);

// const wss = new WebSocketServer({server});

/* const sockets = [];	// msg data array

wss.on("connection", (socket) => {
	sockets.push(socket);
	socket["nickname"] = "Anon";
	console.log('Connected to Browser ✅'); // Browser Connected
	socket.on("close", () => {
		console.log("Disconnected from Browser ❌"); // Browser Disconnected
	});
	socket.on("message", (msg) => {
		// console.log(message.toString());	// message from browser
		const message = JSON.parse(msg);
		switch(message.type) {
			case "new_message":
				return sockets.forEach( aSocket => aSocket.send(`${socket.nickname}: ${message.payload}`) );
			case "nickname":
				return socket["nickname"] = message.payload;
		}
	});
	// socket.send("Hello"); // send message to browser
}); */

const handleListen = () => console.log(`Listening on http://localhost:8000`);

httpServer.listen(8000, handleListen);