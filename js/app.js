const cards__container = document.querySelector(".cards-container");
const btn = document.querySelector("button");
const loading = document.querySelector(".lds-spinner");
const header = document.querySelector("header");
let skip_by_category = 0;

const API = "https://dummyjson.com";
let limit = 4;
let skip = 0;
let currentCategory = null;


function createCategoryElement(categories) {
    categories.forEach((category) => {
        const categoryEl = document.createElement("div");
        categoryEl.className = "categoryEl";
        categoryEl.innerHTML = `
            <span>${category.name}</span>
        `;

        categoryEl.addEventListener("click", () => {
            currentCategory = category;
            skip_by_category = 0;
            getByCategory(category.slug);
        });

        header.appendChild(categoryEl);
    });
}

function createCard(data) {
    data.products.forEach((product) => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <img src="${product.thumbnail}" alt="${product.title}">
            <h3>${product.title}</h3>
            <strong>$${product.price}</strong>
            <br>
            <button class="btn__buy">Buy now</button>
        `;
        cards__container.appendChild(card);
    });
}

async function fetchData(api) {
    try {
        loading.style.display = "flex";
        const response = await fetch(api);
        const res = await response.json();
        
        createCard(res);
    } catch (err) {
        console.error("Error fetching data:", err);
    } finally {
        loading.style.display = "none";
        btn.removeAttribute("disabled");
    }
}

async function fetchCategory() {
    try {
        const response = await fetch(`${API}/products/categories`);
        const categories = await response.json();
        createCategoryElement(categories);
    } catch (err) {
        console.error("Error fetching categories:", err);
    } finally {
        loading.style.display = "none";
    }
}


async function getByCategory(categoryName, isLoadMore = false) {
    try {
        if (!isLoadMore) {
            cards__container.innerHTML = ""; 
            skip_by_category = 0;
        }
        loading.style.display = "flex";

        const response = await fetch(`${API}/products/category/${categoryName}?limit=${limit}&skip=${skip_by_category}`);
        const res = await response.json();

        if (res.total <= skip_by_category + res.limit) {
            btn.style.display = "none";
        } else {
            btn.style.display = "block";
        }
        
        createCard(res);
        
    } catch (err) {
        console.error("Error fetching products by category:", err);
    } finally {
        loading.style.display = "none";
        btn.removeAttribute("disabled");
    }
}


fetchCategory();
fetchData(`${API}/products?limit=${limit}&skip=${skip}`);


function showMore() {
    
    loading.style.display = "flex";
    btn.setAttribute("disabled", true); 
    
    if (currentCategory) {
        skip_by_category += limit;
        getByCategory(currentCategory.slug, true);
    } else {
        skip += limit;
        fetchData(`${API}/products?limit=${limit}&skip=${skip}`);
    }
}

btn.addEventListener("click", showMore);
