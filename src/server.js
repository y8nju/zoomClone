import http from "http";
// import WebSocket, { WebSocketServer } from "ws";
import express from "express";
import { Server } from "socket.io";

const app = express();

// console.log(__dirname); //C:\ARU\zoomClone\src
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname+ "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("*", (_, res) => res.redirect("/"));


const httpServer = http.createServer(app);
const wsServer = new Server(httpServer);

const handleListen = () => console.log(`Listening on http://localhost:8000`);
httpServer.listen(8000, handleListen);