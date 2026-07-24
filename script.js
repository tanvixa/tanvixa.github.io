/* =====================================================
   TANVIXA SMART GADGET FINDER

   SCRIPT.JS FINAL VERSION

   PART A

   Core System
   Product Loader
   Search
   Product Display
   Click Tracking

===================================================== */



/* ======================================
   GLOBAL VARIABLES
====================================== */


let products = [];

let productsLoaded = false;

let searchHistory = {};





/* ======================================
   LOAD PRODUCTS JSON
====================================== */


fetch("products.json")

.then(response => {


    if(!response.ok){

        throw new Error(
            "Products file not found"
        );

    }


    return response.json();


})


.then(data=>{


    products = data;


    productsLoaded = true;



    console.log(

        "Tanvixa Products Loaded:",
        products.length

    );





    const counter =

    document.getElementById(
        "totalProducts"
    );





    if(counter){

        counter.innerHTML =
        products.length + "+";

    }



})



.catch(error=>{


    console.error(
        error
    );



    const result =

    document.getElementById(
        "result"
    );




    if(result){


        result.innerHTML = `

        <div class="error-card">

        ❌ Unable to load products.

        </div>

        `;


    }



});









/* ======================================
   SEARCH PRODUCT
====================================== */


function searchProduct(){



    const input =

    document.getElementById(
        "productCode"
    );





    if(!input){

        return;

    }





    const code =

    input.value

    .trim()

    .toUpperCase();







    if(code===""){


        showMessage(
        "⚠️ Please enter a product code"
        );


        return;


    }






    if(!productsLoaded){



        showMessage(
        "⏳ Products are loading..."
        );


        return;


    }







    const product =


    products.find(item=>


        item.code.toUpperCase() === code


    );








    if(product){



        searchHistory[code] =

        (searchHistory[code] || 0)+1;





        displayProduct(product);



    }

    else{



        showMessage(

        "❌ Product Not Found. Please check the code."

        );


    }



}









/* ======================================
   DISPLAY PRODUCT
====================================== */


function displayProduct(product){



const result =

document.getElementById(
"result"
);





if(!result){

return;

}







let featuresHTML = "";






if(

product.features &&

product.features.length

){



featuresHTML = `


<div class="product-features">


<h3>
Features
</h3>


<ul>


${

product.features.map(feature=>

`<li>✔️ ${feature}</li>`

).join("")

}


</ul>


</div>


`;



}








let networkText =

product.network ||

"STORE";









result.innerHTML = `



<div class="product-card">



<div class="product-image">


<img

src="${product.image}"

alt="${product.name}"

loading="lazy"

onerror="this.src='images/no-image.png'"

>


</div>







<div class="product-info">



<h2>

${product.name}

</h2>






<div class="product-code">

Product Code:

<strong>

${product.code}

</strong>

</div>







<div class="product-description">

${formatDescription(product.description)}

</div>







${featuresHTML}







<a

href="${product.link}"

target="_blank"

class="buy-button"

onclick="trackProductClick('${product.code}')"

>

🛒 BUY FROM ${networkText}

</a>







<div class="affiliate-note">


Some links on this website may be affiliate links.
If you purchase through these links, Tanvixa may earn a commission at no extra cost to you.


</div>





</div>


</div>



`;



}









/* ======================================
   DESCRIPTION FORMAT
====================================== */


function formatDescription(text){



if(!text){

return "";

}



return text

.split("\n\n")

.map(p=>


`<p>${p}</p>`


)

.join("");



}









/* ======================================
   MESSAGE DISPLAY
====================================== */


function showMessage(message){



const result =

document.getElementById(
"result"
);





if(result){



result.innerHTML = `


<div class="message-card">


<h3>

${message}

</h3>


</div>


`;



}



}









/* ======================================
   CLICK TRACKING
====================================== */


function trackProductClick(code){



let clicks =


JSON.parse(

localStorage.getItem(

"tanvixaClicks"

)

)

|| {};







clicks[code] =

(clicks[code] || 0)+1;








localStorage.setItem(

"tanvixaClicks",

JSON.stringify(clicks)

);



}









/* ======================================
   ENTER KEY SEARCH
====================================== */


document.addEventListener(

"DOMContentLoaded",

()=>{



const input =

document.getElementById(

"productCode"

);





if(input){



input.addEventListener(

"keypress",

e=>{


if(e.key==="Enter"){


searchProduct();


}


}


);



}



}

);




// ===== END OF FINAL PART A =====

/* =====================================================
   TANVIXA SMART GADGET FINDER

   SCRIPT.JS FINAL VERSION

   PART B

   Homepage System
   Product Sections
   Categories
   Brands

===================================================== */




/* ======================================
   HOMEPAGE INITIALIZER
====================================== */


function initializeHomepage(){



    if(!productsLoaded){


        setTimeout(

            initializeHomepage,

            500

        );


        return;


    }






    loadFeaturedProducts();

    loadLatestProducts();

    loadTrendingProducts();

    loadDealsProducts();

    loadCategories();

    loadBrands();



}









/* ======================================
   PRODUCT SMALL CARD
====================================== */


function createProductCard(product){



return `



<div class="small-product-card">



<div class="small-product-image">


<img

src="${product.image}"

alt="${product.name}"

loading="lazy"

onerror="this.src='images/no-image.png'"

>


</div>







<div class="small-product-info">



<h3>

${product.name}

</h3>







<span class="small-code">

${product.code}

</span>







<a

href="javascript:void(0)"

class="view-button"

onclick="openProduct('${product.code}')"

>

View Details

</a>




</div>



</div>



`;



}









/* ======================================
   OPEN PRODUCT
====================================== */


function openProduct(code){



const input =

document.getElementById(

"productCode"

);






if(input){


input.value = code;


}






searchProduct();





window.scrollTo({


top:0,


behavior:"smooth"


});



}









/* ======================================
   FEATURED PRODUCTS
====================================== */


function loadFeaturedProducts(){



const container =

document.getElementById(

"featuredProducts"

);





if(!container){

return;

}







let featured =


products.filter(product=>


product.featured === true


);







if(featured.length===0){


featured = products.slice(0,6);


}







container.innerHTML =


featured

.map(product=>


createProductCard(product)


)

.join("");



}









/* ======================================
   LATEST PRODUCTS
====================================== */


function loadLatestProducts(){



const container =

document.getElementById(

"latestProducts"

);





if(!container){

return;

}







let latest =


[...products]

.reverse()

.slice(0,6);







container.innerHTML =


latest

.map(product=>


createProductCard(product)


)

.join("");



}









/* ======================================
   TRENDING PRODUCTS
====================================== */


function loadTrendingProducts(){



const container =

document.getElementById(

"trendingProducts"

);





if(!container){

return;

}








let trending =


products.filter(product=>


product.trending === true


);







if(trending.length===0){


trending = products.slice(5,11);


}







container.innerHTML =


trending

.map(product=>


createProductCard(product)


)

.join("");



}









/* ======================================
   DEAL PRODUCTS
====================================== */


function loadDealsProducts(){



const container =

document.getElementById(

"dealProducts"

);





if(!container){

return;

}







let deals =


products.filter(product=>


product.deal === true


);







if(deals.length===0){


deals = products.slice(10,16);


}







container.innerHTML =


deals

.map(product=>


createProductCard(product)


)

.join("");



}









/* ======================================
   CATEGORY SYSTEM
====================================== */


function loadCategories(){



const container =

document.getElementById(

"categoryContainer"

);





if(!container){

return;

}







let categories=[];







products.forEach(product=>{



let category =

product.category ||

detectCategory(product.name);






if(

!categories.includes(category)

){


categories.push(category);


}



});








container.innerHTML =


categories

.slice(0,12)

.map(category=>`



<div

class="category-card"

onclick="searchCategory('${category}')"

>


<h3>

${category}

</h3>



<p>

Explore Gadgets

</p>


</div>



`)

.join("");



}









/* ======================================
   CATEGORY SEARCH
====================================== */


function searchCategory(category){



const result =

document.getElementById(

"result"

);






let categoryProducts =


products.filter(product=>{


let productCategory =


product.category ||


detectCategory(product.name);





return productCategory===category;


});







if(result){



result.innerHTML =


categoryProducts

.map(product=>


createProductCard(product)


)

.join("");



}





window.scrollTo({


top:0,


behavior:"smooth"


});



}









/* ======================================
   CATEGORY DETECTOR
====================================== */


function detectCategory(name){



name =

name.toLowerCase();






if(name.includes("camera"))

return "Security Camera";






if(name.includes("watch"))

return "Smart Watch";






if(name.includes("lock"))

return "Smart Security";






if(name.includes("light"))

return "Smart Lighting";






if(name.includes("power bank"))

return "Power Bank";






if(name.includes("charger"))

return "Charger";






if(

name.includes("earbud")

||

name.includes("headphone")

)

return "Audio";







return "Smart Gadgets";



}









/* ======================================
   BRAND SYSTEM
====================================== */


function loadBrands(){



const container =

document.getElementById(

"brandContainer"

);





if(!container){

return;

}








let brands=[];







products.forEach(product=>{



let brand =

product.brand;






if(!brand){


brand =

product.name.split(" ")[0];


}







if(

!brands.includes(brand)

){


brands.push(brand);


}



});








container.innerHTML =


brands

.slice(0,12)

.map(brand=>`



<div class="brand-card">


<h3>

${brand}

</h3>


</div>



`)

.join("");



}








// ===== END OF FINAL PART B =====/* =====================================================
   TANVIXA SMART GADGET FINDER

   SCRIPT.JS FINAL VERSION

   PART C

   Guides
   Popular Products
   Optimization
   Final Initialization

===================================================== */





/* ======================================
   BUYING GUIDE SYSTEM
====================================== */


function loadBuyingGuides(){



const container =

document.getElementById(

"guideContainer"

);





if(!container){

return;

}






let guides=[];







products.forEach(product=>{



let category =


product.category ||


detectCategory(product.name);







if(

!guides.includes(category)

){


guides.push(category);


}



});








container.innerHTML =


guides

.slice(0,6)

.map(item=>`



<div class="guide-card">



<div class="guide-icon">

📖

</div>





<h3>

${item} Buying Guide

</h3>






<p>

Learn how to choose the right

${item.toLowerCase()}

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









/* ======================================
   POPULAR PRODUCTS SYSTEM
====================================== */


function loadPopularProducts(){



const container =

document.getElementById(

"popularProducts"

);





if(!container){

return;

}







let clicks =


JSON.parse(

localStorage.getItem(

"tanvixaClicks"

)

)

|| {};







let popular =


[...products]

.sort((a,b)=>{



let aClicks =

clicks[a.code] || 0;





let bClicks =

clicks[b.code] || 0;






return bClicks-aClicks;



})

.slice(0,6);







container.innerHTML =


popular

.map(product=>


createProductCard(product)


)

.join("");



}









/* ======================================
   NEWSLETTER SYSTEM
====================================== */


document.addEventListener(

"DOMContentLoaded",

()=>{



const form =


document.querySelector(

".newsletter-form"

);







if(form){



form.addEventListener(

"submit",

function(e){



e.preventDefault();






alert(

"✅ Thanks for joining Tanvixa Community!"

);






form.reset();




}



);



}



}

);









/* ======================================
   IMAGE FALLBACK SYSTEM
====================================== */


document.addEventListener(

"error",

function(event){



if(

event.target.tagName==="IMG"

){



event.target.src =

"images/no-image.png";



}



},

true

);









/* ======================================
   SMOOTH SCROLL SYSTEM
====================================== */


document.addEventListener(

"DOMContentLoaded",

()=>{



document

.querySelectorAll(

'a[href^="#"]'

)

.forEach(anchor=>{



anchor.addEventListener(

"click",

function(e){



const target =


document.querySelector(

this.getAttribute("href")

);







if(target){



e.preventDefault();





target.scrollIntoView({


behavior:"smooth"


});



}



}



);



});



}

);









/* ======================================
   KEYBOARD SEARCH SHORTCUT
====================================== */


document.addEventListener(

"keydown",

function(e){



if(e.key==="/"){



const search =


document.getElementById(

"productCode"

);







if(search){



e.preventDefault();



search.focus();



}



}



}

);









/* ======================================
   FINAL TANVIXA START
====================================== */


function startTanvixa(){



if(!productsLoaded){



setTimeout(

startTanvixa,

500

);



return;


}







initializeHomepage();






loadBuyingGuides();






loadPopularProducts();






console.log(

"🚀 Tanvixa System Ready"

);



}









document.addEventListener(

"DOMContentLoaded",

()=>{



setTimeout(

()=>{


startTanvixa();


},

800

);



}

);







// ===== END OF SCRIPT.JS FINAL VERSION =====
