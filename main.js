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
        prompt = data.prompt;
        replies = data.replies;
        alternatives = data.alternatives;
    })
    .catch(error => console.error('Error loading data:', error));

const robot = ["How do you do","I not human"];


function initializeChat() {
    const chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];

    chatHistory.forEach(msg => {
        addChat(msg.name, msg.img, msg.side, msg.text);
    });

    // Add welcome message only if the chat is empty
    if (chatHistory.length === 0) {
        const initialMessage = "Hi, Welcome to WebBot. Go ahead and send me a message.";
        addChat(BOT_NAME, BOT_IMG, "left", initialMessage);
    }
}


// Run the initialization function on page load
document.addEventListener("DOMContentLoaded", initializeChat);


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

    // Get chatbot response
    product = compare(prompt, replies, text) || getRandomAlternative();

    const delay = text.split(" ").length * 100;
    setTimeout(() => {
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
    const msgHTML = `
    <div class="msg ${side}-msg">
        <div class="msg-img" style="background-image: url(${img})"></div>
        <div class="msg-bubble">
            <div class="msg-info">
                <div class="msg-info-name">${name}</div>
                <div class="msg-info-time">${formatDate(new Date())}</div>
            </div>
            <div class="msg-text">${text}</div>
        </div>
    </div>`;

    msgerChat.insertAdjacentHTML("beforeend", msgHTML);
    msgerChat.scrollTop += 500;

    // Save to local storage
    saveMessage({ name, img, side, text, time: formatDate(new Date()) });
}


function get(selector, root = document){
    return root.querySelector(selector);
}


function formatDate(date) {
    let hours = date.getHours();
    let minutes = "0" + date.getMinutes();
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert to 12-hour format

    return `${hours}:${minutes.slice(-2)} ${ampm}`;
}

function random(min , max){
    return Math.floor(Maths.random() * (max - min) + min);
}

function saveMessage(message) {
    let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
    chatHistory.push(message);
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
}

document.getElementById("clear-chat-btn").addEventListener("click", () => {
    if (confirm("Are you sure you want to clear the chat?")) {
        localStorage.removeItem("chatHistory"); // Remove stored chat history
        msgerChat.innerHTML = ""; // Clear chat display
        setTimeout(() => location.reload(), 300); // Refresh the page after clearing
    }
});































