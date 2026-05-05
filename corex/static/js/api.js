async function getChatsDB() {
    const response = await fetch("/api/get_chats", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });
    return await response.json().catch(() => {});
}


async function getModelsDB() {
    const response = await fetch("/api/get_models", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });
    return await response.json().catch(() => {});
}


async function chatCreateDB(chatName, message) {
    const response = await fetch("/api/create_chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({name: chatName, message: message})
    });
    return await response.json().catch(() => {});
}


async function chatRenameDB(chatId, chatName) {
    const response = await fetch("/api/rename_chat", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({id: chatId, name: chatName})
    });
    return await response.json().catch(() => {});
}


async function chatDeleteDB(chatId) {
    const response = await fetch(`/api/delete_chat/${chatId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
    });
    return await response.json().catch(() => {});
}


async function getChatTitleDB(chatId) {
    const response = await fetch(`/api/get_chat_title/${chatId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });
    return await response.json();
}


async function getChatHistoryDB(chatId) {
    const response = await fetch(`/api/get_chat_history/${chatId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });
    return await response.json();
}


async function insertUserMessageDB(chatId, message) {
    const response = await fetch("/api/insert_user_message", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ id: chatId, message: message })
    });
}
