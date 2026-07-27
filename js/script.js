(() => {
  "use strict";

  if (typeof AOS !== "undefined") {
    AOS.init({
      duration: 600,
      once: true,
      offset: 60,
    });
  }

  const nav = document.getElementById("nav");
  const burger = document.getElementById("burger");
  const navClose = document.getElementById("nav-close");
  const navLinks = nav ? nav.querySelectorAll("a") : [];

  const openMenu = () => {
    nav.classList.add("is-open");
    burger.setAttribute("aria-expanded", "true");
  };

  const closeMenu = () => {
    nav.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
  };

  if (burger && nav) {
    burger.addEventListener("click", openMenu);
  }

  if (navClose) {
    navClose.addEventListener("click", closeMenu);
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  const setupSlider = (sliderId, prevId, nextId, dotsId) => {
    const slider = document.getElementById(sliderId);
    const prevBtn = document.getElementById(prevId);
    const nextBtn = document.getElementById(nextId);
    const dots = dotsId
      ? document.querySelectorAll(`#${dotsId} .slider__dot`)
      : [];

    if (!slider) return;

    const scrollByCard = (direction) => {
      const card = slider.children[0];
      const gap = 24;
      const step = card
        ? card.getBoundingClientRect().width + gap
        : slider.clientWidth * 0.8;
      slider.scrollBy({ left: direction * step, behavior: "smooth" });
    };

    if (prevBtn) prevBtn.addEventListener("click", () => scrollByCard(-1));
    if (nextBtn) nextBtn.addEventListener("click", () => scrollByCard(1));

    if (dots.length) {
      dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
          const card = slider.children[index];
          if (card) {
            slider.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
          }
        });
      });

      slider.addEventListener("scroll", () => {
        let closest = 0;
        let minDistance = Infinity;
        Array.from(slider.children).forEach((child, index) => {
          const distance = Math.abs(child.offsetLeft - slider.scrollLeft);
          if (distance < minDistance) {
            minDistance = distance;
            closest = index;
          }
        });
        dots.forEach((dot, index) => {
          dot.classList.toggle("is-active", index === closest);
        });
      });
    }
  };

  setupSlider(
    "bestsellers-slider",
    "bestsellers-prev",
    "bestsellers-next",
    "bestsellers-dots",
  );
  setupSlider("feedback-slider", "feedback-prev", "feedback-next", null);
})();
