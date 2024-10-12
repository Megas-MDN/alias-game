const exitBtn = document.getElementById("exitBtn");
const playerName = document.getElementById("playerName");
const messagesList = document.getElementById("messages");
const guessContainer = document.getElementById("guessContainer");
const messageContainer = document.getElementById("messageContainer");
const messageInput = document.getElementById("messageInput");
const guessInput = document.getElementById("guessInput");
const status = document.getElementById("status");
const round = document.getElementById("round");

const socket = io("/");
let user = null;
let game = null;
let gameDetails = null;
let isUserDescribe = false;
let isPlaying = true;

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
      isUserDescribe ? sendMessages("description") : sendMessages("chat");
    }
  });

const createNewLine = (data) => {
  const newMessage = document.createElement("li");

  newMessage.classList.add("text-gray-700", "p-2", "rounded-md", "mb-2");

  if (data.messageType === "guess") {
    newMessage.classList.add(
      "bg-green-300",
      "bg-opacity-50",
      "border",
      "border-green-300",
    );
  } else if (data.messageType === "description") {
    newMessage.classList.add(
      "bg-blue-300",
      "bg-opacity-50",
      "border",
      "border-blue-300",
      "mx-auto",
      "w-full",
    );
  } else {
    newMessage.classList.add("bg-gray-100", "bg-opacity-50");
  }

  newMessage.innerHTML = `<strong>${data.username || data.userId}:</strong> ${
    data.message
  }`;

  messagesList.appendChild(newMessage);

  messagesList.scrollTop = messagesList.scrollHeight;
};

socket.on("receiveMessage", (data) => {
  if (data.gameId === game.gameId) {
    createNewLine(data);
  }
});

const fetchGameMessages = async (gameId, teamId) => {
  const response = await fetch(`/api/chats?gameId=${gameId}&order=1`, {
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

  document.getElementById("messages").scrollTop = messagesList.scrollHeight;
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
      currentRound: data?.currentRound,
    };
    setInLocalStorage("gameDetails", gameDetails);
    return gameDetails;
  }
  return data;
};

const setDescriberInputs = () => {
  isUserDescribe = true;
  guessContainer.remove();
  messageInput.placeholder = "Describe the word";
};

const setNonPlaying = () => {
  isPlaying = false;
  messageContainer.remove();
};

const setPlaying = () => {
  isPlaying = true;

  if (!document.getElementById("messageContainer")) {
    const messageContainer = document.createElement("div");
    messageContainer.id = "messageContainer";
    messageContainer.classList.add("flex", "w-full", "space-x-2");

    const messageInput = document.createElement("input");
    messageInput.type = "text";
    messageInput.id = "messageInput";
    messageInput.placeholder = "Chat with your team";
    messageInput.classList.add(
      "w-full",
      "px-4",
      "py-2",
      "border",
      "border-gray-300",
      "rounded-md",
      "focus:outline-none",
      "focus:ring",
      "focus:ring-blue-500",
    );

    const guessContainer = document.createElement("div");
    guessContainer.id = "guessContainer";
    guessContainer.classList.add("w-2/5", "flex", "space-x-2");

    const guessInput = document.createElement("input");
    guessInput.type = "text";
    guessInput.id = "guessInput";
    guessInput.placeholder = "Try guess";
    guessInput.classList.add(
      "w-full",
      "px-4",
      "py-2",
      "border",
      "border-gray-300",
      "rounded-md",
      "focus:outline-none",
      "focus:ring",
      "focus:ring-blue-500",
    );
    guessInput.maxLength = 12;

    const sendButton = document.createElement("button");
    sendButton.id = "sendButton";
    sendButton.classList.add(
      "bg-green-500",
      "text-white",
      "px-4",
      "py-2",
      "rounded-md",
      "hover:bg-green-600",
      "transition",
      "duration-200",
    );
    sendButton.textContent = "Guess";

    guessContainer.appendChild(guessInput);
    guessContainer.appendChild(sendButton);

    messageContainer.appendChild(messageInput);
    messageContainer.appendChild(guessContainer);

    const messagesList = document.getElementById("messages");
    messagesList.parentNode.insertBefore(
      messageContainer,
      messagesList.nextSibling,
    );

    sendButton.onclick = () => sendMessages("guess", "guessInput");
    messageInput.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        isUserDescribe ? sendMessages("description") : sendMessages("chat");
      }
    });
  }
};

const setRounds = (roundNumber) => {
  round.textContent = `Round ${roundNumber}`;
};

const setStatus = (statusInfo) => {
  status.textContent = `Status: ${statusInfo}`;
};

const setGameDetails = async () => {
  const data = await fetchGameDetails();
  gameDetails = data;

  if (!data) {
    return;
  }

  if (data.currentRound || data.currentRound === 0) {
    setRounds(data.currentRound);
  }

  if (data.status) {
    setStatus(data.status);
  }

  if (user.id === data.userIdDescriber) {
    setPlaying();
    return setDescriberInputs();
  }
  if (game.teamId !== data.teamIdTurn) {
    return setNonPlaying();
  }
  return setPlaying();
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
