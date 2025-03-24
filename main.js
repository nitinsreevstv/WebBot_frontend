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

fetch('data.json')
    .then(response => response.json())
    .then(data => {
        prompt = data.prompt || [];
        replies = data.replies || [];
        alternatives = data.alternatives || ["I'm not sure how to respond."];
        dataLoaded = true;
        initializeChat();
    })
    .catch(error => {
        console.error('Error loading data:', error);
        alternatives = ["Sorry, my brain isn't working right now!"];
        dataLoaded = true;
        initializeChat();
    });


const robot = ["How do you do","I not human"];

function initializeChat() {
    const chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];

    // ✅ Ensure the chat UI is cleared to prevent duplication
    msgerChat.innerHTML = ""; 

    // ✅ Ensure we do not re-add messages already present in the UI
    const existingMessages = new Set();
    
    chatHistory.forEach(msg => {
        // Generate a unique key for each message
        const messageKey = `${msg.name}-${msg.text}-${msg.time}`;
        
        if (!existingMessages.has(messageKey)) {
            addChat(msg.name, msg.img, msg.side, msg.text);
            existingMessages.add(messageKey); // ✅ Track added messages
        }
    });

    // ✅ Ensure welcome message is added only if there is no chat history
    if (chatHistory.length === 0) {
        const initialMessage = "Hi, Welcome to WebBot. Go ahead and send me a message.";
        addChat(BOT_NAME, BOT_IMG, "left", initialMessage);
    }
}


msgerForm.addEventListener("submit", event => {
    event.preventDefault();
    const msgText = msgerInput.value;
    if (!msgText) return;
    console.log("User message:", msgText);
    msgerInput.value = "";
    addChat(PERSON_NAME, PERSON_IMG, "right", msgText);
    output(msgText);
});

function output(input) {
    let product;
    let text = input.toLowerCase().trim();
    
    if (text === "") return; // Ignore empty input

    // Remove special characters
    text = text.replace(/[^a-z0-9\s]/gi, ''); 
    console.log('Normalized input:', text);

    // Show typing indicator
    showTypingIndicator();

    // Get chatbot response
    product = compare(prompt, replies, text) || getRandomAlternative();

    const delay = text.split(" ").length * 300; // Adjust delay based on message length
    setTimeout(() => {
        hideTypingIndicator();
        addChat(BOT_NAME, BOT_IMG, "left", product);
    }, delay);
}


function getRandomAlternative() {
    return alternatives[Math.floor(Math.random() * alternatives.length)];
}


function compare(promptArray, repliesArray, string) {
    for (let x = 0; x < promptArray.length; x++) {
        for (let y = 0; y < promptArray[x].length; y++) {
            if (string.includes(promptArray[x][y])) { // Allow partial matches
                let replies = repliesArray[x];
                return replies[Math.floor(Math.random() * replies.length)];
            }
        }
    }
    return null; // If no match is found
}

function addChat(name, img, side, text) {
    const time = formatDate(new Date()); // Get time of message

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

    // Save chat to localStorage
    const storedChat = localStorage.getItem("chatHistory");
    const chatHistory = storedChat ? JSON.parse(storedChat) : [];
    chatHistory.push({ name, img, side, text, time });

    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
}


function get(selector, root = document){
    return root.querySelector(selector);
}


function formatDate(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
    minutes = minutes < 10 ? "0" + minutes : minutes; // Ensure two-digit minutes
    return `${hours}:${minutes} ${ampm}`;
}


function random(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function saveMessage(message) {
    let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
    chatHistory.push(message);
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
}

document.getElementById("clear-chat-btn").addEventListener("click", () => {
    if (confirm("Are you sure you want to clear the chat?")) {
        localStorage.removeItem("chatHistory"); // Clear localStorage
        msgerChat.innerHTML = ""; // Clear chat UI
        initializeChat(); // Restart chat with welcome message
    }
});

// Show typing indicator
function showTypingIndicator() {
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

// Hide typing indicator
function hideTypingIndicator() {
    const typingIndicator = document.querySelector(".typing-indicator");
    if (typingIndicator) {
        typingIndicator.remove();
    }
}