newChatButton.addEventListener("click", () => {
    history.replaceState(null, "", "/");
    chatMenuTarget = null;
    renderChat("/");
});

CorexButton.addEventListener("click", () => {
    history.replaceState(null, "", "/");
    chatMenuTarget = null;
    renderChat("/");
});
