/* =========================================================
   TANVIXA V3 - GLOBAL DATA + SITE SYSTEM
   FINAL CLEAN STABLE VERSION

   /* =========================================================
   GOOGLE ANALYTICS
   ========================================================= */

(function () {
    const GA_ID = "G-91RBG3DSJZ";

    window.dataLayer = window.dataLayer || [];

    window.gtag = window.gtag || function () {
        window.dataLayer.push(arguments);
    };

    if (!window.__tanvixaGAInitialized) {
        window.gtag("js", new Date());
        window.gtag("config", GA_ID);
        window.__tanvixaGAInitialized = true;
    }

    if (
        !document.querySelector(
            'script[src*="googletagmanager.com/gtag/js"]'
        )
    ) {
        const script = document.createElement("script");

        script.async = true;
        script.src =
            "https://www.googletagmanager.com/gtag/js?id=" +
            GA_ID;

        document.head.appendChild(script);
    }
})();
   ========================================================= */

const TVX = {
    products: [],
    categories: [],
    config: {},
    ready: null
};

/* =========================================================
   ESCAPE HTML
   ========================================================= */

function esc(value = "") {

    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    }[char]));

}


/* =========================================================
   IMAGE HELPER
   ========================================================= */

function img(product) {

    if (
        Array.isArray(product?.images) &&
        product.images.length
    ) {
        return product.images[0];
    }

    return (
        product?.image ||
        "images/no-image.png"
    );

}


/* =========================================================
   HASH
   ========================================================= */

function hash(value = "") {

    let h = 0;

    for (let i = 0; i < value.length; i++) {

        h =
            ((h << 5) - h) +
            value.charCodeAt(i);

        h |= 0;
    }

    return h;

}


/* =========================================================
   NORMALIZE CATEGORY NAME
   ========================================================= */

function normalizeCategory(value = "") {

    return String(value)
        .trim()
        .toLowerCase()
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ");

}


/* =========================================================
   JSON LOADER
   ========================================================= */

async function loadJSON(path) {

    const response = await fetch(path, {
        cache: "no-cache"
    });

    if (!response.ok) {

        throw new Error(
            `Failed to load ${path} (${response.status})`
        );

    }

    return await response.json();

}


/* =========================================================
   NORMALIZE PRODUCTS
   ========================================================= */

function normalizeProducts(products) {

    if (!Array.isArray(products)) {

        throw new Error(
            "products.json must contain an array"
        );

    }

    return products
        .filter(product =>
            product &&
            product.code
        )
        .map(product => ({

            ...product,

            code:
                String(product.code)
                    .trim()
                    .toUpperCase()

        }));

}


/* =========================================================
   BUILD CATEGORIES FROM PRODUCTS
   ========================================================= */

function buildCategoriesFromProducts(products) {

    const map = new Map();

    products.forEach(product => {

        const name =
            String(
                product.category ||
                "Other"
            ).trim();

        const key =
            normalizeCategory(name);

        if (!map.has(key)) {

            map.set(key, {

                id:
                    key.replace(
                        /[^a-z0-9]+/g,
                        "-"
                    ),

                name: name,

                count: 0

            });

        }

        map.get(key).count++;

    });

    return Array.from(
        map.values()
    );

}


/* =========================================================
   GLOBAL DATA READY
   ========================================================= */

TVX.ready = (async () => {

    const productsData =
        await loadJSON(
            "products.json"
        );


    let categoriesData = [];

    let configData = {};


    try {

        categoriesData =
            await loadJSON(
                "categories.json"
            );

    } catch (error) {

        console.warn(
            "categories.json could not be loaded. Categories will be generated from products."
        );

    }


    try {

        configData =
            await loadJSON(
                "site-config.json"
            );

    } catch (error) {

        console.warn(
            "site-config.json could not be loaded. Default configuration will be used."
        );

    }


    TVX.products =
        normalizeProducts(
            productsData
        );


    /*
       IMPORTANT:
       Even if categories.json exists,
       we rebuild category counts from products.
       This prevents old/wrong category counts.
    */

    const generatedCategories =
        buildCategoriesFromProducts(
            TVX.products
        );


    if (
        Array.isArray(categoriesData) &&
        categoriesData.length
    ) {

        TVX.categories =
            categoriesData.map(category => {

                const categoryName =
                    String(
                        category.name ||
                        category.category ||
                        ""
                    ).trim();


                const matching =
                    generatedCategories.find(item =>
                        normalizeCategory(
                            item.name
                        ) ===
                        normalizeCategory(
                            categoryName
                        )
                    );


                return {

                    ...category,

                    id:
                        category.id ||
                        categoryName
                            .toLowerCase()
                            .replace(
                                /[^a-z0-9]+/g,
                                "-"
                            ),

                    name:
                        categoryName,

                    count:
                        matching
                            ? matching.count
                            : Number(
                                category.count || 0
                            )

                };

            });


        /*
           Add categories that exist in products
           but are missing from categories.json.
        */

        generatedCategories.forEach(generated => {

            const exists =
                TVX.categories.some(category =>
                    normalizeCategory(
                        category.name
                    ) ===
                    normalizeCategory(
                        generated.name
                    )
                );


            if (!exists) {

                TVX.categories.push(
                    generated
                );

            }

        });

    } else {

        TVX.categories =
            generatedCategories;

    }


    TVX.config =
        configData &&
        typeof configData === "object"
            ? configData
            : {};


    return TVX;

})().catch(error => {

    console.error(
        "Tanvixa data loading error:",
        error
    );


    TVX.products = [];

    TVX.categories = [];

    TVX.config = {};


    throw error;

});


/* =========================================================
   PRODUCT CARD
   ========================================================= */

function card(product) {

    const code =
        encodeURIComponent(
            product.code
        );


    return `

        <article class="product-card">

            <a
                class="card-media"
                href="product.html?code=${code}"
            >

                <img
                    src="${esc(img(product))}"
                    alt="${esc(
                        product.name ||
                        product.code
                    )}"
                    loading="lazy"
                    onerror="this.onerror=null;this.src='images/no-image.png'"
                >

            </a>


            <div class="card-body">

                <span class="card-kicker">

                    ${esc(
                        product.brand ||
                        product.category ||
                        "Gadget"
                    )}

                </span>


                <h3 class="card-title">

                    ${esc(
                        product.name ||
                        "Unnamed Product"
                    )}

                </h3>


                <div class="card-meta">

                    ${
                        product.rating
                            ? `
                                <span>
                                    ⭐ ${esc(
                                        product.rating
                                    )}
                                </span>
                              `
                            : ""
                    }


                    <span class="card-code">

                        ${esc(
                            product.code
                        )}

                    </span>

                </div>


                <a
                    class="view-btn"
                    href="product.html?code=${code}"
                >
                    VIEW DETAILS →
                </a>

            </div>

        </article>

    `;

}


/* =========================================================
   CATEGORY CARD
   ========================================================= */

function catCard(category) {

    const icons = [

        "📱",
        "⚡",
        "💻",
        "🏠",
        "🎧",
        "🎮",
        "📷",
        "⌚",
        "🔐",
        "🚗",
        "🔋",
        "🔌"

    ];


    const id =
        category.id ||
        category.name ||
        "category";


    const icon =
        icons[
            Math.abs(
                hash(
                    String(id)
                )
            ) %
            icons.length
        ];


    const categoryName =
        category.name ||
        "Category";


    return `

        <a
            class="category-card"
            href="category.html?category=${encodeURIComponent(
                categoryName
            )}"
        >

            <div class="category-icon">

                ${icon}

            </div>


            <strong>

                ${esc(
                    categoryName
                )}

            </strong>


            <span>

                ${Number(
                    category.count || 0
                )}

                products 

            </span>

        </a>

    `;

}


/* =========================================================
   HEADER
   ========================================================= */

function header() {

    const container =
        document.getElementById(
            "siteHeader"
        );


    if (!container) return;


    const config =
        TVX.config || {};


    const logo =
        config.logo ||
        "images/tanvixalogo.jpg";


    container.innerHTML = `

        <div class="topbar">

            <div class="container">

                <span>
                    Smart gadget discovery & product information.
                </span>

                <span>
                    Independent affiliate website
                </span>

            </div>

        </div>


        <header class="site-header">

            <div class="container header-inner">


                <a
                    class="logo"
                    href="index.html"
                >

                    <img
                        src="${esc(logo)}"
                        alt="Tanvixa"
                    >


                    <span>

                        <strong>
                            Tanvixa
                        </strong>

                        <small>
                            SMART GADGET DISCOVERY
                        </small>

                    </span>

                </a>


                <form
                    class="header-search"
                    id="headerSearch"
                >

                    <input
                        id="headerQuery"
                        placeholder="Search product or code"
                        autocomplete="off"
                    >


                    <button type="submit">
                        Search
                    </button>

                </form>


                <nav class="nav">

                    <a href="index.html">
                        Home
                    </a>

                    <a href="categories.html">
                        Categories
                    </a>

                    <a href="trending.html">
                        Trending
                    </a>

                    <a href="latest.html">
                        Latest
                    </a>

                    <a href="about.html">
                        About
                    </a>

                    <a href="contact.html">
                        Contact
                    </a>

                </nav>


                <button
                    class="menu-btn"
                    type="button"
                    onclick="location.href='categories.html'"
                >
                    ☰
                </button>


            </div>

        </header>

    `;

}


/* =========================================================
   FOOTER
   ========================================================= */

function footer() {

    const container =
        document.getElementById(
            "siteFooter"
        );


    if (!container) return;


    const config =
        TVX.config || {};


    const social =
        config.social || {};


    const contact =
        config.contact || {};


    container.innerHTML = `

        <footer class="footer">

            <div class="container footer-grid">


                <div>

                    <h3>
                        Tanvixa
                    </h3>

                    <p>
                        Discover useful tech gadgets,
                        understand key details and find
                        available buying options.
                    </p>

                </div>


                <div>

                    <h3>
                        Explore
                    </h3>


                    <a href="index.html">
                        Home
                    </a>


                    <a href="categories.html">
                        Categories
                    </a>


                    <a href="trending.html">
                        Trending
                    </a>


                    <a href="latest.html">
                        Latest
                    </a>

                </div>


                <div>

                    <h3>
                        Help
                    </h3>


                    <a href="faq.html">
                        FAQ
                    </a>


                    <a href="about.html">
                        About
                    </a>


                    <a href="contact.html">
                        Contact
                    </a>


                    <a href="disclosure.html">
                        Affiliate Disclosure
                    </a>

                </div>


                <div>

                    <h3>
                        Connect
                    </h3>


                    ${
                        contact.email
                            ? `
                                <a
                                    href="mailto:${esc(
                                        contact.email
                                    )}"
                                >
                                    Email
                                </a>
                              `
                            : ""
                    }


                    ${
                        social.youtube
                            ? `
                                <a
                                    href="${esc(
                                        social.youtube
                                    )}"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    YouTube
                                </a>
                              `
                            : ""
                    }


                    ${
                        social.facebook
                            ? `
                                <a
                                    href="${esc(
                                        social.facebook
                                    )}"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Facebook
                                </a>
                              `
                            : ""
                    }


                    ${
                        social.instagram
                            ? `
                                <a
                                    href="${esc(
                                        social.instagram
                                    )}"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Instagram
                                </a>
                              `
                            : ""
                    }


                    <a href="privacy.html">
                        Privacy Policy
                    </a>


                    <a href="terms.html">
                        Terms
                    </a>


                </div>


            </div>


            <div class="container footer-bottom">

                <span>
                    © 2026 Tanvixa. All rights reserved.
                </span>


                <span>
                    ${esc(
                        config.affiliateDisclosure ||
                        ""
                    )}
                </span>

            </div>


        </footer>

    `;

}


/* =========================================================
   SEARCH
   ========================================================= */

function go(query) {

    const value =
        String(query || "").trim();


    if (!value) return;


    const normalized =
        value.toLowerCase();


    const match =
        TVX.products.find(product => {

            const fields = [

                product.code,
                product.name,
                product.brand,
                product.category,
                product.subcategory,

                ...(Array.isArray(
                    product.tags
                )
                    ? product.tags
                    : [])

            ];


            return fields
                .filter(Boolean)
                .some(field =>

                    String(field)
                        .toLowerCase()
                        .includes(
                            normalized
                        )

                );

        });


    if (match) {

        location.href =
            "product.html?code=" +
            encodeURIComponent(
                match.code
            );

        return;

    }


    location.href =
        "index.html?search=" +
        encodeURIComponent(
            value
        );

}


/* =========================================================
   SEARCH EVENTS
   ========================================================= */

function initSearch() {

    const form =
        document.getElementById(
            "headerSearch"
        );


    if (!form) return;


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const input =
                document.getElementById(
                    "headerQuery"
                );


            go(
                input?.value || ""
            );

        }
    );

}


/* =========================================================
   HOME PAGE
   ========================================================= */

function home() {

    const heroForm =
        document.getElementById(
            "heroSearch"
        );


    if (heroForm) {

        heroForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                const input =
                    document.getElementById(
                        "heroQuery"
                    );


                go(
                    input?.value || ""
                );

            }
        );

    }


    const homeCategories =
        document.getElementById(
            "homeCategories"
        );


    if (homeCategories) {

        homeCategories.innerHTML =
            TVX.categories
                .slice(0, 4)
                .map(catCard)
                .join("");

    }


    const useCategories =
        document.getElementById(
            "useCategories"
        );


    if (useCategories) {

        useCategories.innerHTML =
            TVX.categories
                .slice(0, 7)
                .map(catCard)
                .join("");

    }


    const trending =
        TVX.products
            .filter(
                product =>
                    product.trending
            )
            .slice(0, 8);


    const latest =
        TVX.products
            .slice()
            .reverse()
            .slice(0, 8);


    const trendingGrid =
        document.getElementById(
            "trendingGrid"
        );


    if (trendingGrid) {

        trendingGrid.innerHTML =
            trending
                .map(card)
                .join("");

    }


    const latestGrid =
        document.getElementById(
            "latestGrid"
        );


    if (latestGrid) {

        latestGrid.innerHTML =
            latest
                .map(card)
                .join("");

    }


    const featured =
        document.getElementById(
            "featuredPick"
        );


    const featuredProduct =
        TVX.products.find(
            product =>
                product.featured
        ) ||
        TVX.products[0];


    if (
        featured &&
        featuredProduct
    ) {

        featured.innerHTML = `

            <div class="featured">

                <div class="featured-media">

                    <img
                        src="${esc(
                            img(
                                featuredProduct
                            )
                        )}"
                        alt="${esc(
                            featuredProduct.name
                        )}"
                        loading="lazy"
                        onerror="this.onerror=null;this.src='images/no-image.png'"
                    >

                </div>


                <div class="featured-body">

                    <span class="eyebrow">
                        Featured Pick
                    </span>


                    <h2>
                        ${esc(
                            featuredProduct.name
                        )}
                    </h2>


                    <p>
                        ${esc(
                            featuredProduct.shortDescription ||
                            "Explore this product's details and available buying options."
                        )}
                    </p>


                    <ul class="benefit-list">

                        ${
                            (
                                featuredProduct.features ||
                                []
                            )
                            .slice(0, 3)
                            .map(
                                feature =>
                                    `<li>${esc(
                                        feature
                                    )}</li>`
                            )
                            .join("")
                        }

                    </ul>


                    <a
                        class="dark-btn"
                        href="product.html?code=${encodeURIComponent(
                            featuredProduct.code
                        )}"
                    >
                        VIEW PRODUCT →
                    </a>

                </div>

            </div>

        `;

    }


    const search =
        new URLSearchParams(
            location.search
        ).get("search");


    if (search) {

        setTimeout(() => {

            alert(
                "No exact match was found for: " +
                search +
                ". Try another product name, code or keyword."
            );

        }, 80);

    }

}


/* =========================================================
   LISTING PAGES
   ========================================================= */

function listings() {

    const grid =
        document.getElementById(
            "listingGrid"
        );


    if (!grid) return;


    const list =
        document.body.dataset.page ===
        "trending"

            ? TVX.products.filter(
                product =>
                    product.trending
            )

            : TVX.products
                .slice()
                .reverse();


    grid.innerHTML =
        list.length

            ? list
                .map(card)
                .join("")

            : `
                <div class="notice">
                    No products available.
                </div>
              `;

}


/* =========================================================
   CATEGORIES PAGE
   ========================================================= */

function categories() {

    /*
       This function handles BOTH:

       1. categories.html
          → shows all categories

       2. category.html?category=Power Bank
          → shows products in that category
    */


    const categoryGrid =
        document.getElementById(
            "categoryProducts"
        );


    if (!categoryGrid) return;


    const title =
        document.getElementById(
            "categoryTitle"
        );


    const description =
        document.getElementById(
            "categoryDescription"
        );


    const params =
        new URLSearchParams(
            location.search
        );


    const categoryName =
        params.get("category");


    /* =====================================================
       NO CATEGORY SELECTED
       ===================================================== */

    if (!categoryName) {

        if (title) {

            title.textContent =
                "Product Categories";

        }


        if (description) {

            description.textContent =
                "Explore Tanvixa products by category.";

        }


        if (!TVX.categories.length) {

            categoryGrid.innerHTML = `

                <div class="notice">

                    <h2>
                        No Categories Found
                    </h2>

                    <p>
                        Product categories are currently unavailable.
                    </p>

                </div>

            `;

            return;

        }


        categoryGrid.className =
            "category-grid";


        categoryGrid.innerHTML =
            TVX.categories
                .map(catCard)
                .join("");


        return;

    }


    /* =====================================================
       CATEGORY SELECTED
       ===================================================== */

    const requestedCategory =
        normalizeCategory(
            categoryName
        );


    /*
       Match category using normalized text.

       Example:

       Power Bank
       power bank
       POWER BANK
       power-bank
       power_bank

       All match.
    */

    const products =
        TVX.products.filter(product => {

            const productCategory =
                normalizeCategory(
                    product.category
                );


            return (
                productCategory ===
                requestedCategory
            );

        });


    /* =====================================================
       CATEGORY TITLE
       ===================================================== */

    if (title) {

        title.textContent =
            categoryName;

    }


    /* =====================================================
       CATEGORY DESCRIPTION
       ===================================================== */

    if (description) {

        description.textContent =
            products.length

                ? `${products.length} product${products.length !== 1 ? "s" : ""} available in ${categoryName}.`

                : `No products are currently available in ${categoryName}.`;

    }


    /* =====================================================
       NO PRODUCTS
       ===================================================== */

    if (!products.length) {

        categoryGrid.className =
            "grid";


        categoryGrid.innerHTML = `

            <div class="notice">

                <h2>
                    No Products Found
                </h2>


                <p>
                    No products are currently available in
                    ${esc(categoryName)}.
                </p>

            </div>

        `;


        return;

    }


    /* =====================================================
       SHOW PRODUCTS
       ===================================================== */

    categoryGrid.className =
        "grid";


    categoryGrid.innerHTML =
        products
            .map(card)
            .join("");

}


/* =========================================================
   NEWSLETTER
   ========================================================= */

function newsletter() {

    const form =
        document.getElementById(
            "newsletterForm"
        );


    if (!form) return;


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const action =
                TVX.config
                    ?.newsletter
                    ?.action || "";


            if (
                action &&
                action !==
                "YOUR_NEWSLETTER_FORM_ENDPOINT"
            ) {

                form.action =
                    action;


                form.method =
                    "POST";


                form.submit();

            } else {

                alert(
                    "Connect your email marketing provider by adding its form endpoint in site-config.json."
                );

            }

        }
    );

}


/* =========================================================
   SITE INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        try {

            await TVX.ready;


            header();


            footer();


            initSearch();


            home();


            listings();


            categories();


            newsletter();


        } catch (error) {

            console.error(
                "Tanvixa initialization failed:",
                error
            );


            const main =
                document.querySelector(
                    "main"
                );


            if (main) {

                const notice =
                    document.createElement(
                        "div"
                    );


                notice.className =
                    "notice";


                notice.innerHTML = `

                    <h2>
                        Unable to load products
                    </h2>


                    <p>
                        Please try again in a moment.
                    </p>

                `;


                main.prepend(
                    notice
                );

            }

        }

    }
);
