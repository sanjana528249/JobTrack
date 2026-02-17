document.addEventListener("DOMContentLoaded", function () {
  const titleEl = document.querySelector("[data-route-title]");
  const subtitleEl = document.querySelector("[data-route-subtitle]");
  const headerEl = document.querySelector("[data-route-header]");
  const contentEl = document.querySelector("[data-route-content]");
  const navLinks = Array.from(document.querySelectorAll("[data-route-link]"));
  const navToggle = document.querySelector(".kn-nav__toggle");
  const nav = document.querySelector(".kn-nav");

  // Filter state
  let filters = {
    keyword: "",
    location: "",
    mode: "",
    experience: "",
    source: "",
    sort: "latest"
  };

  // Get saved jobs from localStorage
  function getSavedJobs() {
    const saved = localStorage.getItem("savedJobs");
    return saved ? JSON.parse(saved) : [];
  }

  // Save job to localStorage
  function saveJob(jobId) {
    const saved = getSavedJobs();
    if (!saved.includes(jobId)) {
      saved.push(jobId);
      localStorage.setItem("savedJobs", JSON.stringify(saved));
    }
  }

  // Remove job from localStorage
  function removeSavedJob(jobId) {
    const saved = getSavedJobs();
    const filtered = saved.filter(id => id !== jobId);
    localStorage.setItem("savedJobs", JSON.stringify(filtered));
  }

  // Check if job is saved
  function isJobSaved(jobId) {
    return getSavedJobs().includes(jobId);
  }

  // Get unique values for filter dropdowns
  function getUniqueLocations() {
    return [...new Set(JOBS_DATA.map(job => job.location))].sort();
  }

  function getUniqueSources() {
    return [...new Set(JOBS_DATA.map(job => job.source))].sort();
  }

  // Filter and sort jobs
  function getFilteredJobs() {
    let filtered = [...JOBS_DATA];

    // Keyword filter
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(keyword) ||
        job.company.toLowerCase().includes(keyword)
      );
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(job => job.location === filters.location);
    }

    // Mode filter
    if (filters.mode) {
      filtered = filtered.filter(job => job.mode.toLowerCase() === filters.mode.toLowerCase());
    }

    // Experience filter
    if (filters.experience) {
      filtered = filtered.filter(job => job.experience === filters.experience);
    }

    // Source filter
    if (filters.source) {
      filtered = filtered.filter(job => job.source === filters.source);
    }

    // Sort
    if (filters.sort === "latest") {
      filtered.sort((a, b) => a.postedDaysAgo - b.postedDaysAgo);
    } else if (filters.sort === "oldest") {
      filtered.sort((a, b) => b.postedDaysAgo - a.postedDaysAgo);
    }

    return filtered;
  }

  // Format posted days ago
  function formatPostedDays(days) {
    if (days === 0) return "Today";
    if (days === 1) return "1 day ago";
    return `${days} days ago`;
  }

  // Render job card
  function renderJobCard(job, showSaveButton = true) {
    const saved = isJobSaved(job.id);
    return `
      <div class="kn-job-card" data-job-id="${job.id}">
        <div class="kn-job-card__header">
          <div class="kn-job-card__title-row">
            <h3 class="kn-job-card__title">${job.title}</h3>
            <span class="kn-job-card__source kn-job-card__source--${job.source.toLowerCase()}">${job.source}</span>
          </div>
          <p class="kn-job-card__company">${job.company}</p>
        </div>
        <div class="kn-job-card__body">
          <div class="kn-job-card__meta">
            <span class="kn-job-card__meta-item">
              <span class="kn-job-card__meta-label">Location:</span> ${job.location}
            </span>
            <span class="kn-job-card__meta-item">
              <span class="kn-job-card__meta-label">Mode:</span> ${job.mode}
            </span>
            <span class="kn-job-card__meta-item">
              <span class="kn-job-card__meta-label">Experience:</span> ${job.experience}
            </span>
            <span class="kn-job-card__meta-item">
              <span class="kn-job-card__meta-label">Salary:</span> ${job.salaryRange}
            </span>
          </div>
          <div class="kn-job-card__footer">
            <span class="kn-job-card__posted">${formatPostedDays(job.postedDaysAgo)}</span>
            <div class="kn-job-card__actions">
              <button class="kn-button kn-button--secondary kn-job-card__btn" data-action="view" data-job-id="${job.id}">View</button>
              ${showSaveButton ? `
                <button class="kn-button kn-button--secondary kn-job-card__btn" data-action="${saved ? 'unsave' : 'save'}" data-job-id="${job.id}">
                  ${saved ? 'Saved' : 'Save'}
                </button>
              ` : ''}
              <button class="kn-button kn-button--primary kn-job-card__btn" data-action="apply" data-job-url="${job.applyUrl}">Apply</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Render filter bar
  function renderFilterBar() {
    const locations = getUniqueLocations();
    const sources = getUniqueSources();
    return `
      <div class="kn-filters">
        <div class="kn-filters__row">
          <div class="kn-filters__field">
            <input
              type="text"
              class="kn-input kn-filters__input"
              placeholder="Search jobs..."
              id="filter-keyword"
              value="${filters.keyword}"
            />
          </div>
          <div class="kn-filters__field">
            <select class="kn-input kn-filters__select" id="filter-location">
              <option value="">All Locations</option>
              ${locations.map(loc => `<option value="${loc}" ${filters.location === loc ? 'selected' : ''}>${loc}</option>`).join('')}
            </select>
          </div>
          <div class="kn-filters__field">
            <select class="kn-input kn-filters__select" id="filter-mode">
              <option value="">All Modes</option>
              <option value="Remote" ${filters.mode === 'Remote' ? 'selected' : ''}>Remote</option>
              <option value="Hybrid" ${filters.mode === 'Hybrid' ? 'selected' : ''}>Hybrid</option>
              <option value="Onsite" ${filters.mode === 'Onsite' ? 'selected' : ''}>Onsite</option>
            </select>
          </div>
          <div class="kn-filters__field">
            <select class="kn-input kn-filters__select" id="filter-experience">
              <option value="">All Experience</option>
              <option value="Fresher" ${filters.experience === 'Fresher' ? 'selected' : ''}>Fresher</option>
              <option value="0-1" ${filters.experience === '0-1' ? 'selected' : ''}>0-1 years</option>
              <option value="1-3" ${filters.experience === '1-3' ? 'selected' : ''}>1-3 years</option>
              <option value="3-5" ${filters.experience === '3-5' ? 'selected' : ''}>3-5 years</option>
            </select>
          </div>
          <div class="kn-filters__field">
            <select class="kn-input kn-filters__select" id="filter-source">
              <option value="">All Sources</option>
              ${sources.map(src => `<option value="${src}" ${filters.source === src ? 'selected' : ''}>${src}</option>`).join('')}
            </select>
          </div>
          <div class="kn-filters__field">
            <select class="kn-input kn-filters__select" id="filter-sort">
              <option value="latest" ${filters.sort === 'latest' ? 'selected' : ''}>Latest First</option>
              <option value="oldest" ${filters.sort === 'oldest' ? 'selected' : ''}>Oldest First</option>
            </select>
          </div>
        </div>
      </div>
    `;
  }

  // Render job modal
  function renderJobModal(job) {
    const saved = isJobSaved(job.id);
    return `
      <div class="kn-modal" id="job-modal">
        <div class="kn-modal__overlay" data-action="close-modal"></div>
        <div class="kn-modal__content">
          <button class="kn-modal__close" data-action="close-modal" aria-label="Close">×</button>
          <div class="kn-modal__header">
            <h2 class="kn-heading-md">${job.title}</h2>
            <p class="kn-modal__company">${job.company}</p>
          </div>
          <div class="kn-modal__body">
            <div class="kn-modal__meta">
              <div class="kn-modal__meta-item">
                <span class="kn-modal__meta-label">Location:</span> ${job.location}
              </div>
              <div class="kn-modal__meta-item">
                <span class="kn-modal__meta-label">Mode:</span> ${job.mode}
              </div>
              <div class="kn-modal__meta-item">
                <span class="kn-modal__meta-label">Experience:</span> ${job.experience}
              </div>
              <div class="kn-modal__meta-item">
                <span class="kn-modal__meta-label">Salary:</span> ${job.salaryRange}
              </div>
              <div class="kn-modal__meta-item">
                <span class="kn-modal__meta-label">Source:</span> ${job.source}
              </div>
              <div class="kn-modal__meta-item">
                <span class="kn-modal__meta-label">Posted:</span> ${formatPostedDays(job.postedDaysAgo)}
              </div>
            </div>
            <div class="kn-modal__section">
              <h3 class="kn-heading-sm">Description</h3>
              <p class="kn-text-md">${job.description}</p>
            </div>
            <div class="kn-modal__section">
              <h3 class="kn-heading-sm">Skills Required</h3>
              <div class="kn-modal__skills">
                ${job.skills.map(skill => `<span class="kn-modal__skill">${skill}</span>`).join('')}
              </div>
            </div>
          </div>
          <div class="kn-modal__footer">
            <button class="kn-button kn-button--secondary" data-action="${saved ? 'unsave' : 'save'}" data-job-id="${job.id}">
              ${saved ? 'Remove from Saved' : 'Save Job'}
            </button>
            <a href="${job.applyUrl}" target="_blank" class="kn-button kn-button--primary">Apply Now</a>
          </div>
        </div>
      </div>
    `;
  }

  // Show job modal
  function showJobModal(jobId) {
    const job = JOBS_DATA.find(j => j.id === jobId);
    if (!job) return;

    const modalHTML = renderJobModal(job);
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = document.getElementById('job-modal');
    modal.classList.add('kn-modal--open');

    // Close modal handlers
    document.querySelectorAll('[data-action="close-modal"]').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.remove();
      });
    });

    // Save/unsave handler in modal
    const saveBtn = modal.querySelector('[data-action="save"], [data-action="unsave"]');
    if (saveBtn) {
      saveBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const action = saveBtn.getAttribute('data-action');
        if (action === 'save') {
          saveJob(jobId);
        } else {
          removeSavedJob(jobId);
        }
        // Re-render modal
        modal.remove();
        showJobModal(jobId);
        // Re-render dashboard if on dashboard
        if (getPathFromHash() === '/dashboard') {
          renderDashboard();
        }
      });
    }
  }

  // Handle job card actions
  function handleJobAction(action, jobId, jobUrl) {
    if (action === 'view') {
      showJobModal(jobId);
    } else if (action === 'save') {
      saveJob(jobId);
      renderDashboard();
    } else if (action === 'unsave') {
      removeSavedJob(jobId);
      renderDashboard();
    } else if (action === 'apply') {
      window.open(jobUrl, '_blank');
    }
  }

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
      const filteredJobs = getFilteredJobs();
      const jobsHTML = filteredJobs.length > 0
        ? filteredJobs.map(job => renderJobCard(job)).join('')
        : `
          <div class="kn-empty-state">
            <p class="kn-text-md kn-empty-state__text">
              No jobs found matching your filters. Try adjusting your search criteria.
            </p>
          </div>
        `;

      contentEl.innerHTML = `
        ${renderFilterBar()}
        <div class="kn-jobs-grid">
          ${jobsHTML}
        </div>
      `;

      // Attach event listeners
      contentEl.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const action = btn.getAttribute('data-action');
          const jobId = parseInt(btn.getAttribute('data-job-id'));
          const jobUrl = btn.getAttribute('data-job-url');
          handleJobAction(action, jobId, jobUrl);
        });
      });

      // Filter event listeners
      const keywordInput = document.getElementById('filter-keyword');
      const locationSelect = document.getElementById('filter-location');
      const modeSelect = document.getElementById('filter-mode');
      const experienceSelect = document.getElementById('filter-experience');
      const sourceSelect = document.getElementById('filter-source');
      const sortSelect = document.getElementById('filter-sort');

      if (keywordInput) {
        keywordInput.addEventListener('input', (e) => {
          filters.keyword = e.target.value;
          renderDashboard();
        });
      }

      if (locationSelect) {
        locationSelect.addEventListener('change', (e) => {
          filters.location = e.target.value;
          renderDashboard();
        });
      }

      if (modeSelect) {
        modeSelect.addEventListener('change', (e) => {
          filters.mode = e.target.value;
          renderDashboard();
        });
      }

      if (experienceSelect) {
        experienceSelect.addEventListener('change', (e) => {
          filters.experience = e.target.value;
          renderDashboard();
        });
      }

      if (sourceSelect) {
        sourceSelect.addEventListener('change', (e) => {
          filters.source = e.target.value;
          renderDashboard();
        });
      }

      if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
          filters.sort = e.target.value;
          renderDashboard();
        });
      }
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
      const savedJobIds = getSavedJobs();
      const savedJobs = JOBS_DATA.filter(job => savedJobIds.includes(job.id));

      if (savedJobs.length === 0) {
        contentEl.innerHTML = `
          <div class="kn-empty-state">
            <p class="kn-text-md kn-empty-state__text">
              No saved jobs yet. When you find opportunities that interest you, save them here for easy access.
            </p>
          </div>
        `;
      } else {
        const jobsHTML = savedJobs.map(job => renderJobCard(job, false)).join('');
        contentEl.innerHTML = `
          <div class="kn-jobs-grid">
            ${jobsHTML}
          </div>
        `;

        // Attach event listeners
        contentEl.querySelectorAll('[data-action]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const action = btn.getAttribute('data-action');
            const jobId = parseInt(btn.getAttribute('data-job-id'));
            const jobUrl = btn.getAttribute('data-job-url');
            if (action === 'view') {
              handleJobAction(action, jobId, jobUrl);
            } else if (action === 'apply') {
              handleJobAction(action, jobId, jobUrl);
            }
          });
        });
      }
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
