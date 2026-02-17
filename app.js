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
    sort: "latest",
    showOnlyMatches: false
  };

  // ============================================
  // PREFERENCES MANAGEMENT
  // ============================================

  // Get preferences from localStorage
  function getPreferences() {
    const prefs = localStorage.getItem("jobTrackerPreferences");
    return prefs ? JSON.parse(prefs) : null;
  }

  // Save preferences to localStorage
  function savePreferences(prefs) {
    localStorage.setItem("jobTrackerPreferences", JSON.stringify(prefs));
  }

  // Default preferences structure
  function getDefaultPreferences() {
    return {
      roleKeywords: "",
      preferredLocations: [],
      preferredMode: [],
      experienceLevel: "",
      skills: "",
      minMatchScore: 40
    };
  }

  // ============================================
  // MATCH SCORE ENGINE
  // ============================================

  function calculateMatchScore(job, preferences) {
    if (!preferences) return 0;

    let score = 0;

    // +25 if any roleKeyword appears in job.title (case-insensitive)
    if (preferences.roleKeywords) {
      const keywords = preferences.roleKeywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k);
      const jobTitleLower = job.title.toLowerCase();
      if (keywords.some(keyword => jobTitleLower.includes(keyword))) {
        score += 25;
      }
    }

    // +15 if any roleKeyword appears in job.description
    if (preferences.roleKeywords) {
      const keywords = preferences.roleKeywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k);
      const jobDescLower = job.description.toLowerCase();
      if (keywords.some(keyword => jobDescLower.includes(keyword))) {
        score += 15;
      }
    }

    // +15 if job.location matches preferredLocations
    if (preferences.preferredLocations && preferences.preferredLocations.length > 0) {
      if (preferences.preferredLocations.includes(job.location)) {
        score += 15;
      }
    }

    // +10 if job.mode matches preferredMode
    if (preferences.preferredMode && preferences.preferredMode.length > 0) {
      if (preferences.preferredMode.includes(job.mode)) {
        score += 10;
      }
    }

    // +10 if job.experience matches experienceLevel
    if (preferences.experienceLevel) {
      const expMap = {
        "Fresher": ["Fresher"],
        "0-1": ["0-1"],
        "1-3": ["1-3"],
        "3-5": ["3-5"]
      };
      if (expMap[preferences.experienceLevel] && expMap[preferences.experienceLevel].includes(job.experience)) {
        score += 10;
      }
    }

    // +15 if overlap between job.skills and user.skills (any match)
    if (preferences.skills) {
      const userSkills = preferences.skills.split(',').map(s => s.trim().toLowerCase()).filter(s => s);
      const jobSkills = job.skills.map(s => s.toLowerCase());
      if (userSkills.some(skill => jobSkills.some(js => js.includes(skill) || skill.includes(js)))) {
        score += 15;
      }
    }

    // +5 if postedDaysAgo <= 2
    if (job.postedDaysAgo <= 2) {
      score += 5;
    }

    // +5 if source is LinkedIn
    if (job.source === "LinkedIn") {
      score += 5;
    }

    // Cap score at 100
    return Math.min(score, 100);
  }

  // Get match score badge class
  function getMatchScoreClass(score) {
    if (score >= 80) return "kn-match-score--high";
    if (score >= 60) return "kn-match-score--medium";
    if (score >= 40) return "kn-match-score--low";
    return "kn-match-score--minimal";
  }

  // ============================================
  // SAVED JOBS MANAGEMENT
  // ============================================

  function getSavedJobs() {
    const saved = localStorage.getItem("savedJobs");
    return saved ? JSON.parse(saved) : [];
  }

  function saveJob(jobId) {
    const saved = getSavedJobs();
    if (!saved.includes(jobId)) {
      saved.push(jobId);
      localStorage.setItem("savedJobs", JSON.stringify(saved));
    }
  }

  function removeSavedJob(jobId) {
    const saved = getSavedJobs();
    const filtered = saved.filter(id => id !== jobId);
    localStorage.setItem("savedJobs", JSON.stringify(filtered));
  }

  function isJobSaved(jobId) {
    return getSavedJobs().includes(jobId);
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  function getUniqueLocations() {
    return [...new Set(JOBS_DATA.map(job => job.location))].sort();
  }

  function getUniqueSources() {
    return [...new Set(JOBS_DATA.map(job => job.source))].sort();
  }

  function formatPostedDays(days) {
    if (days === 0) return "Today";
    if (days === 1) return "1 day ago";
    return `${days} days ago`;
  }

  // Extract numeric value from salary range for sorting
  function extractSalaryValue(salaryRange) {
    const match = salaryRange.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  // ============================================
  // FILTER AND SORT LOGIC
  // ============================================

  function getFilteredJobs() {
    const preferences = getPreferences();
    let filtered = [...JOBS_DATA];

    // Calculate match scores for all jobs
    filtered = filtered.map(job => ({
      ...job,
      matchScore: calculateMatchScore(job, preferences)
    }));

    // Keyword filter (AND behavior)
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(keyword) ||
        job.company.toLowerCase().includes(keyword)
      );
    }

    // Location filter (AND behavior)
    if (filters.location) {
      filtered = filtered.filter(job => job.location === filters.location);
    }

    // Mode filter (AND behavior)
    if (filters.mode) {
      filtered = filtered.filter(job => job.mode.toLowerCase() === filters.mode.toLowerCase());
    }

    // Experience filter (AND behavior)
    if (filters.experience) {
      filtered = filtered.filter(job => job.experience === filters.experience);
    }

    // Source filter (AND behavior)
    if (filters.source) {
      filtered = filtered.filter(job => job.source === filters.source);
    }

    // Show only matches filter
    if (filters.showOnlyMatches && preferences) {
      filtered = filtered.filter(job => job.matchScore >= preferences.minMatchScore);
    }

    // Sort
    if (filters.sort === "latest") {
      filtered.sort((a, b) => a.postedDaysAgo - b.postedDaysAgo);
    } else if (filters.sort === "oldest") {
      filtered.sort((a, b) => b.postedDaysAgo - a.postedDaysAgo);
    } else if (filters.sort === "match") {
      filtered.sort((a, b) => b.matchScore - a.matchScore);
    } else if (filters.sort === "salary") {
      filtered.sort((a, b) => extractSalaryValue(b.salaryRange) - extractSalaryValue(a.salaryRange));
    }

    return filtered;
  }

  // ============================================
  // RENDERING FUNCTIONS
  // ============================================

  function renderJobCard(job, showSaveButton = true) {
    const saved = isJobSaved(job.id);
    const matchScore = job.matchScore || 0;
    const matchScoreClass = getMatchScoreClass(matchScore);
    const preferences = getPreferences();
    const showMatchScore = preferences !== null;

    return `
      <div class="kn-job-card" data-job-id="${job.id}">
        <div class="kn-job-card__header">
          <div class="kn-job-card__title-row">
            <h3 class="kn-job-card__title">${job.title}</h3>
            <div class="kn-job-card__badges">
              ${showMatchScore ? `<span class="kn-match-score ${matchScoreClass}">${matchScore}%</span>` : ''}
              <span class="kn-job-card__source kn-job-card__source--${job.source.toLowerCase()}">${job.source}</span>
            </div>
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

  function renderFilterBar() {
    const locations = getUniqueLocations();
    const sources = getUniqueSources();
    const preferences = getPreferences();

    return `
      <div class="kn-filters">
        ${preferences ? '' : `
          <div class="kn-alert kn-alert--empty kn-alert--info">
            <p class="kn-text-sm">
              Set your preferences to activate intelligent matching.
            </p>
            <a href="#/settings" class="kn-button kn-button--tertiary">Go to Settings</a>
          </div>
        `}
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
              ${preferences ? '<option value="match" ' + (filters.sort === 'match' ? 'selected' : '') + '>Match Score</option>' : ''}
              <option value="salary" ${filters.sort === 'salary' ? 'selected' : ''}>Salary (High to Low)</option>
            </select>
          </div>
        </div>
        ${preferences ? `
          <div class="kn-filters__toggle-row">
            <label class="kn-checkbox-label">
              <input type="checkbox" id="filter-show-matches" ${filters.showOnlyMatches ? 'checked' : ''} />
              <span>Show only jobs above my threshold (${preferences.minMatchScore}%)</span>
            </label>
          </div>
        ` : ''}
      </div>
    `;
  }

  function renderJobModal(job) {
    const saved = isJobSaved(job.id);
    const matchScore = job.matchScore || 0;
    const matchScoreClass = getMatchScoreClass(matchScore);
    const preferences = getPreferences();
    const showMatchScore = preferences !== null;

    return `
      <div class="kn-modal" id="job-modal">
        <div class="kn-modal__overlay" data-action="close-modal"></div>
        <div class="kn-modal__content">
          <button class="kn-modal__close" data-action="close-modal" aria-label="Close">×</button>
          <div class="kn-modal__header">
            <div class="kn-modal__header-row">
              <div>
                <h2 class="kn-heading-md">${job.title}</h2>
                <p class="kn-modal__company">${job.company}</p>
              </div>
              ${showMatchScore ? `<span class="kn-match-score ${matchScoreClass}">${matchScore}% Match</span>` : ''}
            </div>
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

  function showJobModal(jobId) {
    const job = JOBS_DATA.find(j => j.id === jobId);
    if (!job) return;

    const preferences = getPreferences();
    const jobWithScore = {
      ...job,
      matchScore: calculateMatchScore(job, preferences)
    };

    const modalHTML = renderJobModal(jobWithScore);
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = document.getElementById('job-modal');
    modal.classList.add('kn-modal--open');

    document.querySelectorAll('[data-action="close-modal"]').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.remove();
      });
    });

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
        modal.remove();
        showJobModal(jobId);
        if (getPathFromHash() === '/dashboard') {
          renderDashboard();
        }
      });
    }
  }

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

  // ============================================
  // PAGE RENDERING FUNCTIONS
  // ============================================

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
              No roles match your criteria. Adjust filters or lower threshold.
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
      const showMatchesCheckbox = document.getElementById('filter-show-matches');

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

      if (showMatchesCheckbox) {
        showMatchesCheckbox.addEventListener('change', (e) => {
          filters.showOnlyMatches = e.target.checked;
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
      const preferences = getPreferences() || getDefaultPreferences();
      const locations = getUniqueLocations();

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
              value="${preferences.roleKeywords}"
            />
          </div>

          <div class="kn-field">
            <label class="kn-label" for="preferred-locations">Preferred locations</label>
            <p class="kn-helper">
              Select one or more locations where you'd like to work.
            </p>
            <select id="preferred-locations" class="kn-input" multiple size="5">
              ${locations.map(loc => `<option value="${loc}" ${preferences.preferredLocations.includes(loc) ? 'selected' : ''}>${loc}</option>`).join('')}
            </select>
            <p class="kn-helper">Hold Ctrl (Windows) or Cmd (Mac) to select multiple locations.</p>
          </div>

          <div class="kn-field">
            <label class="kn-label">Preferred work mode</label>
            <p class="kn-helper">
              Select your preferred work arrangements (you can select multiple).
            </p>
            <div class="kn-checkbox-group">
              <label class="kn-checkbox-label">
                <input type="checkbox" name="preferred-mode" value="Remote" ${preferences.preferredMode.includes('Remote') ? 'checked' : ''} />
                <span>Remote</span>
              </label>
              <label class="kn-checkbox-label">
                <input type="checkbox" name="preferred-mode" value="Hybrid" ${preferences.preferredMode.includes('Hybrid') ? 'checked' : ''} />
                <span>Hybrid</span>
              </label>
              <label class="kn-checkbox-label">
                <input type="checkbox" name="preferred-mode" value="Onsite" ${preferences.preferredMode.includes('Onsite') ? 'checked' : ''} />
                <span>Onsite</span>
              </label>
            </div>
          </div>

          <div class="kn-field">
            <label class="kn-label" for="experience-level">Experience level</label>
            <p class="kn-helper">
              Your years of professional experience.
            </p>
            <select id="experience-level" class="kn-input">
              <option value="">Select level</option>
              <option value="Fresher" ${preferences.experienceLevel === 'Fresher' ? 'selected' : ''}>Fresher</option>
              <option value="0-1" ${preferences.experienceLevel === '0-1' ? 'selected' : ''}>0-1 years</option>
              <option value="1-3" ${preferences.experienceLevel === '1-3' ? 'selected' : ''}>1-3 years</option>
              <option value="3-5" ${preferences.experienceLevel === '3-5' ? 'selected' : ''}>3-5 years</option>
            </select>
          </div>

          <div class="kn-field">
            <label class="kn-label" for="skills">Skills</label>
            <p class="kn-helper">
              Enter your skills separated by commas (e.g., "Java, Python, React").
            </p>
            <input
              id="skills"
              class="kn-input"
              type="text"
              placeholder="e.g., Java, Python, React, Node.js"
              value="${preferences.skills}"
            />
          </div>

          <div class="kn-field">
            <label class="kn-label" for="min-match-score">
              Minimum match score threshold: <span id="min-match-score-value">${preferences.minMatchScore}</span>%
            </label>
            <p class="kn-helper">
              Only show jobs with match score above this threshold.
            </p>
            <input
              id="min-match-score"
              class="kn-input kn-input--range"
              type="range"
              min="0"
              max="100"
              value="${preferences.minMatchScore}"
            />
          </div>

          <div class="kn-actions">
            <button class="kn-button kn-button--primary" id="save-preferences">Save Preferences</button>
            <button class="kn-button kn-button--secondary" id="reset-preferences">Reset</button>
          </div>
        </div>
      `;

      // Event listeners for settings
      const minMatchScoreInput = document.getElementById('min-match-score');
      const minMatchScoreValue = document.getElementById('min-match-score-value');
      if (minMatchScoreInput && minMatchScoreValue) {
        minMatchScoreInput.addEventListener('input', (e) => {
          minMatchScoreValue.textContent = e.target.value;
        });
      }

      const saveBtn = document.getElementById('save-preferences');
      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          const roleKeywords = document.getElementById('role-keywords').value.trim();
          const preferredLocationsSelect = document.getElementById('preferred-locations');
          const preferredLocations = Array.from(preferredLocationsSelect.selectedOptions).map(opt => opt.value);
          const preferredModeCheckboxes = document.querySelectorAll('input[name="preferred-mode"]:checked');
          const preferredMode = Array.from(preferredModeCheckboxes).map(cb => cb.value);
          const experienceLevel = document.getElementById('experience-level').value;
          const skills = document.getElementById('skills').value.trim();
          const minMatchScore = parseInt(document.getElementById('min-match-score').value);

          const newPreferences = {
            roleKeywords,
            preferredLocations,
            preferredMode,
            experienceLevel,
            skills,
            minMatchScore
          };

          savePreferences(newPreferences);
          alert('Preferences saved successfully!');
          renderDashboard();
          window.location.hash = '#/dashboard';
        });
      }

      const resetBtn = document.getElementById('reset-preferences');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          if (confirm('Reset all preferences to defaults?')) {
            localStorage.removeItem('jobTrackerPreferences');
            renderSettings();
          }
        });
      }
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
      const preferences = getPreferences();
      const savedJobs = JOBS_DATA.filter(job => savedJobIds.includes(job.id))
        .map(job => ({
          ...job,
          matchScore: calculateMatchScore(job, preferences)
        }));

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

  // ============================================
  // DIGEST MANAGEMENT
  // ============================================

  // Get today's date in YYYY-MM-DD format
  function getTodayDateString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Get today's digest from localStorage
  function getTodayDigest() {
    const todayKey = `jobTrackerDigest_${getTodayDateString()}`;
    const digest = localStorage.getItem(todayKey);
    return digest ? JSON.parse(digest) : null;
  }

  // Save digest to localStorage
  function saveDigest(jobs) {
    const todayKey = `jobTrackerDigest_${getTodayDateString()}`;
    localStorage.setItem(todayKey, JSON.stringify(jobs));
  }

  // Generate digest (top 10 jobs)
  function generateDigest() {
    const preferences = getPreferences();
    
    if (!preferences) {
      return null;
    }

    // Get all jobs with match scores
    let jobs = JOBS_DATA.map(job => ({
      ...job,
      matchScore: calculateMatchScore(job, preferences)
    }));

    // Filter jobs with match score >= minMatchScore
    jobs = jobs.filter(job => job.matchScore >= preferences.minMatchScore);

    if (jobs.length === 0) {
      return [];
    }

    // Sort: matchScore descending, then postedDaysAgo ascending
    jobs.sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      return a.postedDaysAgo - b.postedDaysAgo;
    });

    // Take top 10
    return jobs.slice(0, 10);
  }

  // Format digest as plain text
  function formatDigestAsText(digestJobs) {
    const date = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    let text = `Top 10 Jobs For You — 9AM Digest\n`;
    text += `${date}\n\n`;

    digestJobs.forEach((job, index) => {
      text += `${index + 1}. ${job.title} at ${job.company}\n`;
      text += `   Location: ${job.location} | Experience: ${job.experience}\n`;
      text += `   Match Score: ${job.matchScore}%\n`;
      text += `   Apply: ${job.applyUrl}\n\n`;
    });

    text += `This digest was generated based on your preferences.\n`;
    return text;
  }

  // Format digest date
  function formatDigestDate() {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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
      const preferences = getPreferences();

      // Check if preferences are set
      if (!preferences) {
        contentEl.innerHTML = `
          <div class="kn-empty-state">
            <p class="kn-text-md kn-empty-state__text">
              Set preferences to generate a personalized digest.
            </p>
            <a href="#/settings" class="kn-button kn-button--primary" style="margin-top: var(--kn-space-2);">Go to Settings</a>
          </div>
        `;
        return;
      }

      // Try to load today's digest
      let digestJobs = getTodayDigest();

      // If no digest exists, show generate button
      if (!digestJobs) {
        contentEl.innerHTML = `
          <div class="kn-digest-generate">
            <p class="kn-text-md">
              Generate today's personalized digest based on your preferences.
            </p>
            <button class="kn-button kn-button--primary" id="generate-digest-btn">
              Generate Today's 9AM Digest (Simulated)
            </button>
            <p class="kn-text-sm kn-digest-note">
              Demo Mode: Daily 9AM trigger simulated manually.
            </p>
          </div>
        `;

        const generateBtn = document.getElementById('generate-digest-btn');
        if (generateBtn) {
          generateBtn.addEventListener('click', () => {
            const jobs = generateDigest();
            if (jobs && jobs.length > 0) {
              saveDigest(jobs);
              renderDigest(); // Re-render to show digest
            } else {
              // No matches found
              contentEl.innerHTML = `
                <div class="kn-empty-state">
                  <p class="kn-text-md kn-empty-state__text">
                    No matching roles today. Check again tomorrow.
                  </p>
                  <button class="kn-button kn-button--secondary" id="generate-digest-btn" style="margin-top: var(--kn-space-2);">
                    Try Again
                  </button>
                </div>
              `;
              document.getElementById('generate-digest-btn').addEventListener('click', () => {
                renderDigest();
              });
            }
          });
        }
        return;
      }

      // If digest exists but empty
      if (digestJobs.length === 0) {
        contentEl.innerHTML = `
          <div class="kn-empty-state">
            <p class="kn-text-md kn-empty-state__text">
              No matching roles today. Check again tomorrow.
            </p>
            <button class="kn-button kn-button--secondary" id="regenerate-digest-btn" style="margin-top: var(--kn-space-2);">
              Regenerate Digest
            </button>
          </div>
        `;

        const regenerateBtn = document.getElementById('regenerate-digest-btn');
        if (regenerateBtn) {
          regenerateBtn.addEventListener('click', () => {
            const jobs = generateDigest();
            if (jobs && jobs.length > 0) {
              saveDigest(jobs);
              renderDigest();
            } else {
              renderDigest();
            }
          });
        }
        return;
      }

      // Render digest UI (email-style)
      const digestDate = formatDigestDate();
      const jobsHTML = digestJobs.map((job, index) => `
        <div class="kn-digest-item">
          <div class="kn-digest-item__number">${index + 1}</div>
          <div class="kn-digest-item__content">
            <h3 class="kn-digest-item__title">${job.title}</h3>
            <p class="kn-digest-item__company">${job.company}</p>
            <div class="kn-digest-item__meta">
              <span class="kn-digest-item__meta-item">${job.location}</span>
              <span class="kn-digest-item__meta-item">${job.experience}</span>
              <span class="kn-match-score ${getMatchScoreClass(job.matchScore)}">${job.matchScore}% Match</span>
            </div>
            <a href="${job.applyUrl}" target="_blank" class="kn-button kn-button--primary kn-digest-item__apply">Apply</a>
          </div>
        </div>
      `).join('');

      const digestText = formatDigestAsText(digestJobs);
      const emailSubject = encodeURIComponent("My 9AM Job Digest");
      const emailBody = encodeURIComponent(digestText);
      const mailtoLink = `mailto:?subject=${emailSubject}&body=${emailBody}`;

      contentEl.innerHTML = `
        <div class="kn-digest-container">
          <div class="kn-digest-card">
            <div class="kn-digest-header">
              <h2 class="kn-heading-md">Top 10 Jobs For You — 9AM Digest</h2>
              <p class="kn-digest-date">${digestDate}</p>
            </div>
            <div class="kn-digest-body">
              ${jobsHTML}
            </div>
            <div class="kn-digest-footer">
              <p class="kn-text-sm">This digest was generated based on your preferences.</p>
              <p class="kn-text-sm kn-digest-note">Demo Mode: Daily 9AM trigger simulated manually.</p>
            </div>
          </div>
          <div class="kn-digest-actions">
            <button class="kn-button kn-button--secondary" id="copy-digest-btn">Copy Digest to Clipboard</button>
            <a href="${mailtoLink}" class="kn-button kn-button--secondary" id="email-digest-btn">Create Email Draft</a>
            <button class="kn-button kn-button--tertiary" id="regenerate-digest-btn">Regenerate Digest</button>
          </div>
        </div>
      `;

      // Copy to clipboard handler
      const copyBtn = document.getElementById('copy-digest-btn');
      if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
          try {
            await navigator.clipboard.writeText(digestText);
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
              copyBtn.textContent = 'Copy Digest to Clipboard';
            }, 2000);
          } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = digestText;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
              copyBtn.textContent = 'Copy Digest to Clipboard';
            }, 2000);
          }
        });
      }

      // Regenerate handler
      const regenerateBtn = document.getElementById('regenerate-digest-btn');
      if (regenerateBtn) {
        regenerateBtn.addEventListener('click', () => {
          const jobs = generateDigest();
          if (jobs && jobs.length > 0) {
            saveDigest(jobs);
            renderDigest();
          } else {
            saveDigest([]);
            renderDigest();
          }
        });
      }
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

    navLinks.forEach((link) => {
      const linkRoute = link.getAttribute("data-route-link");
      if (linkRoute === path) {
        link.classList.add("kn-nav__link--active");
      } else {
        link.classList.remove("kn-nav__link--active");
      }
    });

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

  updateRoute();
});
