/* =====================================================
   TANVIXA PRODUCT PAGE
   FINAL PRODUCT.JS
   Loads products directly from products.json
===================================================== */

let currentProduct = null;
let productList = [];


/* =========================================
   GET PRODUCT CODE
========================================= */

function getProductCode() {

    const params = new URLSearchParams(
        window.location.search
    );

    return (
        params.get("code") || ""
    )
    .trim()
    .toUpperCase();

}


/* =========================================
   ESCAPE HTML
========================================= */

function esc(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================
   IMAGE HELPER
========================================= */

function getProductImage(product) {

    if (
        product.images &&
        Array.isArray(product.images) &&
        product.images.length > 0
    ) {
        return product.images[0];
    }

    if (product.image) {
        return product.image;
    }

    return "images/no-image.png";

}


/* =========================================
   YOUTUBE HELPER
========================================= */

function yt(url) {

    if (!url) {
        return "";
    }

    try {

        const x = new URL(url);

        const id =
            x.searchParams.get("v") ||
            x.pathname.split("/embed/")[1] ||
            (
                x.hostname.includes("youtu.be")
                    ? x.pathname.slice(1)
                    : ""
            );

        return id
            ? "https://www.youtube.com/embed/" +
              encodeURIComponent(id)
            : "";

    }

    catch {

        return "";

    }

}


/* =========================================
   LIST RENDER
========================================= */

function renderList(id, array) {

    const element =
        document.getElementById(id);

    if (!element) {
        return;
    }

    element.innerHTML =
        (array || [])
        .map(item => `<li>${esc(item)}</li>`)
        .join("");

}


/* =========================================
   LOAD PRODUCTS JSON
========================================= */

async function loadProducts() {

    try {

        console.log(
            "📦 Loading products.json..."
        );

        const response =
            await fetch(
                "./products.json?v=" +
                Date.now(),
                {
                    cache: "no-store"
                }
            );

        if (!response.ok) {

            throw new Error(
                "products.json HTTP error: " +
                response.status
            );

        }

        const data =
            await response.json();

        if (!Array.isArray(data)) {

            throw new Error(
                "products.json is not an array"
            );

        }

        productList = data;

        console.log(
            "✅ Products loaded:",
            productList.length
        );

        return true;

    }

    catch (error) {

        console.error(
            "❌ Failed to load products.json:",
            error
        );

        return false;

    }

}


/* =========================================
   FIND PRODUCT
========================================= */

function findProduct(code) {

    const searchCode =
        String(code || "")
        .trim()
        .toUpperCase();

    return productList.find(
        product => {

            if (
                !product ||
                product.code === undefined ||
                product.code === null
            ) {
                return false;
            }

            return String(product.code)
                .trim()
                .toUpperCase()
                === searchCode;

        }
    );

}


/* =========================================
   PRODUCT ERROR
========================================= */

function showProductError(message) {

    const loading =
        document.getElementById(
            "productLoading"
        );

    const error =
        document.getElementById(
            "productError"
        );

    const app =
        document.getElementById(
            "productApp"
        );


    if (loading) {
        loading.hidden = true;
    }


    if (app) {
        app.hidden = true;
    }


    if (error) {

        error.hidden = false;

        error.innerHTML = `

            <h2>Product Not Found</h2>

            <p>
                ${esc(
                    message ||
                    "We could not find this product."
                )}
            </p>

            <br>

            <a
                class="primary-btn"
                href="index.html"
            >
                SEARCH AGAIN
            </a>

        `;

    }

}


/* =========================================
   SET TEXT
========================================= */

function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {

        element.textContent =
            value ?? "";

    }

}


/* =========================================
   SET LINK
========================================= */

function setLink(id, url) {

    const element =
        document.getElementById(id);

    if (!element) {
        return;
    }

    element.href =
        url || "#";

}


/* =========================================
   RENDER PRODUCT
========================================= */

function renderProduct(product) {

    currentProduct = product;


    const loading =
        document.getElementById(
            "productLoading"
        );

    const error =
        document.getElementById(
            "productError"
        );

    const app =
        document.getElementById(
            "productApp"
        );


    if (loading) {
        loading.hidden = true;
    }


    if (error) {
        error.hidden = true;
    }


    if (app) {
        app.hidden = false;
    }


    document.title =
        product.name +
        " | Tanvixa";


    /* =========================
       BASIC INFORMATION
    ========================= */

    setText(
        "productBrand",
        product.brand ||
        "TECH GADGET"
    );


    setText(
        "productName",
        product.name
    );


    setText(
        "productShort",
        product.shortDescription ||
        product.description ||
        "Explore product details, features, specifications and available buying options."
    );


    /* =========================
       RATING
    ========================= */

    const rating =
        document.getElementById(
            "productRating"
        );

    if (rating) {

        if (product.rating) {

            rating.textContent =
                "★★★★★ " +
                product.rating +
                "/5";

            rating.classList.remove(
                "muted"
            );

        }

        else {

            rating.textContent =
                "Rating not provided";

            rating.classList.add(
                "muted"
            );

        }

    }


    /* =========================
       BREADCRUMB
    ========================= */

    const breadcrumb =
        document.getElementById(
            "breadcrumb"
        );

    if (breadcrumb) {

        breadcrumb.innerHTML = `

            <a href="index.html">
                Home
            </a>

            /

            <span>
                ${esc(
                    product.category ||
                    "Gadgets"
                )}
            </span>

            /

            <span>
                ${esc(product.name)}
            </span>

        `;

    }


    /* =========================
       MAIN IMAGE
    ========================= */

    const mainPhoto =
        document.getElementById(
            "mainPhoto"
        );

    const image =
        getProductImage(product);


    if (mainPhoto) {

        mainPhoto.src =
            image;

        mainPhoto.alt =
            product.name;

    }


    /* =========================
       THUMBNAILS
    ========================= */

    const thumbs =
        document.getElementById(
            "thumbs"
        );


    if (thumbs) {

        let images = [];


        if (
            product.images &&
            Array.isArray(product.images) &&
            product.images.length
        ) {

            images =
                product.images;

        }

        else {

            images = [image];

        }


        thumbs.innerHTML =
            images
            .map(
                (src, index) => `

                <button
                    class="${
                        index === 0
                            ? "active"
                            : ""
                    }"
                    data-src="${esc(src)}"
                    type="button"
                >

                    <img
                        src="${esc(src)}"
                        alt="${esc(product.name)}"
                    >

                </button>

                `
            )
            .join("");


        thumbs
        .querySelectorAll("button")
        .forEach(button => {

            button.addEventListener(
                "click",
                function() {

                    if (mainPhoto) {

                        mainPhoto.src =
                            this.dataset.src;

                    }


                    thumbs
                    .querySelectorAll(
                        "button"
                    )
                    .forEach(btn =>
                        btn.classList.remove(
                            "active"
                        )
                    );


                    this.classList.add(
                        "active"
                    );

                }
            );

        });

    }


    /* =========================
       AFFILIATE LINKS
    ========================= */

    const affiliate =
        product.affiliate ||
        {};


    const topCtas =
        document.getElementById(
            "topCtas"
        );


    if (topCtas) {

        let html = "";


        if (
            affiliate.aliexpress
        ) {

            html += `

                <a
                    class="cta pulse"
                    href="${esc(
                        affiliate.aliexpress
                    )}"
                    target="_blank"
                    rel="nofollow sponsored noopener"
                >
                    CHECK CURRENT PRICE ON ALIEXPRESS →
                </a>

            `;

        }


        if (
            affiliate.amazon
        ) {

            html += `

                <a
                    class="cta amazon"
                    href="${esc(
                        affiliate.amazon
                    )}"
                    target="_blank"
                    rel="nofollow sponsored noopener"
                >
                    CHECK PRICE ON AMAZON →
                </a>

            `;

        }


        /* Support old JSON format */

        if (
            !affiliate.aliexpress &&
            !affiliate.amazon &&
            product.link
        ) {

            html += `

                <a
                    class="cta pulse"
                    href="${esc(
                        product.link
                    )}"
                    target="_blank"
                    rel="nofollow sponsored noopener"
                >
                    CHECK CURRENT PRICE →
                </a>

            `;

        }


        topCtas.innerHTML =
            html;

    }


    /* =========================
       BENEFITS
    ========================= */

    const benefits =
        document.getElementById(
            "benefits"
        );


    if (benefits) {

        const benefitList =
            (
                product.benefits &&
                product.benefits.length
            )
                ? product.benefits
                : (
                    product.features ||
                    []
                );


        benefits.innerHTML =
            benefitList
            .slice(0, 4)
            .map(
                (item, index) => `

                <div class="benefit">

                    <strong>
                        ${
                            [
                                "⚡",
                                "🔌",
                                "📱",
                                "✈️"
                            ][
                                index % 4
                            ]
                        }

                        ${esc(item)}

                    </strong>

                    <span>
                        Key product detail
                    </span>

                </div>

                `
            )
            .join("");

    }


    /* =========================
       OVERVIEW
    ========================= */

    const overview =
        document.getElementById(
            "overview"
        );


    if (overview) {

        if (
            product.overview &&
            Array.isArray(
                product.overview
            )
        ) {

            overview.innerHTML =
                product.overview
                .map(
                    item =>
                        `<p>${esc(item)}</p>`
                )
                .join("");

        }

        else if (
            product.description
        ) {

            overview.innerHTML =
                `<p>${esc(
                    product.description
                )}</p>`;

        }

        else {

            overview.innerHTML =
                "<p>Detailed overview has not been added yet.</p>";

        }

    }


    /* =========================
       FEATURES
    ========================= */

    renderList(
        "features",
        product.features
    );


    /* =========================
       VIDEO
    ========================= */

    const videoUrl =
        yt(product.video);


    if (videoUrl) {

        const section =
            document.getElementById(
                "videoSection"
            );

        const frame =
            document.getElementById(
                "videoFrame"
            );

        const toggle =
            document.getElementById(
                "videoToggle"
            );

        const wrap =
            document.getElementById(
                "videoWrap"
            );


        if (section) {
            section.hidden = false;
        }


        if (frame) {
            frame.src =
                videoUrl;
        }


        if (
            toggle &&
            wrap
        ) {

            toggle.onclick =
                () => {

                    wrap.classList.toggle(
                        "open"
                    );

                };

        }

    }


    /* =========================
       SPECIFICATIONS
    ========================= */

    const specifications =
        product.specifications ||
        {};


    const specEntries =
        Object.entries(
            specifications
        );


    if (specEntries.length) {

        const section =
            document.getElementById(
                "specSection"
            );

        const table =
            document.getElementById(
                "specs"
            );


        if (section) {
            section.hidden = false;
        }


        if (table) {

            table.innerHTML =
                specEntries
                .map(
                    ([key, value]) => `

                    <tr>

                        <td>
                            ${esc(key)}
                        </td>

                        <td>
                            ${esc(value)}
                        </td>

                    </tr>

                    `
                )
                .join("");

        }

    }


    /* =========================
       PERFECT FOR / PROS
       / CONSIDERATIONS
    ========================= */

    [
        [
            "perfectFor",
            product.perfectFor,
            "perfectSection"
        ],

        [
            "pros",
            product.pros,
            "prosSection"
        ],

        [
            "considerations",
            product.considerations,
            "considerSection"
        ]

    ].forEach(
        ([id, array, sectionId]) => {

            if (
                array &&
                Array.isArray(array) &&
                array.length
            ) {

                const section =
                    document.getElementById(
                        sectionId
                    );


                if (section) {
                    section.hidden = false;
                }


                renderList(
                    id,
                    array
                );

            }

        }
    );


    /* =========================
       PRODUCT CODE
    ========================= */

    setText(
        "productCodeText",
        "Use " +
        product.code +
        " to find this product again on Tanvixa."
    );


    /* =========================
       DISCLOSURE
    ========================= */

    setText(
        "disclosure",
        "Some links on this page may be affiliate links. If you purchase through these links, Tanvixa may earn a commission at no extra cost to you."
    );


    /* =========================
       RELATED PRODUCTS
    ========================= */

    const related =
        document.getElementById(
            "related"
        );


    if (related) {

        let relatedProducts =
            productList
            .filter(
                item =>
                    item.code !==
                        product.code &&
                    (
                        item.category ===
                            product.category ||
                        item.brand ===
                            product.brand
                    )
            )
            .slice(0, 4);


        if (
            !relatedProducts.length
        ) {

            relatedProducts =
                productList
                .filter(
                    item =>
                        item.code !==
                        product.code
                )
                .slice(0, 4);

        }


        related.innerHTML =
            relatedProducts
            .map(
                createRelatedCard
            )
            .join("");

    }


    /* =========================
       LATEST PRODUCTS
    ========================= */

    const latest =
        document.getElementById(
            "productLatest"
        );


    if (latest) {

        latest.innerHTML =
            productList
            .filter(
                item =>
                    item.code !==
                    product.code
            )
            .slice()
            .reverse()
            .slice(0, 4)
            .map(
                createRelatedCard
            )
            .join("");

    }


    /* =========================
       STICKY CTA
    ========================= */

    const affiliateLink =
        affiliate.aliexpress ||
        affiliate.amazon ||
        product.link ||
        "";


    const sticky =
        document.getElementById(
            "stickyCta"
        );


    if (
        sticky &&
        affiliateLink
    ) {

        sticky.hidden = false;


        setText(
            "stickyName",
            product.name
        );


        setText(
            "stickyCode",
            "Product Code: " +
            product.code
        );


        const stickyButton =
            document.getElementById(
                "stickyButton"
            );


        if (stickyButton) {

            stickyButton.href =
                affiliateLink;


            stickyButton.textContent =
                affiliate.aliexpress
                    ? "CHECK CURRENT PRICE ON ALIEXPRESS →"
                    : "CHECK CURRENT PRICE →";

        }

    }


    /* =========================
       SHARE
    ========================= */

    setupSharing(
        product
    );


    /* =========================
       SCHEMA
    ========================= */

    generateProductSchema(
        product
    );


    console.log(
        "✅ Product rendered:",
        product.code
    );

}


/* =========================================
   RELATED PRODUCT CARD
========================================= */

function createRelatedCard(product) {

    const image =
        getProductImage(product);


    return `

        <div class="related-card">

            <img
                src="${esc(image)}"
                alt="${esc(product.name)}"
                loading="lazy"
                onerror="
                    this.src='images/no-image.png'
                "
            >

            <h3>
                ${esc(product.name)}
            </h3>

            <a
                href="./product.html?code=${encodeURIComponent(
                    product.code
                )}"
            >
                View Product
            </a>

        </div>

    `;

}


/* =========================================
   SHARE SYSTEM
========================================= */

function setupSharing(product) {

    const url =
        window.location.href;


    const title =
        product.name;


    const facebook =
        document.getElementById(
            "facebookShare"
        );


    if (facebook) {

        facebook.href =
            "https://www.facebook.com/sharer/sharer.php?u=" +
            encodeURIComponent(url);

    }


    const x =
        document.getElementById(
            "xShare"
        );


    if (x) {

        x.href =
            "https://twitter.com/intent/tweet?url=" +
            encodeURIComponent(url) +
            "&text=" +
            encodeURIComponent(title);

    }


    const whatsapp =
        document.getElementById(
            "whatsappShare"
        );


    if (whatsapp) {

        whatsapp.href =
            "https://wa.me/?text=" +
            encodeURIComponent(
                title +
                " " +
                url
            );

    }


    const copy =
        document.getElementById(
            "copyLink"
        );


    if (copy) {

        copy.onclick =
            async function() {

                try {

                    await navigator.clipboard
                        .writeText(url);

                    alert(
                        "Product link copied."
                    );

                }

                catch {

                    alert(
                        "Unable to copy the link."
                    );

                }

            };

    }


    const native =
        document.getElementById(
            "nativeShare"
        );


    if (native) {

        native.onclick =
            async function() {

                if (
                    navigator.share
                ) {

                    try {

                        await navigator.share({
                            title:
                                title,
                            url:
                                url
                        });

                    }

                    catch {

                        /* User cancelled share */

                    }

                }

                else {

                    try {

                        await navigator.clipboard
                            .writeText(url);

                        alert(
                            "Product link copied."
                        );

                    }

                    catch {

                        alert(
                            "Unable to copy the link."
                        );

                    }

                }

            };

    }

}


/* =========================================
   PRODUCT SCHEMA
========================================= */

function generateProductSchema(product) {

    const oldSchema =
        document.getElementById(
            "tanvixa-product-schema"
        );


    if (oldSchema) {
        oldSchema.remove();
    }


    const schema =
        document.createElement(
            "script"
        );


    schema.id =
        "tanvixa-product-schema";


    schema.type =
        "application/ld+json";


    schema.textContent =
        JSON.stringify({

            "@context":
                "https://schema.org",

            "@type":
                "Product",

            name:
                product.name,

            image:
                product.images &&
                Array.isArray(
                    product.images
                )
                    ? product.images
                    : [
                        getProductImage(
                            product
                        )
                    ],

            description:
                product.description ||
                product.shortDescription ||
                "",

            sku:
                product.code,

            brand: {

                "@type":
                    "Brand",

                name:
                    product.brand ||
                    "Tanvixa"

            }

        });


    document.head.appendChild(
        schema
    );

}


/* =========================================
   MAIN INITIALIZATION
========================================= */

async function productInit() {

    console.log(
        "🚀 Tanvixa Product Page Starting..."
    );


    const code =
        getProductCode();


    console.log(
        "🔎 Requested Product Code:",
        code
    );


    if (!code) {

        showProductError(
            "No product code was provided in the URL."
        );

        return;

    }


    const loaded =
        await loadProducts();


    if (!loaded) {

        showProductError(
            "Unable to load products.json. Please try again."
        );

        return;

    }


    console.log(
        "📋 Available Product Codes:",
        productList.map(
            product =>
                product.code
        )
    );


    const product =
        findProduct(code);


    if (!product) {

        console.error(
            "❌ Product Not Found:",
            code
        );

        showProductError(
            "Product code " +
            code +
            " was not found in products.json."
        );

        return;

    }


    console.log(
        "🎯 Product Found:",
        product
    );


    renderProduct(
        product
    );

}


/* =========================================
   START
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        productInit();

    }
);
