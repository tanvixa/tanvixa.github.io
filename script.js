let products = [];

fetch("products.json")
  .then(response => response.json())
  .then(data => {
    products = data;
  })
  .catch(error => {
    console.error("Error loading products:", error);
  });

function searchProduct() {

  const keyword = document
    .getElementById("searchInput")
    .value
    .trim()
    .toUpperCase();

  const result = document.getElementById("result");

  result.innerHTML = "";

  if (keyword === "") {
    result.innerHTML = `
      <div class="product">
        <h2>Please enter a product code.</h2>
      </div>
    `;
    return;
  }

  const found = products.find(
    product => product.code.toUpperCase() === keyword
  );

  if (!found) {
    result.innerHTML = `
      <div class="product">
        <h2>❌ Product Not Found</h2>
        <p>Please check the product code and try again.</p>
      </div>
    `;
    return;
  }

  const description = found.description.replace(/\n/g, "<br>");

  result.innerHTML = `
    <div class="product">

      <img
        class="product-image"
        src="${found.image}"
        alt="${found.name}"
      >

      <h2 class="product-title">
        ${found.name}
      </h2>

      <div class="product-description">
        ${description}
      </div>

      <a
        class="buy-btn"
        href="${found.link}"
        target="_blank"
        rel="noopener noreferrer"
      >
        🛒 BUY NOW
      </a>

    </div>
  `;
}
