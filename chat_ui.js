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
    async function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        // Check connection
        if (!window.room || window.room.state !== 'connected') {
            addMessage("System: Please connect to Aanya first.", "aanya");
            return;
        }

        // Add User Message
        addMessage(text, "user");
        chatInput.value = "";

        // Send to LiveKit Data Channel
        try {
            console.log("💬 Attempting to send message:", text);
            const payload = JSON.stringify({ type: "text", message: text });
            const encoder = new TextEncoder();
            const encoded = encoder.encode(payload);

            await window.room.localParticipant.publishData(
                encoded,
                { reliable: true }
            );
            console.log("✅ Message published to LiveKit data channel");
        } catch (e) {
            console.error("❌ Failed to send message:", e);
            addMessage("System: Failed to send message (See Console).", "aanya");
        }
    }

    // ➕ ADD MESSAGE TO DOM
    function addMessage(text, sender) {
        const msgDiv = document.createElement("div");
        msgDiv.classList.add("chat-message", sender);

        // Timestamp
        const timeSpan = document.createElement("span");
        timeSpan.classList.add("msg-time");
        const now = new Date();
        timeSpan.innerText = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

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

    // 📡 LIVEKIT LISTENERS (Added for Text Chat)
    let currentRoom = null;
    setInterval(() => {
        if (window.room) { // Check if room exists
            if (window.room !== currentRoom) {
                currentRoom = window.room;
                console.log("💬 Chat UI: Connected to Room. Listening for data...");

                currentRoom.on("dataReceived", (payload, participant) => {
                    console.log("📩 Data received from:", participant ? participant.identity : "System");
                    try {
                        const decoder = new TextDecoder();
                        const strData = decoder.decode(payload);
                        console.log("📄 Raw data:", strData);
                        const data = JSON.parse(strData);

                        if (data.type === "text_response" && data.message) {
                            // Safety: Ensure it's treated as an Aanya message
                            window.addAanyaMessage(data.message);
                        } else {
                            console.log("ℹ️ Ignored message type:", data.type);
                        }
                    } catch (e) {
                        console.warn("⚠️ Chat UI: Ignored malformed data packet or non-text data", e);
                    }
                });
            }
        }
    }, 1000);
});
