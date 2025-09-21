// Your n8n production webhook URL
const CHATBOT_API_URL = "https://n8n-zd4g.onrender.com/webhook/chat";

// Create a unique sessionId for the user
const sessionId = "session-" + Math.random().toString(36).substr(2, 9);

// Predefined FAQs
const predefinedAnswers = {
  "tell about the groundwater resource in telangana?":
    "Telangana’s groundwater resources are largely dependent on rainfall, with significant variations across districts. Over-exploitation is reported in many areas due to irrigation demand, and sustainable practices are being promoted.",
  "states where these resources are over exploited":
    "As per official groundwater assessments, states like Punjab, Haryana, Rajasthan, Tamil Nadu, and parts of Telangana have critical or over-exploited groundwater blocks due to intensive irrigation and urbanization.",
  "what is INGRES?":
    "INGRES stands for India's Groundwater Resource Assessment, a system used to monitor and manage the country's groundwater resources. It's a comprehensive database and analytical tool that helps us understand groundwater levels, recharge rates, and extraction patterns across different regions of India. The data is collected and analyzed by the Central Ground Water Board (CGWB).",
};

document.getElementById("chatbot-icon").addEventListener("click", () => {
  document.getElementById("chatbox").classList.toggle("hidden");

  // Hide icon when chatbox is open
  if (!document.getElementById("chatbox").classList.contains("hidden")) {
    document.getElementById("chatbot-icon").style.display = "none";
  }
});

document.getElementById("close-chat").addEventListener("click", () => {
  document.getElementById("chatbox").classList.add("hidden");
  document.getElementById("chatbot-icon").style.display = "block"; // show icon again
});

async function sendMessage() {
  const input = document.getElementById("user-input");
  const message = input.value.trim().toLowerCase();
  if (!message) return;

  const chatBody = document.getElementById("chat-body");
  chatBody.innerHTML += `<p><strong>You:</strong> ${input.value}</p>`;
  input.value = "";

  // ✅ Check if predefined answer exists
  if (predefinedAnswers[message]) {
    chatBody.innerHTML += `<p><strong>Bot:</strong> ${predefinedAnswers[message]}</p>`;
    chatBody.scrollTop = chatBody.scrollHeight;
    return;
  }

  // If not predefined, call n8n API
  try {
    const res = await fetch(CHATBOT_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, sessionId }),
    });

    const data = await res.json();

    // Handle array response like [{"output":"something"}]
    const reply =
      Array.isArray(data) && data[0]?.output
        ? data[0].output
        : "Sorry, I didn’t understand that.";

    chatBody.innerHTML += `<p><strong>Bot:</strong> ${reply}</p>`;
  } catch (err) {
    console.error(err);
    chatBody.innerHTML += `<p><strong>Bot:</strong> Thinking...</p>`;
  }

  chatBody.scrollTop = chatBody.scrollHeight;
}

document.getElementById("send-btn").addEventListener("click", sendMessage);

// ✅ Send message on Enter key press
document
  .getElementById("user-input")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  });
