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

wsServer.on("connection", (socket) => {
	socket["nickname"] = "Anon";
    socket.on("join_room", (roomName, nickname, initCall) => {
        socket.join(roomName);
		socket["nickname"] = nickname;
		initCall(countRoom(roomName));
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
    socket.on("offer", (offer, roomName) => {
        socket.to(roomName).emit("offer", offer);
    });
    socket.on("answer", (answer, roomName) => {
        socket.to(roomName).emit("answer", answer);
    });
    socket.on("ice", (ice, roomName) => {
        socket.to(roomName).emit("ice", ice);
    });
});

const handleListen = () => console.log(`Listening on http://localhost:8000`);
httpServer.listen(8080, handleListen);