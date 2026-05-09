async function createChat(chatName) {
    const response = await fetch("/api/v1/chats", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({name: chatName})
    });
    return await response.json().catch(() => {});
}


async function getChats() {
    const response = await fetch("/api/v1/chats", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });
    return await response.json().catch(() => {});
}


async function getChat(chatId) {
    const response = await fetch(`/api/v1/chats/${chatId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });
    return await response.json().catch(() => {});
}


async function updateChat(chatId, chatName) {
    const response = await fetch(`/api/v1/chats/${chatId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({name: chatName})
    });
}


async function deleteChat(chatId) {
    const response = await fetch(`/api/v1/chats/${chatId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
    });
}


async function createMessage(chatId, ordinal, role, content) {
    const response = await fetch(`/api/v1/messages/${chatId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ordinal: ordinal, role: role, content: content})
    });
}


async function getMessages(chatId) {
    const response = await fetch(`/api/v1/messages/${chatId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });
    return await response.json();
}


async function getModels() {
    const response = await fetch("/api/v1/models", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });
    return await response.json().catch(() => {});
}
