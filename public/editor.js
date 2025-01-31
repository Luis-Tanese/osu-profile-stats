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
const downloadPngButton = document.getElementById("download-png-btn");
const copyPngButton = document.getElementById("copy-png-btn");

const convertSvgToPng = async (svgUrl, height) => {
    try {
        const response = await fetch(svgUrl, { mode: "cors" });
        const svgText = await response.text();

        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = svgText;

        const img = new Image();
        const svgBlob = new Blob([svgText], { type: "image/svg+xml" });
        const url = URL.createObjectURL(svgBlob);

        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = url;
        });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const scale = height / img.height;
        canvas.width = img.width * scale;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        URL.revokeObjectURL(url);

        return canvas.toDataURL("image/png");
    } catch (error) {
        console.error(error);
        throw error;
    }
};

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
    const markdownTag = `[img]${url}${
        url.includes("?") ? "&" : "?"
    }height=${height}[/img]`;

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

downloadPngButton.addEventListener("click", async () => {
    const username = usernameInput.value.trim();
    if (!username) return alert("Enter username first");

    try {
        const pngData = await convertSvgToPng(
            previewImage.src,
            previewImage.height
        );

        const a = document.createElement("a");
        a.href = pngData;
        a.download = `${username}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } catch (error) {
        alert("Error downloading PNG");
        console.error(error);
    }
});

copyPngButton.addEventListener("click", async () => {
    const username = usernameInput.value.trim();
    if (!username) return alert("Enter username first");

    try {
        const pngData = await convertSvgToPng(
            previewImage.src,
            previewImage.height
        );
        const blob = await (await fetch(pngData)).blob();

        await navigator.clipboard.write([
            new ClipboardItem({ [blob.type]: blob }),
        ]);
        alert("PNG copied to clipboard!");
    } catch (error) {
        alert("Error copying PNG");
        console.error(error);
    }
});

updatePreview();
