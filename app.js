document.addEventListener("DOMContentLoaded", function () {
  const titleEl = document.querySelector("[data-route-title]");
  const subtitleEl = document.querySelector("[data-route-subtitle]");
  const navLinks = Array.from(document.querySelectorAll("[data-route-link]"));
  const navToggle = document.querySelector(".kn-nav__toggle");
  const nav = document.querySelector(".kn-nav");

  const ROUTE_TITLES = {
    "/": "Dashboard",
    "/dashboard": "Dashboard",
    "/saved": "Saved",
    "/digest": "Digest",
    "/settings": "Settings",
    "/proof": "Proof",
  };

  function getPathFromHash() {
    const hash = window.location.hash || "#/";
    const path = hash.replace(/^#/, "") || "/";
    return path;
  }

  function updateRoute() {
    const path = getPathFromHash();
    const pageTitle = ROUTE_TITLES[path] || "Dashboard";

    if (titleEl) {
      titleEl.textContent = pageTitle;
    }

    if (subtitleEl) {
      subtitleEl.textContent = "This section will be built in the next step.";
    }

    navLinks.forEach((link) => {
      const linkRoute = link.getAttribute("data-route-link");
      if (linkRoute === path || (path === "/" && link.hasAttribute("data-route-default"))) {
        link.classList.add("kn-nav__link--active");
      } else {
        link.classList.remove("kn-nav__link--active");
      }
    });
  }

  window.addEventListener("hashchange", updateRoute);

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      const isOpen = nav.classList.toggle("kn-nav--open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  // Initialize on first load
  updateRoute();
});

