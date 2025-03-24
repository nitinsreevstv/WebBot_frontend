const msgerForm = get(".msger-inputarea");
const msgerInput = get(".msger-input");
const msgerChat = get(".msger-chat");
const BOT_IMG = "bot.png";
const PERSON_IMG = "user.png";
const BOT_NAME = "BOT";
const PERSON_NAME = "User";
const chatbotPopup = document.getElementById("chatbot-popup");
const openBtn = document.getElementById("open-btn");
const minimizeBtn = document.getElementById("minimize-btn");

let prompt = [];
let replies = [];
let alternatives = [];
let dataLoaded = false; // ✅ Prevent multiple executions

async function loadData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        prompt = data.prompt || [];
        replies = data.replies || [];
        alternatives = data.alternatives || ["I'm not sure how to respond."];
    } catch (error) {
        console.error('Error loading data:', error);
        alternatives = ["Sorry, my brain isn't working right now!"];
    } finally {
        dataLoaded = true;
        initializeChat(); // ✅ Ensures chat loads after data
    }
}

loadData(); // Call the function

function initializeChat() {
    if (!dataLoaded) return; // ✅ Prevent re-initialization

    const chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];

    // ✅ Clear chat UI to prevent duplication
    msgerChat.innerHTML = "";

    // ✅ Use a Set to track unique messages
    const existingMessages = new Set();

    chatHistory.forEach(msg => {
        const messageKey = `${msg.name}-${msg.text}-${msg.time}`;

        if (!existingMessages.has(messageKey)) {
            addChat(msg.name, msg.img, msg.side, msg.text, false);
            existingMessages.add(messageKey); // ✅ Track added messages
        }
    });

    if (chatHistory.length === 0) {
        addChat(BOT_NAME, BOT_IMG, "left", "Hi, Welcome to WebBot. Go ahead and send me a message.");
    }
}

msgerForm.addEventListener("submit", event => {
    event.preventDefault();
    const msgText = msgerInput.value.trim();
    if (!msgText) return;

    msgerInput.value = "";
    addChat(PERSON_NAME, PERSON_IMG, "right", msgText, true);
    output(msgText);
});

function output(input) {
    let text = input.toLowerCase().trim();
    if (!text) return;

    text = text.replace(/[^a-z0-9\s]/gi, ''); // Remove special characters

    showTypingIndicator();

    let product = compare(prompt, replies, text) || getRandomAlternative();
    if (!product) product = "I'm not sure how to respond.";

    const delay = text.split(" ").length * 300;
    setTimeout(() => {
        hideTypingIndicator();
        addChat(BOT_NAME, BOT_IMG, "left", product, true);
    }, delay);
}

function getRandomAlternative() {
    return alternatives[Math.floor(Math.random() * alternatives.length)];
}

function compare(promptArray, repliesArray, string) {
    for (let x = 0; x < promptArray.length; x++) {
        for (let y = 0; y < promptArray[x].length; y++) {
            if (string.includes(promptArray[x][y])) {
                return repliesArray[x][Math.floor(Math.random() * repliesArray[x].length)];
            }
        }
    }
    return null;
}

function addChat(name, img, side, text, saveToStorage = true) {
    if (!text.trim()) return;

    const time = formatDate(new Date());

    const msgHTML = `
    <div class="msg ${side}-msg">
        <div class="msg-img" style="background-image: url(${img})"></div>
        <div class="msg-bubble">
            <div class="msg-info">
                <div class="msg-info-name">${name}</div>
                <div class="msg-info-time">${time}</div>
            </div>
            <div class="msg-text">${text}</div>
        </div>
    </div>`;

    msgerChat.insertAdjacentHTML("beforeend", msgHTML);
    msgerChat.scrollTop += 500;

    if (saveToStorage) {
        let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
        chatHistory.push({ name, img, side, text, time });
        localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
    }
}

function get(selector, root = document) {
    return root.querySelector(selector);
}

function formatDate(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    return `${hours}:${minutes} ${ampm}`;
}

document.getElementById("clear-chat-btn").addEventListener("click", () => {
    if (confirm("Are you sure you want to clear the chat?")) {
        localStorage.removeItem("chatHistory");
        msgerChat.innerHTML = "";
        initializeChat();
    }
});

function showTypingIndicator() {
    if (document.querySelector(".typing-indicator")) return;

    const typingHTML = `
    <div class="msg left-msg typing-indicator">
        <div class="msg-img" style="background-image: url(${BOT_IMG})"></div>
        <div class="msg-bubble">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
        </div>
    </div>`;

    msgerChat.insertAdjacentHTML("beforeend", typingHTML);
    msgerChat.scrollTop += 500;
}

function hideTypingIndicator() {
    const typingIndicator = document.querySelector(".typing-indicator");
    if (typingIndicator) {
        typingIndicator.remove();
    }
}
