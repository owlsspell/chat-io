let clients = [];
let messages = [];

let numUsers = 0;
let history = [];
let typingUsers = [];

export const privateChatModule = (socket, io) => {
  // Chatroom

  console.log(`Client with id ${socket.id} connected`);
  console.log("typingUsers", typingUsers);

  let addedUser = false;
  // when the client emits 'new message', this listens and executes
  socket.on("new message", (data) => {
    // we tell the client to execute 'new message'
    console.log("data", data);

    history.push({ username: socket.username, message: data });
    io.emit("new user message", {
      username: socket.username,
      message: data,
      type: "message",
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on("add user", (username) => {
    console.log("add user", addedUser);
    if (addedUser) return;
    // we store the username in the socket session for this client
    socket.username = username;
    console.log("socket.username", socket.username);
    ++numUsers;
    addedUser = true;
    history.push({ username, color: "info", type: "joined" });
    socket.emit("login", {
      numUsers: numUsers,
      history,
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit("user joined", {
      username: socket.username,
      numUsers: numUsers,
      history: history,
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
