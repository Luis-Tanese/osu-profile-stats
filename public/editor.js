const usernameInput = document.getElementById("username");
const playmodeSelect = document.getElementById("playmode");
const backgroundSelect = document.getElementById("background");
const hexColorInput = document.getElementById("hex-color");
const versionSelect = document.getElementById("version");
const heightInput = document.getElementById("height");
const previewImage = document.getElementById("preview-image");
const imgTagTextarea = document.getElementById("img-tag");
const markdownTagTextarea = document.getElementById("markdown-tag");
const copyImgButton = document.getElementById("copy-img-btn");
const copyMdButton = document.getElementById("copy-md-btn");

const updatePreview = () => {
    const username = usernameInput.value.trim();
    const playmode = playmodeSelect.value;
    const background = backgroundSelect.value;
    let hexColor = hexColorInput.value.trim();
    const version = versionSelect.value;
    let height;
    if (version === "full") {
        height = heightInput.value.trim() || 200;
    } else {
        height = heightInput.value.trim() || 120;
    }

    if (!username) {
        previewImage.src = "";
        imgTagTextarea.value = "";
        markdownTagTextarea.value = "";
        return;
    }

    let url = `https://osu-profile-stats.vercel.app/api/profile-stats/${encodeURIComponent(
        username
    )}`;

    if (playmode) url += `?playmode=${playmode}`;

    if (background) {
        const separator = playmode ? "&" : "?";
        if (background === "color" && hexColor) {
            if (hexColor.includes("#")) hexColor = hexColor.replace("#", "");
            url += `${separator}background=color&hex=${hexColor}`;
        } else if (background !== "color") {
            url += `${separator}background=${background}`;
        }
    }

    if (version) {
        const separator = url.includes("?") ? "&" : "?";
        url += `${separator}version=${version}`;
    }

    const imgTag = `<img src="${url}" height="${height}" alt="osu stats">`;
    const markdownTag = `![card](${url}${url.includes("?") ? "&" : "?"}height=${height})`;

    previewImage.src = url;
    previewImage.height = height;
    imgTagTextarea.value = imgTag;
    markdownTagTextarea.value = markdownTag;
};

backgroundSelect.addEventListener("change", () => {
    hexColorInput.disabled = backgroundSelect.value !== "color";
    hexColorInput.value = "";
    updatePreview();
});

[
    usernameInput,
    playmodeSelect,
    backgroundSelect,
    hexColorInput,
    versionSelect,
    heightInput,
].forEach((el) => el.addEventListener("input", updatePreview));

copyImgButton.addEventListener("click", () => {
    navigator.clipboard.writeText(imgTagTextarea.value).then(() => {
        alert("HTML tag copied to clipboard!");
    });
});

copyMdButton.addEventListener("click", () => {
    navigator.clipboard.writeText(markdownTagTextarea.value).then(() => {
        alert("Markdown tag copied to clipboard!");
    });
});

updatePreview();
