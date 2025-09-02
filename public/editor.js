const elements = {
    inputs: {
        username: document.getElementById("username"),
        playmode: document.getElementById("playmode"),
        background: document.getElementById("background"),
        hexColor: document.getElementById("hex-color"),
        version: document.getElementById("version"),
        height: document.getElementById("height"),
        imageType: document.getElementById("imageType"),
        supporter: document.getElementById("supporter"),
        team: document.getElementById("team"),
    },
    preview: {
        image: document.getElementById("preview-image"),
        loadingContainer: document.getElementById("loading-container"),
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
        downloadSvg: document.getElementById("download-svg-btn"),
        downloadPng: document.getElementById("download-png-btn"),
        downloadJpg: document.getElementById("download-jpg-btn"),
        copyPng: document.getElementById("copy-png-btn"),
    },
};

const BASE_URL = window.location.origin;

const downloadImage = async (url, format, filename) => {
    try {
        const response = await fetch(url);
        if (!response.ok)
            throw new Error(
                `Failed to download ${format}: ${response.statusText}`
            );

        const blob = await response.blob();
        const downloadUrl = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(downloadUrl);
        alert(`${format.toUpperCase()} downloaded successfully!`);
    } catch (error) {
        alert(
            `Error downloading ${format.toUpperCase()}; Check console for the problem.`
        );
        console.error(`Error downloading ${format}:`, error);
        throw error;
    }
};

const generateImageUrl = (overrideImageType = null) => {
    const {
        username,
        playmode,
        background,
        hexColor,
        version,
        height,
        imageType,
        supporter,
        team,
    } = getFormValues();
    if (!username) return "";

    const params = new URLSearchParams();

    if (playmode) params.append("playmode", playmode);
    if (version) params.append("version", version);
    if (height) params.append("height", height);

    const finalImageType = overrideImageType || imageType;
    if (finalImageType && finalImageType !== "svg") {
        params.append("imageType", finalImageType);
    }

    if (background === "color" && hexColor) {
        params.append("background", "color");
        params.append("hex", hexColor.replace("#", ""));
    } else if (background) {
        params.append("background", background);
    }

    if (supporter === "false") params.append("supporter", "false");
    if (team === "false") params.append("team", "false");

    return `${BASE_URL}/api/profile-stats/${encodeURIComponent(
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
    imageType: elements.inputs.imageType.value,
    supporter: elements.inputs.supporter.checked ? undefined : "false",
    team: elements.inputs.team.checked ? undefined : "false",
});

const generateAllCodeFormats = (imageUrl, username) => {
    if (!username) return {};

    const profileUrl = `https://osu.ppy.sh/users/${encodeURIComponent(
        username
    )}`;

    const svgUrl = generateImageUrl("svg");
    const pngUrl = generateImageUrl("png");
    const jpgUrl = generateImageUrl("jpg");

    const { imageType } = getFormValues();
    const currentUrl = imageUrl || svgUrl;

    return {
        url: currentUrl,
        markdown: `![osu! stats card](${currentUrl})`,
        "markdown-link": `[![osu! stats card](${currentUrl})](${profileUrl})`,
        bbcode: `[img]${currentUrl}[/img]`,
        "bbcode-link": `[url=${profileUrl}][img]${currentUrl}[/img][/url]`,
        html: `<img src="${currentUrl}" alt="osu! stats card" />`,
        "html-link": `<a href="${profileUrl}"><img src="${currentUrl}" alt="osu! stats card" /></a>`,
    };
};

const updatePreview = async () => {
    const { username, height } = getFormValues();
    const imageUrl = generateImageUrl();

    if (imageUrl) {
        elements.preview.loadingContainer.classList.remove("hidden");
        elements.preview.image.classList.add("hidden");

        try {
            await new Promise((resolve, reject) => {
                elements.preview.image.onload = resolve;
                elements.preview.image.onerror = reject;
                elements.preview.image.src = imageUrl;
            });
        } finally {
            elements.preview.loadingContainer.classList.add("hidden");
            elements.preview.image.classList.remove("hidden");
        }
    } else {
        elements.preview.image.src = "";
    }

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

// Download button event listeners
elements.buttons.downloadSvg.addEventListener("click", async () => {
    const username = elements.inputs.username.value.trim();
    if (!username) return alert("Enter username first!");

    const svgUrl = generateImageUrl("svg");
    await downloadImage(svgUrl, "svg", `${username}.svg`);
});

elements.buttons.downloadPng.addEventListener("click", async () => {
    const username = elements.inputs.username.value.trim();
    if (!username) return alert("Enter username first!");

    const pngUrl = generateImageUrl("png");
    await downloadImage(pngUrl, "png", `${username}.png`);
});

elements.buttons.downloadJpg.addEventListener("click", async () => {
    const username = elements.inputs.username.value.trim();
    if (!username) return alert("Enter username first!");

    const jpgUrl = generateImageUrl("jpg");
    await downloadImage(jpgUrl, "jpg", `${username}.jpg`);
});

elements.buttons.copyPng.addEventListener("click", async () => {
    const username = elements.inputs.username.value.trim();
    if (!username) return alert("Enter username first!");

    try {
        const pngUrl = generateImageUrl("png");
        const response = await fetch(pngUrl);
        if (!response.ok)
            throw new Error(`Failed to fetch PNG: ${response.statusText}`);

        const blob = await response.blob();
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

elements.inputs.supporter.addEventListener("change", updatePreview);
elements.inputs.team.addEventListener("change", updatePreview);
elements.inputs.imageType.addEventListener("change", updatePreview);

updatePreview();
