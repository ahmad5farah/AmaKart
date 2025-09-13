/* =======================
   Loading UX Hydration
   ======================= */
document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector("header.header");
  if (!header) return;

  // Replace skeletons with real UI
  const cartBtn = document.querySelector('[data-skeleton="cart"]');
  if (cartBtn) {
    cartBtn.outerHTML = `
      <button class="btn-modern icon-btn" id="cart-btn">
        <i class="fas fa-shopping-cart"></i>
      </button>
    `;
  }

  const userBtn = document.querySelector('[data-skeleton="user"]');
  if (userBtn) {
    userBtn.outerHTML = `
      <button class="btn-modern icon-btn" id="user-btn">
        <i class="fas fa-user"></i>
      </button>
    `;
  }

  const wishBtn = document.querySelector('[data-skeleton="wishlist"]');
  if (wishBtn) {
    wishBtn.outerHTML = `
      <button class="btn-modern icon-btn" id="wishlist-btn">
        <i class="fas fa-heart"></i>
      </button>
    `;
  }

  const search = document.querySelector('[data-skeleton="search"]');
  if (search) {
    search.outerHTML = `
      <input type="text" placeholder="Search products..." class="search-input" />
    `;
  }

  // Fade in header after hydration
  header.setAttribute("data-hydrating", "false");
});
