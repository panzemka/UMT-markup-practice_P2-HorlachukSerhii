(() => {
  "use strict";

  const API_BASE = "https://dummyjson.com";

  const grid = document.getElementById("catalog-grid");
  const statusEl = document.getElementById("catalog-status");
  const loadMoreBtn = document.getElementById("catalog-load-more");
  const searchInput = document.getElementById("catalog-search");
  const categorySelect = document.getElementById("catalog-category");
  const form = document.getElementById("catalog-form");

  if (!grid || !loadMoreBtn || !searchInput || !categorySelect) return;

  const state = {
    search: "",
    category: "",
    skip: 0,
    limit: 8,
    total: 0,
    loading: false,
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

  const cardTemplate = (product) => {
    const name = escapeHtml(product.title);
    const desc = escapeHtml(
      (product.description || "").length > 90
        ? `${product.description.slice(0, 90)}...`
        : product.description || "",
    );
    const image = escapeHtml(product.thumbnail || "");
    const price = Number(product.price || 0).toFixed(2);

    return `
      <li class="product-card" data-id="${product.id}">
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
          <button
            type="button"
            class="btn btn--block catalog-card__order"
            data-order-product="${name}"
          >
            Order Now
          </button>
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

  const updateLoadMoreVisibility = () => {
    const noMoreLeft = state.skip + state.limit >= state.total;
    loadMoreBtn.hidden = state.total === 0 || noMoreLeft;
  };

  const setLoadMoreLoading = (loading) => {
    loadMoreBtn.disabled = loading;
    loadMoreBtn.textContent = loading ? "Loading..." : "Load More";
  };

  const buildRequest = () => {
    const params = { limit: state.limit, skip: state.skip };
    if (state.search) {
      return { url: `${API_BASE}/products/search`, params: { ...params, q: state.search } };
    }
    if (state.category) {
      return {
        url: `${API_BASE}/products/category/${encodeURIComponent(state.category)}`,
        params,
      };
    }
    return { url: `${API_BASE}/products`, params };
  };

  const fetchProducts = async ({ reset }) => {
    if (state.loading) return;
    state.loading = true;
    setLoadMoreLoading(true);
    if (reset) setStatus("Loading products...", false);

    try {
      const { url, params } = buildRequest();
      const { data } = await axios.get(url, { params });
      const products = Array.isArray(data.products) ? data.products : [];

      state.total = Number(data.total) || 0;

      if (reset) grid.innerHTML = "";

      if (!products.length) {
        if (reset) {
          grid.insertAdjacentHTML(
            "beforeend",
            `<li class="catalog__empty">No products found. Try a different search or category.</li>`,
          );
        }
        setStatus(reset ? "No products found." : "No more products to load.", false);
      } else {
        grid.insertAdjacentHTML("beforeend", products.map(cardTemplate).join(""));
        setStatus(`Showing ${state.skip + products.length} of ${state.total} products.`, false);
      }

      updateLoadMoreVisibility();
    } catch (error) {
      setStatus(
        "Couldn't load the catalog right now. Please try again in a moment.",
        true,
      );
      loadMoreBtn.hidden = true;
    } finally {
      state.loading = false;
      setLoadMoreLoading(false);
    }
  };

  const populateCategories = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/products/categories`);
      const categories = Array.isArray(data) ? data : [];
      const html = categories
        .map((category) => {
          const slug = typeof category === "string" ? category : category.slug;
          const label = typeof category === "string" ? category : category.name;
          return `<option value="${escapeHtml(slug)}">${escapeHtml(label)}</option>`;
        })
        .join("");
      categorySelect.insertAdjacentHTML("beforeend", html);
    } catch (error) {}
  };

  const resetAndFetch = () => {
    state.skip = 0;
    fetchProducts({ reset: true });
  };

  searchInput.addEventListener(
    "input",
    debounce(() => {
      state.search = searchInput.value.trim();
      resetAndFetch();
    }, 400),
  );

  categorySelect.addEventListener("change", () => {
    state.category = categorySelect.value;
    resetAndFetch();
  });

  loadMoreBtn.addEventListener("click", () => {
    state.skip += state.limit;
    fetchProducts({ reset: false });
  });

  if (form) {
    form.addEventListener("submit", (event) => event.preventDefault());
  }

  populateCategories();
  fetchProducts({ reset: true });
})();
