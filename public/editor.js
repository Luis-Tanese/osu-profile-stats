const elements = {
    inputs: {
        username: document.getElementById("username"),
        playmode: document.getElementById("playmode"),
        background: document.getElementById("background"),
        hexColor: document.getElementById("hex-color"),
        version: document.getElementById("version"),
        height: document.getElementById("height"),
        supporter: document.getElementById("supporter"),
        team: document.getElementById("team"),
    },
    preview: {
        image: document.getElementById("preview-image"),
        codes: {
            url: document.getElementById("code-url"),
            markdown: document.getElementById("code-markdown"),
            "markdown-link": document.getElementById("code-markdown-link"),
            bbcode: document.getElementById("code-bbcode"),
            "bbcode-link": document.getElementById("code-bbcode-link"),
            html: document.getElementById("code-html"),
            "html-link": document.getElementById("code-html-link"),
        },
    },
    buttons: {
        downloadPng: document.getElementById("download-png-btn"),
        copyPng: document.getElementById("copy-png-btn"),
    },
};

const convertSvgToPng = async (url, height) => {
    try {
        const res = await fetch(url, { mode: "cors" });
        const svg = await res.text();

        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = svg;

        const img = new Image();
        const svgBlob = new Blob([svg], { type: "image/svg+xml" });
        const urlObj = URL.createObjectURL(svgBlob);

        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = urlObj;
        });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const scale = height / img.height;
        canvas.width = img.width * scale;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        URL.revokeObjectURL(urlObj);

        return canvas.toDataURL("image/png");
    } catch (error) {
        alert("Error converting SVG to PNG; Check console for the problem.");
        console.error("Error converting SVG to PNG:", error);
        throw error;
    }
};

const generateImageUrl = () => {
    const {
        username,
        playmode,
        background,
        hexColor,
        version,
        height,
        supporter,
        team,
    } = getFormValues();
    if (!username) return "";

    const params = new URLSearchParams();

    if (playmode) params.append("playmode", playmode);
    if (version) params.append("version", version);
    if (height) params.append("height", height);

    if (background === "color" && hexColor) {
        params.append("background", "color");
        params.append("hex", hexColor.replace("#", ""));
    } else if (background) {
        params.append("background", background);
    }

    if (supporter === "false") params.append("supporter", "false");
    if (team === "false") params.append("team", "false");

    return `https://osu-profile-stats.vercel.app/api/profile-stats/${encodeURIComponent(
        username
    )}?${params.toString()}`;
};

const getFormValues = () => ({
    username: elements.inputs.username.value.trim(),
    playmode: elements.inputs.playmode.value,
    background: elements.inputs.background.value,
    hexColor: elements.inputs.hexColor.value.trim(),
    version: elements.inputs.version.value,
    height:
        elements.inputs.height.value ||
        (elements.inputs.version.value === "full" ? 200 : 120),
    supporter: elements.inputs.supporter.checked ? undefined : "false",
    team: elements.inputs.team.checked ? undefined : "false",
});

const generateAllCodeFormats = (imageUrl, username) => {
    if (!username) return {};

    const profileUrl = `https://osu.ppy.sh/users/${encodeURIComponent(
        username
    )}`;

    return {
        url: imageUrl,
        markdown: `![osu! stats card](${imageUrl})`,
        "markdown-link": `[![osu! stats card](${imageUrl})](${profileUrl})`,
        bbcode: `[img]${imageUrl}[/img]`,
        "bbcode-link": `[url=${profileUrl}][img]${imageUrl}[/img][/url]`,
        html: `<img src="${imageUrl}" alt="osu! stats card" />`,
        "html-link": `<a href="${profileUrl}"><img src="${imageUrl}" alt="osu! stats card" /></a>`,
    };
};

const updatePreview = () => {
    const { username, height } = getFormValues();
    const imageUrl = generateImageUrl();

    elements.preview.image.src = imageUrl;
    elements.preview.image.style.height = `${height}px`;

    const codes = generateAllCodeFormats(imageUrl, username);
    Object.entries(codes).forEach(([type, code]) => {
        if (elements.preview.codes[type]) {
            elements.preview.codes[type].value = code;
        }
    });
};

elements.inputs.background.addEventListener("change", () => {
    elements.inputs.hexColor.disabled =
        elements.inputs.background.value !== "color";
    elements.inputs.hexColor.value = "";
    updatePreview();
});

let debounceTimeout;

Object.values(elements.inputs).forEach((input) => {
    input.addEventListener("input", () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            updatePreview();
        }, 500);
    });
});

document.querySelector(".preview").addEventListener("click", async (e) => {
    if (e.target.classList.contains("copy-btn")) {
        const type = e.target.dataset.type;
        const textarea = elements.preview.codes[type];

        try {
            await navigator.clipboard.writeText(textarea.value);
            alert(`${type.replace("-", " ")} copied to clipboard!`);
        } catch (error) {
            alert("Copy failed; Check console for the problem.");
            console.error("Copy failed:", error);
            throw error;
        }
    }
});

elements.buttons.downloadPng.addEventListener("click", async () => {
    const username = elements.inputs.username.value.trim();
    if (!username) return alert("Enter username first!");

    try {
        const img = elements.preview.image;
        const pngData = await convertSvgToPng(img.src, img.height);

        const a = document.createElement("a");
        a.href = pngData;
        a.download = `${username}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        alert("PNG downloaded successfully!");
    } catch (error) {
        alert("Error downloading PNG; Check console for the problem.");
        console.error("Error downloading PNG:", error);
        throw error;
    }
});

elements.buttons.copyPng.addEventListener("click", async () => {
    const username = elements.inputs.username.value.trim();
    if (!username) return alert("Enter username first!");

    try {
        const img = elements.preview.image;
        const pngData = await convertSvgToPng(img.src, img.height);

        const blob = await (await fetch(pngData)).blob();
        await navigator.clipboard.write([
            new ClipboardItem({ [blob.type]: blob }),
        ]);

        alert("PNG copied to clipboard!");
    } catch (error) {
        alert("Error copying PNG; Check console for the problem.");
        console.error("Error copying PNG:", error);
        throw error;
    }
});

elements.inputs.supporter.addEventListener('change', updatePreview);
elements.inputs.team.addEventListener('change', updatePreview);

updatePreview();
