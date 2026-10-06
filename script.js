const products = [
  {
    id: "linen-throw",
    name: "Everyday Linen Throw",
    detail: "Belgian flax linen · Oat",
    price: 128,
    category: "Home",
    badge: "Bestseller",
    image: "photo-1600210492486-724fe5c67fb0",
    alt: "Soft neutral linen throw draped over a sofa",
  },
  {
    id: "stoneware-cup",
    name: "Sunday Stoneware Cup",
    detail: "Hand-thrown stoneware · Chalk",
    price: 38,
    category: "Objects",
    badge: "Handmade",
    image: "photo-1578749556568-bc2c40e68b61",
    alt: "Handmade ceramic cup in a soft neutral glaze",
  },
  {
    id: "market-tote",
    name: "The Market Tote",
    detail: "Recycled cotton canvas · Moss",
    price: 54,
    category: "Wear",
    badge: "Everyday",
    image: "photo-1590874103328-eac38a683ce7",
    alt: "Natural canvas tote bag with simple everyday essentials",
  },
  {
    id: "arc-vase",
    name: "Arc Bud Vase",
    detail: "Sculptural glass · Smoke",
    price: 62,
    category: "Objects",
    badge: "Small batch",
    image: "photo-1578500494198-246f612d3b3d",
    alt: "Sculptural glass bud vase in a muted smoky tone",
  },
  {
    id: "wool-cushion",
    name: "Cloud Wool Cushion",
    detail: "Recycled wool · Natural",
    price: 86,
    category: "Home",
    badge: "Thoughtfully made",
    image: "photo-1584100936595-c0654b55a2e2",
    alt: "Textured wool cushion in a calm, neutral living space",
  },
  {
    id: "incense-set",
    name: "Slow Morning Incense",
    detail: "Cedar, hinoki & a little quiet",
    price: 32,
    category: "Objects",
    badge: "A little ritual",
    image: "photo-1602874801007-bd458bb1b8b6",
    alt: "Incense and a simple ceramic holder on a wooden surface",
  },
];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
const productGrid = document.querySelector(".product-grid");
const filterButtons = [...document.querySelectorAll(".filter-button")];
const searchField = document.querySelector(".search-field");
const searchInput = searchField.querySelector("input");
const cart = new Map();
const favorites = new Set();
let activeCategory = "All";
let toastTimer;

function imageUrl(image, width = 800) {
  return `https://images.unsplash.com/${image}?auto=format&fit=crop&w=${width}&q=82`;
}

function renderProducts() {
  const query = searchInput.value.trim().toLowerCase();
  const visibleProducts = products.filter((product) => {
    const matchesCategory = activeCategory === "All" || product.category === activeCategory;
    const matchesSearch = `${product.name} ${product.detail} ${product.category}`.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  productGrid.innerHTML = visibleProducts
    .map(
      (product) => `
        <article class="product-card">
          <div class="product-image-wrap">
            <img class="product-image" src="${imageUrl(product.image)}" alt="${product.alt}" loading="lazy" />
            <span class="product-badge">${product.badge}</span>
            <button class="favorite-button" type="button" data-favorite="${product.id}" aria-label="${favorites.has(product.id) ? "Remove" : "Add"} ${product.name} ${favorites.has(product.id) ? "from" : "to"} favorites" aria-pressed="${favorites.has(product.id)}"><span aria-hidden="true">${favorites.has(product.id) ? "♥" : "♡"}</span></button>
            <button class="quick-add" type="button" data-add="${product.id}">Add to bag <span aria-hidden="true">+</span></button>
          </div>
          <div class="product-info">
            <div><p class="product-name">${product.name}</p><p class="product-detail">${product.detail}</p></div>
            <span class="product-price">${currency.format(product.price)}</span>
          </div>
        </article>`,
    )
    .join("");

  document.querySelector(".empty-state").hidden = visibleProducts.length > 0;
  document.querySelector(".result-count").textContent = query
    ? `${visibleProducts.length} ${visibleProducts.length === 1 ? "piece" : "pieces"}`
    : "";
}

function cartQuantity() {
  return [...cart.values()].reduce((total, item) => total + item.quantity, 0);
}

function updateCart() {
  const quantity = cartQuantity();
  const subtotal = [...cart.values()].reduce((total, item) => total + item.product.price * item.quantity, 0);
  document.querySelector(".bag-count").textContent = quantity;
  document.querySelector(".cart-heading-count").textContent = `(${quantity})`;
  document.querySelector(".cart-subtotal strong").textContent = currency.format(subtotal);
  document.querySelector(".cart-items").innerHTML = [...cart.values()]
    .map(
      ({ product, quantity: itemQuantity }) => `
        <article class="cart-item">
          <img src="${imageUrl(product.image, 240)}" alt="${product.alt}" />
          <div>
            <h3>${product.name}</h3>
            <p>${product.detail}</p>
            <div class="quantity-control" aria-label="Quantity for ${product.name}">
              <button type="button" data-quantity="${product.id}" data-change="-1" aria-label="Decrease quantity">−</button>
              <span>${itemQuantity}</span>
              <button type="button" data-quantity="${product.id}" data-change="1" aria-label="Increase quantity">+</button>
            </div>
          </div>
          <div class="cart-item-price">
            ${currency.format(product.price * itemQuantity)}
            <button type="button" class="remove-item" data-remove="${product.id}">Remove</button>
          </div>
        </article>`,
    )
    .join("");

  const isEmpty = quantity === 0;
  document.querySelector(".cart-empty").hidden = !isEmpty;
  document.querySelector(".cart-bottom").hidden = isEmpty;
  const remaining = Math.max(0, 100 - subtotal);
  document.querySelector(".shipping-progress p").textContent =
    remaining > 0 ? `You’re ${currency.format(remaining)} away from complimentary shipping.` : "You’ve got complimentary shipping. Lovely.";
  document.querySelector(".progress-track span").style.width = `${Math.min(100, (subtotal / 100) * 100)}%`;
  document.querySelector(".checkout-button").disabled = isEmpty;
}

function showToast(message) {
  const toast = document.querySelector(".toast");
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 2400);
}

function openCart() {
  const drawer = document.querySelector(".cart-drawer");
  drawer.classList.add("open");
  drawer.removeAttribute("inert");
  drawer.setAttribute("aria-hidden", "false");
  document.querySelector(".overlay").hidden = false;
  document.body.classList.add("drawer-open");
  document.querySelector(".bag-button").setAttribute("aria-expanded", "true");
  document.querySelector(".close-cart").focus();
}

function closeCart() {
  const drawer = document.querySelector(".cart-drawer");
  drawer.classList.remove("open");
  drawer.setAttribute("inert", "");
  drawer.setAttribute("aria-hidden", "true");
  document.querySelector(".overlay").hidden = true;
  document.body.classList.remove("drawer-open");
  document.querySelector(".bag-button").setAttribute("aria-expanded", "false");
  document.querySelector(".bag-button").focus();
}

productGrid.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add]");
  const favoriteButton = event.target.closest("[data-favorite]");
  if (addButton) {
    const product = products.find((item) => item.id === addButton.dataset.add);
    const current = cart.get(product.id);
    cart.set(product.id, { product, quantity: (current?.quantity ?? 0) + 1 });
    updateCart();
    showToast(`${product.name} added to your bag`);
  }
  if (favoriteButton) {
    const id = favoriteButton.dataset.favorite;
    if (favorites.has(id)) favorites.delete(id);
    else favorites.add(id);
    renderProducts();
  }
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.category;
    filterButtons.forEach((filter) => {
      const isActive = filter === button;
      filter.classList.toggle("active", isActive);
      filter.setAttribute("aria-pressed", String(isActive));
    });
    renderProducts();
  });
});

document.querySelectorAll("[data-nav-category]").forEach((link) => {
  link.addEventListener("click", () => {
    activeCategory = link.dataset.navCategory;
    filterButtons.forEach((button) => {
      const isActive = button.dataset.category === activeCategory;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    renderProducts();
    document.querySelector(".main-nav").classList.remove("open");
    document.querySelector(".menu-toggle").setAttribute("aria-expanded", "false");
  });
});

document.querySelector(".search-toggle").addEventListener("click", () => {
  searchField.hidden = !searchField.hidden;
  if (!searchField.hidden) searchInput.focus();
  else {
    searchInput.value = "";
    renderProducts();
  }
});
searchInput.addEventListener("input", renderProducts);
document.querySelector(".clear-search").addEventListener("click", () => {
  searchInput.value = "";
  renderProducts();
  searchInput.focus();
});

document.querySelector(".bag-button").addEventListener("click", openCart);
document.querySelector(".close-cart").addEventListener("click", closeCart);
document.querySelector(".overlay").addEventListener("click", closeCart);
document.querySelector(".continue-shopping").addEventListener("click", closeCart);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && document.querySelector(".cart-drawer").classList.contains("open")) closeCart();
});

document.querySelector(".cart-items").addEventListener("click", (event) => {
  const removeButton = event.target.closest("[data-remove]");
  const quantityButton = event.target.closest("[data-quantity]");
  if (removeButton) cart.delete(removeButton.dataset.remove);
  if (quantityButton) {
    const id = quantityButton.dataset.quantity;
    const entry = cart.get(id);
    const quantity = entry.quantity + Number(quantityButton.dataset.change);
    if (quantity < 1) cart.delete(id);
    else cart.set(id, { ...entry, quantity });
  }
  updateCart();
});

document.querySelector(".checkout-button").addEventListener("click", () => {
  showToast("Checkout is coming soon. Thanks for stopping by!");
});

document.querySelector(".menu-toggle").addEventListener("click", (event) => {
  const menu = document.querySelector(".main-nav");
  const isOpen = menu.classList.toggle("open");
  event.currentTarget.setAttribute("aria-expanded", String(isOpen));
});

document.querySelector(".newsletter-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const emailInput = event.currentTarget.querySelector("input");
  showToast(`You’re on the list. See you soon, ${emailInput.value.trim()}!`);
  event.currentTarget.reset();
});

renderProducts();
updateCart();
