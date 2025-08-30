# xpdf-viewer

A simple, embeddable PDF viewer that works on both PC and mobile, powered by PDF.js.

## Installation & Usage

No installation is required. Just load the script from a CDN like unpkg.

1.  **Load the script**

Add the following script tag to the bottom of your `<body>`.

```html
<script src="https://unpkg.com/xpdf-viewer@1.0.0/pdf.js" defer></script>
```

2.  **Embed the viewer**

Place an `<embed>` tag where you want the viewer to appear. Use the `xpdf` class and a `data-pdf` attribute to specify the path to your PDF file.

```html
<embed class="xpdf" data-pdf="./path/to/your/document.pdf">
```

3.  **Customize the size (Optional)**

You can control the size of the viewer using the `--xpdf-size` CSS custom property.
- `vw` (viewport width) makes the viewer's width the primary dimension.
- `vh` (viewport height) makes the viewer's height the primary dimension.

```css
.xpdf {
  /* Set the viewer width to 90% of the screen width */
  --xpdf-size: 90vw;
  margin: 20px auto; /* Center the viewer */
}
```
