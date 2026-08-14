/* =====================================================
   TANVIXA SMART GADGET FINDER
   FINAL UNIFIED SCRIPT
   Version: 20260814

   ONE JAVASCRIPT FILE FOR:

   • Homepage
   • Product Search
   • Product Page
   • Categories
   • Brands
   • Featured Products
   • Latest Products
   • Trending Products
   • Deals
   • Buying Guides
   • Popular Products
   • Product Sharing
   • Recently Viewed
   • Click Tracking
===================================================== */


/* =====================================================
   GLOBAL VARIABLES
===================================================== */

let products = [];
let productsLoaded = false;
let currentProduct = null;
let productList = [];


/* =====================================================
   PRODUCTS JSON URL
===================================================== */

const PRODUCTS_URL =
    "./products.json?v=20260814";


/* =====================================================
   LOAD PRODUCTS
===================================================== */

async function loadProducts() {

    try {

        const response = await fetch(
            PRODUCTS_URL,
            {
                cache: "no-store"
            }
        );

        if (!response.ok) {

            throw new Error(
                "products.json could not be loaded"
            );

        }

        const data =
            await response.json();


        if (!Array.isArray(data)) {

            throw new Error(
                "products.json must contain an array"
            );

        }


        products = data;
        productList = data;
        productsLoaded = true;


        console.log(
            "✅ Tanvixa Products Loaded:",
            products.length
        );


        const counter =
            document.getElementById(
                "totalProducts"
            );


        if (counter) {

            counter.textContent =
                products.length + "+";

        }


        return true;


    } catch (error) {

        console.error(
            "❌ Products loading error:",
            error
        );


        productsLoaded = false;


        const result =
            document.getElementById(
                "result"
            );


        if (result) {

            result.innerHTML = `

                <div class="error-card">

                    ❌ Unable to load products.

                </div>

            `;

        }


        return false;

    }

}


/* =====================================================
   SEARCH PRODUCT
===================================================== */

async function searchProduct() {

    const input =
        document.getElementById(
            "productCode"
        );


    if (!input) {
        return;
    }


    const code =
        String(input.value || "")
            .trim()
            .toUpperCase();


    if (!code) {

        showMessage(
            "⚠️ Please enter a product code"
        );

        return;

    }


    if (!productsLoaded) {

        showMessage(
            "⏳ Loading products, please wait..."
        );


        const loaded =
            await loadProducts();


        if (!loaded) {
            return;
        }

    }


    const product =
        products.find(item => {

            if (!item || item.code == null) {
                return false;
            }


            return String(item.code)
                .trim()
                .toUpperCase()
                === code;

        });


    if (product) {

        window.location.href =
            "./product.html?code=" +
            encodeURIComponent(
                product.code
            );

    } else {

        showMessage(
            "❌ Product Not Found. Please check the code."
        );

    }

}


/* =====================================================
   SHOW MESSAGE
===================================================== */

function showMessage(message) {

    const result =
        document.getElementById(
            "result"
        );


    if (!result) {
        return;
    }


    result.innerHTML = `

        <div class="message-card">

            <h3>
                ${message}
            </h3>

        </div>

    `;

}


/* =====================================================
   CREATE PRODUCT CARD
===================================================== */

function createProductCard(product) {

    const image =
        getProductImage(product);


    return `

        <div class="small-product-card">

            <div class="small-product-image">

                <img
                    src="${image}"
                    alt="${escapeHTML(product.name || "Product")}"
                    loading="lazy"
                    onerror="this.src='images/no-image.png'"
                >

            </div>


            <div class="small-product-info">

                <h3>
                    ${escapeHTML(product.name || "Product")}
                </h3>


                <span class="small-code">
                    ${escapeHTML(product.code || "")}
                </span>


                <a
                    href="./product.html?code=${encodeURIComponent(product.code || "")}"
                    class="view-button"
                >
                    View Details
                </a>

            </div>

        </div>

    `;

}


/* =====================================================
   PRODUCT IMAGE HELPER
===================================================== */

function getProductImage(product) {

    if (
        product &&
        Array.isArray(product.images) &&
        product.images.length
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


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =====================================================
   FEATURED PRODUCTS
===================================================== */

function loadFeaturedProducts() {

    const container =
        document.getElementById(
            "featuredProducts"
        );


    if (!container) {
        return;
    }


    let featured =
        products.filter(
            product =>
                product.featured === true
        );


    if (!featured.length) {

        featured =
            products.slice(0, 6);

    }


    container.innerHTML =
        featured
            .map(createProductCard)
            .join("");

}


/* =====================================================
   LATEST PRODUCTS
===================================================== */

function loadLatestProducts() {

    const container =
        document.getElementById(
            "latestProducts"
        );


    if (!container) {
        return;
    }


    const latest =
        [...products]
            .reverse()
            .slice(0, 6);


    container.innerHTML =
        latest
            .map(createProductCard)
            .join("");

}


/* =====================================================
   TRENDING PRODUCTS
===================================================== */

function loadTrendingProducts() {

    const container =
        document.getElementById(
            "trendingProducts"
        );


    if (!container) {
        return;
    }


    let trending =
        products.filter(
            product =>
                product.trending === true
        );


    if (!trending.length) {

        trending =
            products.slice(5, 11);

    }


    container.innerHTML =
        trending
            .map(createProductCard)
            .join("");

}


/* =====================================================
   DEAL PRODUCTS
===================================================== */

function loadDealsProducts() {

    const container =
        document.getElementById(
            "dealProducts"
        );


    if (!container) {
        return;
    }


    let deals =
        products.filter(
            product =>
                product.deal === true
        );


    if (!deals.length) {

        deals =
            products.slice(10, 16);

    }


    container.innerHTML =
        deals
            .map(createProductCard)
            .join("");

}


/* =====================================================
   CATEGORY DETECTOR
===================================================== */

function detectCategory(name) {

    name =
        String(name || "")
            .toLowerCase();


    if (name.includes("camera"))
        return "Security Camera";


    if (name.includes("watch"))
        return "Smart Watch";


    if (name.includes("lock"))
        return "Smart Security";


    if (name.includes("light"))
        return "Smart Lighting";


    if (name.includes("power bank"))
        return "Power Bank";


    if (name.includes("charger"))
        return "Charger";


    if (
        name.includes("earbud") ||
        name.includes("headphone")
    )
        return "Audio";


    return "Smart Gadgets";

}


/* =====================================================
   CATEGORY SYSTEM
===================================================== */

function loadCategories() {

    const container =
        document.getElementById(
            "categoryContainer"
        );


    if (!container) {
        return;
    }


    const categories = [];


    products.forEach(product => {

        const category =
            product.category ||
            detectCategory(product.name);


        if (
            !categories.includes(category)
        ) {

            categories.push(category);

        }

    });


    container.innerHTML =
        categories
            .slice(0, 12)
            .map(category => `

                <div
                    class="category-card"
                    onclick="searchCategory('${escapeHTML(category)}')"
                >

                    <h3>
                        ${escapeHTML(category)}
                    </h3>

                    <p>
                        Explore Gadgets
                    </p>

                </div>

            `)
            .join("");

}


/* =====================================================
   CATEGORY SEARCH
===================================================== */

function searchCategory(category) {

    const result =
        document.getElementById(
            "result"
        );


    const categoryProducts =
        products.filter(product => {

            const productCategory =
                product.category ||
                detectCategory(product.name);


            return productCategory === category;

        });


    if (result) {

        result.innerHTML =
            categoryProducts
                .map(createProductCard)
                .join("");

    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =====================================================
   BRAND SYSTEM
===================================================== */

function loadBrands() {

    const container =
        document.getElementById(
            "brandContainer"
        );


    if (!container) {
        return;
    }


    const brands = [];


    products.forEach(product => {

        let brand =
            product.brand;


        if (!brand) {

            brand =
                String(product.name || "")
                    .split(" ")[0];

        }


        if (
            brand &&
            !brands.includes(brand)
        ) {

            brands.push(brand);

        }

    });


    container.innerHTML =
        brands
            .slice(0, 12)
            .map(brand => `

                <div class="brand-card">

                    <h3>
                        ${escapeHTML(brand)}
                    </h3>

                </div>

            `)
            .join("");

}


/* =====================================================
   BUYING GUIDES
===================================================== */

function loadBuyingGuides() {

    const container =
        document.getElementById(
            "guideContainer"
        );


    if (!container) {
        return;
    }


    const guides = [];


    products.forEach(product => {

        const category =
            product.category ||
            detectCategory(product.name);


        if (
            !guides.includes(category)
        ) {

            guides.push(category);

        }

    });


    container.innerHTML =
        guides
            .slice(0, 6)
            .map(category => `

                <div class="guide-card">

                    <div class="guide-icon">
                        📖
                    </div>

                    <h3>
                        ${escapeHTML(category)}
                        Buying Guide
                    </h3>

                    <p>
                        Learn how to choose the right
                        ${escapeHTML(category.toLowerCase())}
                        before buying.
                    </p>

                    <a
                        href="#"
                        onclick="return false;"
                    >
                        Read Guide
                    </a>

                </div>

            `)
            .join("");

}


/* =====================================================
   POPULAR PRODUCTS
===================================================== */

function loadPopularProducts() {

    const container =
        document.getElementById(
            "popularProducts"
        );


    if (!container) {
        return;
    }


    let clicks = {};


    try {

        clicks =
            JSON.parse(
                localStorage.getItem(
                    "tanvixaClicks"
                )
            ) || {};

    } catch {

        clicks = {};

    }


    const popular =
        [...products]
            .sort((a, b) => {

                const aClicks =
                    clicks[a.code] || 0;

                const bClicks =
                    clicks[b.code] || 0;

                return bClicks - aClicks;

            })
            .slice(0, 6);


    container.innerHTML =
        popular
            .map(createProductCard)
            .join("");

}


/* =====================================================
   PRODUCT CLICK TRACKING
===================================================== */

function trackProductClick(code) {

    let clicks = {};


    try {

        clicks =
            JSON.parse(
                localStorage.getItem(
                    "tanvixaClicks"
                )
            ) || {};

    } catch {

        clicks = {};

    }


    clicks[code] =
        (clicks[code] || 0) + 1;


    localStorage.setItem(
        "tanvixaClicks",
        JSON.stringify(clicks)
    );

}


/* =====================================================
   PRODUCT PAGE
===================================================== */

function isProductPage() {

    return (
        window.location.pathname
            .toLowerCase()
            .endsWith("product.html")
    );

}


/* =====================================================
   GET PRODUCT CODE
===================================================== */

function getProductCode() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    return params.get("code");

}


/* =====================================================
   LOAD PRODUCT PAGE
===================================================== */

async function loadProductPage() {

    if (!isProductPage()) {
        return;
    }


    console.log(
        "🟢 Tanvixa Product Page System 20260814"
    );


    const code =
        getProductCode();


    if (!code) {

        showProductError(
            "No product code was provided."
        );

        return;

    }


    try {

        if (!productsLoaded) {

            const loaded =
                await loadProducts();


            if (!loaded) {

                showProductError(
                    "Unable to load product data."
                );

                return;

            }

        }


        const searchCode =
            String(code)
                .trim()
                .toUpperCase();


        currentProduct =
            products.find(product => {

                if (
                    !product ||
                    product.code == null
                ) {

                    return false;

                }


                return String(product.code)
                    .trim()
                    .toUpperCase()
                    === searchCode;

            });


        if (!currentProduct) {

            console.error(
                "❌ Product not found:",
                searchCode
            );


            console.log(
                "Available codes:",
                products.map(
                    product => product.code
                )
            );


            showProductError(
                "We could not find this product."
            );


            return;

        }


        console.log(
            "✅ Product Found:",
            currentProduct.code
        );


        renderProduct();


    } catch (error) {

        console.error(
            "❌ Product Page Error:",
            error
        );


        showProductError(
            "Unable to load this product."
        );

    }

}


/* =====================================================
   PRODUCT ERROR
===================================================== */

function showProductError(message) {

    const name =
        document.getElementById(
            "productName"
        );


    if (name) {

        name.textContent =
            "Product Not Found";

    }


    const description =
        document.getElementById(
            "productDescription"
        );


    if (description) {

        description.innerHTML = `

            <p>
                ${escapeHTML(message)}
                Search again using a product code.
            </p>

        `;

    }


    const mainImage =
        document.getElementById(
            "mainImage"
        );


    if (mainImage) {

        mainImage.src =
            "images/no-image.png";

    }

}


/* =====================================================
   RENDER PRODUCT
===================================================== */

function renderProduct() {

    if (!currentProduct) {
        return;
    }


    document.title =
        currentProduct.name +
        " | Tanvixa";


    setText(
        "productName",
        currentProduct.name
    );


    setText(
        "productBrand",
        currentProduct.brand || "-"
    );


    setText(
        "productCategory",
        currentProduct.category ||
        detectCategory(
            currentProduct.name
        )
    );


    setLink(
        "buyButton",
        currentProduct.link
    );


    setLink(
        "bottomBuyButton",
        currentProduct.link
    );


    renderImages();

    renderDescription();

    renderFeatures();

    loadSpecifications();

    renderRelatedProducts();

    renderRecentlyViewed();

    updateSEO();

    setupShare();

    setupCopy();

    generateSchema();

    generateBreadcrumb();

}


/* =====================================================
   SET TEXT
===================================================== */

function setText(id, value) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value == null
                ? "-"
                : value;

    }

}


/* =====================================================
   SET LINK
===================================================== */

function setLink(id, url) {

    const element =
        document.getElementById(id);


    if (!element) {
        return;
    }


    if (url) {

        element.href = url;

    } else {

        element.href = "#";

    }

}


/* =====================================================
   RENDER IMAGES
===================================================== */

function renderImages() {

    const main =
        document.getElementById(
            "mainImage"
        );


    const thumbs =
        document.getElementById(
            "thumbnailContainer"
        );


    if (!main) {
        return;
    }


    let images = [];


    if (
        Array.isArray(
            currentProduct.images
        ) &&
        currentProduct.images.length
    ) {

        images =
            currentProduct.images;

    } else if (
        currentProduct.image
    ) {

        images = [
            currentProduct.image
        ];

    }


    if (!images.length) {

        main.src =
            "images/no-image.png";

        if (thumbs) {
            thumbs.innerHTML = "";
        }

        return;

    }


    main.src =
        images[0];


    main.alt =
        currentProduct.name;


    if (!thumbs) {
        return;
    }


    thumbs.innerHTML = "";


    images.forEach((imageURL, index) => {

        const image =
            document.createElement(
                "img"
            );


        image.src =
            imageURL;


        image.alt =
            currentProduct.name +
            " image " +
            (index + 1);


        image.loading =
            "lazy";


        image.onclick =
            function () {

                main.src =
                    imageURL;

            };


        image.onerror =
            function () {

                this.src =
                    "images/no-image.png";

            };


        thumbs.appendChild(
            image
        );

    });

}


/* =====================================================
   DESCRIPTION
===================================================== */

function renderDescription() {

    const box =
        document.getElementById(
            "productDescription"
        );


    if (!box) {
        return;
    }


    const description =
        currentProduct.description ||
        "Product information is currently unavailable.";


    box.innerHTML =
        String(description)
            .split(/\n\s*\n/)
            .map(paragraph => {

                return `
                    <p>
                        ${escapeHTML(paragraph)}
                    </p>
                `;

            })
            .join("");

}


/* =====================================================
   FEATURES
===================================================== */

function renderFeatures() {

    const list =
        document.getElementById(
            "productFeatures"
        );


    if (!list) {
        return;
    }


    list.innerHTML = "";


    const features =
        Array.isArray(
            currentProduct.features
        )
            ? currentProduct.features
            : [];


    features.forEach(feature => {

        const li =
            document.createElement(
                "li"
            );


        li.textContent =
            "✔️ " + feature;


        list.appendChild(
            li
        );

    });

}


/* =====================================================
   SPECIFICATIONS
===================================================== */

function loadSpecifications() {

    setText(
        "specBrand",
        currentProduct.brand || "-"
    );


    setText(
        "specModel",
        currentProduct.model ||
        currentProduct.code ||
        "-"
    );


    setText(
        "specCategory",
        currentProduct.category ||
        detectCategory(
            currentProduct.name
        )
    );

}


/* =====================================================
   RELATED PRODUCTS
===================================================== */

function renderRelatedProducts() {

    const box =
        document.getElementById(
            "relatedProducts"
        );


    if (!box) {
        return;
    }


    const currentCategory =
        currentProduct.category ||
        detectCategory(
            currentProduct.name
        );


    const related =
        productList
            .filter(product => {

                if (!product) {
                    return false;
                }


                const category =
                    product.category ||
                    detectCategory(
                        product.name
                    );


                return (
                    category ===
                    currentCategory
                ) &&
                (
                    String(product.code)
                        .toUpperCase() !==
                    String(currentProduct.code)
                        .toUpperCase()
                );

            })
            .slice(0, 4);


    box.innerHTML =
        related
            .map(product => {

                const image =
                    getProductImage(
                        product
                    );


                return `

                    <div class="related-card">

                        <img
                            src="${image}"
                            alt="${escapeHTML(product.name)}"
                            loading="lazy"
                            onerror="this.src='images/no-image.png'"
                        >

                        <h3>
                            ${escapeHTML(product.name)}
                        </h3>

                        <a
                            href="./product.html?code=${encodeURIComponent(product.code)}"
                        >
                            View Product
                        </a>

                    </div>

                `;

            })
            .join("");

}


/* =====================================================
   RECENTLY VIEWED
===================================================== */

function saveRecentlyViewed() {

    if (!currentProduct) {
        return;
    }


    let history = [];


    try {

        history =
            JSON.parse(
                localStorage.getItem(
                    "tanvixa_recent"
                )
            ) || [];

    } catch {

        history = [];

    }


    history =
        history.filter(
            product =>
                product.code !==
                currentProduct.code
        );


    history.unshift({

        code:
            currentProduct.code,

        name:
            currentProduct.name,

        image:
            getProductImage(
                currentProduct
            )

    });


    localStorage.setItem(
        "tanvixa_recent",
        JSON.stringify(
            history.slice(0, 6)
        )
    );

}


function renderRecentlyViewed() {

    const box =
        document.getElementById(
            "recentProducts"
        );


    if (!box) {
        return;
    }


    let history = [];


    try {

        history =
            JSON.parse(
                localStorage.getItem(
                    "tanvixa_recent"
                )
            ) || [];

    } catch {

        history = [];

    }


    box.innerHTML =
        history
            .filter(
                item =>
                    item.code !==
                    currentProduct.code
            )
            .slice(0, 6)
            .map(item => `

                <div class="recent-card">

                    <img
                        src="${item.image || "images/no-image.png"}"
                        alt="${escapeHTML(item.name)}"
                        loading="lazy"
                        onerror="this.src='images/no-image.png'"
                    >

                    <h3>
                        ${escapeHTML(item.name)}
                    </h3>

                    <a
                        href="./product.html?code=${encodeURIComponent(item.code)}"
                    >
                        View Product
                    </a>

                </div>

            `)
            .join("");

}


/* =====================================================
   SEO UPDATE
===================================================== */

function updateSEO() {

    if (!currentProduct) {
        return;
    }


    const description =
        String(
            currentProduct.description ||
            ""
        );


    const meta =
        document.querySelector(
            'meta[name="description"]'
        );


    if (meta) {

        meta.content =
            description.substring(
                0,
                155
            );

    }


    const ogTitle =
        document.querySelector(
            'meta[property="og:title"]'
        );


    if (ogTitle) {

        ogTitle.content =
            currentProduct.name;

    }


    const ogDescription =
        document.querySelector(
            'meta[property="og:description"]'
        );


    if (ogDescription) {

        ogDescription.content =
            description.substring(
                0,
                155
            );

    }


    const ogImage =
        document.querySelector(
            'meta[property="og:image"]'
        );


    if (ogImage) {

        ogImage.content =
            new URL(
                getProductImage(
                    currentProduct
                ),
                window.location.href
            ).href;

    }

}


/* =====================================================
   SHARE
===================================================== */

function setupShare() {

    if (!currentProduct) {
        return;
    }


    const url =
        encodeURIComponent(
            window.location.href
        );


    const title =
        encodeURIComponent(
            currentProduct.name
        );


    const facebook =
        document.getElementById(
            "shareFacebook"
        );


    if (facebook) {

        facebook.href =
            "https://www.facebook.com/sharer/sharer.php?u=" +
            url;

    }


    const x =
        document.getElementById(
            "shareX"
        );


    if (x) {

        x.href =
            "https://twitter.com/intent/tweet?text=" +
            title +
            "&url=" +
            url;

    }


    const pinterest =
        document.getElementById(
            "sharePinterest"
        );


    if (pinterest) {

        pinterest.href =
            "https://pinterest.com/pin/create/button/?url=" +
            url +
            "&description=" +
            title;

    }

}


/* =====================================================
   COPY LINK
===================================================== */

function setupCopy() {

    const button =
        document.getElementById(
            "copyProductLink"
        );


    if (!button) {
        return;
    }


    button.onclick =
        async function (event) {

            event.preventDefault();


            try {

                await navigator.clipboard.writeText(
                    window.location.href
                );


                button.textContent =
                    "✅ Copied";


            } catch {

                button.textContent =
                    "Copy failed";

            }


            setTimeout(
                function () {

                    button.textContent =
                        "Copy Link";

                },
                2000
            );

        };

}


/* =====================================================
   PRODUCT SCHEMA
===================================================== */

function generateSchema() {

    if (!currentProduct) {
        return;
    }


    const existing =
        document.getElementById(
            "tanvixa-product-schema"
        );


    if (existing) {
        existing.remove();
    }


    const script =
        document.createElement(
            "script"
        );


    script.id =
        "tanvixa-product-schema";


    script.type =
        "application/ld+json";


    script.textContent =
        JSON.stringify({

            "@context":
                "https://schema.org",

            "@type":
                "Product",

            "name":
                currentProduct.name,

            "image":
                Array.isArray(
                    currentProduct.images
                )
                    ? currentProduct.images
                    : [
                        getProductImage(
                            currentProduct
                        )
                    ],

            "description":
                currentProduct.description || "",

            "sku":
                currentProduct.code,

            "brand": {

                "@type":
                    "Brand",

                "name":
                    currentProduct.brand || "Unknown"

            }

        });


    document.head.appendChild(
        script
    );

}


/* =====================================================
   BREADCRUMB SCHEMA
===================================================== */

function generateBreadcrumb() {

    if (!currentProduct) {
        return;
    }


    const existing =
        document.getElementById(
            "tanvixa-breadcrumb-schema"
        );


    if (existing) {
        existing.remove();
    }


    const script =
        document.createElement(
            "script"
        );


    script.id =
        "tanvixa-breadcrumb-schema";


    script.type =
        "application/ld+json";


    script.textContent =
        JSON.stringify({

            "@context":
                "https://schema.org",

            "@type":
                "BreadcrumbList",

            "itemListElement": [

                {

                    "@type":
                        "ListItem",

                    "position":
                        1,

                    "name":
                        "Home",

                    "item":
                        "https://tanvixa.github.io/"

                },

                {

                    "@type":
                        "ListItem",

                    "position":
                        2,

                    "name":
                        currentProduct.name

                }

            ]

        });


    document.head.appendChild(
        script
    );

}


/* =====================================================
   HOMEPAGE INITIALIZER
===================================================== */

function initializeHomepage() {

    if (!productsLoaded) {
        return;
    }


    loadFeaturedProducts();

    loadLatestProducts();

    loadTrendingProducts();

    loadDealsProducts();

    loadCategories();

    loadBrands();

    loadBuyingGuides();

    loadPopularProducts();

}


/* =====================================================
   NEWSLETTER
===================================================== */

function initializeNewsletter() {

    const form =
        document.querySelector(
            ".newsletter-form"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            alert(
                "✅ Thanks for joining Tanvixa Community!"
            );


            form.reset();

        }
    );

}


/* =====================================================
   ENTER KEY SEARCH
===================================================== */

function initializeSearch() {

    const input =
        document.getElementById(
            "productCode"
        );


    if (!input) {
        return;
    }


    input.addEventListener(
        "keypress",
        function (event) {

            if (
                event.key ===
                "Enter"
            ) {

                searchProduct();

            }

        }
    );

}


/* =====================================================
   KEYBOARD SEARCH SHORTCUT
===================================================== */

function initializeKeyboardShortcut() {

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "/" &&
                !(
                    event.target.tagName ===
                    "INPUT" ||
                    event.target.tagName ===
                    "TEXTAREA"
                )
            ) {

                const search =
                    document.getElementById(
                        "productCode"
                    );


                if (search) {

                    event.preventDefault();

                    search.focus();

                }

            }

        }
    );

}


/* =====================================================
   IMAGE FALLBACK
===================================================== */

function initializeImageFallback() {

    document.addEventListener(
        "error",
        function (event) {

            if (
                event.target &&
                event.target.tagName ===
                "IMG"
            ) {

                if (
                    !event.target.src.includes(
                        "no-image.png"
                    )
                ) {

                    event.target.src =
                        "images/no-image.png";

                }

            }

        },
        true
    );

}


/* =====================================================
   SMOOTH ANCHOR SCROLL
===================================================== */

function initializeSmoothScroll() {

    document
        .querySelectorAll(
            'a[href^="#"]'
        )
        .forEach(anchor => {

            anchor.addEventListener(
                "click",
                function (event) {

                    const selector =
                        this.getAttribute(
                            "href"
                        );


                    if (
                        !selector ||
                        selector === "#"
                    ) {

                        return;

                    }


                    const target =
                        document.querySelector(
                            selector
                        );


                    if (target) {

                        event.preventDefault();


                        target.scrollIntoView({
                            behavior: "smooth"
                        });

                    }

                }
            );

        });

}


/* =====================================================
   START TANVIXA
===================================================== */

async function startTanvixa() {

    console.log(
        "🚀 Tanvixa System Starting..."
    );


    const loaded =
        await loadProducts();


    if (!loaded) {

        console.error(
            "❌ Tanvixa could not start because products.json failed."
        );

        return;

    }


    initializeSearch();

    initializeNewsletter();

    initializeKeyboardShortcut();

    initializeImageFallback();

    initializeSmoothScroll();


    if (isProductPage()) {

        await loadProductPage();

    } else {

        initializeHomepage();

    }


    console.log(
        "🚀 Tanvixa System Ready"
    );

}


/* =====================================================
   DOM READY
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        startTanvixa();

    }
);


/* =====================================================
   END OF TANVIXA FINAL SCRIPT
===================================================== */
