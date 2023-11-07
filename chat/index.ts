import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import cors from "cors";
import { globalChatModule } from "./src/globalChat";
import { privateChatModule } from "./src/privateChat";
import db from "./db";

const port = process.env.PORT || 6001;

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.get("/", (req, res) => {
  res.status(200).json("Welcome to the chat service");
});

let lastDoc = null;

app.get("/loadMessages", async (req, res) => {
  const messages = [];
  console.log("req", req.query);
  let ref;

  req.query.startDate
    ? (ref = db
        .orderBy("date", "desc")
        .startAfter(lastDoc ?? req.query.startDate)
        .limit(10))
    : (ref = db.orderBy("date", "desc").limit(10));

  const data = await ref.get();
  data.docs.forEach((doc) => {
    let document = doc.data();
    console.log("document", document);
    messages.push({ ...document, date: doc.id });
  });

  lastDoc = data.docs[data.docs.length - 1];

  res.status(200).json(messages);
});

//namespaces
const globalChat = io.of("/global");
const privateChat = io.of("/private");

globalChat.on("connection", (socket: any) => {
  globalChatModule(socket, globalChat);
});
privateChat.on("connection", (socket: any) => {
  privateChatModule(socket, privateChat);
});

server.on("error", (err) => {
  console.log("Error opening server");
});

server.listen(port, () => {
  console.log(`Chat microservice listening on port ${port} `);
});

export default app;
