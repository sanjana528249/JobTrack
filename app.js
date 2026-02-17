document.addEventListener("DOMContentLoaded", function () {
  const titleEl = document.querySelector("[data-route-title]");
  const subtitleEl = document.querySelector("[data-route-subtitle]");
  const headerEl = document.querySelector("[data-route-header]");
  const contentEl = document.querySelector("[data-route-content]");
  const navLinks = Array.from(document.querySelectorAll("[data-route-link]"));
  const navToggle = document.querySelector(".kn-nav__toggle");
  const nav = document.querySelector(".kn-nav");

  function getPathFromHash() {
    const hash = window.location.hash || "#/";
    const path = hash.replace(/^#/, "") || "/";
    return path;
  }

  function renderLandingPage() {
    if (headerEl) {
      headerEl.innerHTML = `
        <h1 class="kn-heading-xl">Stop Missing The Right Jobs.</h1>
        <p class="kn-text-md">
          Precision-matched job discovery delivered daily at 9AM.
        </p>
      `;
    }
    if (contentEl) {
      contentEl.innerHTML = `
        <div class="kn-landing">
          <div class="kn-landing__cta">
            <a href="#/settings" class="kn-button kn-button--primary">Start Tracking</a>
          </div>
        </div>
      `;
    }
  }

  function renderDashboard() {
    if (headerEl) {
      headerEl.innerHTML = `
        <h1 class="kn-heading-xl">Dashboard</h1>
        <p class="kn-text-md">
          Your matched job opportunities.
        </p>
      `;
    }
    if (contentEl) {
      contentEl.innerHTML = `
        <div class="kn-empty-state">
          <p class="kn-text-md kn-empty-state__text">
            No jobs yet. In the next step, you will load a realistic dataset.
          </p>
        </div>

        <section class="kn-verification">
          <h2 class="kn-verification__title">Verification checklist</h2>
          <p class="kn-verification__subtitle">Verify the app structure.</p>
          <ul class="kn-verification__list">
            <li class="kn-verification__item">
              <span class="kn-verification__icon" aria-hidden="true"></span>
              <span class="kn-verification__label">Does the landing page show "Stop Missing The Right Jobs." as headline?</span>
            </li>
            <li class="kn-verification__item">
              <span class="kn-verification__icon" aria-hidden="true"></span>
              <span class="kn-verification__label">Does the "Start Tracking" button navigate to /settings?</span>
            </li>
            <li class="kn-verification__item">
              <span class="kn-verification__icon" aria-hidden="true"></span>
              <span class="kn-verification__label">Does /settings show placeholder preference fields: Role keywords, Preferred locations, Mode, Experience level?</span>
            </li>
            <li class="kn-verification__item">
              <span class="kn-verification__icon" aria-hidden="true"></span>
              <span class="kn-verification__label">Does /dashboard show empty state message: "No jobs yet. In the next step, you will load a realistic dataset."?</span>
            </li>
            <li class="kn-verification__item">
              <span class="kn-verification__icon" aria-hidden="true"></span>
              <span class="kn-verification__label">Do /saved and /digest show premium empty states?</span>
            </li>
          </ul>
        </section>
      `;
    }
  }

  function renderSettings() {
    if (headerEl) {
      headerEl.innerHTML = `
        <h1 class="kn-heading-xl">Settings</h1>
        <p class="kn-text-md">
          Configure your job preferences to receive precision-matched opportunities.
        </p>
      `;
    }
    if (contentEl) {
      contentEl.innerHTML = `
        <div class="kn-card__body">
          <div class="kn-field">
            <label class="kn-label" for="role-keywords">Role keywords</label>
            <p class="kn-helper">
              Enter job titles or keywords separated by commas (e.g., "Software Engineer, Frontend Developer").
            </p>
            <input
              id="role-keywords"
              class="kn-input"
              type="text"
              placeholder="e.g., Software Engineer, Product Manager"
            />
          </div>

          <div class="kn-field">
            <label class="kn-label" for="preferred-locations">Preferred locations</label>
            <p class="kn-helper">
              Cities or regions where you'd like to work.
            </p>
            <input
              id="preferred-locations"
              class="kn-input"
              type="text"
              placeholder="e.g., San Francisco, Remote, New York"
            />
          </div>

          <div class="kn-field">
            <label class="kn-label" for="work-mode">Mode</label>
            <p class="kn-helper">
              Select your preferred work arrangement.
            </p>
            <select id="work-mode" class="kn-input">
              <option value="">Select mode</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">Onsite</option>
            </select>
          </div>

          <div class="kn-field">
            <label class="kn-label" for="experience-level">Experience level</label>
            <p class="kn-helper">
              Your years of professional experience.
            </p>
            <select id="experience-level" class="kn-input">
              <option value="">Select level</option>
              <option value="entry">Entry Level (0-2 years)</option>
              <option value="mid">Mid Level (3-5 years)</option>
              <option value="senior">Senior (6-10 years)</option>
              <option value="lead">Lead/Principal (10+ years)</option>
            </select>
          </div>

          <div class="kn-actions">
            <button class="kn-button kn-button--primary">Save Preferences</button>
            <button class="kn-button kn-button--secondary">Reset</button>
          </div>
        </div>
      `;
    }
  }

  function renderSaved() {
    if (headerEl) {
      headerEl.innerHTML = `
        <h1 class="kn-heading-xl">Saved</h1>
        <p class="kn-text-md">
          Jobs you've bookmarked for later review.
        </p>
      `;
    }
    if (contentEl) {
      contentEl.innerHTML = `
        <div class="kn-empty-state">
          <p class="kn-text-md kn-empty-state__text">
            No saved jobs yet. When you find opportunities that interest you, save them here for easy access.
          </p>
        </div>
      `;
    }
  }

  function renderDigest() {
    if (headerEl) {
      headerEl.innerHTML = `
        <h1 class="kn-heading-xl">Digest</h1>
        <p class="kn-text-md">
          Your daily job digest delivered at 9AM.
        </p>
      `;
    }
    if (contentEl) {
      contentEl.innerHTML = `
        <div class="kn-empty-state">
          <p class="kn-text-md kn-empty-state__text">
            No digest available yet. Once you configure your preferences, you'll receive daily summaries of matched opportunities.
          </p>
        </div>
      `;
    }
  }

  function renderProof() {
    if (headerEl) {
      headerEl.innerHTML = `
        <h1 class="kn-heading-xl">Proof</h1>
        <p class="kn-text-md">
          Collection of artifacts and evidence.
        </p>
      `;
    }
    if (contentEl) {
      contentEl.innerHTML = `
        <div class="kn-empty-state">
          <p class="kn-text-md kn-empty-state__text">
            This section will be used to collect proof and artifacts as the application is built.
          </p>
        </div>
      `;
    }
  }

  function updateRoute() {
    const path = getPathFromHash();

    // Update active nav link
    navLinks.forEach((link) => {
      const linkRoute = link.getAttribute("data-route-link");
      if (linkRoute === path) {
        link.classList.add("kn-nav__link--active");
      } else {
        link.classList.remove("kn-nav__link--active");
      }
    });

    // Render route-specific content
    if (path === "/" || path === "") {
      renderLandingPage();
    } else if (path === "/dashboard") {
      renderDashboard();
    } else if (path === "/settings") {
      renderSettings();
    } else if (path === "/saved") {
      renderSaved();
    } else if (path === "/digest") {
      renderDigest();
    } else if (path === "/proof") {
      renderProof();
    } else {
      // Default to landing page
      window.location.hash = "#/";
      renderLandingPage();
    }
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

