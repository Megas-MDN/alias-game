const exitBtn = document.getElementById("exitBtn");
const playerName = document.getElementById("playerName");
const messagesList = document.getElementById("messages");
const guessContainer = document.getElementById("guessContainer");
const messageInput = document.getElementById("messageInput");
const guessInput = document.getElementById("guessInput");

const socket = io("/");
let user = null;
let game = null;

document.getElementById("backBtn").onclick = () => {
  window.location.href = "/";
};

guessInput.addEventListener("input", function () {
  this.value = this.value.replace(/\s/g, "");
});

const setInLocalStorage = (key, value) => {
  localStorage.removeItem(key);
  const str = JSON.stringify(value);
  localStorage.setItem(key, str);
  return value;
};

const clearAll = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("game");
  localStorage.removeItem("token");
  localStorage.removeItem("gameDetails");
  localStorage.clear();
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

const loadMessages = async () => {
  if (!user || !game) {
    return;
  }
  const data = await fetchGameMessages(game.gameId, game.teamId);
  (data || []).forEach((chat) => {
    createNewLine({
      ...chat,
      username: chat?.userId.username,
      userId: chat?.userId._id,
    });
  });
};

const fetchGameDetails = async () => {
  if (!game || !game.gameId) return;
  const response = await fetch(`/api/games/${game.gameId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}`,
    },
  });
  const data = await response.json();
  if (data) {
    const gameDetails = {
      teamIdTurn: data?.currentTurnTeam,
      userIdDescriber: data.currentDescriber,
      status: data?.status,
    };
    setInLocalStorage("gameDetails", gameDetails);
    return gameDetails;
  }
  return data;
};

const setGameDetails = async () => {
  const data = await fetchGameDetails();

  if (user.id === data.userIdDescriber) {
    console.log("describer");
    guessContainer.remove();
    messageInput.placeholder = "Describe the word";
  }
};

window.onload = () => {
  user = getUserFromLocalStorage();
  game = getGameFromLocalStorage();
  if (!user || !game) {
    clearAll();
    window.location.replace("/login.html");
    return;
  }
  playerName.textContent = user.username;
  loadMessages();
  setGameDetails();
};
