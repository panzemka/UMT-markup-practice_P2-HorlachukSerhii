(() => {
  "use strict";

  const backdrop = document.getElementById("modal-backdrop");
  const closeBtn = document.getElementById("modal-close");
  const openTriggers = document.querySelectorAll("[data-modal-open]");
  const modalTitle = document.getElementById("modal-title");
  const modalSubtitle = document.getElementById("modal-subtitle");

  const orderForm = document.getElementById("order-form");
  const orderStatus = document.getElementById("order-form-status");

  const subscribeForm = document.getElementById("subscribe-form");
  const subscribeStatus = document.getElementById("subscribe-status");

  let lastFocused = null;

  const openModal = (productName) => {
    if (!backdrop) return;
    lastFocused = document.activeElement;
    if (modalTitle) {
      modalTitle.textContent = productName
        ? `Order "${productName}"`
        : "Request a Bouquet";
    }
    if (modalSubtitle) {
      modalSubtitle.textContent = productName
        ? `Tell us a bit more about your order and we'll confirm availability.`
        : `Tell us what you have in mind and we'll get back to you.`;
    }
    backdrop.classList.add("is-open");
    document.body.classList.add("no-scroll");
    const firstField = orderForm ? orderForm.querySelector("input, textarea") : null;
    if (firstField) firstField.focus();
  };

  const closeModal = () => {
    if (!backdrop) return;
    backdrop.classList.remove("is-open");
    document.body.classList.remove("no-scroll");
    if (orderStatus) {
      orderStatus.textContent = "";
      orderStatus.className = "order-form__status";
    }
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  };

  openTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      openModal(trigger.getAttribute("data-product") || "");
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  if (backdrop) {
    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop) closeModal();
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && backdrop && backdrop.classList.contains("is-open")) {
      closeModal();
    }
  });

  document.addEventListener("click", (event) => {
    const orderBtn = event.target.closest("[data-order-product]");
    if (orderBtn) {
      openModal(orderBtn.getAttribute("data-order-product") || "");
    }
  });

  if (orderForm) {
    orderForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const agree = document.getElementById("order-agree");
      if (agree && !agree.checked) {
        orderStatus.textContent = "Please agree to the licensing agreement.";
        orderStatus.className = "order-form__status order-form__status--error";
        return;
      }

      const submitBtn = orderForm.querySelector('[type="submit"]');
      const payload = {
        title: orderForm.name.value,
      };

      if (submitBtn) submitBtn.disabled = true;
      orderStatus.textContent = "Sending your request...";
      orderStatus.className = "order-form__status";

      try {
        await axios.post("https://dummyjson.com/products/add", payload);
        orderStatus.textContent = `Thanks, ${orderForm.name.value}! We received your request and will reach out soon.`;
        orderStatus.className = "order-form__status order-form__status--success";
        orderForm.reset();
      } catch (error) {
        orderStatus.textContent =
          "Something went wrong while sending your request. Please try again.";
        orderStatus.className = "order-form__status order-form__status--error";
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  if (subscribeForm) {
    subscribeForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const email = document.getElementById("subscribe-email");
      if (!email || !email.value) return;
      subscribeStatus.textContent = `Thanks! ${email.value} has been subscribed.`;
      subscribeForm.reset();
    });
  }
})();
