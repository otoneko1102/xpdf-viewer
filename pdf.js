(function () {
  "use strict";

  const PDFJS_VERSION = "2.10.377";
  const PDFJS_URL = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.min.js`;
  const PDFJS_WORKER_URL = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;

  function injectStyles() {
    if (document.getElementById("xpdf-styles")) return;
    const style = document.createElement("style");
    style.id = "xpdf-styles";
    style.innerHTML = `
      .xpdf-container {
        display: flex;
        flex-direction: column;
        border: 1px solid #cccccc;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
        font-family: sans-serif;
        background-color: #f0f0f0;
        overflow: hidden;
        position: relative;
      }
      .xpdf-overlay {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        z-index: 9999;
        justify-content: center;
        align-items: center;
      }
      .xpdf-container.xpdf-pseudo-fullscreen {
        max-width: calc(100vw - 20px);
        max-height: calc(100vh - 20px);
        box-shadow: 0 0 20px rgba(0,0,0,0.5);
        border: none;
      }
      .xpdf-loading {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: rgba(255, 255, 255, 0.9);
        font-size: 1.5em;
        color: #333333;
        z-index: 10;
      }
      .xpdf-canvas-wrapper {
        flex-grow: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        overflow: hidden;
        position: relative;
      }
      .xpdf-canvas {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        max-width: 100%;
        max-height: 100%;
      }
      .xpdf-navigation {
        width: 100%;
        flex-shrink: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 8px;
        background-color: #333333;
        color: white;
        user-select: none;
        position: relative;
        z-index: 10;
      }
      .xpdf-navigation button {
        width: 38px;
        height: 38px;
        margin: 0 10px;
        padding: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 18px;
        font-weight: bold;
        border: 1px solid #555555;
        background-color: #444444;
        color: white;
        cursor: pointer;
        border-radius: 4px;
        transition: background-color 0.2s;
      }
      .xpdf-fullscreen-btn {
        position: absolute;
        right: 10px;
      }
      .xpdf-fullscreen-btn svg {
        width: 20px;
        height: 20px;
        fill: white;
      }
      .xpdf-navigation button:hover {
        background-color: #555555;
      }
      .xpdf-navigation button:disabled {
        background-color: #222222;
        color: #666666;
        cursor: not-allowed;
      }
      .xpdf-page-info {
        margin: 0 15px;
        font-size: 16px;
      }
    `;
    document.head.appendChild(style);
  }

  function loadPdfJs() {
    return new Promise((resolve, reject) => {
      if (window.pdfjsLib) return resolve();
      const script = document.createElement("script");
      script.src = PDFJS_URL;
      script.onload = () => {
        window["pdfjs-dist/build/pdf"].GlobalWorkerOptions.workerSrc =
          PDFJS_WORKER_URL;
        resolve();
      };
      script.onerror = (e) => reject(new Error("Failed to load.", e));
      document.head.appendChild(script);
    });
  }

  async function createViewer(embedElement) {
    if (embedElement.dataset.xpdfInitialized) return;
    embedElement.dataset.xpdfInitialized = "true";

    const pdfPath = embedElement.dataset.pdf;
    if (!pdfPath) return;

    const container = document.createElement("div");
    container.className = embedElement.className + " xpdf-container";

    const originalParent = embedElement.parentNode;
    const originalNextSibling = embedElement.nextSibling;

    const overlay = document.createElement("div");
    overlay.className = "xpdf-overlay";

    const loadingIndicator = document.createElement("div");
    loadingIndicator.className = "xpdf-loading";
    loadingIndicator.textContent = "Loading...";

    const canvasWrapper = document.createElement("div");
    canvasWrapper.className = "xpdf-canvas-wrapper";

    const canvases = [
      document.createElement("canvas"),
      document.createElement("canvas"),
    ];
    canvases.forEach((cvs) => {
      cvs.className = "xpdf-canvas";
      canvasWrapper.appendChild(cvs);
    });
    let currentCanvas = canvases[0];
    let nextCanvas = canvases[1];

    const nav = document.createElement("div");
    nav.className = "xpdf-navigation";
    const prevButton = document.createElement("button");
    prevButton.textContent = "<";
    const pageInfo = document.createElement("span");
    pageInfo.className = "xpdf-page-info";
    const pageNumSpan = document.createElement("span");
    const pageCountSpan = document.createElement("span");
    pageInfo.append(pageNumSpan, " / ", pageCountSpan);
    const nextButton = document.createElement("button");
    nextButton.textContent = ">";

    const fullscreenButton = document.createElement("button");
    fullscreenButton.className = "xpdf-fullscreen-btn";
    const fullscreenEnterIcon = `<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>`;
    const fullscreenExitIcon = `<svg viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>`;
    fullscreenButton.innerHTML = fullscreenEnterIcon;
    nav.append(prevButton, pageInfo, nextButton, fullscreenButton);

    container.append(loadingIndicator, canvasWrapper, nav);
    if (!document.getElementsByClassName("xpdf-overlay")[0]) {
      document.body.appendChild(overlay);
    }
    embedElement.parentNode.replaceChild(container, embedElement);

    let pdfDoc = null;
    let currentPage = 1;
    let isRendering = false;

    const renderPage = async (num) => {
      if (isRendering || !pdfDoc) return;
      isRendering = true;
      prevButton.disabled = true;
      nextButton.disabled = true;
      const page = await pdfDoc.getPage(num);
      const dpi = Math.min(window.devicePixelRatio || 1, 2);
      const pageViewport = page.getViewport({ scale: 1.0 });
      const availableWidth = canvasWrapper.clientWidth;
      const availableHeight = canvasWrapper.clientHeight;
      const baseScale = Math.min(
        availableWidth / pageViewport.width,
        availableHeight / pageViewport.height
      );
      const viewport = page.getViewport({ scale: baseScale * dpi });
      const canvas = nextCanvas;
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      canvas.style.height = `${viewport.height / dpi}px`;
      canvas.style.width = `${viewport.width / dpi}px`;
      await page.render({ canvasContext: context, viewport: viewport }).promise;
      canvas.style.zIndex = 1;
      currentCanvas.style.zIndex = 0;
      [currentCanvas, nextCanvas] = [nextCanvas, currentCanvas];
      const oldContext = nextCanvas.getContext("2d");
      oldContext.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
      currentPage = num;
      pageNumSpan.textContent = currentPage;
      prevButton.disabled = currentPage <= 1;
      nextButton.disabled = currentPage >= pdfDoc.numPages;
      isRendering = false;
    };

    try {
      pdfDoc = await window.pdfjsLib.getDocument(pdfPath).promise;
      pageCountSpan.textContent = pdfDoc.numPages;
      const firstPage = await pdfDoc.getPage(1);
      const viewport = firstPage.getViewport({ scale: 1.0 });
      const pdfAspectRatio = viewport.width / viewport.height;
      container.style.aspectRatio = pdfAspectRatio;
      const initialPdfSize = embedElement.dataset.pdfSize || "90vw";
      if (initialPdfSize.endsWith("vh")) {
        container.style.height = initialPdfSize;
        container.style.width = "auto";
      } else {
        container.style.width = initialPdfSize;
        container.style.height = "auto";
      }
      [nextCanvas, currentCanvas] = [currentCanvas, nextCanvas];
      await renderPage(currentPage);
      loadingIndicator.style.display = "none";
    } catch (error) {
      console.error(`Failed to load ${pdfPath}`, error);
      loadingIndicator.style.display = "none";
      container.textContent = "Failed to load.";
    }

    const goToPrevPage = () => {
      if (currentPage > 1) renderPage(currentPage - 1);
    };
    const goToNextPage = () => {
      if (currentPage < pdfDoc.numPages) renderPage(currentPage + 1);
    };

    prevButton.addEventListener("click", goToPrevPage);
    nextButton.addEventListener("click", goToNextPage);

    fullscreenButton.addEventListener("click", () => {
      const isApiSupported =
        container.requestFullscreen || container.webkitRequestFullscreen;
      const isIPhone =
        /iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

      const triggerResizeWithDelay = () => {
        setTimeout(() => {
          window.dispatchEvent(new Event("resize"));
        }, 100);
      };

      if (isIPhone || !isApiSupported) {
        const isPseudoFullscreen = overlay.style.display === "flex";
        if (!isPseudoFullscreen) {
          overlay.style.display = "flex";
          overlay.appendChild(container);
          container.classList.add("xpdf-pseudo-fullscreen");
          fullscreenButton.innerHTML = fullscreenExitIcon;
          // window.dispatchEvent(new Event("resize"));
          triggerResizeWithDelay();
        } else {
          if (originalParent && document.body.contains(originalParent)) {
            originalParent.insertBefore(container, originalNextSibling);
          } else {
            if (container.parentNode === overlay) {
              overlay.removeChild(container);
            }
            console.warn("xpdf-viewer: Original parent node removed.");
          }
          overlay.style.display = "none";
          container.classList.remove("xpdf-pseudo-fullscreen");
          fullscreenButton.innerHTML = fullscreenEnterIcon;
          // window.dispatchEvent(new Event("resize"));
          triggerResizeWithDelay();
        }
      } else {
        const isCurrentlyFullscreen =
          document.fullscreenElement || document.webkitFullscreenElement;
        if (!isCurrentlyFullscreen) {
          if (container.requestFullscreen) {
            container.requestFullscreen();
          } else if (container.webkitRequestFullscreen) {
            container.webkitRequestFullscreen();
          }
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
          }
        }
      }
    });

    const handleFullscreenChange = () => {
      const isFullscreen =
        document.fullscreenElement || document.webkitFullscreenElement;
      if (isFullscreen) {
        container.classList.add("xpdf-fullscreen-active");
        fullscreenButton.innerHTML = fullscreenExitIcon;
      } else {
        container.classList.remove("xpdf-fullscreen-active");
        fullscreenButton.innerHTML = fullscreenEnterIcon;
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (pdfDoc) renderPage(currentPage);
      }, 250);
    });

    let touchStartX = 0;
    let touchStartY = 0;
    canvasWrapper.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
      },
      { passive: true }
    );

    canvasWrapper.addEventListener("touchend", (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      const touchEndY = e.changedTouches[0].screenY;
      const diffX = touchStartX - touchEndX;
      const diffY = touchStartY - touchEndY;
      const swipeThreshold = 50;
      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > swipeThreshold) goToNextPage();
        else if (diffX < -swipeThreshold) goToPrevPage();
      }
    });

    let isWheeling = false;
    container.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        if (isWheeling) return;
        isWheeling = true;
        setTimeout(() => {
          isWheeling = false;
        }, 200);
        if (e.deltaY > 0) goToNextPage();
        else if (e.deltaY < 0) goToPrevPage();
      },
      { passive: false }
    );
  }

  window.initializeXpdfViewers = async function () {
    injectStyles();
    const targets = document.querySelectorAll(
      "embed.xpdf[data-pdf]:not([data-xpdf-initialized])"
    );
    if (targets.length === 0) return;
    try {
      await loadPdfJs();
    } catch (error) {
      console.error(error);
      return;
    }
    targets.forEach(createViewer);
  };

  document.addEventListener("DOMContentLoaded", window.initializeXpdfViewers);
})();
