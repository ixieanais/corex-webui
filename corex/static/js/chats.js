const textarea = document.getElementById("textarea-field");
const sendButton = document.getElementById("send-button");
const stopButton = document.getElementById("stop-button");
const chatContainer = document.getElementById("chat-messages");
const chatWrapper = document.querySelector(".chat-wrapper");
const copyMessageSVG = `
    <svg width="16" height="16" viewBox="0 0 512 512" fill="white">
        <path d="m 241,4.9 c -61,-1 -119,44 -133,103 -62,15 -107,78 -103,141 0,45 -1,90 1,135 5,69 69,125 137,123 48,0 95,1 143,-1 56,-5 105,-48 118,-103 62,-14 107,-77 103,-140 0,-45 1,-90 -1,-135 C 501,58.9 437,2.9 369,4.9 c -43,0 -85,0 -128,0 z m 0,46 c 46,0 93,-1 139,0 48,3 86,50 81,97 0,44 1,89 -1,133 -3,31 -24,60 -53,72 -1,-43 1,-87 -1,-130 -7,-67 -71,-122 -138,-119 -37,0 -73,0 -110,0 14,-32 48,-54 83,-53 z m -99,99 c 46,0 93,-1 139,0 48,3 86,50 81,97 0,44 1,88 0,132 -3,48 -50,86 -97,81 -44,0 -88,1 -132,0 -48,-3 -86,-50 -81,-97 0,-44 -1,-88 0,-132 4,-45 45,-82 90,-81 z"/>
    </svg>
`;

let controller;


function smoothScrollToBottom() {
    chatWrapper.scrollTo({
        top: chatContainer.scrollHeight,
        behavior: 'smooth'
    });
}


textarea.addEventListener("input", () => {
    const textareaFill = textarea.value.trim().length > 0;
    sendButton.disabled = textareaFill ? false : true;
});


textarea.addEventListener("blur", () => {
    const textareaFill = textarea.value.trim().length > 0;
    sendButton.disabled = textareaFill ? false : true;
});


textarea.addEventListener("focus", () => {
    const textareaFill = textarea.value.trim().length > 0;
    sendButton.disabled = textareaFill ? false : true;
});


textarea.addEventListener("keydown", function(e) {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendButton.click();
    }
});


document.querySelector('.new-chat-textarea-container').addEventListener('click', e => {
    if (e.target.closest('.textarea-left-buttons, .textarea-right-buttons')) return;
    document.getElementById('textarea-field').focus();
});


sendButton.addEventListener("click", async (e) => {
    if (stopButton.style.display === "flex") return;
    const message = textarea.value;
    textarea.value = "";
    sendButton.disabled = true;
    const searchEnabled = localStorage.getItem("searchEnabled") === "true"
    if (window.location.pathname === "/") {
        const chatName = message.trim().slice(0, 36);
        const chatId = await createChat(chatName);
        await createMessage(chatId, 1, "user", message)
        history.replaceState(null, "", `/chat/${chatId}`);
        await renderChat(chatId);
        await sidebarChatsContainer();
        controller = new AbortController();
        insertAssistantMessage(chatId, searchEnabled);
        return;
    }
    const chatId = window.location.pathname.split("/")[2];
    await insertUserMessage(chatId, message);
    controller = new AbortController();
    insertAssistantMessage(chatId, searchEnabled);
});

stopButton.addEventListener("click", () => {
    if (controller) controller.abort();
});

let searchEnabled = localStorage.getItem("searchEnabled");
function checkSearch() {
    const searchSVG = document.getElementById("search-svg");
    if (searchEnabled === "true") {
        searchSVG.style.stroke = "#83b0f4";
        searchEnabled = "true";
    } else if (searchEnabled === "false") {
        searchSVG.style.stroke = "white";
        searchEnabled = "false";
    } else {
        localStorage.setItem("searchEnabled", "false");
    }
}

const searchButton = document.getElementById("search-button");
searchButton.addEventListener("click", () => {
    const searchSVG = document.getElementById("search-svg");
    searchButton.blur();
    if (searchEnabled === "true") {
        searchEnabled = "false";
        searchSVG.style.stroke = "white";
        localStorage.setItem("searchEnabled", "false");
    } else {
        searchEnabled = "true";
        searchSVG.style.stroke = "#83b0f4";
        localStorage.setItem("searchEnabled", "true");
    }
});

checkSearch();

async function insertAssistantMessage(chatId, searchEnabled) {
    sendButton.style.display = "none";
    stopButton.style.display = "flex";

    const container = document.createElement("div");
    container.className = "chat-assistant-message-container";
    const assistant_div = document.createElement("div");
    assistant_div.className = "chat-message chat-assistant-message";
    assistant_div.style.whiteSpace = "pre-wrap";
    const buttons = document.createElement("div");
    buttons.className = "chat-message-buttons-container";
    container.appendChild(assistant_div);
    container.appendChild(buttons);
    chatContainer.appendChild(container);

    const loader = document.createElement("div");
    loader.className = "loader";
    assistant_div.appendChild(loader);
    smoothScrollToBottom();

    try {
        await new Promise(res => setTimeout(res, 300));
        let model = localStorage.getItem("selectedModel");
        if (model === null) {
            model = "Unknown";
        }
        const response = await fetch(`/api/v1/assistant/typing`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({id: chatId, model: model, search: searchEnabled}),
            signal: controller?.signal
        });
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let chatHeight = chatContainer.scrollHeight
        let load = false
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (!load) {
                if (value) {
                    assistant_div.innerHTML = "";
                    load = true;
                }
            }
            assistant_div.textContent += decoder.decode(value, { stream: true });
            if (chatHeight !== chatContainer.scrollHeight) {
                const isAtBottom = chatWrapper.scrollTop + chatWrapper.clientHeight >= chatWrapper.scrollHeight - 36;
                if (isAtBottom) {
                    chatWrapper.scrollTo({
                        top: chatContainer.scrollHeight,
                        behavior: 'instant'
                    });
                }
                chatHeight = chatContainer.scrollHeight;
            }
        }
    } catch (err) {
        if (err?.name !== "AbortError") console.error(err);
    } finally {
        loader.remove();
        sendButton.style.display = "flex";
        stopButton.style.display = "none";
        buttons.innerHTML = `
            <button class="chat-copy-message" data-tooltip="Copy">
                ${copyMessageSVG}
            </button>
        `;
    }
}

async function insertUserMessage(chatId, message) {
    const ordinalResponse = await getMessages(chatId);
    const ordinal = ordinalResponse.at(-1)["ordinal"] + 1

    await createMessage(chatId, ordinal, "user", message)
    const container = document.createElement("div");
    container.className = "chat-user-message-container";

    const user_div = document.createElement("div");
    user_div.className = "chat-message chat-user-message";
    user_div.style.whiteSpace = "pre-wrap";
    user_div.textContent = message;

    const buttons = document.createElement("div");
    buttons.className = "chat-message-buttons-container";
    buttons.style.justifyContent = "end";
    buttons.innerHTML = `
        <button class="chat-copy-message" data-tooltip="Copy">
            ${copyMessageSVG}
        </button>
    `;

    container.appendChild(user_div);
    container.appendChild(buttons);
    chatContainer.appendChild(container);

    smoothScrollToBottom();
}

chatContainer.addEventListener("click", async (e) => {
    if (e.target.classList.contains("chat-copy-message")) {
        const text = e.target.parentElement.parentElement.querySelector(".chat-message").textContent
        navigator.clipboard.writeText(text).then(() => {
            const svgCopied = `
                <svg width="16" height="16" viewBox="0 0 512 512" fill="white">
                    <path d="m 485.5,79.6 c -6.7,0 -13.6,2.6 -18.7,7.8 L 185.7,368.4 45.2,228 c -10.3,-10.3 -27,-10.3 -37.4,0.1 -10.4,10.4 -10.4,27.1 -0.1,37.4 L 166.9,424.7 c 5.8,5.8 13.7,8.4 21.3,7.7 5.9,-0.6 11.7,-3.2 16.2,-7.7 L 504.2,124.9 c 10.4,-10.4 10.4,-27.1 0,-37.5 -5.2,-5.2 -12,-7.8 -18.7,-7.8 z"/>
                </svg>
            `
            e.target.innerHTML = svgCopied
            setTimeout(() => {
                e.target.innerHTML = copyMessageSVG
            }, 1500);
        })
    }
})

async function renderChat(chatId) {
    const newChatWrapper = document.getElementById("new-chat-wrapper");
    const chatTextareaHide = document.getElementById("chat-textarea-hide");
    const newChatContainer = document.getElementById("new-chat-container");
    const corexCentered = document.querySelector(".centered-text");
    newChatWrapper.style.display = "inline";
    chatContainer.innerHTML = "";

    if (chatId !== "/") {
        chatContainer.style.display = "flex"
        chatTextareaHide.style.display = "inline";
        newChatWrapper.className = "chat-textarea-wrapper";
        newChatContainer.className = "chat-textarea-container";
        corexCentered.style.display = "none";
        const chatHistory = await getMessages(chatId);
        var chatData = await getChat(chatId);
        document.title = chatData.name;

        chatHistory.forEach(message => {
            const div = document.createElement("div");
            const isUser = message.role === "user";
            const isUserMessage = isUser ? "chat-user-message" : "chat-assistant-message";
            const copyButtonPosition = isUser ? "justify-content: end;" : "justify-content: start;";

            div.className = isUser ? "chat-user-message-container" : "chat-assistant-message-container";

            const messageDiv = document.createElement("div");
            messageDiv.className = `chat-message ${isUserMessage}`;
            messageDiv.textContent = message.content;
            messageDiv.dataset.id = message.id;
            messageDiv.dataset.role = message.role;
            messageDiv.dataset.ordinal = message.ordinal;

            const buttonsContainer = document.createElement("div");
            buttonsContainer.className = "chat-message-buttons-container";
            buttonsContainer.style = copyButtonPosition;

            const copyButton = document.createElement("button");
            copyButton.className = "chat-copy-message";
            copyButton.setAttribute("data-tooltip", "Copy");
            copyButton.innerHTML = copyMessageSVG;

            buttonsContainer.appendChild(copyButton);
            div.appendChild(messageDiv);
            div.appendChild(buttonsContainer);

            div.style.whiteSpace = "pre-wrap";
            chatContainer.appendChild(div);
        });
        chatWrapper.scrollTo({
            top: chatContainer.scrollHeight,
            behavior: 'instant'
        });
    } else {
        chatContainer.style.display = "none"
        chatTextareaHide.style.display = "none";
        newChatWrapper.className = "new-chat-wrapper";
        newChatContainer.className = "new-chat-container";
        corexCentered.style.display = "flex";
        document.title = "Corex";
    }
}

if (window.location.pathname === "/") {
    renderChat("/");
} else {
    renderChat(window.location.pathname.split("/")[2]);
}