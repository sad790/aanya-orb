// ==================================
// 💬 CHAT UI LOGIC (ISOLATED)
// ==================================

document.addEventListener("DOMContentLoaded", () => {
    const chatBtn = document.getElementById("chatBtnSide");
    const chatOverlay = document.getElementById("chat-overlay");
    const chatCloseBtn = document.getElementById("chat-close-btn");
    const chatSendBtn = document.getElementById("chat-send-btn");
    const chatInput = document.getElementById("chat-input");
    const chatMessages = document.getElementById("chat-messages");
    const canvas = document.querySelector("canvas"); // Target the Three.js canvas for blurring

    let isChatOpen = false;

    // 🟢 TOGGLE CHAT
    function toggleChat(forceClose = false) {
        if (forceClose) {
            isChatOpen = false;
        } else {
            isChatOpen = !isChatOpen;
        }

        if (isChatOpen) {
            chatOverlay.style.display = "flex";
            chatBtn.classList.add("active-state");
            // Apply blur to background
            if (canvas) {
                canvas.style.transition = "filter 0.5s ease";
                canvas.style.filter = "blur(8px) brightness(0.4)";
            }
            // Focus input
            setTimeout(() => chatInput.focus(), 100);
            
            // Add initial greeting if empty
            if (chatMessages.children.length === 0) {
                 setTimeout(() => addAanyaMessage("Link established. Text channel active."), 500);
            }

        } else {
            chatOverlay.style.display = "none";
            chatBtn.classList.remove("active-state");
            // Remove blur
            if (canvas) {
                canvas.style.filter = "none";
            }
        }
    }

    // 📤 SEND MESSAGE
    function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        // Add User Message
        addMessage(text, "user");
        chatInput.value = "";

        // Simulate minimal Aanya Echo (Optional, can be removed if strictly no-op)
        // keeping it purely text storage for now as requested, but user mentioned "Aanya messages aligned left".
        // I'll add a dummy response for 'help' or just leave it manual.
    }

    // ➕ ADD MESSAGE TO DOM
    function addMessage(text, sender) {
        const msgDiv = document.createElement("div");
        msgDiv.classList.add("chat-message", sender);
        
        // Timestamp
        const timeSpan = document.createElement("span");
        timeSpan.classList.add("msg-time");
        const now = new Date();
        timeSpan.innerText = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
        
        const textSpan = document.createElement("span");
        textSpan.innerText = text;

        if (sender === 'user') {
             msgDiv.appendChild(textSpan);
             msgDiv.appendChild(timeSpan);
        } else {
             msgDiv.appendChild(timeSpan);
             msgDiv.appendChild(textSpan);
        }

        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // 🤖 PUBLIC API FOR AANYA MESSAGES (If needed by other scripts later)
    window.addAanyaMessage = (text) => {
        addMessage(text, "aanya");
    };

    // 🎮 EVENT LISTENERS
    if (chatBtn) chatBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleChat();
    });

    if (chatCloseBtn) chatCloseBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleChat(true); // Force close
    });

    if (chatSendBtn) chatSendBtn.addEventListener("click", sendMessage);

    if (chatInput) chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            sendMessage();
        }
        e.stopPropagation(); // Prevent affecting other global keys like ESC
    });

    // Close on ESC
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && isChatOpen) {
            toggleChat(true);
        }
    });
});
