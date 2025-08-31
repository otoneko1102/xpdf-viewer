# %name%

A simple, embeddable PDF viewer that works on both PC and mobile, powered by PDF.js.

## Features

-   **Easy to Embed**: Just one line of HTML and one script tag.
-   **Responsive**: Automatically adjusts to the PDF's aspect ratio.
-   **Multiple Controls**: Navigate with buttons, mouse wheel, and touch swipes.
-   **Fullscreen Mode**: View documents without distractions.
-   **Customizable Size**: Easily set the viewer size directly in your HTML.
-   **High-Res Display**: Renders crisply on high-DPI (Retina) screens.

## Usage

1.  **Load the Script**

    Add the following script tag to the bottom of your `<body>`.

    Use current version:

    ```html
    <script src="https://unpkg.com/%name%@%version%/pdf.js" defer></script>
    ```

    Use latest version:

    ```html
    <script src="https://unpkg.com/%name%/pdf.js" defer></script>
    ```

2.  **Embed the Viewer**

    Place an `<embed>` tag where you want the viewer to appear.

    -   Use the `xpdf` class.
    -   Use `data-pdf` to specify the path to your PDF file.
    -   Use `data-pdf-size` (optional) to set the viewer's size. The default is `90vw`.

    **Basic Example (Default size: 90% of screen width):**

    ```html
    <embed class="xpdf" data-pdf="./path/to/your/document.pdf" />
    ```

    **Custom Size Example (80% of screen height):**

    ```html
    <embed class="xpdf" data-pdf="./another.pdf" data-pdf-size="80vh" />
    ```

    The `data-pdf-size` attribute accepts any valid CSS size unit:
    -   `vw` (viewport width) makes the viewer's width the primary dimension.
    -   `vh` (viewport height) makes the viewer's height the primary dimension.
    -   You can also use `%` or `px`.
