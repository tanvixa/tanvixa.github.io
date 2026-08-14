/* =========================================================
   TANVIXA WEBSITE
   FINAL SEARCH SYSTEM
   DIRECT PRODUCT PAGE NAVIGATION
   ========================================================= */

"use strict";


/* =========================================================
   GLOBAL VARIABLES
   ========================================================= */

let products = [];
let productsLoaded = false;
let productsLoading = false;


/* =========================================================
   CONFIGURATION
   ========================================================= */

const PRODUCTS_FILE =
    "./products.json?v=" + Date.now();

const PRODUCT_PAGE =
    "./product.html";


/* =========================================================
   GET ELEMENT
   ========================================================= */

function $(id) {
    return document.getElementById(id);
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
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


/* =========================================================
   NORMALIZE PRODUCT CODE
   ========================================================= */

function normalizeCode(code) {

    return String(code || "")
        .trim()
        .toUpperCase();

}


/* =========================================================
   GET PRODUCT IMAGE
   ========================================================= */

function getProductImage(product) {

    if (
        product &&
        Array.isArray(product.images) &&
        product.images.length > 0
    ) {

        return product.images[0];

    }

    if (
        product &&
        product.image
    ) {

        return product.image;

    }

    return "images/no-image.png";

}


/* =========================================================
   LOAD PRODUCTS
   ========================================================= */

async function loadProducts() {

    /* -----------------------------------------
       Already loaded
    ----------------------------------------- */

    if (productsLoaded) {

        return products;

    }


    /* -----------------------------------------
       Prevent duplicate requests
    ----------------------------------------- */

    if (productsLoading) {

        while (productsLoading) {

            await new Promise(
                resolve =>
                    setTimeout(resolve, 50)
            );

        }

        return products;

    }


    productsLoading = true;


    try {

        const response =
            await fetch(
                PRODUCTS_FILE,
                {
                    method: "GET",
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
                "products.json must contain an array."
            );

        }


        products =
            data.filter(
                item =>
                    item &&
                    item.code !== undefined &&
                    item.code !== null
            );


        productsLoaded = true;


        console.log(
            "✅ Tanvixa products loaded:",
            products.length
        );


        return products;

    }

    catch (error) {

        console.error(
            "❌ Failed to load products.json:",
            error
        );


        products = [];

        productsLoaded = false;


        throw error;

    }

    finally {

        productsLoading = false;

    }

}


/* =========================================================
   FIND PRODUCT
   ========================================================= */

function findProduct(code) {

    const normalized =
        normalizeCode(code);


    if (!normalized) {

        return null;

    }


    return products.find(
        product =>
            normalizeCode(product.code) ===
            normalized
    ) || null;

}


/* =========================================================
   GET SEARCH INPUT
   ========================================================= */

function getSearchInput() {

    const input =
        $("productCode");


    if (!input) {

        return "";

    }


    return normalizeCode(
        input.value
    );

}


/* =========================================================
   SHOW SEARCH MESSAGE
   ========================================================= */

function showSearchMessage(
    message,
    type = "info"
) {

    let result =
        $("searchResult");


    /*
       Support different IDs in case
       the current index.html uses another
       result container.
    */

    if (!result) {

        result =
            $("searchResults");

    }


    if (!result) {

        result =
            $("result");

    }


    if (!result) {

        console.warn(
            message
        );

        return;

    }


    result.innerHTML = `

        <div class="search-message ${escapeHTML(type)}">

            ${escapeHTML(message)}

        </div>

    `;

}


/* =========================================================
   CREATE PRODUCT CARD
   ========================================================= */

function createProductCard(product) {

    const image =
        getProductImage(product);


    const code =
        normalizeCode(product.code);


    const name =
        product.name ||
        "Untitled Product";


    const brand =
        product.brand ||
        "";


    const category =
        product.category ||
        "";


    const description =
        product.description ||
        product.shortDescription ||
        "Explore this product on Tanvixa.";


    return `

        <article class="product-card">

            <a
                class="product-card-link"
                href="${PRODUCT_PAGE}?code=${encodeURIComponent(code)}"
                data-product-code="${escapeHTML(code)}"
                aria-label="View ${escapeHTML(name)}"
            >

                <img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(name)}"
                    loading="lazy"
                    onerror="this.onerror=null;this.src='images/no-image.png';"
                >

                <div class="product-card-content">

                    <h2>
                        ${escapeHTML(name)}
                    </h2>

                    ${
                        brand
                        ? `
                            <p class="product-brand">
                                ${escapeHTML(brand)}
                            </p>
                          `
                        : ""
                    }

                    ${
                        category
                        ? `
                            <p class="product-category">
                                ${escapeHTML(category)}
                            </p>
                          `
                        : ""
                    }

                    <p class="product-description">
                        ${escapeHTML(description)}
                    </p>

                    <span class="view-product">
                        View Product →
                    </span>

                </div>

            </a>

        </article>

    `;

}


/* =========================================================
   DISPLAY SEARCH RESULT
   ========================================================= */

function displayProduct(product) {

    let result =
        $("searchResult");


    if (!result) {

        result =
            $("searchResults");

    }


    if (!result) {

        result =
            $("result");

    }


    if (!result) {

        console.warn(
            "Search result container not found."
        );

        return;

    }


    result.innerHTML =
        createProductCard(product);


    /*
       Attach direct navigation.
       This prevents SPA-style or delayed
       click problems.
    */

    const card =
        result.querySelector(
            "[data-product-code]"
        );


    if (card) {

        card.addEventListener(
            "click",
            function(event) {

                event.preventDefault();


                const code =
                    normalizeCode(
                        this.dataset.productCode
                    );


                if (!code) {

                    return;

                }


                navigateToProduct(
                    code
                );

            }
        );

    }

}


/* =========================================================
   DIRECT PRODUCT PAGE NAVIGATION
   ========================================================= */

function navigateToProduct(code) {

    const normalized =
        normalizeCode(code);


    if (!normalized) {

        return;

    }


    /*
       Use URL object so the query parameter
       is always correctly encoded.
    */

    const url =
        new URL(
            PRODUCT_PAGE,
            window.location.href
        );


    url.searchParams.set(
        "code",
        normalized
    );


    console.log(
        "🚀 Opening product:",
        normalized
    );


    /*
       Direct browser navigation.
       No refresh required.
    */

    window.location.assign(
        url.href
    );

}


/* =========================================================
   MAIN SEARCH FUNCTION
   ========================================================= */

async function searchProduct() {

    const code =
        getSearchInput();


    /* -----------------------------------------
       Empty search
    ----------------------------------------- */

    if (!code) {

        showSearchMessage(
            "Please enter a product code.",
            "warning"
        );

        const input =
            $("productCode");

        if (input) {

            input.focus();

        }

        return;

    }


    /* -----------------------------------------
       Loading state
    ----------------------------------------- */

    const button =
        $("searchButton");


    if (button) {

        button.disabled = true;

        button.dataset.originalText =
            button.textContent;

        button.textContent =
            "Searching...";

    }


    showSearchMessage(
        "Searching for product...",
        "loading"
    );


    try {

        /* -----------------------------------------
           Load products first
        ----------------------------------------- */

        await loadProducts();


        /* -----------------------------------------
           Find exact product
        ----------------------------------------- */

        const product =
            findProduct(code);


        /* -----------------------------------------
           Product not found
        ----------------------------------------- */

        if (!product) {

            showSearchMessage(
                "❌ Product Not Found. Please check the product code.",
                "error"
            );

            return;

        }


        /* -----------------------------------------
           Save recent search
        ----------------------------------------- */

        try {

            localStorage.setItem(
                "tanvixa_last_product_code",
                normalizeCode(product.code)
            );

        }

        catch (storageError) {

            console.warn(
                "LocalStorage unavailable."
            );

        }


        /* -----------------------------------------
           IMPORTANT:
           Go directly to product page
        ----------------------------------------- */

        navigateToProduct(
            product.code
        );

    }

    catch (error) {

        console.error(
            "❌ Search failed:",
            error
        );


        showSearchMessage(
            "⚠️ Unable to load products right now. Please try again.",
            "error"
        );

    }

    finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                button.dataset.originalText ||
                "Search";

        }

    }

}


/* =========================================================
   ENTER KEY SEARCH
   ========================================================= */

function setupSearchInput() {

    const input =
        $("productCode");


    if (!input) {

        return;

    }


    input.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();


                searchProduct();

            }

        }
    );

}


/* =========================================================
   SEARCH BUTTON
   ========================================================= */

function setupSearchButton() {

    const button =
        $("searchButton");


    if (!button) {

        return;

    }


    /*
       Remove inline onclick dependency.
       The HTML can still contain onclick,
       but we prevent duplicate execution
       by using this setup only when needed.
    */

    button.addEventListener(
        "click",
        function(event) {

            event.preventDefault();


            searchProduct();

        }
    );

}


/* =========================================================
   SUPPORT DIRECT PRODUCT LINKS
   ========================================================= */

function setupProductLinks() {

    document.addEventListener(
        "click",
        function(event) {

            const link =
                event.target.closest(
                    "a[data-product-code]"
                );


            if (!link) {

                return;

            }


            /*
               Don't allow browser default navigation
               to interfere with our controlled navigation.
            */

            event.preventDefault();


            const code =
                normalizeCode(
                    link.dataset.productCode
                );


            if (code) {

                navigateToProduct(
                    code
                );

            }

        }
    );

}


/* =========================================================
   PRELOAD PRODUCTS
   ========================================================= */

async function preloadProducts() {

    try {

        await loadProducts();

        console.log(
            "⚡ Product database preloaded."
        );

    }

    catch (error) {

        console.warn(
            "Product preload failed. Search will retry automatically."
        );

    }

}


/* =========================================================
   INITIALIZE WEBSITE
   ========================================================= */

function initTanvixa() {

    console.log(
        "🚀 Tanvixa Search System Starting..."
    );


    setupSearchInput();


    setupSearchButton();


    setupProductLinks();


    /*
       Preload products immediately.
       This makes search much faster.
    */

    preloadProducts();

}


/* =========================================================
   DOM READY
   ========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initTanvixa
    );

}

else {

    initTanvixa();

}


/* =========================================================
   GLOBAL SEARCH FUNCTION
   ========================================================= */

window.searchProduct =
    searchProduct;


/* =========================================================
   GLOBAL NAVIGATION FUNCTION
   ========================================================= */

window.navigateToProduct =
    navigateToProduct;


/* =========================================================
   DEBUG HELPER
   ========================================================= */

window.TanvixaSearch = {

    getProducts: function() {

        return products;

    },

    findProduct: function(code) {

        return findProduct(code);

    },

    goToProduct: function(code) {

        navigateToProduct(code);

    }

};
