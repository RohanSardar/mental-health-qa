document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("question-form");
    const input = document.getElementById("question-input");
    const chatContainer = document.getElementById("chat-container");
    const typingIndicator = document.getElementById("typing-indicator");
    const statusIndicator = document.getElementById("status-indicator");

    // Check backend health
    async function checkHealth() {
        try {
            const res = await fetch("/health");
            const data = await res.json();
            if (data.status === "ok") {
                statusIndicator.innerText = `✅ Model ready (running on ${data.device})`;
                statusIndicator.classList.add("text-success");
            } else {
                statusIndicator.innerText = "⚠️ Model not ready";
                statusIndicator.classList.add("text-danger");
            }
        } catch (err) {
            statusIndicator.innerText = "❌ Cannot connect to server";
            statusIndicator.classList.add("text-danger");
        }
    }
    checkHealth();

    // Handle form submission
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const message = input.value.trim();
        if (!message) return;

        // Add user message
        addMessage("user", message);
        input.value = "";

        // Show typing indicator
        typingIndicator.style.display = "block";

        try {
            const response = await fetch("/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message })
            });

            const data = await response.json();

            typingIndicator.style.display = "none";

            if (data.response) {
                addMessage("assistant", data.response);
            } else {
                addMessage("assistant", "⚠️ Error: No response received.");
            }
        } catch (error) {
            typingIndicator.style.display = "none";
            addMessage("assistant", "⚠️ Error connecting to server.");
            console.error(error);
        }
    });

    // Example question buttons
    document.querySelectorAll(".example-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            input.value = btn.dataset.question;
            form.dispatchEvent(new Event("submit"));
        });
    });

    function addMessage(role, text) {
        const msg = document.createElement("div");
        msg.classList.add("message");
        msg.classList.add(role === "user" ? "user-message" : "assistant-message");
        msg.innerText = text;
        chatContainer.appendChild(msg);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
});
