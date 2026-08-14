/* =========================================================
   TANVIXA V3 - PRODUCT PAGE
   FINAL STABLE VERSION
   ========================================================= */


/* =========================================================
   YOUTUBE URL CONVERTER
   ========================================================= */

function yt(url) {

    if (!url) return "";

    try {

        const x = new URL(url);

        let id =
            x.searchParams.get("v") ||
            x.pathname.split("/embed/")[1] ||
            (
                x.hostname.includes("youtu.be")
                    ? x.pathname.slice(1)
                    : ""
            );

        if (!id) return "";

        id = id.split(/[?&#]/)[0];

        return (
            "https://www.youtube.com/embed/" +
            encodeURIComponent(id)
        );

    } catch {

        return "";
    }
}


/* =========================================================
   LIST HELPER
   ========================================================= */

function list(id, items) {

    const element =
        document.getElementById(id);

    if (!element) return;

    element.innerHTML =
        (items || [])
            .map(item => `<li>${esc(item)}</li>`)
            .join("");
}


/* =========================================================
   FIND PRODUCT BY CODE
   ========================================================= */

function findProductByCode(code) {

    const normalized =
        String(code || "")
            .trim()
            .toUpperCase();

    if (!normalized) {
        return null;
    }

    return TVX.products.find(product =>
        String(product.code || "")
            .trim()
            .toUpperCase() === normalized
    ) || null;
}


/* =========================================================
   SHOW PRODUCT ERROR
   ========================================================= */

function showProductError(message) {

    const loading =
        document.getElementById("productLoading");

    const error =
        document.getElementById("productError");

    const app =
        document.getElementById("productApp");


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


/* =========================================================
   SET MAIN IMAGE
   ========================================================= */

function setMainImage(src, name) {

    const image =
        document.getElementById("mainPhoto");

    if (!image) return;

    image.src =
        src || "images/no-image.png";

    image.alt =
        name || "Tanvixa product";

    image.onerror = function () {

        this.onerror = null;

        this.src = "images/no-image.png";
    };
}


/* =========================================================
   PRODUCT RENDER
   ========================================================= */

function renderProduct(product) {

    const loading =
        document.getElementById("productLoading");

    const error =
        document.getElementById("productError");

    const app =
        document.getElementById("productApp");


    if (loading) {
        loading.hidden = true;
    }

    if (error) {
        error.hidden = true;
    }

    if (!product) {

        showProductError(
            "We could not find this product. Please check the product code."
        );

        return;
    }

    if (app) {
        app.hidden = false;
    }


    /* =====================================================
       BASIC INFORMATION
       ===================================================== */

    document.title =
        `${product.name} | Tanvixa`;


    const brand =
        document.getElementById("productBrand");

    if (brand) {
        brand.textContent =
            product.brand || "TECH GADGET";
    }


    const name =
        document.getElementById("productName");

    if (name) {
        name.textContent =
            product.name || product.code;
    }


    const rating =
        document.getElementById("productRating");

    if (rating) {

        rating.classList.remove("muted");

        if (product.rating) {

            rating.textContent =
                `★★★★★ ${product.rating}/5`;

        } else {

            rating.textContent =
                "Rating not provided";

            rating.classList.add("muted");
        }
    }


    const short =
        document.getElementById("productShort");

    if (short) {

        short.textContent =
            product.shortDescription ||
            "Explore product details, features, specifications and available buying options.";
    }


    /* =====================================================
       BREADCRUMB
       ===================================================== */

    const breadcrumb =
        document.getElementById("breadcrumb");

    if (breadcrumb) {

        breadcrumb.innerHTML = `
            <a href="index.html">
                Home
            </a>
            /

            <a
                href="category.html?category=${encodeURIComponent(product.category || "")}"
            >
                ${esc(product.category || "Gadgets")}
            </a>

            /

            ${esc(product.name)}
        `;
    }


    /* =====================================================
       IMAGE GALLERY
       ===================================================== */

    const imageList =
        Array.isArray(product.images) &&
        product.images.length
            ? product.images
            : [product.image || "images/no-image.png"];


    setMainImage(
        imageList[0],
        product.name
    );


    const thumbs =
        document.getElementById("thumbs");


    if (thumbs) {

        thumbs.innerHTML =
            imageList
                .map((src, index) => `
                    <button
                        type="button"
                        class="${index === 0 ? "active" : ""}"
                        data-src="${esc(src)}"
                    >
                        <img
                            src="${esc(src)}"
                            alt=""
                            loading="lazy"
                            onerror="this.onerror=null;this.src='images/no-image.png'"
                        >
                    </button>
                `)
                .join("");


        thumbs
            .querySelectorAll("button")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        setMainImage(
                            button.dataset.src,
                            product.name
                        );


                        thumbs
                            .querySelectorAll("button")
                            .forEach(item =>
                                item.classList.remove("active")
                            );


                        button.classList.add("active");
                    }
                );

            });
    }


    /* =====================================================
       AFFILIATE LINKS
       ===================================================== */

    const affiliate =
        product.affiliate || {};


    const topCtas =
        document.getElementById("topCtas");


    if (topCtas) {

        let html = "";


        if (affiliate.aliexpress) {

            html += `
                <a
                    class="cta pulse"
                    href="${esc(affiliate.aliexpress)}"
                    target="_blank"
                    rel="nofollow sponsored noopener"
                >
                    CHECK CURRENT PRICE ON ALIEXPRESS →
                </a>
            `;
        }


        if (affiliate.amazon) {

            html += `
                <a
                    class="cta amazon"
                    href="${esc(affiliate.amazon)}"
                    target="_blank"
                    rel="nofollow sponsored noopener"
                >
                    CHECK PRICE ON AMAZON →
                </a>
            `;
        }


        /*
          Backward compatibility:
          Your older products use "link"
          directly instead of affiliate.aliexpress.
        */

        if (
            !html &&
            product.link
        ) {

            html = `
                <a
                    class="cta pulse"
                    href="${esc(product.link)}"
                    target="_blank"
                    rel="nofollow sponsored noopener"
                >
                    CHECK CURRENT PRICE →
                </a>
            `;
        }


        topCtas.innerHTML = html;
    }


    /* =====================================================
       BENEFITS
       ===================================================== */

    const benefits =
        document.getElementById("benefits");


    if (benefits) {

        const items =
            Array.isArray(product.benefits) &&
            product.benefits.length
                ? product.benefits
                : product.features || [];


        benefits.innerHTML =
            items
                .slice(0, 4)
                .map((item, index) => {

                    const icons = [
                        "⚡",
                        "🔌",
                        "📱",
                        "✈️"
                    ];

                    return `
                        <div class="benefit">

                            <strong>
                                ${icons[index % icons.length]}
                                ${esc(item)}
                            </strong>

                            <span>
                                Key product detail
                            </span>

                        </div>
                    `;
                })
                .join("");
    }


    /* =====================================================
       OVERVIEW
       ===================================================== */

    const overview =
        document.getElementById("overview");


    if (overview) {

        if (
            Array.isArray(product.overview) &&
            product.overview.length
        ) {

            overview.innerHTML =
                product.overview
                    .map(item =>
                        `<p>${esc(item)}</p>`
                    )
                    .join("");

        } else if (product.description) {

            overview.innerHTML =
                String(product.description)
                    .split(/\n\s*\n/)
                    .map(item =>
                        `<p>${esc(item)}</p>`
                    )
                    .join("");

        } else {

            overview.innerHTML =
                "<p>Detailed overview has not been added yet.</p>";
        }
    }


    /* =====================================================
       FEATURES
       ===================================================== */

    list(
        "features",
        product.features || []
    );


    /* =====================================================
       VIDEO
       ===================================================== */

    const videoSection =
        document.getElementById("videoSection");

    const videoFrame =
        document.getElementById("videoFrame");

    const videoToggle =
        document.getElementById("videoToggle");

    const videoWrap =
        document.getElementById("videoWrap");


    const video =
        yt(product.video);


    if (
        video &&
        videoSection &&
        videoFrame
    ) {

        videoSection.hidden = false;

        videoFrame.src = video;


        if (videoToggle && videoWrap) {

            videoToggle.onclick = () => {

                videoWrap.classList.toggle("open");

            };
        }

    } else if (videoSection) {

        videoSection.hidden = true;
    }


    /* =====================================================
       SPECIFICATIONS
       ===================================================== */

    const specSection =
        document.getElementById("specSection");

    const specs =
        document.getElementById("specs");


    const specificationEntries =
        Object.entries(
            product.specifications || {}
        );


    if (
        specificationEntries.length &&
        specSection &&
        specs
    ) {

        specSection.hidden = false;


        specs.innerHTML =
            specificationEntries
                .map(([key, value]) => `
                    <tr>
                        <td>
                            ${esc(key)}
                        </td>

                        <td>
                            ${esc(value)}
                        </td>
                    </tr>
                `)
                .join("");

    } else if (specSection) {

        specSection.hidden = true;
    }


    /* =====================================================
       OPTIONAL SECTIONS
       ===================================================== */

    const optionalSections = [
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
    ];


    optionalSections.forEach(
        ([id, items, sectionId]) => {

            const section =
                document.getElementById(sectionId);


            if (
                Array.isArray(items) &&
                items.length
            ) {

                if (section) {
                    section.hidden = false;
                }

                list(id, items);

            } else {

                if (section) {
                    section.hidden = true;
                }
            }
        }
    );


    /* =====================================================
       PRODUCT CODE
       ===================================================== */

    const codeText =
        document.getElementById("productCodeText");


    if (codeText) {

        codeText.innerHTML = `
            Use
            <strong>
                ${esc(product.code)}
            </strong>
            to find this product again on Tanvixa.
        `;
    }


    /* =====================================================
       DISCLOSURE
       ===================================================== */

    const disclosure =
        document.getElementById("disclosure");


    if (disclosure) {

        disclosure.textContent =
            TVX.config?.affiliateDisclosure ||
            "Some links on this website may be affiliate links.";
    }


    /* =====================================================
       RELATED PRODUCTS
       ===================================================== */

    const related =
        document.getElementById("related");


    if (related) {

        const relatedProducts =
            TVX.products
                .filter(item =>
                    item.code !== product.code &&
                    (
                        item.category === product.category ||
                        item.brand === product.brand
                    )
                )
                .slice(0, 4);


        const fallback =
            TVX.products
                .filter(item =>
                    item.code !== product.code
                )
                .slice(0, 4);


        related.innerHTML =
            (
                relatedProducts.length
                    ? relatedProducts
                    : fallback
            )
                .map(card)
                .join("");
    }


    /* =====================================================
       LATEST PRODUCTS
       ===================================================== */

    const latest =
        document.getElementById("productLatest");


    if (latest) {

        latest.innerHTML =
            TVX.products
                .filter(item =>
                    item.code !== product.code
                )
                .slice()
                .reverse()
                .slice(0, 4)
                .map(card)
                .join("");
    }


    /* =====================================================
       STICKY CTA
       ===================================================== */

    const sticky =
        document.getElementById("stickyCta");


    const stickyButton =
        document.getElementById("stickyButton");


    const purchaseLink =
        affiliate.aliexpress ||
        affiliate.amazon ||
        product.link ||
        "";


    if (
        sticky &&
        stickyButton &&
        purchaseLink
    ) {

        sticky.hidden = false;


        const stickyName =
            document.getElementById("stickyName");

        const stickyCode =
            document.getElementById("stickyCode");


        if (stickyName) {
            stickyName.textContent =
                product.name;
        }


        if (stickyCode) {
            stickyCode.textContent =
                "Product Code: " +
                product.code;
        }


        stickyButton.href =
            purchaseLink;


        stickyButton.textContent =
            affiliate.aliexpress
                ? "CHECK CURRENT PRICE ON ALIEXPRESS →"
                : "CHECK CURRENT PRICE →";

    } else if (sticky) {

        sticky.hidden = true;
    }


    /* =====================================================
       SOCIAL SHARE
       ===================================================== */

    const currentUrl =
        window.location.href;


    const facebook =
        document.getElementById("facebookShare");

    const x =
        document.getElementById("xShare");

    const whatsapp =
        document.getElementById("whatsappShare");


    if (facebook) {

        facebook.href =
            "https://www.facebook.com/sharer/sharer.php?u=" +
            encodeURIComponent(currentUrl);
    }


    if (x) {

        x.href =
            "https://twitter.com/intent/tweet?url=" +
            encodeURIComponent(currentUrl) +
            "&text=" +
            encodeURIComponent(product.name);
    }


    if (whatsapp) {

        whatsapp.href =
            "https://wa.me/?text=" +
            encodeURIComponent(
                product.name +
                " " +
                currentUrl
            );
    }


    /* =====================================================
       COPY LINK
       ===================================================== */

    const copyButton =
        document.getElementById("copyLink");


    if (copyButton) {

        copyButton.onclick = async () => {

            try {

                await navigator.clipboard.writeText(
                    currentUrl
                );

                alert(
                    "Product link copied."
                );

            } catch {

                alert(
                    "Unable to copy the link."
                );
            }
        };
    }


    /* =====================================================
       NATIVE SHARE
       ===================================================== */

    const shareButton =
        document.getElementById("nativeShare");


    if (shareButton) {

        shareButton.onclick = async () => {

            try {

                if (navigator.share) {

                    await navigator.share({
                        title: product.name,
                        url: currentUrl
                    });

                } else {

                    await navigator.clipboard.writeText(
                        currentUrl
                    );

                    alert(
                        "Product link copied."
                    );
                }

            } catch (error) {

                if (
                    error?.name !==
                    "AbortError"
                ) {

                    console.error(
                        "Share failed:",
                        error
                    );
                }
            }
        };
    }
}


/* =========================================================
   PRODUCT PAGE INITIALIZATION
   IMPORTANT:
   NO setTimeout()
   NO ARTIFICIAL DELAY
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        try {

            /*
             * Wait for the EXACT same data promise
             * used by script.js.
             */

            await TVX.ready;


            /*
             * Now products.json is guaranteed
             * to be loaded.
             */

            const params =
                new URLSearchParams(
                    window.location.search
                );


            const code =
                params.get("code");


            if (!code) {

                showProductError(
                    "No product code was provided."
                );

                return;
            }


            const product =
                findProductByCode(code);


            if (!product) {

                showProductError(
                    `Product code "${code}" was not found.`
                );

                return;
            }


            renderProduct(product);


        } catch (error) {

            console.error(
                "Product page initialization failed:",
                error
            );


            showProductError(
                "We could not load the product database. Please try again."
            );
        }

    }
);
