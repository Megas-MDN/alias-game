const exitBtn = document.getElementById("exitBtn");
const playerName = document.getElementById("playerName");
const messagesList = document.getElementById("messages");

const socket = io("/");
let user = null;
let game = null;

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

const sendMessages = () => {
  const messageInput = document.getElementById("messageInput");
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
  });

  messageInput.value = "";
};

document.getElementById("sendButton").onclick = sendMessages;
document
  .getElementById("messageInput")
  .addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessages();
    }
  });

socket.on("receiveMessage", (data) => {
  const newMessage = document.createElement("li");
  newMessage.classList.add("text-gray-700");
  newMessage.innerHTML = `<strong>${data.username || data.userId}:</strong> ${
    data.message
  }`;
  messagesList.appendChild(newMessage);

  messagesList.scrollTop = messagesList.scrollHeight;
});

window.onload = () => {
  user = getUserFromLocalStorage();
  game = getGameFromLocalStorage();
  console.log(user, "><<<");
  console.log(game, "><<<");
  if (!user || !game) {
    clearAll();
    window.location.replace("/login.html");
  }
  playerName.textContent = user.username;
};
