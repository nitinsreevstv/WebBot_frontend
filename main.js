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

async function fetchWikipediaSummary(query) {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.extract) {
            return {
                title: data.title,
                extract: data.extract,
                image: data.thumbnail ? data.thumbnail.source : null,
                link: data.content_urls.desktop.page
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Wikipedia API Error:", error);
        return null;
    }
}

async function fetchJoke() {
    try {
        const response = await fetch("https://official-joke-api.appspot.com/random_joke");
        const data = await response.json();
        return `${data.setup} 😂 ${data.punchline}`;
    } catch (error) {
        console.error("Joke API Error:", error);
        return "I tried to find a joke, but my humor module is offline! 🤖";
    }
}


async function output(input) {
    let text = input.toLowerCase().trim();
    if (!text) return;

    text = text.replace(/[^a-z0-9\s]/gi, ''); // Remove special characters

    showTypingIndicator();

    // 🔹 Check if user is providing their name
    const namePattern = /^(my name is|i am|call me) (.+)/i;
    const nameMatch = text.match(namePattern);

    if (text.includes("fun fact") || text.includes("tell me a fact") || text.includes("random fact")) {
        try {
            const response = await fetch("https://uselessfacts.jsph.pl/api/v2/facts/random?language=en");
            
            if (!response.ok) throw new Error("Failed to fetch fun fact.");
            
            const data = await response.json();
            const fact = data.text;
    
            setTimeout(() => {
                hideTypingIndicator();
                addChat(BOT_NAME, BOT_IMG, "left", `Here's a fun fact: 🤯<br><strong>${fact}</strong>`, true);
            }, 1500);
        } catch (error) {
            console.error("Error fetching fun fact:", error);
            hideTypingIndicator();
            addChat(BOT_NAME, BOT_IMG, "left", "Oops! I couldn't fetch a fun fact right now. Try again later. 😔", true);
        }
        return;
    }
    
    if (text.includes("joke") || text.includes("tell me a joke") || text.includes("funny")) {
        try {
            const response = await fetch("https://official-joke-api.appspot.com/random_joke");
    
            if (!response.ok) throw new Error("Failed to fetch a joke.");
    
            const data = await response.json();
            const joke = `${data.setup} 😂<br><strong>${data.punchline}</strong>`;
    
            setTimeout(() => {
                hideTypingIndicator();
                addChat(BOT_NAME, BOT_IMG, "left", joke, true);
            }, 1500);
        } catch (error) {
            console.error("Error fetching joke:", error);
            hideTypingIndicator();
            addChat(BOT_NAME, BOT_IMG, "left", "Oops! I couldn't fetch a joke right now. Try again later. 😔", true);
        }
        return;
    }
    

    if (nameMatch) {
        let userName = nameMatch[2].trim();
        userName = userName.charAt(0).toUpperCase() + userName.slice(1); // Capitalize first letter
        localStorage.setItem("userName", userName); // Store in localStorage
        hideTypingIndicator();
        addChat(BOT_NAME, BOT_IMG, "left", `Nice to meet you, ${userName}! 😊`, true);
        return;
    }

    // 🔹 Retrieve stored user name (ensure it's not "User" if unknown)
    let userName = localStorage.getItem("userName");
    if (!userName) {
        userName = ""; // Empty string if no name is set
    } else {
        userName = userName.charAt(0).toUpperCase() + userName.slice(1); // Capitalize if found
    }

    // 🔹 Enhanced Wikipedia query detection
    const wikiPattern = /^(what is|who is|tell me about|define) (.+)/;
    const match = text.match(wikiPattern);

    if (match) {
        const query = match[2].trim(); // Extracted topic
        const wikiData = await fetchWikipediaSummary(query);

        if (wikiData) {
            let botMessage = `<strong>${wikiData.title}</strong><br>${wikiData.extract}<br><a href="${wikiData.link}" target="_blank">Read more</a>`;
            if (wikiData.image) {
                botMessage = `<img src="${wikiData.image}" alt="${wikiData.title}" width="150"><br>` + botMessage;
            }
            hideTypingIndicator();
            addChat(BOT_NAME, BOT_IMG, "left", botMessage, true);
            return;
        }
    }

    let product = compare(prompt, replies, text) || getRandomAlternative();
    if (!product) product = "I'm not sure how to respond.";

    const delay = Math.min(3000, text.length * 150); // 🔹 Improved delay calculation
    setTimeout(() => {
        hideTypingIndicator();
        const response = userName ? `${userName}, ${product}` : product; // 🔹 Avoid "User"
        addChat(BOT_NAME, BOT_IMG, "left", response, true);
    }, delay);
}


function getRandomAlternative() {
    return alternatives[Math.floor(Math.random() * alternatives.length)];
}

function compare(promptArray, repliesArray, userInput) {
    for (let x = 0; x < promptArray.length; x++) {
        for (let y = 0; y < promptArray[x].length; y++) {
            let keyword = promptArray[x][y];
            if (userInput.includes(keyword) || userInput.startsWith(keyword)) {
                let replies = repliesArray[x];
                return replies[Math.floor(Math.random() * replies.length)];
            }
        }
    }
    return null;
}


function addChat(name, img, side, text, saveToStorage = true) {
    if (!text.trim()) return;

    // Speak the bot's message if it's the bot speaking
    if (name === "BOT") {
        speak(text);
    }

    const time = formatDate(new Date());
    let userNameStored = localStorage.getItem("userName") || ""; // Get stored name
    userNameStored = userNameStored.charAt(0).toUpperCase() + userNameStored.slice(1); // Capitalize

    // Ensure the bot does not call the user "User" if the name is not set
    const displayName = (side === "right") ? (userNameStored || "You") : BOT_NAME;

    const msgHTML = `
    <div class="msg ${side}-msg">
        <div class="msg-img" style="background-image: url(${img})"></div>
        <div class="msg-bubble">
            <div class="msg-info">
                <div class="msg-info-name">${displayName}</div>
                <div class="msg-info-time">${time}</div>
            </div>
            <div class="msg-text">${text}</div>
        </div>
    </div>`;

    msgerChat.insertAdjacentHTML("beforeend", msgHTML);
    msgerChat.scrollTop += 500;

    if (saveToStorage) {
        let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
        chatHistory.push({ name: displayName, img, side, text, time });
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
const darkModeToggle = document.getElementById("dark-mode-toggle");

if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark-mode");
    darkModeToggle.innerHTML = '<i class="fa fa-sun"></i>';
}

// Dark Mode Toggle
darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("darkMode", "enabled");
        darkModeToggle.innerHTML = '<i class="fa fa-sun"></i>';
    } else {
        localStorage.setItem("darkMode", "disabled");
        darkModeToggle.innerHTML = '<i class="fa fa-moon"></i>';
    }
});

const micButton = document.getElementById("mic-btn");
const inputField = document.querySelector(".msger-input");
const sendButton = document.querySelector(".msger-send-btn");

const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.continuous = false;
recognition.interimResults = false;
recognition.lang = "en-US";

let isMicActive = false; // ✅ Tracks mic state
let manuallyStopped = false; // ✅ Prevents unintended restart

// ✅ Toggle Mic Only on Button Click
micButton.addEventListener("click", () => {
    if (isMicActive) {
        stopMic(true); // 🔹 Pass true to mark as manually stopped
    } else {
        startMic();
    }
});

// ✅ Function to Start Mic
function startMic() {
    if (manuallyStopped) return; // 🚫 Prevent mic from starting after manual stop

    isMicActive = true;
    micButton.classList.add("listening");
    recognition.start();
    console.log("Mic started");
}

// ✅ Function to Stop Mic
function stopMic(manual = false) {
    if (isMicActive) {
        recognition.stop();
        console.log("Mic stopped");
    }
    isMicActive = false;
    micButton.classList.remove("listening");

    if (manual) {
        manuallyStopped = true; // ✅ Prevents auto-restart
        setTimeout(() => (manuallyStopped = false), 1000); // ✅ Reset flag after some time
    }
}

// ✅ Speech Recognition Result Handling
recognition.onresult = (event) => {
    inputField.value = event.results[0][0].transcript;
    stopMic(true);
};

// ✅ Ensure Mic Fully Stops When Recognition Ends
recognition.onend = () => {
    if (!manuallyStopped) {
        console.log("Mic ended naturally.");
        isMicActive = false; // 🔹 Ensure state is reset
    } else {
        console.log("Mic manually stopped, not restarting.");
    }
};

// ✅ Handle Speech Recognition Errors
recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    stopMic(true); // 🔹 Ensure mic stops on error
};

// 🚫 Prevent Mic from Restarting When Sending Message
sendButton.addEventListener("click", () => {
    console.log("Send button clicked, stopping mic...");
    stopMic(true);
});

// 🚫 Prevent Mic from Restarting When Pressing Enter
inputField.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        console.log("Enter key pressed, stopping mic...");
        stopMic(true);
    }
});
function speak(text) {
    // Create a temporary div to safely strip HTML tags (especially images)
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = text;

    // Remove all images
    tempDiv.querySelectorAll("img").forEach(img => img.remove());

    // Extract clean text
    const cleanText = tempDiv.innerText
        .replace(/https?:\/\/\S+/g, '') // Remove links
        .replace(/[\u{1F600}-\u{1F6FF}]/gu, '') // Remove emojis
        .replace(/[\p{Emoji}]/gu, '') // Remove Unicode emojis
        .replace(/[^\w\s.,!?]/g, '') // Remove unwanted special characters
        .replace(/\.\.\./g, '') // Remove "..."
        .replace(/(\s)\./g, '$1') // Fix spaces before dots
        .replace(/\s+/g, ' ') // Remove extra spaces
        .trim(); // Trim leading/trailing spaces

    // If no readable text remains, skip speech
    if (!cleanText) {
        console.log("No readable text to speak.");
        return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;

    // Ensure voices are loaded before selecting one
    const setVoice = () => {
        const voices = speechSynthesis.getVoices();
        const googleVoice = voices.find(voice => voice.name.includes("Google UK English Female"));
        utterance.voice = googleVoice || voices[0]; // Use Google voice if available
        speechSynthesis.speak(utterance);
    };

    if (speechSynthesis.getVoices().length === 0) {
        speechSynthesis.onvoiceschanged = setVoice;
    } else {
        setVoice();
    }

}
