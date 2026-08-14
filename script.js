/*
===========================================================
 TANVIXA PRODUCT SEARCH SYSTEM
 FINAL STABLE VERSION
===========================================================

 Features:
 - Product code search
 - Product name search
 - Brand search
 - Category search
 - Feature search
 - Direct product page
 - product.html?code=GL001
 - View Details support
 - No hard refresh required
 - GitHub Pages compatible
 - Handles image and images[]
 - Handles affiliate links
 - Handles missing products
 - Enter key search
 - URL query search
 - Related products
 - Recent products
 - Safe JSON loading
===========================================================
*/


"use strict";


/* ========================================================
   GLOBAL VARIABLES
======================================================== */

let products = [];

let productsLoaded = false;

let productsLoading = false;


/* ========================================================
   BASE PATH
   Works on GitHub Pages and normal hosting
======================================================== */

function getBasePath() {

    const path = window.location.pathname;

    if (path.endsWith("/")) {
        return path;
    }

    const lastSlash = path.lastIndexOf("/");

    if (lastSlash >= 0) {
        return path.substring(0, lastSlash + 1);
    }

    return "/";
}


/* ========================================================
   LOAD PRODUCTS
======================================================== */

async function loadProducts() {

    if (productsLoaded) {
        return products;
    }

    if (productsLoading) {

        while (productsLoading) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        return products;
    }


    productsLoading = true;


    try {

        const response = await fetch(
            "products.json?cache=" + Date.now(),
            {
                method: "GET",
                cache: "no-store"
            }
        );


        if (!response.ok) {
            throw new Error(
                "Unable to load products.json"
            );
        }


        const data = await response.json();


        if (!Array.isArray(data)) {

            throw new Error(
                "products.json must contain an array."
            );

        }


        products = data;

        productsLoaded = true;


        return products;


    } catch (error) {

        console.error(
            "Tanvixa Product Loading Error:",
            error
        );


        products = [];


        throw error;


    } finally {

        productsLoading = false;

    }

}


/* ========================================================
   NORMALIZE TEXT
======================================================== */

function normalizeText(value) {

    if (
        value === undefined ||
        value === null
    ) {
        return "";
    }


    return String(value)
        .trim()
        .toLowerCase();

}


/* ========================================================
   NORMALIZE PRODUCT CODE
======================================================== */

function normalizeCode(value) {

    return normalizeText(value)
        .replace(/\s+/g, "");

}


/* ========================================================
   GET PRODUCT CODE
======================================================== */

function getProductCode(product) {

    if (!product) {
        return "";
    }


    return (
        product.code ||
        product.productCode ||
        product.id ||
        ""
    );

}


/* ========================================================
   GET PRODUCT NAME
======================================================== */

function getProductName(product) {

    if (!product) {
        return "Product";
    }


    return (
        product.name ||
        product.title ||
        "Product"
    );

}


/* ========================================================
   GET PRODUCT IMAGE
======================================================== */

function getProductImage(product) {

    if (!product) {
        return "";
    }


    if (
        product.image &&
        typeof product.image === "string"
    ) {

        return product.image;

    }


    if (
        Array.isArray(product.images) &&
        product.images.length > 0
    ) {

        return product.images[0];

    }


    return "";

}


/* ========================================================
   GET PRODUCT IMAGES
======================================================== */

function getProductImages(product) {

    if (!product) {
        return [];
    }


    let images = [];


    if (
        Array.isArray(product.images)
    ) {

        images = product.images.filter(
            image =>
                typeof image === "string" &&
                image.trim() !== ""
        );

    }


    if (
        product.image &&
        typeof product.image === "string"
    ) {

        if (!images.includes(product.image)) {

            images.unshift(product.image);

        }

    }


    return images;

}


/* ========================================================
   GET DESCRIPTION
======================================================== */

function getProductDescription(product) {

    if (!product) {
        return "";
    }


    return (
        product.description ||
        product.desc ||
        ""
    );

}


/* ========================================================
   GET FEATURES
======================================================== */

function getProductFeatures(product) {

    if (!product) {
        return [];
    }


    if (Array.isArray(product.features)) {

        return product.features.filter(
            feature =>
                feature !== null &&
                feature !== undefined &&
                String(feature).trim() !== ""
        );

    }


    return [];

}


/* ========================================================
   GET AFFILIATE LINK
======================================================== */

function getAffiliateLink(product) {

    if (!product) {
        return "#";
    }


    return (
        product.link ||
        product.affiliateLink ||
        product.url ||
        "#"
    );

}


/* ========================================================
   ESCAPE HTML
======================================================== */

function escapeHTML(value) {

    if (
        value === undefined ||
        value === null
    ) {
        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* ========================================================
   CONVERT DESCRIPTION
======================================================== */

function formatDescription(description) {

    if (!description) {
        return "";
    }


    return escapeHTML(description)
        .replace(/\r\n/g, "<br><br>")
        .replace(/\n/g, "<br><br>");

}


/* ========================================================
   GET PRODUCT BY CODE
======================================================== */

function findProductByCode(code) {

    const normalizedSearch =
        normalizeCode(code);


    if (!normalizedSearch) {
        return null;
    }


    return products.find(product => {

        return (
            normalizeCode(
                getProductCode(product)
            ) === normalizedSearch
        );

    }) || null;

}


/* ========================================================
   GET PRODUCT BY ANY SEARCH
======================================================== */

function searchProducts(value) {

    const search =
        normalizeText(value);


    if (!search) {
        return [];
    }


    return products.filter(product => {

        const code =
            normalizeText(
                getProductCode(product)
            );


        const name =
            normalizeText(
                getProductName(product)
            );


        const brand =
            normalizeText(
                product.brand || ""
            );


        const category =
            normalizeText(
                product.category || ""
            );


        const description =
            normalizeText(
                getProductDescription(product)
            );


        const features =
            getProductFeatures(product)
                .join(" ")
                .toLowerCase();


        return (
            code.includes(search) ||
            name.includes(search) ||
            brand.includes(search) ||
            category.includes(search) ||
            description.includes(search) ||
            features.includes(search)
        );

    });

}


/* ========================================================
   SHOW LOADING
======================================================== */

function showLoading() {

    const result =
        document.getElementById(
            "searchResult"
        );


    if (!result) {
        return;
    }


    result.innerHTML = `
        <div class="product-loading">
            <div class="loading-spinner"></div>
            <p>Finding your product...</p>
        </div>
    `;

}


/* ========================================================
   SHOW ERROR
======================================================== */

function showError(message) {

    const result =
        document.getElementById(
            "searchResult"
        );


    if (!result) {
        return;
    }


    result.innerHTML = `
        <div class="product-error">
            <h2>❌ Product Not Found</h2>
            <p>${escapeHTML(message)}</p>
        </div>
    `;

}


/* ========================================================
   SHOW MESSAGE
======================================================== */

function showSearchMessage(message) {

    const messageBox =
        document.getElementById(
            "searchMessage"
        );


    if (!messageBox) {
        return;
    }


    messageBox.textContent = message;

}


/* ========================================================
   CREATE PRODUCT CARD
======================================================== */

function createProductCard(product) {

    const code =
        getProductCode(product);


    const name =
        getProductName(product);


    const image =
        getProductImage(product);


    const description =
        getProductDescription(product);


    const features =
        getProductFeatures(product);


    const safeCode =
        escapeHTML(code);


    const safeName =
        escapeHTML(name);


    const safeImage =
        escapeHTML(image);


    const featureHTML =
        features.length > 0

            ? `
                <ul class="product-features">
                    ${features.map(feature => `
                        <li>
                            ${escapeHTML(feature)}
                        </li>
                    `).join("")}
                </ul>
              `

            : "";


    return `
        <article class="product-card">

            <div class="product-image-wrapper">

                ${
                    image
                    ?
                    `
                    <img
                        src="${safeImage}"
                        alt="${safeName}"
                        class="product-image"
                        loading="lazy"
                        onerror="this.style.display='none'"
                    >
                    `
                    :
                    `
                    <div class="no-product-image">
                        No Image Available
                    </div>
                    `
                }

            </div>


            <div class="product-info">

                <div class="product-code">
                    ${safeCode}
                </div>


                <h2 class="product-title">
                    ${safeName}
                </h2>


                ${
                    description
                    ?
                    `
                    <div class="product-description">
                        ${formatDescription(description)}
                    </div>
                    `
                    :
                    ""
                }


                ${featureHTML}


                <a
                    href="product.html?code=${encodeURIComponent(code)}"
                    class="view-product-button"
                >
                    View Details
                </a>

            </div>

        </article>
    `;

}


/* ========================================================
   SEARCH PRODUCT
======================================================== */

async function searchProduct() {

    const input =
        document.getElementById(
            "productCode"
        );


    const result =
        document.getElementById(
            "searchResult"
        );


    if (!input || !result) {
        return;
    }


    const searchValue =
        input.value.trim();


    if (!searchValue) {

        showSearchMessage(
            "Please enter a product code."
        );


        result.innerHTML = `
            <div class="product-error">
                <h2>⚠️ Enter a Product Code</h2>
                <p>
                    Example: GL001
                </p>
            </div>
        `;


        return;
    }


    showSearchMessage("");

    showLoading();


    try {

        await loadProducts();


        /*
        ================================================
        FIRST PRIORITY:
        Exact product code
        ================================================
        */

        const exactProduct =
            findProductByCode(
                searchValue
            );


        if (exactProduct) {

            const code =
                getProductCode(
                    exactProduct
                );


            /*
            Go directly to product page.

            replace() prevents the user from
            needing a refresh.
            */

            window.location.href =
                "product.html?code=" +
                encodeURIComponent(code);


            return;

        }


        /*
        ================================================
        SECOND PRIORITY:
        Name / brand / category / feature search
        ================================================
        */

        const matchedProducts =
            searchProducts(
                searchValue
            );


        if (matchedProducts.length === 0) {

            showError(
                `No product matched "${searchValue}".`
            );


            return;

        }


        /*
        ================================================
        If multiple results are found,
        show them directly.
        ================================================
        */

        result.innerHTML = `

            <div class="search-results-container">

                <h2 class="results-title">
                    Search Results
                </h2>

                <div class="results-grid">

                    ${matchedProducts.map(
                        product =>
                            createProductCard(product)
                    ).join("")}

                </div>

            </div>

        `;


    } catch (error) {

        console.error(error);


        result.innerHTML = `
            <div class="product-error">
                <h2>⚠️ Something Went Wrong</h2>
                <p>
                    We could not load the product database.
                    Please try again.
                </p>
            </div>
        `;

    }

}


/* ========================================================
   DIRECT PRODUCT PAGE
======================================================== */

async function loadDirectProductPage() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const code =
        params.get("code");


    if (!code) {
        return false;
    }


    const productPageContainer =
        document.getElementById(
            "productPage"
        );


    if (!productPageContainer) {
        return false;
    }


    try {

        await loadProducts();


        const product =
            findProductByCode(code);


        if (!product) {

            productPageContainer.innerHTML = `
                <div class="product-error">
                    <h2>❌ Product Not Found</h2>
                    <p>
                        Product code
                        <strong>
                            ${escapeHTML(code)}
                        </strong>
                        was not found.
                    </p>

                    <a
                        href="index.html"
                        class="view-product-button"
                    >
                        Back to Search
                    </a>
                </div>
            `;


            document.title =
                "Product Not Found — Tanvixa";


            return true;

        }


        renderProductPage(
            product,
            productPageContainer
        );


        return true;


    } catch (error) {

        console.error(error);


        productPageContainer.innerHTML = `
            <div class="product-error">
                <h2>⚠️ Unable to Load Product</h2>
                <p>
                    Please try again.
                </p>
            </div>
        `;


        return true;

    }

}


/* ========================================================
   RENDER PRODUCT PAGE
======================================================== */

function renderProductPage(
    product,
    container
) {

    const code =
        getProductCode(product);


    const name =
        getProductName(product);


    const description =
        getProductDescription(product);


    const features =
        getProductFeatures(product);


    const images =
        getProductImages(product);


    const affiliateLink =
        getAffiliateLink(product);


    const imageHTML =
        images.length > 0

            ?

            `
            <div class="product-gallery">

                <div class="main-product-image">

                    <img
                        id="mainProductImage"
                        src="${escapeHTML(images[0])}"
                        alt="${escapeHTML(name)}"
                    >

                </div>


                ${
                    images.length > 1
                    ?

                    `
                    <div class="product-thumbnails">

                        ${images.map(
                            (image, index) => `
                                <button
                                    type="button"
                                    class="product-thumbnail ${
                                        index === 0
                                        ? "active"
                                        : ""
                                    }"
                                    onclick="changeMainImage(
                                        '${escapeHTML(image)}',
                                        this
                                    )"
                                >

                                    <img
                                        src="${escapeHTML(image)}"
                                        alt="${escapeHTML(name)}"
                                    >

                                </button>
                            `
                        ).join("")}

                    </div>
                    `

                    :

                    ""

                }

            </div>
            `

            :

            `
            <div class="no-product-image">
                No Image Available
            </div>
            `;


    const featuresHTML =
        features.length > 0

            ?

            `
            <div class="product-features-section">

                <h2>
                    Key Features
                </h2>

                <ul class="product-features">

                    ${features.map(
                        feature => `
                            <li>
                                ${escapeHTML(feature)}
                            </li>
                        `
                    ).join("")}

                </ul>

            </div>
            `

            :

            "";


    const safeAffiliateLink =
        affiliateLink &&
        affiliateLink !== "YOUR_AFFILIATE_LINK"
        ?
        affiliateLink
        :
        "#";


    container.innerHTML = `

        <article class="single-product-page">


            <div class="single-product-grid">


                <!-- PRODUCT IMAGE -->

                <div class="single-product-media">

                    ${imageHTML}

                </div>


                <!-- PRODUCT INFORMATION -->

                <div class="single-product-info">


                    <div class="product-code">

                        ${escapeHTML(code)}

                    </div>


                    <h1 class="single-product-title">

                        ${escapeHTML(name)}

                    </h1>


                    ${
                        description
                        ?

                        `
                        <div class="single-product-description">

                            ${formatDescription(description)}

                        </div>
                        `

                        :

                        ""
                    }


                    ${featuresHTML}


                    <div class="buy-section">


                        ${
                            safeAffiliateLink !== "#"

                            ?

                            `
                            <a
                                href="${escapeHTML(safeAffiliateLink)}"
                                target="_blank"
                                rel="noopener noreferrer sponsored"
                                class="buy-now-button"
                            >
                                BUY NOW
                            </a>
                            `

                            :

                            `
                            <button
                                type="button"
                                class="buy-now-button disabled"
                                disabled
                            >
                                LINK NOT AVAILABLE
                            </button>
                            `

                        }


                        <p class="affiliate-disclosure">

                            Some links on this website may be
                            affiliate links. If you make a purchase
                            through these links, we may earn a commission
                            at no extra cost to you.

                        </p>


                    </div>


                    <a
                        href="index.html"
                        class="back-search-button"
                    >
                        ← Search Another Product
                    </a>


                </div>


            </div>


        </article>

    `;


    document.title =
        `${name} — Tanvixa`;


    updateMetaDescription(
        description ||
        `${name} product details on Tanvixa.`
    );


    loadRelatedProducts(
        product
    );

}


/* ========================================================
   CHANGE MAIN IMAGE
======================================================== */

function changeMainImage(
    image,
    button
) {

    const mainImage =
        document.getElementById(
            "mainProductImage"
        );


    if (!mainImage) {
        return;
    }


    mainImage.src = image;


    document
        .querySelectorAll(
            ".product-thumbnail"
        )
        .forEach(
            thumbnail =>
                thumbnail.classList.remove(
                    "active"
                )
        );


    if (button) {

        button.classList.add(
            "active"
        );

    }

}


/* ========================================================
   RELATED PRODUCTS
======================================================== */

function loadRelatedProducts(
    currentProduct
) {

    const container =
        document.getElementById(
            "relatedProducts"
        );


    if (!container) {
        return;
    }


    const currentCode =
        normalizeCode(
            getProductCode(
                currentProduct
            )
        );


    const currentCategory =
        normalizeText(
            currentProduct.category || ""
        );


    let related =
        products.filter(product => {

            const code =
                normalizeCode(
                    getProductCode(product)
                );


            if (
                code === currentCode
            ) {
                return false;
            }


            if (
                currentCategory &&
                normalizeText(
                    product.category || ""
                ) === currentCategory
            ) {
                return true;
            }


            return false;

        });


    /*
    If category matches are not enough,
    fill with other products.
    */

    if (related.length < 4) {

        const additional =
            products.filter(product => {

                const code =
                    normalizeCode(
                        getProductCode(product)
                    );


                return (
                    code !== currentCode &&
                    !related.includes(product)
                );

            });


        related =
            related.concat(
                additional
            );

    }


    related =
        related.slice(0, 4);


    if (related.length === 0) {
        return;
    }


    container.innerHTML = `

        <section class="related-products-section">

            <h2>
                You May Also Like
            </h2>


            <div class="related-products-grid">

                ${related.map(
                    product =>
                        createProductCard(product)
                ).join("")}

            </div>

        </section>

    `;

}


/* ========================================================
   RECENT PRODUCTS
======================================================== */

async function renderRecentProducts() {

    const container =
        document.getElementById(
            "recentProducts"
        );


    if (!container) {
        return;
    }


    try {

        await loadProducts();


        const recent =
            products.slice(
                Math.max(
                    0,
                    products.length - 4
                )
            ).reverse();


        if (recent.length === 0) {
            return;
        }


        container.innerHTML = `

            <div class="recent-products-container">

                <h2>
                    Latest Products
                </h2>


                <div class="results-grid">

                    ${recent.map(
                        product =>
                            createProductCard(product)
                    ).join("")}

                </div>

            </div>

        `;


    } catch (error) {

        console.error(
            "Recent products error:",
            error
        );

    }

}


/* ========================================================
   UPDATE META DESCRIPTION
======================================================== */

function updateMetaDescription(
    description
) {

    let meta =
        document.querySelector(
            'meta[name="description"]'
        );


    if (!meta) {

        meta =
            document.createElement(
                "meta"
            );


        meta.name =
            "description";


        document.head.appendChild(
            meta
        );

    }


    meta.content =
        String(description)
            .replace(/\s+/g, " ")
            .trim()
            .substring(0, 160);

}


/* ========================================================
   ENTER KEY SEARCH
======================================================== */

function setupSearchInput() {

    const input =
        document.getElementById(
            "productCode"
        );


    if (!input) {
        return;
    }


    input.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                searchProduct();

            }

        }
    );

}


/* ========================================================
   AUTO SEARCH FROM URL
======================================================== */

async function autoHandleURL() {

    const path =
        window.location.pathname;


    /*
    Product page
    */

    if (
        path.endsWith(
            "/product.html"
        )
        ||
        path.endsWith(
            "product.html"
        )
    ) {

        await loadDirectProductPage();

        return;

    }


    /*
    Index page with ?code=GL001
    */

    const params =
        new URLSearchParams(
            window.location.search
        );


    const code =
        params.get("code");


    if (code) {

        const input =
            document.getElementById(
                "productCode"
            );


        if (input) {

            input.value =
                code;

        }


        await searchProduct();

        return;

    }


    /*
    Normal homepage
    */

    await renderRecentProducts();

}


/* ========================================================
   INITIALIZE WEBSITE
======================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        setupSearchInput();

        await autoHandleURL();

    }
);
