const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");
const { log } = require("./utils.js");
const path = require("path");
const fs = require("fs");

const imageCache = new Map();
const MAX_CACHE_SIZE = 100;
const CACHE_TTL = 300000;

let browserInstance = null;

const getBrowser = async () => {
    if (!browserInstance) {
        try {
            const isServerless =
                process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

            log(
                `[BROWSER] Environment detection: VERCEL=${process.env.VERCEL}, NODE_ENV=${process.env.NODE_ENV}`
            );
            log(`[BROWSER] Using serverless mode: ${!!isServerless}`);

            if (isServerless) {
                log("[BROWSER] Launching Chrome for serverless environment");
                browserInstance = await puppeteer.launch({
                    args: chromium.args,
                    defaultViewport: chromium.defaultViewport,
                    executablePath: await chromium.executablePath(),
                    headless: chromium.headless,
                    ignoreHTTPSErrors: true,
                });
                log(
                    "[BROWSER] Chrome launched successfully in serverless mode"
                );
            } else {
                // Use regular puppeteer for local development
                let puppeteerRegular;
                try {
                    puppeteerRegular = require("puppeteer");
                } catch (error) {
                    throw new Error(
                        "Puppeteer not available for local development. Run: npm install puppeteer"
                    );
                }

                log("[BROWSER] Launching Chrome for local development");
                const executablePath = puppeteerRegular.executablePath();
                log(`[BROWSER] Using Chrome executable: ${executablePath}`);

                browserInstance = await puppeteer.launch({
                    executablePath,
                    headless: "new",
                    args: [
                        "--no-sandbox",
                        "--disable-setuid-sandbox",
                        "--disable-dev-shm-usage",
                        "--disable-gpu",
                        "--no-first-run",
                        "--no-zygote",
                        "--single-process",
                        "--disable-extensions",
                        "--disable-background-timer-throttling",
                        "--disable-backgrounding-occluded-windows",
                        "--disable-renderer-backgrounding",
                    ],
                    timeout: 30000,
                });
                log("[BROWSER] Chrome launched successfully in local mode");
            }
        } catch (error) {
            log(`[BROWSER-ERROR] Failed to launch browser: ${error.message}`);
            log(
                `[BROWSER-ERROR] Environment: ${
                    process.env.VERCEL ? "Vercel" : "Local"
                }`
            );
            throw error;
        }
    }
    return browserInstance;
};

process.on("exit", async () => {
    if (browserInstance) {
        await browserInstance.close();
    }
});

process.on("SIGINT", async () => {
    if (browserInstance) {
        await browserInstance.close();
    }
    process.exit();
});

const createHtmlPage = (svgContent, width, height) => {
    const fontPath = path.join(
        __dirname,
        "..",
        "assets",
        "fonts",
        "Torus-Regular.otf"
    );
    let fontBase64 = "";

    try {
        const fontBuffer = fs.readFileSync(fontPath);
        fontBase64 = fontBuffer.toString("base64");
    } catch (error) {
        log(`[FONT-ERROR] Could not load Torus font: ${error.message}`);
    }

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @font-face {
            font-family: 'Torus';
            src: url('data:font/opentype;base64,${fontBase64}') format('opentype');
            font-display: block;
        }
        
        body {
            margin: 0;
            padding: 20px;
            background: transparent;
            font-family: 'Torus', Arial, sans-serif;
        }
        
        .svg-container {
            display: inline-block;
            width: ${width}px;
            height: ${height}px;
        }
        
        .text { 
            fill: rgb(255, 255, 255); 
            font-family: 'Torus', Arial, sans-serif; 
        }
        .ans { 
            fill: rgb(247, 201, 221); 
        }
        .massive { font-size: 17px; }
        .large { font-size: 13px; }
        .medium { font-size: 9px; }
        .small { font-size: 7px; }
    </style>
</head>
<body>
    <div class="svg-container">
        ${svgContent}
    </div>
</body>
</html>`;
};

const convertSvgToImage = async (svgString, format, width, height) => {
    const browser = await getBrowser();
    const page = await browser.newPage();

    try {
        await page.setViewport({
            width: width + 40,
            height: height + 40,
            deviceScaleFactor: 2,
        });

        const htmlContent = createHtmlPage(svgString, width, height);

        await page.setContent(htmlContent, {
            waitUntil: "networkidle0",
            timeout: 10000,
        });

        await page.evaluateHandle(() => document.fonts.ready);

        const element = await page.$(".svg-container");
        if (!element) {
            throw new Error("SVG container not found");
        }

        const screenshot = await element.screenshot({
            type: format === "jpg" ? "jpeg" : "png",
            quality: format === "jpg" ? 95 : undefined,
            omitBackground: format === "png",
        });

        return screenshot;
    } catch (error) {
        log(`[ERROR] Puppeteer conversion failed: ${error.message}`);
        throw error;
    } finally {
        await page.close();
    }
};

const validateImageType = (imageType) => {
    if (!imageType) return "svg";

    const normalized = imageType.toLowerCase().trim();
    const validTypes = ["svg", "png", "jpg", "jpeg"];

    if (!validTypes.includes(normalized)) {
        throw new Error(
            `Invalid imageType. Supported formats: ${validTypes.join(", ")}`
        );
    }

    return normalized === "jpeg" ? "jpg" : normalized;
};

const generateImageCacheKey = (endpoint, username, params, imageType) => {
    const paramString = Object.keys(params)
        .sort()
        .map((key) => `${key}=${params[key]}`)
        .join("&");

    return `${endpoint}-${username}-${paramString}-${imageType}`;
};

const cacheImage = (key, buffer, format) => {
    if (imageCache.size >= MAX_CACHE_SIZE) {
        const firstKey = imageCache.keys().next().value;
        imageCache.delete(firstKey);
    }

    imageCache.set(key, {
        buffer,
        format,
        timestamp: Date.now(),
    });
};

const getCachedImage = (key) => {
    const cached = imageCache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > CACHE_TTL) {
        imageCache.delete(key);
        return null;
    }

    return cached;
};
const processImageConversion = async (svgString, imageType, options = {}) => {
    const { width, height, cacheKey } = options;

    try {
        if (imageType === "svg") {
            return {
                success: true,
                data: svgString,
                contentType: "image/svg+xml",
                fromCache: false,
            };
        }

        if (cacheKey) {
            const cached = getCachedImage(cacheKey);
            if (cached) {
                return {
                    success: true,
                    data: cached.buffer,
                    contentType: `image/${cached.format}`,
                    fromCache: true,
                };
            }
        }

        const targetWidth = width || 400;
        const targetHeight = height || 200;

        const imageBuffer = await convertSvgToImage(
            svgString,
            imageType,
            targetWidth,
            targetHeight
        );

        if (cacheKey) {
            cacheImage(cacheKey, imageBuffer, imageType);
        }

        return {
            success: true,
            data: imageBuffer,
            contentType: `image/${imageType}`,
            fromCache: false,
        };
    } catch (error) {
        log(
            `[ERROR] Image conversion failed for ${imageType}: ${error.message}`
        );

        return {
            success: false,
            data: svgString,
            contentType: "image/svg+xml",
            error: error.message,
            fallback: true,
        };
    }
};

const getCacheStats = () => {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;
    let totalSize = 0;

    for (const [key, value] of imageCache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
            expiredEntries++;
        } else {
            validEntries++;
            totalSize += value.buffer.length;
        }
    }

    return {
        totalEntries: imageCache.size,
        validEntries,
        expiredEntries,
        totalSizeBytes: totalSize,
        maxSize: MAX_CACHE_SIZE,
        ttlMs: CACHE_TTL,
    };
};

const cleanExpiredCache = () => {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, value] of imageCache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
            imageCache.delete(key);
            cleanedCount++;
        }
    }

    return cleanedCount;
};

setInterval(cleanExpiredCache, CACHE_TTL);

module.exports = {
    validateImageType,
    generateImageCacheKey,
    processImageConversion,
    getCacheStats,
    cleanExpiredCache,
};
