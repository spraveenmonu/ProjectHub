// ============================================================
// House Recommendation System — AI Assistant Chatbot
// Client-side assistant handling inquiries about home design
// ============================================================

(function () {
  "use strict";

  const responses = {
    vastu: "☸ <strong>Vastu Shastra Recommendations:</strong><br>• <strong>Entrance:</strong> Face East or North for positive energy flow.<br>• <strong>Kitchen:</strong> South-East corner (Agni direction). Avoid placing the kitchen directly under or over toilets.<br>• <strong>Master Bedroom:</strong> South-West corner for stability.<br>• <strong>Pooja Room:</strong> North-East is the most sacred corner for meditation.<br>• <strong>Staircase:</strong> South or West direction, climbing clockwise.",
    cost: "💰 <strong>Construction Cost Breakdown (per sq.ft):</strong><br>• <strong>Modern:</strong> ~₹2,200/sq.ft<br>• <strong>Traditional:</strong> ~₹1,800/sq.ft<br>• <strong>Contemporary:</strong> ~₹2,500/sq.ft<br>• <strong>Minimalist:</strong> ~₹1,600/sq.ft<br>• <strong>Colonial:</strong> ~₹2,000/sq.ft<br><br>💡 Adjust your Plot Dimensions or BHK configuration to see how these styles affect the estimated cost!",
    budget: "💰 <strong>Construction Cost Breakdown (per sq.ft):</strong><br>• <strong>Modern:</strong> ~₹2,200/sq.ft<br>• <strong>Traditional:</strong> ~₹1,800/sq.ft<br>• <strong>Contemporary:</strong> ~₹2,500/sq.ft<br>• <strong>Minimalist:</strong> ~₹1,600/sq.ft<br>• <strong>Colonial:</strong> ~₹2,000/sq.ft<br><br>💡 Adjust your Plot Dimensions or BHK configuration to see how these styles affect the estimated cost!",
    estimate: "💰 <strong>Construction Cost Breakdown (per sq.ft):</strong><br>• <strong>Modern:</strong> ~₹2,200/sq.ft<br>• <strong>Traditional:</strong> ~₹1,800/sq.ft<br>• <strong>Contemporary:</strong> ~₹2,500/sq.ft<br>• <strong>Minimalist:</strong> ~₹1,600/sq.ft<br>• <strong>Colonial:</strong> ~₹2,000/sq.ft<br><br>💡 Adjust your Plot Dimensions or BHK configuration to see how these styles affect the estimated cost!",
    price: "💰 <strong>Construction Cost Breakdown (per sq.ft):</strong><br>• <strong>Modern:</strong> ~₹2,200/sq.ft<br>• <strong>Traditional:</strong> ~₹1,800/sq.ft<br>• <strong>Contemporary:</strong> ~₹2,500/sq.ft<br>• <strong>Minimalist:</strong> ~₹1,600/sq.ft<br>• <strong>Colonial:</strong> ~₹2,000/sq.ft<br><br>💡 Adjust your Plot Dimensions or BHK configuration to see how these styles affect the estimated cost!",
    modern: "🏙️ <strong>Modern Architecture:</strong><br>• Costs ~₹2,200/sq.ft.<br>• Characterized by flat roofs, large glass panels, open plans, and clean steel/concrete structures.",
    traditional: "🪔 <strong>Traditional Architecture:</strong><br>• Costs ~₹1,800/sq.ft.<br>• Characterized by sloping tile roofs, central courtyards, sit-out verandas, pooja rooms, and jali screens.",
    contemporary: "🎨 <strong>Contemporary Architecture:</strong><br>• Costs ~₹2,500/sq.ft.<br>• Blend of modern structures with bold geometry, double-height ceilings, mixed materials, and custom lighting.",
    minimalist: "🌿 <strong>Minimalist Architecture:</strong><br>• Costs ~₹1,600/sq.ft (Lowest cost).<br>• Focuses on maximum functionality, concealed wiring, built-in storage, and bright, open natural light spaces.",
    colonial: "🏛️ <strong>Colonial Architecture:</strong><br>• Costs ~₹2,000/sq.ft.<br>• Traditional pillared porches, grand arched windows, high-pitched ceilings, and wrapping verandas.",
    bhk: "🛏️ <strong>BHK Configurations:</strong><br>• Choose from 1 BHK to 5 BHK layouts.<br>• Multi-floor designs will automatically distribute bedrooms to upper floors and communal spaces to the ground floor.",
    floor: "🏢 <strong>Multi-Story Design:</strong><br>• G (Ground Only), G + 1 (Two floors), or G + 2 (Three floors).<br>• Use the floor switcher tabs above the canvas after generating to inspect the layout of each floor!",
    plot: "📏 <strong>Plot Sizing:</strong><br>• Enter width and depth in feet (min 15' × 15' to max 200' × 200').<br>• Built-up area is calculated as ~65% of the total plot size multiplied by the number of floors.",
    dimension: "📏 <strong>Plot Sizing:</strong><br>• Enter width and depth in feet (min 15' × 15' to max 200' × 200').<br>• Built-up area is calculated as ~65% of the total plot size multiplied by the number of floors.",
    area: "📏 <strong>Plot Sizing:</strong><br>• Enter width and depth in feet (min 15' × 15' to max 200' × 200').<br>• Built-up area is calculated as ~65% of the total plot size multiplied by the number of floors.",
    layout: "🔧 <strong>Customize Layouts:</strong><br>• Use the sliders under the plan card to dynamically change the room size percentages!<br>• Click the <strong>✕</strong> next to any room to delete it. The remaining rooms will automatically expand to fill the layout space.<br>• Choose a preset from the dropdown (or type in a <em>Custom Room...</em>) and click <strong>➕ Add Room</strong> to add custom areas.<br>• Click <strong>🔀 Shuffle Layout</strong> to randomly jitter and reorganize the room placement.",
    change: "🔧 <strong>Customize Layouts:</strong><br>• Use the sliders under the plan card to dynamically change the room size percentages!<br>• Click the <strong>✕</strong> next to any room to delete it. The remaining rooms will automatically expand to fill the layout space.<br>• Choose a preset from the dropdown (or type in a <em>Custom Room...</em>) and click <strong>➕ Add Room</strong> to add custom areas.<br>• Click <strong>🔀 Shuffle Layout</strong> to randomly jitter and reorganize the room placement.",
    shuffle: "🔧 <strong>Customize Layouts:</strong><br>• Use the sliders under the plan card to dynamically change the room size percentages!<br>• Click the <strong>✕</strong> next to any room to delete it. The remaining rooms will automatically expand to fill the layout space.<br>• Choose a preset from the dropdown (or type in a <em>Custom Room...</em>) and click <strong>➕ Add Room</strong> to add custom areas.<br>• Click <strong>🔀 Shuffle Layout</strong> to randomly jitter and reorganize the room placement.",
    hello: "👋 Hello! I am your HomeMatch AI Assistant. How can I help you design your home today?",
    hi: "👋 Hello! I am your HomeMatch AI Assistant. How can I help you design your home today?",
    hey: "👋 Hello! I am your HomeMatch AI Assistant. How can I help you design your home today?",
    thanks: "😊 You're welcome! Let me know if you have any other questions.",
    thank: "😊 You're welcome! Let me know if you have any other questions.",
    help: "🤖 I can help you with:<br>• Vastu directions (kitchen, bedroom, entrance)<br>• Construction cost per square foot<br>• Layout customization & shuffling<br>• Plot dimensions and area rules",
    default: "🤖 Interesting question! For specific help, please ask about: <strong>Vastu</strong>, <strong>construction cost</strong>, <strong>layout customization</strong>, <strong>architectural styles</strong>, or <strong>plot dimensions</strong>."
  };

  function initChatbot() {
    const toggleBtn = document.getElementById("chat-toggle-btn");
    const closeBtn = document.getElementById("chat-close-btn");
    const chatWindow = document.getElementById("chat-window");
    const chatInput = document.getElementById("chat-input");
    const sendBtn = document.getElementById("chat-send-btn");
    const messagesContainer = document.getElementById("chat-messages");

    if (!toggleBtn || !chatWindow) return;

    // Toggle window
    toggleBtn.addEventListener("click", () => {
      chatWindow.classList.toggle("active");
      if (chatWindow.classList.contains("active")) {
        chatInput.focus();
      }
    });

    closeBtn.addEventListener("click", () => {
      chatWindow.classList.remove("active");
    });

    // Send Message
    function handleSend() {
      const text = chatInput.value.trim();
      if (!text) return;

      appendMessage(text, "user");
      chatInput.value = "";

      // Process response
      const botResponse = getBotResponse(text);
      setTimeout(() => {
        appendMessage(botResponse, "bot");
      }, 600);
    }

    sendBtn.addEventListener("click", handleSend);
    chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleSend();
    });

    function appendMessage(text, sender) {
      const msg = document.createElement("div");
      msg.classList.add("chat-message", sender);
      msg.innerHTML = text;
      messagesContainer.appendChild(msg);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function getBotResponse(userText) {
      const cleanText = userText.toLowerCase();
      
      for (const [key, value] of Object.entries(responses)) {
        if (cleanText.includes(key)) {
          return value;
        }
      }
      return responses.default;
    }
  }

  document.addEventListener("DOMContentLoaded", initChatbot);
})();
