(() => {
  "use strict";

  const API_BASE = "http://localhost:3000";

  const grid = document.getElementById("catalog-grid");
  const statusEl = document.getElementById("catalog-status");
  const loadMoreBtn = document.getElementById("catalog-load-more");
  const searchInput = document.getElementById("catalog-search");
  const filterSelect = document.getElementById("catalog-filter");
  const form = document.getElementById("catalog-form");

  if (!grid || !loadMoreBtn || !searchInput || !filterSelect) return;

  const state = {
    search: "",
    filter: "",
    page: 0,
    perPage: 8,
    all: [],
    filtered: [],
    loaded: false,
  };

  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const debounce = (fn, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  const resolvePhotoUrl = (photoURL) => {
    if (!photoURL) return "";
    return /^https?:\/\//.test(photoURL) ? photoURL : `${API_BASE}${photoURL}`;
  };

  const cardTemplate = (bouquet) => {
    const name = escapeHtml(bouquet.title);
    const desc = escapeHtml(bouquet.description || "");
    const image = escapeHtml(resolvePhotoUrl(bouquet.photoURL));
    const price = Number(bouquet.price || 0).toFixed(2);
    const isFavorite = Boolean(bouquet.favorite);

    return `
      <li class="product-card" data-id="${bouquet.id}">
        <img
          class="product-card__image"
          src="${image}"
          alt="${name}"
          loading="lazy"
        />
        <div class="product-card__body">
          <span class="product-card__name">${name}</span>
          <p class="product-card__desc">${desc}</p>
          <span class="product-card__price">$${price}</span>
          <div class="catalog-card__actions">
            <button
              type="button"
              class="btn btn--block catalog-card__order"
              data-order-product="${name}"
            >
              Order Now
            </button>
            <button
              type="button"
              class="catalog-card__favorite${isFavorite ? " is-active" : ""}"
              data-favorite-toggle="${bouquet.id}"
              aria-pressed="${isFavorite}"
              aria-label="${isFavorite ? "Remove from favorites" : "Add to favorites"}"
            >
              &hearts;
            </button>
          </div>
        </div>
      </li>
    `;
  };

  const setStatus = (message, isError) => {
    statusEl.textContent = message;
    statusEl.className = isError
      ? "catalog__status catalog__status--error"
      : "catalog__status";
  };

  const applyFilters = () => {
    const search = state.search.toLowerCase();
    state.filtered = state.all.filter((bouquet) => {
      const matchesSearch =
        !search ||
        bouquet.title.toLowerCase().includes(search) ||
        (bouquet.description || "").toLowerCase().includes(search);
      const matchesFavorite = state.filter !== "favorite" || bouquet.favorite;
      return matchesSearch && matchesFavorite;
    });
  };

  const render = () => {
    const end = (state.page + 1) * state.perPage;
    const visible = state.filtered.slice(0, end);

    grid.innerHTML = "";

    if (!visible.length) {
      grid.insertAdjacentHTML(
        "beforeend",
        `<li class="catalog__empty">No bouquets found. Try a different search or filter.</li>`,
      );
      setStatus("No bouquets found.", false);
    } else {
      grid.insertAdjacentHTML("beforeend", visible.map(cardTemplate).join(""));
      setStatus(`Showing ${visible.length} of ${state.filtered.length} bouquets.`, false);
    }

    loadMoreBtn.hidden = state.filtered.length === 0 || end >= state.filtered.length;
  };

  const resetAndRender = () => {
    state.page = 0;
    applyFilters();
    render();
  };

  const fetchBouquets = async () => {
    setStatus("Loading bouquets...", false);
    try {
      const { data } = await axios.get(`${API_BASE}/api/bouquets`);
      state.all = Array.isArray(data) ? data : [];
      state.loaded = true;
      resetAndRender();
    } catch (error) {
      setStatus(
        "Couldn't load the catalog right now. Please try again in a moment.",
        true,
      );
      loadMoreBtn.hidden = true;
    }
  };

  const toggleFavorite = async (id, button) => {
    const bouquet = state.all.find((b) => b.id === id);
    if (!bouquet) return;

    const nextFavorite = !bouquet.favorite;
    button.disabled = true;

    try {
      const { data } = await axios.patch(`${API_BASE}/api/bouquets/${id}/favorite`, {
        favorite: nextFavorite,
      });
      bouquet.favorite = data.favorite;
      applyFilters();
      render();
    } catch (error) {
      button.disabled = false;
    }
  };

  searchInput.addEventListener(
    "input",
    debounce(() => {
      state.search = searchInput.value.trim();
      resetAndRender();
    }, 300),
  );

  filterSelect.addEventListener("change", () => {
    state.filter = filterSelect.value;
    resetAndRender();
  });

  loadMoreBtn.addEventListener("click", () => {
    state.page += 1;
    render();
  });

  grid.addEventListener("click", (event) => {
    const favoriteBtn = event.target.closest("[data-favorite-toggle]");
    if (favoriteBtn) {
      toggleFavorite(favoriteBtn.getAttribute("data-favorite-toggle"), favoriteBtn);
    }
  });

  if (form) {
    form.addEventListener("submit", (event) => event.preventDefault());
  }

  fetchBouquets();
})();
