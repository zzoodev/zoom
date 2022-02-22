import http from "http";
import WebSocket from "ws";
import express from "express";
import { Server } from "socket.io";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer);

httpServer.listen(3000, handleListen);
wsServer.on("connection", (socket) => {
  socket.on("enter_room", (payroad, fun) => {
    console.log(payroad);
    setTimeout(() => {
      fun();
    }, 7000);
  });
});

// const wss = new WebSocket.Server({ server });
// const sockets = [];
// wss.on("connection", (socket) => {
//   sockets.push(socket);
//   socket["nickname"] = "Anon";
//   socket.on("message", (msg) => {
//     const message = JSON.parse(msg.toString());
//     switch (message.type) {
//       case "new_message":
//         sockets.forEach((perSoket) =>
//           perSoket.send(`${socket.nickname}: ${message.payroad}`)
//         );
//         break;
//       case "nickname":
//         socket["nickname"] = message.payroad;
//         break;
//     }
//   });
// });
