window.dataLayer = window.dataLayer || [];

(function loadGtm(id) {
  if (!id || id.includes("XXXX")) return;
  window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtm.js?id=" + id;
  document.head.appendChild(script);
})(SHOP_CONFIG.gtmId);

const storage = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
  },
};

function getCart() {
  return storage.get("cart", []);
}

function saveCart(cart) {
  storage.set("cart", cart);
  renderCartCount();
}

function cartTotal(cart) {
  return round2(cart.reduce((sum, line) => sum + findProduct(line.id).price * line.quantity, 0));
}

function round2(x) {
  return Math.round(x * 100) / 100;
}

function money(x) {
  return "$" + x.toFixed(2);
}

function ga4Item(product, quantity, index) {
  return {
    item_id: product.id,
    item_name: product.name,
    item_category: product.category,
    price: product.price,
    quantity: quantity,
    index: index,
  };
}

function trackEcommerce(eventName, ecommerce) {
  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push({ event: eventName, ecommerce: ecommerce });
}

function cartEcommerce(cart) {
  return {
    currency: SHOP_CONFIG.currency,
    value: cartTotal(cart),
    items: cart.map((line, i) => ga4Item(findProduct(line.id), line.quantity, i)),
  };
}

function addToCart(productId, quantity) {
  const cart = getCart();
  const line = cart.find((l) => l.id === productId);
  if (line) line.quantity += quantity;
  else cart.push({ id: productId, quantity: quantity });
  saveCart(cart);

  const product = findProduct(productId);
  trackEcommerce("add_to_cart", {
    currency: SHOP_CONFIG.currency,
    value: round2(product.price * quantity),
    items: [ga4Item(product, quantity, 0)],
  });
  toast("«" + product.name + "» додано в кошик");
}

function toast(text) {
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2200);
}

function renderHeader() {
  document.querySelectorAll("[data-shop-name]").forEach((el) => (el.textContent = SHOP_CONFIG.shopName));
  renderCartCount();
}

function renderCartCount() {
  const count = getCart().reduce((n, l) => n + l.quantity, 0);
  document.querySelectorAll("[data-cart-count]").forEach((el) => (el.textContent = count));
}

function productCard(product) {
  return `
    <article class="card">
      <a class="card-link" href="product.html?id=${product.id}">
        <div class="thumb">${product.emoji}</div>
        <div class="card-category">${product.category}</div>
        <h3>${product.name}</h3>
      </a>
      <div class="card-footer">
        <span class="price">${money(product.price)}</span>
        <button class="btn" data-add="${product.id}">У кошик</button>
      </div>
    </article>`;
}

const pages = {
  catalog() {
    document.getElementById("catalog").innerHTML = PRODUCTS.map(productCard).join("");
    document.querySelectorAll("[data-add]").forEach((btn) =>
      btn.addEventListener("click", () => addToCart(btn.dataset.add, 1))
    );
    trackEcommerce("view_item_list", {
      item_list_id: "catalog",
      item_list_name: "Каталог",
      items: PRODUCTS.map((p, i) => ga4Item(p, 1, i)),
    });
  },

  product() {
    const id = new URLSearchParams(location.search).get("id");
    const product = findProduct(id) || PRODUCTS[0];
    document.title = product.name + " — " + SHOP_CONFIG.shopName;
    document.getElementById("product").innerHTML = `
      <div class="thumb thumb-large">${product.emoji}</div>
      <div class="product-info">
        <div class="card-category">${product.category}</div>
        <h1>${product.name}</h1>
        <p>${product.description}</p>
        <div class="price price-large">${money(product.price)}</div>
        <div class="buy-row">
          <input id="qty" type="number" min="1" max="10" value="1" aria-label="Кількість">
          <button class="btn" id="add">Додати в кошик</button>
        </div>
      </div>`;
    document.getElementById("add").addEventListener("click", () => {
      const qty = Math.max(1, Math.min(10, parseInt(document.getElementById("qty").value, 10) || 1));
      addToCart(product.id, qty);
    });
    trackEcommerce("view_item", {
      currency: SHOP_CONFIG.currency,
      value: product.price,
      items: [ga4Item(product, 1, 0)],
    });
  },

  cart() {
    const cart = getCart();
    const box = document.getElementById("cart");
    if (cart.length === 0) {
      box.innerHTML = `<p class="empty">Кошик порожній. <a href="index.html">Перейти до каталогу</a></p>`;
      return;
    }
    box.innerHTML = `
      <table class="cart-table">
        <thead><tr><th>Товар</th><th>Ціна</th><th>К-сть</th><th>Сума</th><th></th></tr></thead>
        <tbody>
          ${cart.map((line) => {
            const p = findProduct(line.id);
            return `<tr>
              <td>${p.emoji} ${p.name}</td>
              <td>${money(p.price)}</td>
              <td>${line.quantity}</td>
              <td>${money(round2(p.price * line.quantity))}</td>
              <td><button class="btn btn-ghost" data-remove="${p.id}">Видалити</button></td>
            </tr>`;
          }).join("")}
        </tbody>
      </table>
      <div class="cart-total">Разом: <strong>${money(cartTotal(cart))}</strong></div>
      <a class="btn btn-big" href="checkout.html">Оформити замовлення</a>`;

    box.querySelectorAll("[data-remove]").forEach((btn) =>
      btn.addEventListener("click", () => {
        const current = getCart();
        const line = current.find((l) => l.id === btn.dataset.remove);
        const product = findProduct(line.id);
        trackEcommerce("remove_from_cart", {
          currency: SHOP_CONFIG.currency,
          value: round2(product.price * line.quantity),
          items: [ga4Item(product, line.quantity, 0)],
        });
        saveCart(current.filter((l) => l.id !== line.id));
        pages.cart();
      })
    );
    trackEcommerce("view_cart", cartEcommerce(cart));
  },

  checkout() {
    const cart = getCart();
    if (cart.length === 0) {
      location.href = "cart.html";
      return;
    }
    document.getElementById("checkout-total").textContent = money(cartTotal(cart));
    trackEcommerce("begin_checkout", cartEcommerce(cart));

    document.getElementById("checkout-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const order = {
        transaction_id: "T-" + Date.now(),
        shipping_tier: document.querySelector("[name=shipping]:checked").value,
        payment_type: document.querySelector("[name=payment]:checked").value,
        ...cartEcommerce(cart),
      };
      storage.set("last_order", order);
      saveCart([]);
      location.href = "thankyou.html";
    });
  },

  thankyou() {
    const order = storage.get("last_order", null);
    const box = document.getElementById("thankyou");
    if (!order) {
      box.innerHTML = `<p class="empty">Замовлення не знайдено. <a href="index.html">До каталогу</a></p>`;
      return;
    }
    box.innerHTML = `
      <h1>Дякуємо за замовлення!</h1>
      <p>Номер замовлення: <strong>${order.transaction_id}</strong></p>
      <p>Сума: <strong>${money(order.value)}</strong></p>`;

    const tracked = storage.get("tracked_orders", []);
    if (tracked.includes(order.transaction_id)) return;
    trackEcommerce("purchase", {
      transaction_id: order.transaction_id,
      currency: order.currency,
      value: order.value,
      shipping: 0,
      tax: 0,
      items: order.items,
    });
    storage.set("tracked_orders", tracked.concat(order.transaction_id));
  },

  campaigns() {},
};

document.addEventListener("DOMContentLoaded", () => {
  renderHeader();
  const page = document.body.dataset.page;
  if (pages[page]) pages[page]();
});
