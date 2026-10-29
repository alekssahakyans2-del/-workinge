const products = [
  { id: 1, name: "Lash Love Mascara", category: "eyes", categoryName: "Աչքերի դիմահարդարում", description: "Ծավալ և ընդգծված թարթիչներ՝ ամեն օր։", price: 4200, tag: "Սիրված", image: "https://images.unsplash.com/photo-1631214540242-5b7b2f2f5e54?auto=format&fit=crop&w=700&q=85" },
  { id: 2, name: "Soft Line Eyeliner", category: "eyes", categoryName: "Աչքերի դիմահարդարում", description: "Նուրբ կամ արտահայտիչ գծեր՝ քո ընտրությամբ։", price: 3500, tag: "Նոր", image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=700&q=85" },
  { id: 3, name: "Rose Nude Palette", category: "eyes", categoryName: "Աչքերի դիմահարդարում", description: "Նուրբ վարդագույն և բնական երանգներ։", price: 6900, tag: "Թրենդային", image: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=700&q=85" },
  { id: 4, name: "Velvet Matte Lipstick", category: "lips", categoryName: "Շրթունքների դիմահարդարում", description: "Թավշյա ավարտ և գեղեցիկ գույն։", price: 3900, tag: "Սիրված", image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=700&q=85" },
  { id: 5, name: "Glossy Kiss Lip Gloss", category: "lips", categoryName: "Շրթունքների դիմահարդարում", description: "Փայլուն, խոնավ և թեթև զգացողություն։", price: 3200, tag: "", image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=700&q=85" },
  { id: 6, name: "Peachy Cream Blush", category: "face", categoryName: "Դեմքի դիմահարդարում", description: "Թարմ, բնական գույն՝ վայրկյանների ընթացքում։", price: 4700, tag: "Նոր", image: "https://images.unsplash.com/photo-1599733589046-10c005739efb?auto=format&fit=crop&w=700&q=85" },
  { id: 7, name: "Dew Drop Highlighter", category: "face", categoryName: "Դեմքի դիմահարդարում", description: "Նուրբ փայլ՝ լուսավոր տեսքի համար։", price: 5100, tag: "", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=700&q=85" },
  { id: 8, name: "Cloud Soft Moisturizer", category: "care", categoryName: "Մաշկի խնամք", description: "Թեթև խոնավեցնող խնամք ամեն օրվա համար։", price: 5600, tag: "Խնամք", image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=700&q=85" }
];

// Փոխիր այս համարը քո WhatsApp համարով՝ միջազգային ձևաչափով, առանց + նշանի։
const WHATSAPP_NUMBER = "374XXXXXXXX";

const productGrid = document.querySelector("#product-grid");
const filterButtons = [...document.querySelectorAll(".filter")];
const searchInput = document.querySelector("#search-input");
const emptyState = document.querySelector("#empty-state");
const cartCount = document.querySelector("#cart-count");
const cartDrawer = document.querySelector("#cart-drawer");
const overlay = document.querySelector("#overlay");
const cartItems = document.querySelector("#cart-items");
const cartEmpty = document.querySelector("#cart-empty");
const cartTotal = document.querySelector("#cart-total");
const toast = document.querySelector("#toast");

let activeCategory = "all";
let cart = [];
let toastTimer;

const formatPrice = value => new Intl.NumberFormat("hy-AM").format(value) + " ֏";

function renderProducts() {
  const query = searchInput.value.trim().toLocaleLowerCase("hy-AM");
  const visible = products.filter(product => {
    const categoryMatch = activeCategory === "all" || product.category === activeCategory;
    const queryMatch = `${product.name} ${product.categoryName} ${product.description}`.toLocaleLowerCase("hy-AM").includes(query);
    return categoryMatch && queryMatch;
  });

  productGrid.innerHTML = visible.map(product => `
    <article class="product-card">
      <div class="product-image">
        ${product.tag ? `<span class="product-tag">${product.tag}</span>` : ""}
        <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.onerror=null;this.src='https://placehold.co/600x700/f6dce4/9d4e66?text=Luna+Beauty';">
      </div>
      <div class="product-info">
        <p class="product-category">${product.categoryName}</p>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <div class="product-bottom"><span class="product-price">${formatPrice(product.price)}</span><button class="add-button" data-add="${product.id}" aria-label="Ավելացնել ${product.name} զամբյուղում">+</button></div>
      </div>
    </article>
  `).join("");
  emptyState.hidden = visible.length > 0;
}

function addToCart(id) {
  const existing = cart.find(item => item.id === id);
  if (existing) existing.quantity += 1;
  else cart.push({ id, quantity: 1 });
  renderCart();
  showToast("Ավելացվեց զամբյուղում ♡");
}

function changeQuantity(id, delta) {
  const item = cart.find(row => row.id === id);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) cart = cart.filter(row => row.id !== id);
  renderCart();
}

function renderCart() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => {
    const product = products.find(product => product.id === item.id);
    return sum + product.price * item.quantity;
  }, 0);
  cartCount.textContent = totalItems;
  cartItems.innerHTML = cart.map(item => {
    const product = products.find(row => row.id === item.id);
    return `<div class="cart-line">
      <img src="${product.image}" alt="">
      <div><h3>${product.name}</h3><p>${formatPrice(product.price)}</p>
      <div class="quantity-controls"><button data-quantity="${product.id}" data-delta="-1" aria-label="Նվազեցնել">−</button><span>${item.quantity}</span><button data-quantity="${product.id}" data-delta="1" aria-label="Ավելացնել">+</button></div></div>
      <button class="remove-line" data-remove="${product.id}" aria-label="Հեռացնել ապրանքը">×</button>
    </div>`;
  }).join("");
  cartEmpty.hidden = cart.length > 0;
  cartTotal.textContent = formatPrice(total);
}

function openCart() {
  cartDrawer.hidden = false;
  overlay.hidden = false;
  document.body.style.overflow = "hidden";
  document.querySelector("#close-cart").focus();
}
function closeCart() {
  cartDrawer.hidden = true;
  overlay.hidden = true;
  document.body.style.overflow = "";
}
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2300);
}

filterButtons.forEach(button => button.addEventListener("click", () => {
  activeCategory = button.dataset.category;
  filterButtons.forEach(item => item.classList.toggle("active", item === button));
  renderProducts();
}));
searchInput.addEventListener("input", renderProducts);
productGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (button) addToCart(Number(button.dataset.add));
});
cartItems.addEventListener("click", event => {
  const quantityButton = event.target.closest("[data-quantity]");
  const removeButton = event.target.closest("[data-remove]");
  if (quantityButton) changeQuantity(Number(quantityButton.dataset.quantity), Number(quantityButton.dataset.delta));
  if (removeButton) {
    cart = cart.filter(item => item.id !== Number(removeButton.dataset.remove));
    renderCart();
  }
});
document.querySelector("#open-cart").addEventListener("click", openCart);
document.querySelector("#close-cart").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);
document.addEventListener("keydown", event => { if (event.key === "Escape") closeCart(); });

document.querySelector("#checkout-button").addEventListener("click", () => {
  if (!cart.length) {
    showToast("Նախ ավելացրու ապրանք զամբյուղում ♡");
    return;
  }
  if (WHATSAPP_NUMBER.includes("X")) {
    showToast("Պատվերի համար script.js-ում ավելացրու քո WhatsApp համարը։");
    return;
  }
  const lines = cart.map(item => {
    const product = products.find(row => row.id === item.id);
    return `• ${product.name} × ${item.quantity} — ${formatPrice(product.price * item.quantity)}`;
  });
  const total = cart.reduce((sum, item) => sum + products.find(p => p.id === item.id).price * item.quantity, 0);
  const message = `Բարև, ուզում եմ պատվիրել Luna Beauty-ից։\n\n${lines.join("\n")}\n\nԸնդհանուր՝ ${formatPrice(total)}`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
});

document.querySelector("#newsletter-form").addEventListener("submit", event => {
  event.preventDefault();
  document.querySelector("#newsletter-message").textContent = "Շնորհակալություն ♡ Այս ցուցադրական կայքում էլ. փոստը չի պահպանվում։";
  event.target.reset();
});
document.querySelector("#year").textContent = new Date().getFullYear();

renderProducts();
renderCart();
