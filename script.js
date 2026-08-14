/* =========================================================
   TANVIXA — UNIFIED PRODUCT SYSTEM
   FINAL SCRIPT.JS

   Supports:
   ✅ Product code search
   ✅ Product name search
   ✅ Brand search
   ✅ Category search
   ✅ Direct product URL
   ✅ Product page rendering
   ✅ Multiple product images
   ✅ Affiliate links
   ✅ Related products
   ✅ Recently viewed
   ✅ Product sharing
   ✅ Dynamic SEO
   ✅ Product Schema
   ✅ GitHub Pages
   ✅ One products.json request per page
========================================================= */

(() => {

    "use strict";


    /* =====================================================
       GLOBAL SETTINGS
    ===================================================== */

    const PRODUCTS_URL = "./products.json";

    const PRODUCT_PAGE = "product.html";

    const NO_IMAGE = "images/no-image.png";

    let products = [];

    let productsLoaded = false;

    let productsPromise = null;

    let currentProduct = null;



    /* =====================================================
       BASIC HELPERS
    ===================================================== */

    function byId(...ids) {

        for (const id of ids) {

            const element =
                document.getElementById(id);

            if (element) {

                return element;

            }

        }

        return null;

    }



    function text(value) {

        if (
            value === null ||
            value === undefined
        ) {

            return "";

        }

        return String(value);

    }



    function normalize(value) {

        return text(value)
            .trim()
            .replace(/\s+/g, " ")
            .toUpperCase();

    }



    function esc(value) {

        return text(value)

            .replace(/&/g, "&amp;")

            .replace(/</g, "&lt;")

            .replace(/>/g, "&gt;")

            .replace(/"/g, "&quot;")

            .replace(/'/g, "&#039;");

    }



    function setText(id, value) {

        const element =
            document.getElementById(id);

        if (element) {

            element.textContent =
                value ?? "";

        }

    }



    function safeArray(value) {

        return Array.isArray(value)
            ? value.filter(Boolean)
            : [];

    }



    /* =====================================================
       PRODUCT IMAGE SYSTEM
    ===================================================== */

    function getImages(product) {

        if (
            product &&
            Array.isArray(product.images) &&
            product.images.length > 0
        ) {

            const images =
                product.images

                    .map(item =>
                        text(item).trim()
                    )

                    .filter(Boolean);


            if (images.length > 0) {

                return images;

            }

        }


        if (
            product &&
            product.image
        ) {

            return [
                text(product.image).trim()
            ];

        }


        return [
            NO_IMAGE
        ];

    }



    /* =====================================================
       PRODUCT CATEGORY
    ===================================================== */

    function detectCategory(name) {

        const value =
            normalize(name);


        if (
            value.includes("CAMERA") ||
            value.includes("CCTV")
        ) {

            return "Security Camera";

        }


        if (
            value.includes("SMART WATCH") ||
            value.includes("WATCH")
        ) {

            return "Smart Watch";

        }


        if (
            value.includes("EARBUD") ||
            value.includes("HEADPHONE") ||
            value.includes("HEADSET")
        ) {

            return "Audio";

        }


        if (
            value.includes("CHARGER") ||
            value.includes("POWER BANK")
        ) {

            return "Charging";

        }


        if (
            value.includes("ROUTER") ||
            value.includes("WIFI")
        ) {

            return "Networking";

        }


        if (
            value.includes("KEYBOARD") ||
            value.includes("MOUSE")
        ) {

            return "Computer Accessories";

        }


        if (
            value.includes("PROJECTOR")
        ) {

            return "Projector";

        }


        if (
            value.includes("DRONE")
        ) {

            return "Drone";

        }


        if (
            value.includes("TABLET")
        ) {

            return "Tablet";

        }


        if (
            value.includes("PHONE") ||
            value.includes("SMARTPHONE")
        ) {

            return "Smartphone";

        }


        if (
            value.includes("LIGHT") ||
            value.includes("LAMP") ||
            value.includes("LED")
        ) {

            return "Smart Lighting";

        }


        if (
            value.includes("LOCK")
        ) {

            return "Smart Lock";

        }


        if (
            value.includes("VACUUM")
        ) {

            return "Home Appliances";

        }


        return "Smart Gadgets";

    }



    function getCategory(product) {

        if (
            product &&
            product.category
        ) {

            return text(
                product.category
            ).trim();

        }

        return detectCategory(
            product?.name
        );

    }



    /* =====================================================
       PRODUCT CODE
    ===================================================== */

    function getCode(product) {

        return normalize(
            product?.code
        );

    }



    /* =====================================================
       PRODUCT URL
    ===================================================== */

    function getProductPageUrl(code) {

        return (
            PRODUCT_PAGE +
            "?code=" +
            encodeURIComponent(
                text(code).trim()
            )
        );

    }



    function openProduct(code) {

        const cleanCode =
            text(code).trim();


        if (!cleanCode) {

            return;

        }


        window.location.href =
            getProductPageUrl(
                cleanCode
            );

    }



    window.openProduct =
        openProduct;



    /* =====================================================
       AFFILIATE LINK
    ===================================================== */

    function getAffiliateLink(product) {

        if (
            product &&
            product.affiliate &&
            typeof product.affiliate === "object"
        ) {

            if (
                product.affiliate.aliexpress
            ) {

                return product
                    .affiliate
                    .aliexpress;

            }


            if (
                product.affiliate.amazon
            ) {

                return product
                    .affiliate
                    .amazon;

            }


            for (
                const value
                of Object.values(
                    product.affiliate
                )
            ) {

                if (
                    typeof value === "string" &&
                    value.trim()
                ) {

                    return value.trim();

                }

            }

        }


        if (
            product &&
            product.link
        ) {

            return text(
                product.link
            ).trim();

        }


        return "";

    }



    /* =====================================================
       LOAD PRODUCTS.JSON
       IMPORTANT:
       ONLY ONE REQUEST PER PAGE
    ===================================================== */

    async function loadProducts() {

        if (productsLoaded) {

            return products;

        }


        if (productsPromise) {

            return productsPromise;

        }


        productsPromise = fetch(
            PRODUCTS_URL +
            "?v=20260814",
            {
                cache: "no-store"
            }
        )

        .then(response => {

            if (!response.ok) {

                throw new Error(
                    "products.json HTTP " +
                    response.status
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
                data.filter(
                    item =>
                        item &&
                        typeof item === "object"
                );


            productsLoaded =
                true;


            console.log(
                "✅ Tanvixa products loaded:",
                products.length
            );


            return products;

        })


        .catch(error => {

            productsPromise =
                null;


            console.error(
                "❌ products.json error:",
                error
            );


            throw error;

        });


        return productsPromise;

    }



    /* =====================================================
       FIND PRODUCT BY CODE
    ===================================================== */

    function findProductByCode(code) {

        const searchCode =
            normalize(code);


        if (!searchCode) {

            return null;

        }


        return products.find(
            product =>
                getCode(product) ===
                searchCode
        ) || null;

    }



    /* =====================================================
       SEARCH PRODUCTS
    ===================================================== */

    function searchProducts(query) {

        const search =
            normalize(query);


        if (!search) {

            return [];

        }


        /* Exact product code */

        const exact =
            findProductByCode(
                search
            );


        if (exact) {

            return [
                exact
            ];

        }


        /* Name / brand / category /
           description / features */

        return products.filter(
            product => {

                const fields = [

                    product.code,

                    product.name,

                    product.brand,

                    product.category,

                    product.description,

                    product.shortDescription,

                    ...safeArray(
                        product.features
                    )

                ];


                return fields.some(
                    value =>
                        normalize(
                            value
                        ).includes(search)
                );

            }
        );

    }



    /* =====================================================
       SEARCH ERROR
    ===================================================== */

    function showSearchMessage(message) {

        const result =
            byId(
                "result",
                "searchResult"
            );


        if (!result) {

            return;

        }


        result.innerHTML = `

            <div class="error-card">

                ${esc(message)}

            </div>

        `;

    }



    /* =====================================================
       SEARCH FUNCTION
    ===================================================== */

    async function searchProduct() {

        const input =
            byId(

                "productCode",

                "searchInput",

                "productSearch",

                "searchQuery"

            );


        if (!input) {

            return;

        }


        const query =
            text(
                input.value
            ).trim();


        if (!query) {

            showSearchMessage(
                "Please enter a product code, product name, brand or category."
            );


            input.focus();

            return;

        }


        try {

            await loadProducts();

        }

        catch {

            showSearchMessage(
                "Unable to load products. Please refresh the page and try again."
            );

            return;

        }


        const results =
            searchProducts(
                query
            );


        if (
            !results.length
        ) {

            showSearchMessage(
                `No product found for "${query}".`
            );

            return;

        }


        /*
         EXACT CODE
         → DIRECT PRODUCT PAGE
        */

        if (
            normalize(
                results[0].code
            ) ===
            normalize(query)
        ) {

            openProduct(
                results[0].code
            );

            return;

        }


        /*
         NAME / BRAND /
         CATEGORY
         → SEARCH RESULTS
        */

        renderSearchResults(
            results
        );

    }



    window.searchProduct =
        searchProduct;



    /* =====================================================
       SEARCH RESULTS
    ===================================================== */

    function renderSearchResults(
        results
    ) {

        const result =
            byId(
                "result",
                "searchResult"
            );


        if (!result) {

            return;

        }


        result.innerHTML = `

            <div class="search-results">

                <div class="search-results-header">

                    <strong>
                        ${
                            results.length
                        }
                        product${
                            results.length === 1
                                ? ""
                                : "s"
                        }
                        found
                    </strong>

                </div>


                ${
                    results
                        .map(
                            createProductCard
                        )
                        .join("")
                }

            </div>

        `;

    }



    /* =====================================================
       PRODUCT CARD
    ===================================================== */

    function createProductCard(
        product
    ) {

        const images =
            getImages(
                product
            );


        const image =
            images[0];


        const code =
            text(
                product.code
            );


        const name =
            text(
                product.name
            ) ||
            "Tanvixa Product";


        const brand =
            text(
                product.brand
            );


        const category =
            getCategory(
                product
            );


        const description =
            text(
                product.shortDescription
            ) ||
            text(
                product.description
            );


        return `

            <article class="product-card">

                <a
                    href="${esc(
                        getProductPageUrl(
                            code
                        )
                    )}"
                    class="product-card-link"
                    aria-label="View ${esc(
                        name
                    )}"
                >

                    <div class="product-image">

                        <img
                            src="${esc(
                                image
                            )}"
                            alt="${esc(
                                name
                            )}"
                            loading="lazy"
                            decoding="async"
                            onerror="
                                this.onerror=null;
                                this.src='${NO_IMAGE}';
                            "
                        >

                    </div>


                    <div class="product-card-content">

                        <div class="product-code">

                            ${esc(code)}

                        </div>


                        <h3>

                            ${esc(name)}

                        </h3>


                        ${
                            brand
                                ? `
                                    <p class="product-brand">
                                        ${esc(brand)}
                                    </p>
                                `
                                : ""
                        }


                        ${
                            category
                                ? `
                                    <p class="product-category">
                                        ${esc(category)}
                                    </p>
                                `
                                : ""
                        }


                        ${
                            description
                                ? `
                                    <p class="product-description">
                                        ${esc(
                                            description
                                        ).slice(
                                            0,
                                            180
                                        )}
                                    </p>
                                `
                                : ""
                        }


                        <span class="view-button">

                            View Product →

                        </span>


                    </div>

                </a>

            </article>

        `;

    }



    /* =====================================================
       CATEGORY SEARCH
    ===================================================== */

    function searchCategory(
        category
    ) {

        const wanted =
            normalize(
                category
            );


        const results =
            products.filter(
                product =>
                    normalize(
                        getCategory(
                            product
                        )
                    ) === wanted
            );


        renderSearchResults(
            results
        );


        const result =
            byId(
                "result",
                "searchResult"
            );


        if (result) {

            result.scrollIntoView({
                behavior:
                    "smooth",
                block:
                    "start"
            });

        }

    }



    window.searchCategory =
        searchCategory;



    /* =====================================================
       CATEGORY LIST
    ===================================================== */

    function loadCategories() {

        const container =
            document.getElementById(
                "categoryContainer"
            );


        if (!container) {

            return;

        }


        const categories =
            [];


        products.forEach(
            product => {

                const category =
                    getCategory(
                        product
                    );


                if (
                    category &&
                    !categories.includes(
                        category
                    )
                ) {

                    categories.push(
                        category
                    );

                }

            }
        );


        container.innerHTML =
            categories
                .slice(
                    0,
                    12
                )
                .map(
                    category => `

                        <button
                            type="button"
                            class="category-card"
                            data-category="${esc(
                                category
                            )}"
                        >

                            <h3>

                                ${esc(
                                    category
                                )}

                            </h3>


                            <p>
                                Explore Gadgets
                            </p>

                        </button>

                    `
                )
                .join("");


        container
            .querySelectorAll(
                "[data-category]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            searchCategory(
                                button.dataset.category
                            );

                        }
                    );

                }
            );

    }



    /* =====================================================
       HOMEPAGE PRODUCT SECTIONS
    ===================================================== */

    function renderSection(
        id,
        list
    ) {

        const container =
            document.getElementById(
                id
            );


        if (!container) {

            return;

        }


        container.innerHTML =
            list
                .map(
                    createProductCard
                )
                .join("");

    }



    function loadFeaturedProducts() {

        const featured =
            products.filter(
                product =>
                    product.featured ===
                    true
            );


        renderSection(
            "featuredProducts",
            featured.length
                ? featured.slice(
                    0,
                    6
                )
                : products.slice(
                    0,
                    6
                )
        );

    }



    function loadLatestProducts() {

        renderSection(
            "latestProducts",
            [
                ...products
            ]
                .reverse()
                .slice(
                    0,
                    6
                )
        );

    }



    function loadTrendingProducts() {

        const trending =
            products.filter(
                product =>
                    product.trending ===
                    true
            );


        renderSection(
            "trendingProducts",
            trending.length
                ? trending.slice(
                    0,
                    6
                )
                : products.slice(
                    0,
                    6
                )
        );

    }



    function loadDealProducts() {

        const deals =
            products.filter(
                product =>
                    product.deal ===
                    true
            );


        renderSection(
            "dealProducts",
            deals.length
                ? deals.slice(
                    0,
                    6
                )
                : products.slice(
                    0,
                    6
                )
        );

    }



    /* =====================================================
       PRODUCT PAGE CHECK
    ===================================================== */

    function isProductPage() {

        const path =
            window.location.pathname
                .toLowerCase();


        return (
            path.endsWith(
                "/product.html"
            ) ||
            path.endsWith(
                "product.html"
            )
        );

    }



    /* =====================================================
       GET URL CODE
    ===================================================== */

    function getProductCodeFromURL() {

        const params =
            new URLSearchParams(
                window.location.search
            );


        return text(
            params.get(
                "code"
            )
        ).trim();

    }



    /* =====================================================
       PRODUCT PAGE ERROR
    ===================================================== */

    function showProductPageError(
        message
    ) {

        document.title =
            "Product Not Found | Tanvixa";


        setText(
            "productName",
            "Product Not Found"
        );


        setText(
            "productBrand",
            "—"
        );


        setText(
            "productCategory",
            "—"
        );


        setText(
            "productDescription",
            message
        );


        setText(
            "specBrand",
            "—"
        );


        setText(
            "specModel",
            "—"
        );


        setText(
            "specCategory",
            "—"
        );


        const mainImage =
            document.getElementById(
                "mainImage"
            );


        if (mainImage) {

            mainImage.src =
                NO_IMAGE;

            mainImage.alt =
                "Product not found";

        }


        const buyButton =
            document.getElementById(
                "buyButton"
            );


        const bottomButton =
            document.getElementById(
                "bottomBuyButton"
            );


        if (buyButton) {

            buyButton.style.display =
                "none";

        }


        if (bottomButton) {

            bottomButton.style.display =
                "none";

        }

    }



    /* =====================================================
       PRODUCT PAGE IMAGE SYSTEM
    ===================================================== */

    function renderProductImages(
        product
    ) {

        const mainImage =
            document.getElementById(
                "mainImage"
            );


        const thumbnailContainer =
            document.getElementById(
                "thumbnailContainer"
            );


        const images =
            getImages(
                product
            );


        if (mainImage) {

            mainImage.src =
                images[0];

            mainImage.alt =
                text(
                    product.name
                ) ||
                "Product Image";


            mainImage.loading =
                "eager";


            mainImage.decoding =
                "async";


            mainImage.onerror =
                function() {

                    this.onerror =
                        null;

                    this.src =
                        NO_IMAGE;

                };

        }


        if (
            !thumbnailContainer
        ) {

            return;

        }


        if (
            images.length <= 1
        ) {

            thumbnailContainer.innerHTML =
                "";

            return;

        }


        thumbnailContainer.innerHTML =
            images
                .map(
                    (
                        image,
                        index
                    ) => `

                        <button
                            type="button"
                            class="${
                                index === 0
                                    ? "active"
                                    : ""
                            }"
                            data-image="${esc(
                                image
                            )}"
                            aria-label="View product image ${
                                index + 1
                            }"
                        >

                            <img
                                src="${esc(
                                    image
                                )}"
                                alt="${esc(
                                    product.name
                                )} thumbnail ${
                                    index + 1
                                }"
                                loading="lazy"
                                decoding="async"
                                onerror="
                                    this.onerror=null;
                                    this.src='${NO_IMAGE}';
                                "
                            >

                        </button>

                    `
                )
                .join("");


        thumbnailContainer
            .querySelectorAll(
                "button"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            if (
                                mainImage
                            ) {

                                mainImage.src =
                                    button.dataset.image;

                            }


                            thumbnailContainer
                                .querySelectorAll(
                                    "button"
                                )
                                .forEach(
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

                }
            );

    }



    /* =====================================================
       DESCRIPTION
    ===================================================== */

    function renderProductDescription(
        product
    ) {

        const box =
            document.getElementById(
                "productDescription"
            );


        if (!box) {

            return;

        }


        const description =
            text(
                product.description
            ) ||
            text(
                product.shortDescription
            ) ||
            "Product description is not available.";


        const paragraphs =
            description
                .split(
                    /\n\s*\n/
                );


        box.innerHTML =
            paragraphs
                .map(
                    paragraph => `

                        <p>

                            ${esc(
                                paragraph
                            ).replace(
                                /\n/g,
                                "<br>"
                            )}

                        </p>

                    `
                )
                .join("");

    }



    /* =====================================================
       FEATURES
    ===================================================== */

    function renderProductFeatures(
        product
    ) {

        const list =
            document.getElementById(
                "productFeatures"
            );


        if (!list) {

            return;

        }


        const features =
            safeArray(
                product.features
            );


        if (!features.length) {

            list.innerHTML = `
                <li>
                    Product features are not available.
                </li>
            `;

            return;

        }


        list.innerHTML =
            features
                .map(
                    feature => `

                        <li>

                            ${esc(
                                feature
                            )}

                        </li>

                    `
                )
                .join("");

    }



    /* =====================================================
       AFFILIATE BUTTONS
    ===================================================== */

    function renderAffiliateButtons(
        product
    ) {

        const link =
            getAffiliateLink(
                product
            );


        const buttons = [

            document.getElementById(
                "buyButton"
            ),

            document.getElementById(
                "bottomBuyButton"
            )

        ];


        buttons.forEach(
            button => {

                if (!button) {

                    return;

                }


                if (link) {

                    button.href =
                        link;

                    button.target =
                        "_blank";

                    button.rel =
                        "nofollow sponsored noopener";

                    button.style.display =
                        "";

                }

                else {

                    button.style.display =
                        "none";

                }

            }
        );

    }



    /* =====================================================
       SPECIFICATIONS
    ===================================================== */

    function renderSpecifications(
        product
    ) {

        const specifications =
            product.specifications;


        if (
            !specifications ||
            typeof specifications !==
                "object" ||
            Array.isArray(
                specifications
            )
        ) {

            return;

        }


        const table =
            document.getElementById(
                "specs"
            );


        const section =
            byId(
                "specSection",
                "specificationsSection"
            );


        if (section) {

            section.hidden =
                false;

        }


        if (!table) {

            return;

        }


        table.innerHTML =
            Object.entries(
                specifications
            )
            .map(
                (
                    [
                        key,
                        value
                    ]
                ) => `

                    <tr>

                        <td>

                            ${esc(
                                key
                            )}

                        </td>


                        <td>

                            ${esc(
                                value
                            )}

                        </td>

                    </tr>

                `
            )
            .join("");

    }



    /* =====================================================
       YOUTUBE
    ===================================================== */

    function getYoutubeEmbed(
        url
    ) {

        if (!url) {

            return "";

        }


        try {

            const youtube =
                new URL(
                    url
                );


            let id = "";


            if (
                youtube.hostname
                    .includes(
                        "youtu.be"
                    )
            ) {

                id =
                    youtube.pathname
                        .slice(
                            1
                        );

            }


            else if (
                youtube.searchParams
                    .get(
                        "v"
                    )
            ) {

                id =
                    youtube.searchParams
                        .get(
                            "v"
                        );

            }


            else if (
                youtube.pathname
                    .includes(
                        "/embed/"
                    )
            ) {

                id =
                    youtube.pathname
                        .split(
                            "/embed/"
                        )[1]
                        .split(
                            "/"
                        )[0];

            }


            else if (
                youtube.pathname
                    .includes(
                        "/shorts/"
                    )
            ) {

                id =
                    youtube.pathname
                        .split(
                            "/shorts/"
                        )[1]
                        .split(
                            "/"
                        )[0];

            }


            if (!id) {

                return "";

            }


            return (
                "https://www.youtube.com/embed/" +
                encodeURIComponent(
                    id
                )
            );

        }

        catch {

            return "";

        }

    }



    function renderProductVideo(
        product
    ) {

        const section =
            document.getElementById(
                "videoSection"
            );


        const frame =
            document.getElementById(
                "videoFrame"
            );


        const embed =
            getYoutubeEmbed(
                product.video
            );


        if (
            section &&
            frame &&
            embed
        ) {

            section.hidden =
                false;

            frame.src =
                embed;

        }

    }



    /* =====================================================
       RELATED PRODUCTS
    ===================================================== */

    function createRelatedCard(
        product
    ) {

        const image =
            getImages(
                product
            )[0];


        return `

            <article class="related-card">

                <a
                    href="${esc(
                        getProductPageUrl(
                            product.code
                        )
                    )}"
                >

                    <img
                        src="${esc(
                            image
                        )}"
                        alt="${esc(
                            product.name
                        )}"
                        loading="lazy"
                        decoding="async"
                        onerror="
                            this.onerror=null;
                            this.src='${NO_IMAGE}';
                        "
                    >


                    <h3>

                        ${esc(
                            product.name
                        )}

                    </h3>


                    <span>

                        View Product →

                    </span>

                </a>

            </article>

        `;

    }



    function renderRelatedProducts(
        product
    ) {

        const container =
            byId(
                "relatedProducts",
                "related"
            );


        if (!container) {

            return;

        }


        const currentCode =
            getCode(
                product
            );


        const currentCategory =
            normalize(
                getCategory(
                    product
                )
            );


        const currentBrand =
            normalize(
                product.brand
            );


        let related =
            products.filter(
                item => {

                    if (
                        getCode(
                            item
                        ) ===
                        currentCode
                    ) {

                        return false;

                    }


                    return (

                        normalize(
                            getCategory(
                                item
                            )
                        ) ===
                        currentCategory

                    ) ||

                    (

                        currentBrand &&
                        normalize(
                            item.brand
                        ) ===
                        currentBrand

                    );

                }
            )
            .slice(
                0,
                4
            );


        if (
            !related.length
        ) {

            related =
                products
                    .filter(
                        item =>
                            getCode(
                                item
                            ) !==
                            currentCode
                    )
                    .slice(
                        0,
                        4
                    );

        }


        container.innerHTML =
            related
                .map(
                    createRelatedCard
                )
                .join("");

    }



    /* =====================================================
       RECENTLY VIEWED
    ===================================================== */

    function renderRecentlyViewed(
        product
    ) {

        const container =
            byId(
                "recentProducts",
                "recent"
            );


        if (!container) {

            return;

        }


        const storageKey =
            "tanvixa_recent_products";


        let codes = [];


        try {

            codes =
                JSON.parse(
                    localStorage.getItem(
                        storageKey
                    ) ||
                    "[]"
                );

        }

        catch {

            codes =
                [];

        }


        if (
            !Array.isArray(
                codes
            )
        ) {

            codes =
                [];

        }


        const currentCode =
            getCode(
                product
            );


        const previousProducts =
            codes

                .map(
                    code =>
                        findProductByCode(
                            code
                        )
                )

                .filter(Boolean)

                .filter(
                    item =>
                        getCode(
                            item
                        ) !==
                        currentCode
                )

                .slice(
                    0,
                    4
                );


        container.innerHTML =
            previousProducts
                .map(
                    createRelatedCard
                )
                .join("");


        const newCodes = [

            currentCode,

            ...previousProducts.map(
                item =>
                    getCode(
                        item
                    )
            )

        ]

        .filter(Boolean);


        const uniqueCodes =
            [
                ...new Set(
                    newCodes
                )
            ]
            .slice(
                0,
                8
            );


        try {

            localStorage.setItem(
                storageKey,
                JSON.stringify(
                    uniqueCodes
                )
            );

        }

        catch {

            /* localStorage unavailable */

        }

    }



    /* =====================================================
       SHARE SYSTEM
    ===================================================== */

    function setupSharing(
        product
    ) {

        const url =
            window.location.href;


        const title =
            text(
                product.name
            ) ||
            "Tanvixa Product";


        const facebook =
            byId(
                "shareFacebook",
                "facebookShare"
            );


        if (facebook) {

            facebook.href =
                "https://www.facebook.com/sharer/sharer.php?u=" +
                encodeURIComponent(
                    url
                );

        }


        const x =
            byId(
                "shareX",
                "xShare"
            );


        if (x) {

            x.href =
                "https://twitter.com/intent/tweet?url=" +
                encodeURIComponent(
                    url
                ) +
                "&text=" +
                encodeURIComponent(
                    title
                );

        }


        const pinterest =
            document.getElementById(
                "sharePinterest"
            );


        if (pinterest) {

            pinterest.href =
                "https://pinterest.com/pin/create/button/?url=" +
                encodeURIComponent(
                    url
                ) +
                "&description=" +
                encodeURIComponent(
                    title
                );

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
            byId(
                "copyProductLink",
                "copyLink"
            );


        if (copy) {

            copy.onclick =
                async function(
                    event
                ) {

                    event.preventDefault();


                    try {

                        await navigator
                            .clipboard
                            .writeText(
                                url
                            );


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


        const nativeShare =
            document.getElementById(
                "nativeShare"
            );


        if (nativeShare) {

            nativeShare.onclick =
                async function(
                    event
                ) {

                    event.preventDefault();


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


                            return;

                        }

                        catch {

                            /* User cancelled */

                        }

                    }


                    try {

                        await navigator
                            .clipboard
                            .writeText(
                                url
                            );


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

    }



    /* =====================================================
       BREADCRUMB
    ===================================================== */

    function updateBreadcrumb(
        product
    ) {

        const breadcrumb =
            document.querySelector(
                ".breadcrumb"
            );


        if (!breadcrumb) {

            return;

        }


        breadcrumb.innerHTML = `

            <a href="index.html">

                Home

            </a>


            <span>

                &gt;

            </span>


            <span>

                ${esc(
                    getCategory(
                        product
                    )
                )}

            </span>


            <span>

                &gt;

            </span>


            <span>

                ${esc(
                    product.name
                )}

            </span>

        `;

    }



    /* =====================================================
       SEO META
    ===================================================== */

    function updateMeta(
        name,
        content
    ) {

        if (!content) {

            return;

        }


        let meta =
            document.querySelector(
                `meta[name="${name}"]`
            );


        if (!meta) {

            meta =
                document.createElement(
                    "meta"
                );


            meta.setAttribute(
                "name",
                name
            );


            document.head.appendChild(
                meta
            );

        }


        meta.setAttribute(
            "content",
            content
        );

    }



    function updateOG(
        property,
        content
    ) {

        if (!content) {

            return;

        }


        let meta =
            document.querySelector(
                `meta[property="${property}"]`
            );


        if (!meta) {

            meta =
                document.createElement(
                    "meta"
                );


            meta.setAttribute(
                "property",
                property
            );


            document.head.appendChild(
                meta
            );

        }


        meta.setAttribute(
            "content",
            content
        );

    }



    function setCanonical(
        url
    ) {

        let canonical =
            document.querySelector(
                'link[rel="canonical"]'
            );


        if (!canonical) {

            canonical =
                document.createElement(
                    "link"
                );


            canonical.rel =
                "canonical";


            document.head.appendChild(
                canonical
            );

        }


        canonical.href =
            url;

    }



    /* =====================================================
       PRODUCT SEO
    ===================================================== */

    function updateProductSEO(
        product
    ) {

        const name =
            text(
                product.name
            );


        const description =
            text(
                product.description
            ) ||
            text(
                product.shortDescription
            ) ||
            `Discover ${name} on Tanvixa.`;


        const url =
            window.location.href;


        const images =
            getImages(
                product
            );


        const image =
            new URL(
                images[0],
                window.location.href
            ).href;


        document.title =
            `${name} | Tanvixa`;


        updateMeta(
            "description",
            description.slice(
                0,
                155
            )
        );


        updateMeta(
            "keywords",
            [

                name,

                product.brand,

                getCategory(
                    product
                ),

                "smart gadgets",

                "tech gadgets",

                "Tanvixa"

            ]

            .filter(Boolean)

            .join(", ")

        );


        updateOG(
            "og:title",
            `${name} | Tanvixa`
        );


        updateOG(
            "og:description",
            description.slice(
                0,
                200
            )
        );


        updateOG(
            "og:image",
            image
        );


        updateOG(
            "og:url",
            url
        );


        updateMeta(
            "twitter:title",
            `${name} | Tanvixa`
        );


        updateMeta(
            "twitter:description",
            description.slice(
                0,
                200
            )
        );


        updateMeta(
            "twitter:image",
            image
        );


        setCanonical(
            url
        );

    }



    /* =====================================================
       PRODUCT STRUCTURED DATA
    ===================================================== */

    function generateProductSchema(
        product
    ) {

        const old =
            document.getElementById(
                "tanvixa-product-schema"
            );


        if (old) {

            old.remove();

        }


        const script =
            document.createElement(
                "script"
            );


        script.id =
            "tanvixa-product-schema";


        script.type =
            "application/ld+json";


        const images =
            getImages(
                product
            )
            .map(
                image =>
                    new URL(
                        image,
                        window.location.href
                    ).href
            );


        const schema = {

            "@context":
                "https://schema.org",

            "@type":
                "Product",

            name:
                text(
                    product.name
                ),

            image:
                images,

            description:
                text(
                    product.description
                ) ||
                text(
                    product.shortDescription
                ) ||
                "",

            sku:
                text(
                    product.code
                ),

            brand: {

                "@type":
                    "Brand",

                name:
                    text(
                        product.brand
                    ) ||
                    "Tanvixa"

            },

            category:
                getCategory(
                    product
                )

        };


        script.textContent =
            JSON.stringify(
                schema
            );


        document.head.appendChild(
            script
        );

    }



    /* =====================================================
       PRODUCT PAGE RENDER
    ===================================================== */

    function renderProductPage(
        product
    ) {

        currentProduct =
            product;


        setText(
            "productName",
            product.name
        );


        setText(
            "productBrand",
            product.brand ||
            "TECH GADGET"
        );


        setText(
            "productCategory",
            getCategory(
                product
            )
        );


        setText(
            "specBrand",
            product.brand ||
            "TECH GADGET"
        );


        setText(
            "specModel",
            product.model ||
            product.modelNumber ||
            product.code ||
            "Not specified"
        );


        setText(
            "specCategory",
            getCategory(
                product
            )
        );


        renderProductImages(
            product
        );


        renderProductDescription(
            product
        );


        renderProductFeatures(
            product
        );


        renderAffiliateButtons(
            product
        );


        renderSpecifications(
            product
        );


        renderProductVideo(
            product
        );


        renderRelatedProducts(
            product
        );


        renderRecentlyViewed(
            product
        );


        setupSharing(
            product
        );


        updateBreadcrumb(
            product
        );


        updateProductSEO(
            product
        );


        generateProductSchema(
            product
        );


        console.log(
            "✅ Product rendered:",
            product.code
        );

    }



    /* =====================================================
       PRODUCT PAGE INITIALIZATION
    ===================================================== */

    async function initProductPage() {

        if (
            !isProductPage()
        ) {

            return;

        }


        const code =
            getProductCodeFromURL();


        if (!code) {

            showProductPageError(
                "No product code was provided in the URL."
            );


            return;

        }


        try {

            await loadProducts();

        }

        catch {

            showProductPageError(
                "Unable to load products.json. Please refresh the page and try again."
            );


            return;

        }


        const product =
            findProductByCode(
                code
            );


        if (!product) {

            console.error(
                "❌ Product Not Found:",
                code
            );


            showProductPageError(
                `Product code "${code}" was not found in products.json.`
            );


            return;

        }


        renderProductPage(
            product
        );

    }



    /* =====================================================
       HOMEPAGE INITIALIZATION
    ===================================================== */

    async function initHomepage() {

        if (
            isProductPage()
        ) {

            return;

        }


        const hasHomepageElements =
            byId(

                "productCode",

                "searchInput",

                "result",

                "searchResult",

                "featuredProducts",

                "latestProducts",

                "categoryContainer"

            );


        if (
            !hasHomepageElements
        ) {

            return;

        }


        try {

            await loadProducts();

        }

        catch {

            showSearchMessage(
                "Unable to load products. Please refresh the page."
            );


            return;

        }


        loadFeaturedProducts();

        loadLatestProducts();

        loadTrendingProducts();

        loadDealProducts();

        loadCategories();

    }



    /* =====================================================
       SEARCH BUTTON + ENTER KEY
    ===================================================== */

    function setupSearchEvents() {

        const input =
            byId(

                "productCode",

                "searchInput",

                "productSearch",

                "searchQuery"

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


        if (input) {

            input.addEventListener(
                "keydown",
                event => {

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

    }



    /* =====================================================
       FINAL START
    ===================================================== */

    async function start() {

        console.log(
            "🚀 Tanvixa Product System Starting..."
        );


        setupSearchEvents();


        if (
            isProductPage()
        ) {

            await initProductPage();

        }

        else {

            await initHomepage();

        }


        console.log(
            "✅ Tanvixa Product System Ready"
        );

    }



    document.addEventListener(
        "DOMContentLoaded",
        start
    );


})();
