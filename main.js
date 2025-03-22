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
    const initialMessage = "Hi, Welcome to WebBot. Go ahead and send me a message.";
    addChat(BOT_NAME, BOT_IMG, "left", initialMessage);
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
    
    // Normalize the text by removing special characters
    text = text.replace(/[^a-z0-9\s]/gi, ''); // Remove non-alphanumeric characters
    console.log('Normalized input:', text); // Debug log

    // Check for a match and get the response
    product = compare(prompt, replies, text) || "I didn't understand that."; // Default response

    const delay = text.split(" ").length * 100;
    setTimeout(() => {
        addChat(BOT_NAME, BOT_IMG, "left", product);
    }, delay);
}

function compare(promptArray, repliesArray, string) {
    for (let x = 0; x < promptArray.length; x++) {
        for (let y = 0; y < promptArray[x].length; y++) {
            console.log('Comparing:', string, 'with prompt:', promptArray[x][y]); // Debug log
            // Use exact matching for cleaned input
            if (promptArray[x][y] === string) {
                let replies = repliesArray[x];
                return replies[Math.floor(Math.random() * replies.length)];
            }
        }
    }
    return null; // Return null if no match found
}

function addChat(name,img, side, text){
    const msgHTML = `
    <div class ="msg ${side}-msg">
        <div class = "msg-img" style="background-image:url(${img})"></div>
        <div class = "msg-bubble">
            <div class = "msg-info">
                <div class = "msg-info-name">${name}</div>
                <div class = "msg-info-time">${FormData(new Date())}</div>
            </div>
            <div class = "msg-text">${text}</div>
        </div>
    </div>`;

    msgerChat.insertAdjacentHTML("beforeend", msgHTML);
    msgerChat.scrollTop += 500;
}

function get(selector, root = document){
    return root.querySelector(selector);
}
function FormData(date) {
    let hours = date.getHours();
    const minutes = "0" + date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12; // Convert to 12-hour format
    hours = hours ? hours : 12; // Adjust for 0 (midnight)
    
    return `${hours}:${minutes.slice(-2)} ${ampm}`;
}

function random(min , max){
    return Math.floor(Maths.random() * (max - min) + min);
}






























