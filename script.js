"use strict";

/*
===========================================================
 TANVIXA PRODUCT SYSTEM
 FAST / CACHE / NO FALSE PRODUCT-NOT-FOUND VERSION
===========================================================

 Product structure supported:

 {
   "code": "GL001",
   "name": "...",
   "image": "images/GL001.jpg",
   "description": "...",
   "features": [],
   "link": "...",
   "category": "...",
   "brand": "...",
   "featured": true,
   "trending": true,
   "deal": false
 }

 Main strategy:

 1. products.json loads ONCE.
 2. Products are stored in localStorage.
 3. Clicked product is stored in sessionStorage.
 4. product.html renders cached product FIRST.
 5. JSON is only used as fallback.
 6. Product Not Found appears ONLY after
    a successful database lookup.
===========================================================
*/


/* ========================================================
   CONFIGURATION
======================================================== */

const PRODUCTS_FILE = "./products.json";

const LOCAL_CACHE_KEY =
    "tanvixa_products_cache_v1";

const LOCAL_CACHE_TIME_KEY =
    "tanvixa_products_cache_time_v1";

const SESSION_PRODUCT_KEY =
    "tanvixa_selected_product_v1";

const CACHE_DURATION =
    24 * 60 * 60 * 1000;


/* ========================================================
   GLOBAL STATE
======================================================== */

let products = [];

let productsLoaded = false;

let productsPromise = null;


/* ========================================================
   BASIC HELPERS
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


function normalizeCode(value) {

    return normalizeText(value)
        .replace(/\s+/g, "");

}


/* ========================================================
   PRODUCT HELPERS
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


function getProductImage(product) {

    if (!product) {
        return "";
    }

    return product.image || "";

}


function getProductImages(product) {

    if (!product) {
        return [];
    }

    const images = [];

    if (
        product.image &&
        typeof product.image === "string"
    ) {

        images.push(
            product.image
        );

    }

    if (
        Array.isArray(product.images)
    ) {

        product.images.forEach(image => {

            if (
                typeof image === "string" &&
                image.trim() !== "" &&
                !images.includes(image)
            ) {

                images.push(image);

            }

        });

    }

    return images;

}


function getProductDescription(product) {

    if (!product) {
        return "";
    }

    return product.description || "";

}


function getProductFeatures(product) {

    if (
        !product ||
        !Array.isArray(product.features)
    ) {
        return [];
    }

    return product.features.filter(
        feature =>
            feature !== null &&
            feature !== undefined &&
            String(feature).trim() !== ""
    );

}


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
   HTML ESCAPE
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
   DESCRIPTION FORMAT
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
   SAVE PRODUCTS TO LOCAL STORAGE
======================================================== */

function saveProductsToCache(data) {

    try {

        localStorage.setItem(
            LOCAL_CACHE_KEY,
            JSON.stringify(data)
        );

        localStorage.setItem(
            LOCAL_CACHE_TIME_KEY,
            String(Date.now())
        );

    } catch (error) {

        console.warn(
            "Tanvixa localStorage unavailable:",
            error
        );

    }

}


/* ========================================================
   GET PRODUCTS FROM LOCAL CACHE
======================================================== */

function getProductsFromCache() {

    try {

        const cached =
            localStorage.getItem(
                LOCAL_CACHE_KEY
            );

        if (!cached) {
            return null;
        }

        const parsed =
            JSON.parse(cached);

        if (
            !Array.isArray(parsed)
        ) {
            return null;
        }

        return parsed;

    } catch (error) {

        console.warn(
            "Invalid Tanvixa cache:",
            error
        );

        return null;

    }

}


/* ========================================================
   CHECK CACHE AGE
======================================================== */

function isCacheFresh() {

    try {

        const time =
            Number(
                localStorage.getItem(
                    LOCAL_CACHE_TIME_KEY
                )
            );

        if (!time) {
            return false;
        }

        return (
            Date.now() - time <
            CACHE_DURATION
        );

    } catch (error) {

        return false;

    }

}


/* ========================================================
   LOAD PRODUCTS
======================================================== */

function loadProducts(options = {}) {

    const forceRefresh =
        options.forceRefresh === true;


    /*
    Already loaded in this page
    */

    if (
        productsLoaded &&
        products.length > 0 &&
        !forceRefresh
    ) {

        return Promise.resolve(
            products
        );

    }


    /*
    If another request is already running,
    reuse that SAME request.
    */

    if (
        productsPromise &&
        !forceRefresh
    ) {

        return productsPromise;

    }


    /*
    FIRST:
    Use local cache immediately.
    */

    if (!forceRefresh) {

        const cached =
            getProductsFromCache();


        if (
            cached &&
            cached.length > 0
        ) {

            products =
                cached;

            productsLoaded =
                true;


            /*
            Return cached data immediately.
            */

            productsPromise =
                Promise.resolve(
                    products
                );


            /*
            If cache is old, refresh in
            background without blocking UI.
            */

            if (!isCacheFresh()) {

                refreshProductsInBackground();

            }


            return productsPromise;

        }

    }


    /*
    No cache:
    Fetch products.json.
    */

    productsPromise =
        fetch(
            PRODUCTS_FILE,
            {
                method: "GET",
                cache: "default"
            }
        )
        .then(response => {

            if (!response.ok) {

                throw new Error(
                    "Products database could not be loaded."
                );

            }

            return response.json();

        })
        .then(data => {

            if (
                !Array.isArray(data)
            ) {

                throw new Error(
                    "products.json must contain an array."
                );

            }


            products =
                data;

            productsLoaded =
                true;


            saveProductsToCache(
                products
            );


            return products;

        })
        .catch(error => {

            console.error(
                "Tanvixa products loading error:",
                error
            );


            /*
            If old cache exists,
            use it even if network fails.
            */

            const fallback =
                getProductsFromCache();


            if (
                fallback &&
                fallback.length > 0
            ) {

                products =
                    fallback;

                productsLoaded =
                    true;

                return products;

            }


            throw error;

        });


    return productsPromise;

}


/* ========================================================
   BACKGROUND REFRESH
======================================================== */

function refreshProductsInBackground() {

    fetch(
        PRODUCTS_FILE,
        {
            method: "GET",
            cache: "default"
        }
    )
    .then(response => {

        if (!response.ok) {
            throw new Error(
                "Background refresh failed."
            );
        }

        return response.json();

    })
    .then(data => {

        if (
            !Array.isArray(data)
        ) {
            return;
        }


        products =
            data;

        productsLoaded =
            true;


        saveProductsToCache(
            products
        );


    })
    .catch(error => {

        console.warn(
            "Background product refresh failed:",
            error
        );

    });

}


/* ========================================================
   FIND PRODUCT BY CODE
======================================================== */

function findProductByCode(code) {

    const wanted =
        normalizeCode(code);


    if (!wanted) {
        return null;
    }


    for (
        let i = 0;
        i < products.length;
        i++
    ) {

        const current =
            normalizeCode(
                getProductCode(
                    products[i]
                )
            );


        if (
            current === wanted
        ) {

            return products[i];

        }

    }


    return null;

}


/* ========================================================
   SAVE SELECTED PRODUCT
======================================================== */

function saveSelectedProduct(product) {

    if (!product) {
        return;
    }


    try {

        sessionStorage.setItem(
            SESSION_PRODUCT_KEY,
            JSON.stringify(product)
        );

    } catch (error) {

        console.warn(
            "Session storage unavailable:",
            error
        );

    }

}


/* ========================================================
   GET SELECTED PRODUCT
======================================================== */

function getSelectedProduct() {

    try {

        const stored =
            sessionStorage.getItem(
                SESSION_PRODUCT_KEY
            );


        if (!stored) {
            return null;
        }


        const product =
            JSON.parse(stored);


        if (!product) {
            return null;
        }


        return product;


    } catch (error) {

        return null;

    }

}


/* ========================================================
   CLEAR SELECTED PRODUCT
======================================================== */

function clearSelectedProduct() {

    try {

        sessionStorage.removeItem(
            SESSION_PRODUCT_KEY
        );

    } catch (error) {

        /* Ignore */

    }

}


/* ========================================================
   GET URL PRODUCT CODE
======================================================== */

function getURLProductCode() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    return (
        params.get("code") ||
        ""
    ).trim();

}


/* ========================================================
   SET PAGE TITLE
======================================================== */

function setProductTitle(product) {

    if (!product) {
        return;
    }

    document.title =
        `${getProductName(product)} — Tanvixa`;

}


/* ========================================================
   UPDATE DESCRIPTION META
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
        String(
            description || ""
        )
        .replace(/\s+/g, " ")
        .trim()
        .substring(0, 160);

}


/* ========================================================
   PRODUCT CARD
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


    const featureHTML =
        features.length > 0

        ?

        `
        <ul class="product-features">

            ${features.map(
                feature => `
                    <li>
                        ${escapeHTML(feature)}
                    </li>
                `
            ).join("")}

        </ul>
        `

        :

        "";


    return `

        <article class="product-card">


            <div class="product-image-wrapper">

                ${
                    image

                    ?

                    `
                    <img
                        src="${escapeHTML(image)}"
                        alt="${escapeHTML(name)}"
                        class="product-image"
                        loading="lazy"
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
                    ${escapeHTML(code)}
                </div>


                <h2 class="product-title">
                    ${escapeHTML(name)}
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
                    href="./product.html?code=${encodeURIComponent(code)}"
                    class="view-product-button"
                    data-product-code="${escapeHTML(code)}"
                >
                    View Details
                </a>


            </div>


        </article>

    `;

}


/* ========================================================
   OPEN PRODUCT
======================================================== */

function openProduct(product) {

    if (!product) {
        return;
    }


    /*
    IMPORTANT:
    Save the COMPLETE product before navigating.

    This means product.html can render immediately
    without waiting for products.json.
    */

    saveSelectedProduct(
        product
    );


    const code =
        getProductCode(product);


    window.location.href =
        "./product.html?code=" +
        encodeURIComponent(code);

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


    const search =
        input.value.trim();


    if (!search) {

        result.innerHTML = `
            <div class="product-error">

                <h2>
                    ⚠️ Enter a Product Code
                </h2>

                <p>
                    Example: GL001
                </p>

            </div>
        `;

        return;

    }


    /*
    First check currently available
    cached products.
    */

    if (
        productsLoaded &&
        products.length > 0
    ) {

        const product =
            findProductByCode(
                search
            );


        if (product) {

            openProduct(
                product
            );

            return;

        }

    }


    /*
    Load cache / JSON.
    */

    try {

        const data =
            await loadProducts();


        const product =
            findProductByCode(
                search
            );


        if (product) {

            openProduct(
                product
            );

            return;

        }


        /*
        Exact code not found.
        */

        result.innerHTML = `

            <div class="product-error">

                <h2>
                    ❌ Product Not Found
                </h2>

                <p>
                    No product was found for
                    <strong>
                        ${escapeHTML(search)}
                    </strong>.
                </p>

            </div>

        `;


    } catch (error) {

        /*
        NEVER call this Product Not Found.
        This is a DATABASE/NETWORK error.
        */

        result.innerHTML = `

            <div class="product-error">

                <h2>
                    ⚠️ Product Database Unavailable
                </h2>

                <p>
                    Please try again in a moment.
                </p>

            </div>

        `;

    }

}


/* ========================================================
   SHOW SEARCH RESULTS
======================================================== */

function showSearchResults(
    searchValue
) {

    const result =
        document.getElementById(
            "searchResult"
        );


    if (!result) {
        return;
    }


    const search =
        normalizeText(
            searchValue
        );


    const matched =
        products.filter(product => {

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


            return (
                code.includes(search) ||
                name.includes(search) ||
                brand.includes(search) ||
                category.includes(search)
            );

        });


    if (
        matched.length === 0
    ) {

        result.innerHTML = `

            <div class="product-error">

                <h2>
                    ❌ Product Not Found
                </h2>

                <p>
                    No matching product found.
                </p>

            </div>

        `;

        return;

    }


    result.innerHTML = `

        <div class="search-results-container">

            <h2 class="results-title">
                Search Results
            </h2>

            <div class="results-grid">

                ${matched.map(
                    product =>
                        createProductCard(
                            product
                        )
                ).join("")}

            </div>

        </div>

    `;

}


/* ========================================================
   RENDER PRODUCT PAGE
======================================================== */

function renderProductPage(
    product,
    container
) {

    if (!product || !container) {
        return;
    }


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


    setProductTitle(
        product
    );


    updateMetaDescription(
        description
    );


    let galleryHTML = "";


    if (
        images.length > 0
    ) {

        galleryHTML = `

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
                                    data-image="${escapeHTML(image)}"
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

        `;

    } else {

        galleryHTML = `

            <div class="no-product-image">
                No Image Available
            </div>

        `;

    }


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


    const hasAffiliateLink =
        affiliateLink &&
        affiliateLink !== "#" &&
        affiliateLink !== "YOUR_AFFILIATE_LINK";


    const buyHTML =
        hasAffiliateLink

        ?

        `

        <a
            href="${escapeHTML(affiliateLink)}"
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

        `;


    container.innerHTML = `

        <article class="single-product-page">


            <div class="single-product-grid">


                <div class="single-product-media">

                    ${galleryHTML}

                </div>


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

                            ${formatDescription(
                                description
                            )}

                        </div>
                        `

                        :

                        ""
                    }


                    ${featuresHTML}


                    <div class="buy-section">

                        ${buyHTML}


                        <p class="affiliate-disclosure">

                            Some links on this website may be
                            affiliate links. If you make a purchase
                            through these links, we may earn a commission
                            at no extra cost to you.

                        </p>

                    </div>


                    <a
                        href="./index.html"
                        class="back-search-button"
                    >
                        ← Search Another Product
                    </a>


                </div>


            </div>


        </article>

    `;


    /*
    Setup image thumbnails AFTER HTML exists.
    */

    setupImageGallery();


    /*
    Related products can be rendered after
    the main product is already visible.
    */

    requestAnimationFrame(
        () => {
            renderRelatedProducts(
                product
            );
        }
    );

}


/* ========================================================
   IMAGE GALLERY
======================================================== */

function setupImageGallery() {

    const buttons =
        document.querySelectorAll(
            ".product-thumbnail"
        );


    const mainImage =
        document.getElementById(
            "mainProductImage"
        );


    if (
        !mainImage ||
        buttons.length === 0
    ) {
        return;
    }


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const image =
                    button.dataset.image;


                if (!image) {
                    return;
                }


                mainImage.src =
                    image;


                buttons.forEach(
                    item =>
                        item.classList.remove(
                            "active"
                        )
                );


                button.classList.add(
                    "active"
                );

            }
        );

    });

}


/* ========================================================
   RELATED PRODUCTS
======================================================== */

function renderRelatedProducts(
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
                    getProductCode(
                        product
                    )
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
    Fill remaining slots with other products.
    */

    if (
        related.length < 4
    ) {

        products.forEach(product => {

            if (
                related.length >= 4
            ) {
                return;
            }


            const code =
                normalizeCode(
                    getProductCode(
                        product
                    )
                );


            if (
                code === currentCode
            ) {
                return;
            }


            if (
                related.includes(
                    product
                )
            ) {
                return;
            }


            related.push(
                product
            );

        });

    }


    related =
        related.slice(
            0,
            4
        );


    if (
        related.length === 0
    ) {
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
                        createProductCard(
                            product
                        )
                ).join("")}

            </div>

        </section>

    `;

}


/* ========================================================
   RECENT PRODUCTS
======================================================== */

function renderRecentProducts() {

    const container =
        document.getElementById(
            "recentProducts"
        );


    if (!container) {
        return;
    }


    if (
        !products.length
    ) {
        return;
    }


    const recent =
        products
            .slice(0, 4);


    container.innerHTML = `

        <div class="recent-products-container">

            <h2>
                Latest Products
            </h2>


            <div class="results-grid">

                ${recent.map(
                    product =>
                        createProductCard(
                            product
                        )
                ).join("")}

            </div>

        </div>

    `;

}


/* ========================================================
   EVENT: PRODUCT LINKS
======================================================== */

function setupProductLinks() {

    document.addEventListener(
        "click",
        function(event) {

            const link =
                event.target.closest(
                    "[data-product-code]"
                );


            if (!link) {
                return;
            }


            const code =
                link.dataset.productCode;


            if (!code) {
                return;
            }


            const product =
                findProductByCode(
                    code
                );


            if (!product) {
                return;
            }


            /*
            Save COMPLETE product BEFORE
            browser navigation.
            */

            saveSelectedProduct(
                product
            );

        }
    );

}


/* ========================================================
   ENTER KEY
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
   INDEX PAGE INITIALIZATION
======================================================== */

async function initializeIndexPage() {

    const input =
        document.getElementById(
            "productCode"
        );


    const button =
        document.getElementById(
            "searchButton"
        );


    if (button) {

        button.addEventListener(
            "click",
            searchProduct
        );

    }


    setupSearchInput();


    /*
    Start loading products immediately.

    IMPORTANT:
    The user does NOT have to wait.

    The browser starts loading products
    while the user is reading the page.
    */

    try {

        await loadProducts();

        renderRecentProducts();

    } catch (error) {

        console.error(
            "Initial product load failed:",
            error
        );

    }


    /*
    Handle ?code=GL001 if present.
    */

    const urlCode =
        getURLProductCode();


    if (
        urlCode &&
        input
    ) {

        input.value =
            urlCode;


        searchProduct();

    }

}


/* ========================================================
   PRODUCT PAGE INITIALIZATION
======================================================== */

async function initializeProductPage() {

    const container =
        document.getElementById(
            "productPage"
        );


    if (!container) {
        return;
    }


    const urlCode =
        getURLProductCode();


    if (!urlCode) {

        container.innerHTML = `

            <div class="product-error">

                <h2>
                    Product Code Missing
                </h2>

                <p>
                    No product code was provided.
                </p>


                <a
                    href="./index.html"
                    class="view-product-button"
                >
                    Back to Search
                </a>

            </div>

        `;

        return;

    }


    /*
    =======================================================
    STEP 1
    INSTANT SESSION PRODUCT
    =======================================================

    If user clicked a product from homepage,
    the COMPLETE product is already here.

    Render it immediately.
    */

    const selected =
        getSelectedProduct();


    if (
        selected &&
        normalizeCode(
            getProductCode(
                selected
            )
        ) === normalizeCode(
            urlCode
        )
    ) {

        renderProductPage(
            selected,
            container
        );


        /*
        Do NOT wait for products.json.

        Refresh the cache in background.
        */

        loadProducts()
            .then(() => {

                /*
                If newer data exists, we don't
                interrupt the current page.
                */

            })
            .catch(() => {});


        return;

    }


    /*
    =======================================================
    STEP 2
    LOCAL CACHE
    =======================================================

    Direct product URL:
    product.html?code=GL001

    If localStorage already has products,
    render immediately.
    */

    const cached =
        getProductsFromCache();


    if (
        cached &&
        cached.length > 0
    ) {

        products =
            cached;

        productsLoaded =
            true;


        const product =
            findProductByCode(
                urlCode
            );


        if (product) {

            renderProductPage(
                product,
                container
            );


            /*
            Refresh in background.
            */

            if (
                !isCacheFresh()
            ) {

                refreshProductsInBackground();

            }


            return;

        }

    }


    /*
    =======================================================
    STEP 3
    NO CACHE
    =======================================================

    Only now do we need to fetch
    products.json.
    */

    try {

        const data =
            await loadProducts();


        const product =
            findProductByCode(
                urlCode
            );


        if (product) {

            renderProductPage(
                product,
                container
            );


            return;

        }


        /*
        IMPORTANT:
        Only successful database lookup
        can produce Product Not Found.
        */

        container.innerHTML = `

            <div class="product-error">

                <h2>
                    ❌ Product Not Found
                </h2>

                <p>
                    Product code
                    <strong>
                        ${escapeHTML(urlCode)}
                    </strong>
                    does not exist in the product database.
                </p>


                <a
                    href="./index.html"
                    class="view-product-button"
                >
                    Back to Search
                </a>

            </div>

        `;


    } catch (error) {

        /*
        Network/database error is NOT
        the same thing as Product Not Found.
        */

        container.innerHTML = `

            <div class="product-error">

                <h2>
                    ⚠️ Product Database Unavailable
                </h2>

                <p>
                    The product database could not be loaded.
                    Please try again.
                </p>


                <a
                    href="./index.html"
                    class="view-product-button"
                >
                    Back to Search
                </a>

            </div>

        `;

    }

}


/* ========================================================
   DETECT PAGE
======================================================== */

function initializeSite() {

    setupProductLinks();


    const productPage =
        document.getElementById(
            "productPage"
        );


    if (productPage) {

        initializeProductPage();

        return;

    }


    initializeIndexPage();

}


/* ========================================================
   START
======================================================== */

document.addEventListener(
    "DOMContentLoaded",
    initializeSite
);
