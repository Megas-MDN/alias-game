const exitBtn = document.getElementById("exitBtn");
const playerName = document.getElementById("playerName");
const messagesList = document.getElementById("messages");

const socket = io("/");
let user = null;
let game = null;

document.getElementById("backBtn").onclick = () => {
  window.location.href = "/";
};

const clearAll = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("game");
  localStorage.removeItem("token");
};
exitBtn.onclick = () => {
  clearAll();
  window.location.replace("/login.html");
};

const getUserFromLocalStorage = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

const getGameFromLocalStorage = () => {
  const game = localStorage.getItem("game");
  return game ? JSON.parse(game) : null;
};

const sendMessages = (messageType = "guess", id = "messageInput") => {
  const messageInput = document.getElementById(id);
  const message = messageInput.value;
  const user = getUserFromLocalStorage();
  const game = getGameFromLocalStorage();
  const userId = user.id;

  socket.emit("sendMessage", {
    message,
    userId,
    username: user.username,
    gameId: game.gameId,
    teamId: game.teamId,
    messageType,
  });

  messageInput.value = "";
};

document.getElementById("sendButton").onclick = () =>
  sendMessages("guess", "guessInput");
document
  .getElementById("messageInput")
  .addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessages("chat");
    }
  });

const createNewLine = (data) => {
  const newMessage = document.createElement("li");
  newMessage.classList.add("text-gray-700");
  newMessage.innerHTML = `<strong>${data.username || data.userId}:</strong> ${
    data.message
  }`;
  messagesList.appendChild(newMessage);

  messagesList.scrollTop = messagesList.scrollHeight;
};

socket.on("receiveMessage", (data) => {
  if (data.gameId === game.gameId && data.teamId === game.teamId) {
    createNewLine(data);
  }
});

const fetchGameMessages = async (gameId, teamId) => {
  const response = await fetch(`/api/chats?gameId=${gameId}&teamId=${teamId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}`,
    },
  });
  const data = await response.json();
  return data;
};

window.onload = () => {
  user = getUserFromLocalStorage();
  game = getGameFromLocalStorage();
  if (!user || !game) {
    clearAll();
    window.location.replace("/login.html");
  }
  playerName.textContent = user.username;
  fetchGameMessages(game.gameId, game.teamId).then((data) => {
    (data || []).forEach((chat) => {
      createNewLine({
        ...chat,
        username: chat?.userId.username,
        userId: chat?.userId._id,
      });
    });
  });
};
