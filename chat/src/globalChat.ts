import dayjs from "dayjs";
// import { db } from "../db";
import { addDoc, arrayUnion, collection, getDocs } from "@firebase/firestore";
import db from "./../db";

let numUsers = 0;
let history = [];
let typingUsers = [];
let lastDoc = null;

export const globalChatModule = (socket, io) => {
  // Chatroom

  console.log(`Client with id ${socket.id} connected`);
  console.log("typingUsers", typingUsers);

  let addedUser = false;
  // when the client emits 'new message', this listens and executes
  socket.on("new message", async (data) => {
    // we tell the client to execute 'new message'
    console.log("data", data);

    history.push({ username: socket.username, message: data });

    // try {
    //   const docRef = await addDoc(collection(db, "global_chat_messages"), {
    //     username: socket.username,
    //     message: data,
    //     date: dayjs().format("YYYY-MM-DD "),
    //     time: dayjs().format("HH:mm:ss"),
    //   });
    //   console.log("Document written with ID: ", docRef.id);
    // } catch (e) {
    //   console.error("Error adding document: ", e);
    // }

    // console.log("db", db);
    // getDocs(db.doc("global_chat_messages"));
    const time = dayjs().unix().toString();
    const info = {
      username: socket.username,
      message: data,
      date: dayjs().unix(),
      // date: dayjs().format("YYYY-MM-DD "),
      color: "message",
      type: "message",
    };
    db.doc(time).set(info);
    // const documents = [];
    // const snapshot = await db.get();
    // snapshot.forEach((doc) => {
    //   const document = { [doc.id]: doc.data() };
    //   documents.push(document);
    // });
    // console.log("documents", documents);

    io.emit("new user message", info);
  });

  // when the client emits 'add user', this listens and executes
  socket.on("add user", async (username) => {
    // console.log("add user", addedUser);
    if (addedUser) return;
    // we store the username in the socket session for this client
    socket.username = username;
    console.log("socket.username", socket.username);
    ++numUsers;
    addedUser = true;
    // history.push({ username, color: "info", type: "joined" });
    const documents = [];
    const snapshot = await db.get();
    let first = await db.orderBy("date", "desc").limit(3).get();

    lastDoc = first.docs[first.docs.length - 1];
    first.forEach((doc) => {
      const document = doc.data();
      documents.push({ ...document, date: doc.id });
    });

    socket.emit("login", {
      numUsers: numUsers,
      history: documents,
      count: snapshot.docs.length,
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit("user joined", {
      username: socket.username,
    });
  });

  socket.on("loading messages", async (startDate) => {
    // const messages = [];

    // let ref = db
    //   .orderBy("date", "desc")
    //   .startAfter(lastDoc ?? startIndex)
    //   .limit(3);

    // const data = await ref.get();
    // data.docs.forEach((doc) => {
    //   let document = doc.data();
    //   console.log("document", document);
    //   messages.push({ ...document, date: doc.id });
    // });
    // lastDoc = data.docs[data.docs.length - 1];
    // console.log("messages!!!", messages);
    const messages = [];
    console.log("startDate", startDate);
    let ref;

    startDate
      ? (ref = db
          .orderBy("date", "desc")
          .startAfter(lastDoc ?? startDate)
          .limit(10))
      : (ref = db.orderBy("date", "desc").limit(10));

    const data = await ref.get();
    data.docs.forEach((doc) => {
      let document = doc.data();
      console.log("document", document);
      messages.push({ ...document, date: doc.id });
    });

    lastDoc = data.docs[data.docs.length - 1];

    socket.emit("loading messages", {
      messages,
    });
  });

  socket.on("typing", () => {
    if (typingUsers.includes(socket.username)) return;
    typingUsers.push(socket.username);
    console.log("socket.username", socket.username);
    console.log("typingUsers", typingUsers);
    socket.broadcast.emit("typing", typingUsers);
  });

  socket.on("stop typing", () => {
    typingUsers = typingUsers.filter((user) => user !== socket.username);
    console.log("typingUsers", typingUsers);
    socket.broadcast.emit("typing", typingUsers);
  });

  // when the user disconnects.. perform this
  socket.on("disconnect", () => {
    console.log("disconnect", addedUser);
    if (addedUser) {
      --numUsers;

      history.push({
        username: socket.username,
        color: "info",
        type: "left",
      });
      // echo globally that this client has left
      socket.broadcast.emit("user left", {
        username: socket.username,
        numUsers: numUsers,
        history: history,
      });
    }
  });
};
