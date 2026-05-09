const SIDEBAR_SMALL = "52px";
const SIDEBAR_NORMAL = "260px";
const root = document.documentElement;
const sidebarResizeButton = document.getElementById("hide-sidebar-button");
const sidebarResizeSVG = document.getElementById("hide-sidebar-svg");
const newChatSpan = document.getElementById("new-chat-span");
const newChatButton = document.getElementById("new-chat");
const CorexButton = document.getElementById("corex-button");
const sidebarChats = document.getElementById("sidebar-chats");
const chatsContainer = document.querySelector(".sidebar-chats-content");
const chatContextMenu = document.getElementById("chat-context-menu");
const renameChatsButton = document.getElementById("rename-button");
const deleteChatsButton = document.getElementById("delete-button");
const settingsButton = document.getElementById("settings-button");

let sidebarWidth = localStorage.getItem("sidebarWidth") || SIDEBAR_NORMAL;
root.style.setProperty("--sidebar-width", sidebarWidth);

let chatMenuTarget = null;


function updateSidebarState(isCollapsed) {
    const newWidth = isCollapsed ? SIDEBAR_SMALL : SIDEBAR_NORMAL;
    root.style.setProperty("--sidebar-width", newWidth);
    localStorage.setItem("sidebarWidth", newWidth);
    const opacity = isCollapsed ? "0" : "1";
    const pointerEvents = isCollapsed ? "none" : "all";
    [newChatSpan, sidebarChats, CorexButton].forEach(el => {
        if (!el) return;
        el.style.opacity = opacity;
        el.style.pointerEvents = pointerEvents;
    });
    if (sidebarResizeSVG) sidebarResizeSVG.style.transform = isCollapsed ? "rotate(0deg)" : "rotate(180deg)";
    if (sidebarChats) sidebarChats.style.overflowY = isCollapsed ? "hidden" : "auto";
    if (newChatSpan) newChatSpan.innerHTML = isCollapsed ? "" : "New chat";
}


function toggleSidebar() {
    const currentWidth = getComputedStyle(root).getPropertyValue("--sidebar-width").trim();
    updateSidebarState(currentWidth === SIDEBAR_NORMAL);
}


function handleWindowResize() {
    const shouldCollapse = window.innerWidth <= 800;
    root.style.setProperty(
        "--sidebar-width",
        shouldCollapse ? "0px" : localStorage.getItem("sidebarWidth") || SIDEBAR_NORMAL
    );
}

function checkEmptyChats() {
    if (!chatsContainer.querySelector(".sidebar-chats-button")) {
        let label = chatsContainer.querySelector(".no-chat-label");
        if (!label) {
            label = document.createElement("label");
            label.className = "no-chat-label";
            label.textContent = "No chat history";
            chatsContainer.appendChild(label);
        }
    } else {
        const label = chatsContainer.querySelector(".no-chat-label");
        if (label) label.remove();
    }
}


function menuChatsButtonFunc() {
    document.querySelectorAll(".sidebar-chats-menu-button").forEach(chatButton => {
        chatButton.addEventListener("click", e => {
            e.stopPropagation();
            const isSameTarget = chatMenuTarget === chatButton;
            const isMenuOpen = chatContextMenu.style.display === "flex";
            if (isMenuOpen && isSameTarget) {
                chatContextMenu.style.display = "none";
                chatMenuTarget = null;
                return;
            }
            chatContextMenu.style.display = "flex";
            chatContextMenu.style.top = `${chatButton.getBoundingClientRect().top + 28}px`;
            chatContextMenu.style.left = `${chatButton.getBoundingClientRect().left - chatContextMenu.offsetWidth + chatButton.offsetWidth}px`;
            chatMenuTarget = chatButton;
        });
    });

    document.addEventListener("click", async (e) => {
        if (!chatContextMenu.contains(e.target)) {
            chatContextMenu.style.display = "none";
            chatMenuTarget = null;
        }
    });

    renameChatsButton.addEventListener("click", () => {
        chatContextMenu.style.display = "none";
        const chatBlock = chatMenuTarget.closest(".sidebar-chats-button");
        const chatButton = chatBlock.querySelector(".sidebar-chats-a-button");
        const chatSpan = chatButton.querySelector(".sidebar-chats-span");
        const chatId = chatButton.dataset.chatId;
        const currentName = chatSpan.textContent;
        const input = document.createElement("input");
        input.type = "text";
        input.className = "rename-input";
        input.maxLength = 36;
        input.value = currentName;
        chatSpan.replaceWith(input);
        input.focus();
        input.select();
        let renamed = false;
        const finalizeRename = () => {
            if (renamed) return;
            renamed = true;
            input.replaceWith(chatSpan);
            input.remove();
        };
        input.addEventListener("keydown", e => {
            if (e.key === "Enter") {
                const chatName = input.value;
                chatSpan.textContent = chatName;
                finalizeRename();
                updateChat(chatId, chatName);
                document.title = chatName;
            } else if (e.key === "Escape") {
                finalizeRename();
            }
        });
        input.addEventListener("blur", () => {
            finalizeRename();
        });
        chatMenuTarget = null;
    });

    deleteChatsButton.addEventListener("click", () => {
        const chatBlock = chatMenuTarget?.closest(".sidebar-chats-button");
        if (!chatMenuTarget || !chatBlock) return;
        const chatButton = chatBlock.querySelector(".sidebar-chats-a-button");
        const chatId = chatButton.dataset.chatId;
        if (window.location.pathname === `/chat/${chatId}`) {
            history.replaceState(null, "", "/");
            chatContainer.innerHTML = "";
            renderChat("/");
        }
        deleteChat(chatId);
        chatBlock.remove();
        checkEmptyChats();
        chatContextMenu.style.display = "none";
        chatMenuTarget = null;
    });

    document.querySelectorAll(".sidebar-chats-a-button").forEach(sidebarChatButton => {
        sidebarChatButton.addEventListener("click", () => {
            const chatId = sidebarChatButton.dataset.chatId;
            if (chatId === window.location.pathname.split("/")[2]) return;
            history.replaceState(null, "", `/chat/${chatId}`);
            renderChat(chatId);
        });
    });
}


async function sidebarChatsContainer() {
    const sidebarChatsContent = document.getElementById("sidebar-chats-content");
    sidebarChatsContent.innerHTML = "";
    const chats = await getChats();
    const fragment = document.createDocumentFragment();
    chats.forEach(chat => {
        const div = document.createElement("div");
        div.className = "sidebar-chats-button";
        div.innerHTML = `
            <button class="sidebar-chats-a-button" data-chat-id="${chat.id}">
                <span class="sidebar-chats-span">${chat.name}</span>
            </button>
            <button class="sidebar-chats-menu-button">
                <svg width="14" height="14" viewBox="0 0 512 512" fill="white">
                    <circle cx="60" cy="256" r="50"/>
                    <circle cx="256" cy="256" r="50"/>
                    <circle cx="452" cy="256" r="50"/>
                </svg>
            </button>
        `;
        fragment.appendChild(div);
    });
    sidebarChatsContent.appendChild(fragment);
    menuChatsButtonFunc();
    checkEmptyChats();
}


settingsButton.addEventListener("click", () => {
    alert("This button is currently under development...");
});


updateSidebarState(sidebarWidth === SIDEBAR_SMALL);
sidebarResizeButton.addEventListener("click", toggleSidebar);
window.addEventListener("resize", handleWindowResize);
