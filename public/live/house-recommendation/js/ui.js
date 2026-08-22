// ============================================================
// House Recommendation System — UI Controller
// Rendering, interactions, state management
// ============================================================

(function () {
  "use strict";

  // ── State ──
  const state = {
    currentView: "preference", // "preference" | "content" | "collaborative"
    selectedProperty: null,
    likedProperties: JSON.parse(localStorage.getItem("likedProperties") || "[]"),
    activeUser: null,
    filters: {
      budgetMin: 0,
      budgetMax: 50000000,
      locations: [],
      bhk: [],
      amenities: [],
      furnishing: [],
      propertyType: []
    },
    lastResults: [],
    sortBy: "relevance" // "relevance" | "price-asc" | "price-desc" | "area"
  };

  // ── Color map for property images ──
  const IMAGE_GRADIENTS = {
    "Apartment": "linear-gradient(135deg, #1e3a5f, #0f1b2d)",
    "Villa": "linear-gradient(135deg, #2d5016, #1a3009)",
    "Independent House": "linear-gradient(135deg, #5c2d0e, #3a1c06)",
    "Penthouse": "linear-gradient(135deg, #3b1f5c, #1f0f30)",
    "Studio": "linear-gradient(135deg, #0f3a3a, #072020)"
  };

  const TYPE_ICONS = {
    "Apartment": "🏢",
    "Villa": "🏡",
    "Independent House": "🏠",
    "Penthouse": "🌆",
    "Studio": "🏙️"
  };

  const AMENITY_ICONS = {
    "Parking": "🅿️",
    "Gym": "🏋️",
    "Swimming Pool": "🏊",
    "Garden": "🌳",
    "Security": "🔒",
    "Power Backup": "⚡",
    "Lift": "🛗",
    "Club House": "🎭",
    "Children's Play Area": "🎪",
    "Jogging Track": "🏃",
    "Indoor Games": "🎮",
    "Intercom": "📞",
    "Fire Safety": "🧯",
    "Rainwater Harvesting": "🌧️",
    "CCTV": "📷",
    "Visitor Parking": "🚗"
  };

  const USER_COLORS = [
    "#f59e0b", "#ef4444", "#3b82f6", "#10b981", "#8b5cf6",
    "#ec4899", "#06b6d4", "#f97316", "#14b8a6", "#6366f1"
  ];

  // ── Initialize ──
  function init() {
    setupNavbar();
    setupFilters();
    setupTabs();
    setupModal();
    setupScrollReveal();
    setupCollaborativeSection();
    renderDefaultResults();
    initCharts();
  }

  // ── Navbar ──
  function setupNavbar() {
    const navbar = document.querySelector(".navbar");
    const toggle = document.querySelector(".nav-toggle");
    const links = document.querySelector(".nav-links");

    window.addEventListener("scroll", () => {
      navbar.classList.toggle("scrolled", window.scrollY > 50);
    });

    if (toggle) {
      toggle.addEventListener("click", () => {
        links.classList.toggle("open");
        const spans = toggle.querySelectorAll("span");
        if (links.classList.contains("open")) {
          spans[0].style.transform = "rotate(45deg) translate(5px, 5px)";
          spans[1].style.opacity = "0";
          spans[2].style.transform = "rotate(-45deg) translate(5px, -5px)";
        } else {
          spans[0].style.transform = "";
          spans[1].style.opacity = "";
          spans[2].style.transform = "";
        }
      });
    }

    // Close mobile nav on link click
    document.querySelectorAll(".nav-links a").forEach(a => {
      a.addEventListener("click", () => {
        links.classList.remove("open");
      });
    });

    // Theme Selector
    const themeSelector = document.getElementById("theme-selector");
    if (themeSelector) {
      themeSelector.addEventListener("change", () => {
        const theme = themeSelector.value;
        document.body.className = document.body.className
          .split(" ")
          .filter(c => !c.startsWith("theme-"))
          .join(" ");
        if (theme !== "midnight-amber") {
          document.body.classList.add(`theme-${theme}`);
        }
      });
    }
  }

  // ── Filters ──
  function setupFilters() {
    const { properties } = window.HouseData;

    // Budget slider
    const budgetSlider = document.getElementById("budget-slider");
    const budgetDisplay = document.getElementById("budget-display");
    if (budgetSlider) {
      budgetSlider.addEventListener("input", () => {
        state.filters.budgetMax = parseInt(budgetSlider.value);
        budgetDisplay.textContent = window.HouseData.formatPrice(state.filters.budgetMax);
      });
    }

    // Location select
    const locationSelect = document.getElementById("location-select");
    if (locationSelect) {
      locationSelect.addEventListener("change", () => {
        const val = locationSelect.value;
        state.filters.locations = val ? [val] : [];
      });
    }

    // BHK tags
    document.querySelectorAll(".bhk-tag").forEach(tag => {
      tag.addEventListener("click", () => {
        const val = parseInt(tag.dataset.bhk);
        tag.classList.toggle("active");
        if (tag.classList.contains("active")) {
          state.filters.bhk.push(val);
        } else {
          state.filters.bhk = state.filters.bhk.filter(b => b !== val);
        }
      });
    });

    // Amenity tags
    document.querySelectorAll(".amenity-filter-tag").forEach(tag => {
      tag.addEventListener("click", () => {
        const val = tag.dataset.amenity;
        tag.classList.toggle("active");
        if (tag.classList.contains("active")) {
          state.filters.amenities.push(val);
        } else {
          state.filters.amenities = state.filters.amenities.filter(a => a !== val);
        }
      });
    });

    // Furnishing select
    const furnishSelect = document.getElementById("furnishing-select");
    if (furnishSelect) {
      furnishSelect.addEventListener("change", () => {
        const val = furnishSelect.value;
        state.filters.furnishing = val ? [val] : [];
      });
    }

    // Property type select
    const typeSelect = document.getElementById("type-select");
    if (typeSelect) {
      typeSelect.addEventListener("change", () => {
        const val = typeSelect.value;
        state.filters.propertyType = val ? [val] : [];
      });
    }

    // Get Recommendations button
    const recBtn = document.getElementById("get-recommendations-btn");
    if (recBtn) {
      recBtn.addEventListener("click", () => {
        runPreferenceSearch();
        document.getElementById("results-section").scrollIntoView({ behavior: "smooth" });
      });
    }

    // Reset button
    const resetBtn = document.getElementById("reset-filters-btn");
    if (resetBtn) {
      resetBtn.addEventListener("click", resetFilters);
    }

    // Hero search
    const heroSearchBtn = document.getElementById("hero-search-btn");
    const heroSearchInput = document.getElementById("hero-search-input");
    if (heroSearchBtn) {
      heroSearchBtn.addEventListener("click", () => {
        const query = heroSearchInput.value.trim();
        if (query) {
          quickSearch(query);
        } else {
          document.getElementById("filters-section").scrollIntoView({ behavior: "smooth" });
        }
      });

      heroSearchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") heroSearchBtn.click();
      });
    }
  }

  function resetFilters() {
    state.filters = {
      budgetMin: 0,
      budgetMax: 50000000,
      locations: [],
      bhk: [],
      amenities: [],
      furnishing: [],
      propertyType: []
    };

    // Reset UI
    const budgetSlider = document.getElementById("budget-slider");
    if (budgetSlider) budgetSlider.value = 50000000;
    document.getElementById("budget-display").textContent = "₹5.00 Cr";
    document.getElementById("location-select").value = "";
    document.getElementById("furnishing-select").value = "";
    document.getElementById("type-select").value = "";

    document.querySelectorAll(".bhk-tag.active, .amenity-filter-tag.active").forEach(t => {
      t.classList.remove("active");
    });

    renderDefaultResults();
    showToast("🔄 Filters reset");
  }

  // ── Quick Search ──
  function quickSearch(query) {
    const q = query.toLowerCase();
    const { properties } = window.HouseData;

    // Search by location, title, description, property type
    const results = properties.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.property_type.toLowerCase().includes(q)
    ).map(p => ({ ...p, similarity_score: 1.0 }));

    if (results.length > 0) {
      state.lastResults = results;
      renderResults(results, `Search results for "${query}"`);
      document.getElementById("results-section").scrollIntoView({ behavior: "smooth" });
    } else {
      showToast("😕 No properties found for your search");
    }
  }

  // ── Tabs ──
  function setupTabs() {
    document.querySelectorAll(".rec-tab").forEach(tab => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".rec-tab").forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        state.currentView = tab.dataset.mode;

        // Show/hide relevant sections
        const collabSection = document.getElementById("collab-user-section");
        if (collabSection) {
          collabSection.style.display = state.currentView === "collaborative" ? "block" : "none";
        }
      });
    });
  }

  // ── Run Preference Search ──
  function runPreferenceSearch() {
    const { properties } = window.HouseData;
    const results = window.Recommend.preferenceBased(state.filters, properties, 50);
    state.lastResults = results;

    const mode = state.currentView;
    let title = "Recommended Properties";

    if (mode === "content" && state.selectedProperty) {
      const contentResults = window.Recommend.contentBased(state.selectedProperty, properties, 12);
      state.lastResults = contentResults;
      title = `Properties similar to "${state.selectedProperty.title}"`;
      renderResults(contentResults, title);
      return;
    }

    if (mode === "collaborative" && state.activeUser) {
      const collabResults = window.Recommend.collaborative(
        state.activeUser.ratings,
        window.HouseData.users,
        properties,
        12
      );
      state.lastResults = collabResults;
      title = `Recommended for ${state.activeUser.name}`;
      renderResults(collabResults, title);
      return;
    }

    renderResults(results, title);
  }

  // ── Default Results ──
  function renderDefaultResults() {
    const { properties } = window.HouseData;
    // Show top properties sorted by a mix of newness and amenities
    const scored = properties.map(p => ({
      ...p,
      similarity_score: Math.round((1 - p.age_years / 20 + p.amenities.length / 16) / 2 * 100) / 100
    })).sort((a, b) => b.similarity_score - a.similarity_score);

    state.lastResults = scored;
    renderResults(scored, "Featured Properties");
  }

  // ── Render Results ──
  function renderResults(results, title = "Recommended Properties") {
    const container = document.getElementById("results-grid");
    const countEl = document.getElementById("results-count");
    const titleEl = document.getElementById("results-title");

    if (titleEl) titleEl.textContent = title;
    if (countEl) countEl.innerHTML = `Showing <strong>${results.length}</strong> properties`;

    if (!container) return;

    if (results.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">🏠</div>
          <div class="empty-state-text">No properties match your criteria</div>
          <div class="empty-state-sub">Try adjusting your filters for more results</div>
        </div>
      `;
      return;
    }

    // Sort results
    let sorted = [...results];
    switch (state.sortBy) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "area":
        sorted.sort((a, b) => b.area_sqft - a.area_sqft);
        break;
      default:
        sorted.sort((a, b) => (b.similarity_score || 0) - (a.similarity_score || 0));
    }

    container.innerHTML = sorted.map((p, i) => renderPropertyCard(p, i)).join("");

    // Attach event listeners
    container.querySelectorAll(".property-card").forEach(card => {
      card.addEventListener("click", (e) => {
        if (e.target.closest(".property-card-like")) return;
        const id = parseInt(card.dataset.id);
        openPropertyModal(id);
      });
    });

    container.querySelectorAll(".property-card-like").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        toggleLike(id, btn);
      });
    });

    // Animate cards
    container.querySelectorAll(".property-card").forEach((card, i) => {
      card.style.opacity = "0";
      card.style.transform = "translateY(20px)";
      setTimeout(() => {
        card.style.transition = "opacity 0.4s ease, transform 0.4s ease";
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
      }, i * 60);
    });
  }

  // ── Render Property Card ──
  function renderPropertyCard(property, index) {
    const isLiked = state.likedProperties.includes(property.id);
    const gradient = IMAGE_GRADIENTS[property.property_type] || IMAGE_GRADIENTS["Apartment"];
    const icon = TYPE_ICONS[property.property_type] || "🏠";
    const scorePercent = Math.round((property.similarity_score || 0) * 100);

    return `
      <div class="property-card" data-id="${property.id}">
        <div class="property-card-image">
          <div class="property-card-image-bg" style="background: ${gradient};">
            ${icon}
          </div>
          <span class="property-card-type">${property.property_type}</span>
          ${property.similarity_score !== undefined ? `<span class="property-card-score">${scorePercent}% Match</span>` : ''}
          <button class="property-card-like ${isLiked ? 'liked' : ''}" data-id="${property.id}" title="Like">
            ${isLiked ? '❤️' : '🤍'}
          </button>
        </div>
        <div class="property-card-body">
          <div class="property-card-price">${window.HouseData.formatPrice(property.price)}</div>
          <div class="property-card-title">${property.title}</div>
          <div class="property-card-location">
            📍 ${property.location}${property.floor > 0 ? ` · Floor ${property.floor}` : ''}
          </div>
          <div class="property-card-features">
            <div class="property-feature">
              <span class="property-feature-icon">🛏️</span>
              <strong>${property.bhk}</strong> BHK
            </div>
            <div class="property-feature">
              <span class="property-feature-icon">🚿</span>
              <strong>${property.bathrooms}</strong> Bath
            </div>
            <div class="property-feature">
              <span class="property-feature-icon">📐</span>
              <strong>${property.area_sqft.toLocaleString()}</strong> sq.ft
            </div>
            <div class="property-feature">
              <span class="property-feature-icon">🪑</span>
              ${property.furnishing.split('-')[0]}
            </div>
          </div>
          <div class="property-card-amenities">
            ${property.amenities.slice(0, 4).map(a => `<span class="amenity-tag">${AMENITY_ICONS[a] || ''} ${a}</span>`).join('')}
            ${property.amenities.length > 4 ? `<span class="amenity-tag">+${property.amenities.length - 4} more</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  // ── Like / Unlike ──
  function toggleLike(id, btn) {
    const idx = state.likedProperties.indexOf(id);
    if (idx >= 0) {
      state.likedProperties.splice(idx, 1);
      btn.classList.remove("liked");
      btn.innerHTML = "🤍";
      showToast("💔 Removed from favorites");
    } else {
      state.likedProperties.push(id);
      btn.classList.add("liked");
      btn.innerHTML = "❤️";
      btn.style.transform = "scale(1.3)";
      setTimeout(() => btn.style.transform = "", 200);
      showToast("❤️ Added to favorites");
    }
    localStorage.setItem("likedProperties", JSON.stringify(state.likedProperties));
  }

  // ── Sort ──
  window.sortResults = function (sortBy) {
    state.sortBy = sortBy;
    renderResults(state.lastResults, document.getElementById("results-title")?.textContent);
  };

  // ── Modal ──
  function setupModal() {
    const overlay = document.getElementById("modal-overlay");
    if (!overlay) return;

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });
  }

  function openPropertyModal(id) {
    const property = window.HouseData.properties.find(p => p.id === id);
    if (!property) return;

    state.selectedProperty = property;
    const overlay = document.getElementById("modal-overlay");
    const body = document.getElementById("modal-body");

    const gradient = IMAGE_GRADIENTS[property.property_type] || IMAGE_GRADIENTS["Apartment"];
    const icon = TYPE_ICONS[property.property_type] || "🏠";
    const isLiked = state.likedProperties.includes(property.id);

    body.innerHTML = `
      <div class="modal-image" style="background: ${gradient};">
        <span style="z-index:1; font-size:80px;">${icon}</span>
      </div>
      <div class="modal-price">${window.HouseData.formatPrice(property.price)}</div>
      <div class="modal-title">${property.title}</div>
      <div class="modal-location">📍 ${property.location} · ${property.property_type} · ${property.age_years === 0 ? 'New' : property.age_years + ' years old'}</div>

      <div class="modal-features-grid">
        <div class="modal-feature-card">
          <div class="modal-feature-card-icon">🛏️</div>
          <div class="modal-feature-card-value">${property.bhk}</div>
          <div class="modal-feature-card-label">Bedrooms</div>
        </div>
        <div class="modal-feature-card">
          <div class="modal-feature-card-icon">🚿</div>
          <div class="modal-feature-card-value">${property.bathrooms}</div>
          <div class="modal-feature-card-label">Bathrooms</div>
        </div>
        <div class="modal-feature-card">
          <div class="modal-feature-card-icon">📐</div>
          <div class="modal-feature-card-value">${property.area_sqft.toLocaleString()}</div>
          <div class="modal-feature-card-label">Sq. Ft.</div>
        </div>
        <div class="modal-feature-card">
          <div class="modal-feature-card-icon">🪑</div>
          <div class="modal-feature-card-value">${property.furnishing}</div>
          <div class="modal-feature-card-label">Furnishing</div>
        </div>
        ${property.floor > 0 ? `
        <div class="modal-feature-card">
          <div class="modal-feature-card-icon">🏗️</div>
          <div class="modal-feature-card-value">${property.floor}</div>
          <div class="modal-feature-card-label">Floor</div>
        </div>
        ` : ''}
      </div>

      <div class="modal-description">${property.description}</div>

      <div class="modal-amenities">
        <h3>Amenities & Features</h3>
        <div class="modal-amenities-grid">
          ${property.amenities.map(a => `<span class="modal-amenity-tag">${AMENITY_ICONS[a] || '✓'} ${a}</span>`).join('')}
        </div>
      </div>

      <div class="modal-actions">
        <button class="btn btn-primary" id="modal-find-similar" style="flex:1;">
          🔍 Find Similar Properties
        </button>
        <button class="btn btn-secondary" id="modal-like-btn" style="flex:1;">
          ${isLiked ? '❤️ Liked' : '🤍 Like This Property'}
        </button>
      </div>
    `;

    // Events
    document.getElementById("modal-find-similar").addEventListener("click", () => {
      closeModal();
      const results = window.Recommend.contentBased(property, window.HouseData.properties, 12);
      state.lastResults = results;
      state.currentView = "content";

      // Update tab
      document.querySelectorAll(".rec-tab").forEach(t => t.classList.remove("active"));
      document.querySelector('[data-mode="content"]')?.classList.add("active");

      renderResults(results, `Properties similar to "${property.title}"`);
      document.getElementById("results-section").scrollIntoView({ behavior: "smooth" });
    });

    document.getElementById("modal-like-btn").addEventListener("click", function () {
      const idx = state.likedProperties.indexOf(property.id);
      if (idx >= 0) {
        state.likedProperties.splice(idx, 1);
        this.innerHTML = "🤍 Like This Property";
        showToast("💔 Removed from favorites");
      } else {
        state.likedProperties.push(property.id);
        this.innerHTML = "❤️ Liked";
        showToast("❤️ Added to favorites");
      }
      localStorage.setItem("likedProperties", JSON.stringify(state.likedProperties));
    });

    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    const overlay = document.getElementById("modal-overlay");
    if (overlay) {
      overlay.classList.remove("active");
      document.body.style.overflow = "";
    }
  }

  // Expose close for the close button
  window.closeModal = closeModal;

  // ── Collaborative Section ──
  function setupCollaborativeSection() {
    const container = document.getElementById("user-profiles-container");
    if (!container) return;

    const { users } = window.HouseData;

    container.innerHTML = users.map((user, i) => `
      <div class="user-card" data-user-id="${user.id}">
        <div class="user-avatar" style="background: ${USER_COLORS[i]};">
          ${user.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div class="user-info">
          <span class="user-name">${user.name}</span>
          <span class="user-pref">Budget: ${window.HouseData.formatPrice(user.preferences.budget_max)} · ${user.preferences.preferred_bhk} BHK</span>
        </div>
      </div>
    `).join('');

    container.querySelectorAll(".user-card").forEach(card => {
      card.addEventListener("click", () => {
        container.querySelectorAll(".user-card").forEach(c => c.classList.remove("active"));
        card.classList.add("active");

        const userId = parseInt(card.dataset.userId);
        state.activeUser = users.find(u => u.id === userId);

        // Run collaborative filtering
        const results = window.Recommend.collaborative(
          state.activeUser.ratings,
          users,
          window.HouseData.properties,
          12
        );

        state.lastResults = results;
        renderResults(results, `Recommended for ${state.activeUser.name}`);
        document.getElementById("results-section").scrollIntoView({ behavior: "smooth" });
      });
    });
  }

  // ── Charts ──
  function initCharts() {
    const { properties } = window.HouseData;

    // 1. Average Price by Location (Bar Chart)
    window.Charts.observeChart("chart-price-location", () => {
      const locationPrices = {};
      properties.forEach(p => {
        if (!locationPrices[p.location]) locationPrices[p.location] = [];
        locationPrices[p.location].push(p.price);
      });

      const barData = Object.entries(locationPrices).map(([loc, prices]) => ({
        label: loc,
        value: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
      })).sort((a, b) => b.value - a.value);

      window.Charts.drawBarChart("chart-price-location", barData, {
        title: "Average Price by Location"
      });
    });

    // 2. Price vs Area (Scatter Plot)
    window.Charts.observeChart("chart-price-area", () => {
      const locations = [...new Set(properties.map(p => p.location))].sort();
      const colorMap = {};
      locations.forEach((loc, i) => {
        colorMap[loc] = [
          "#f59e0b", "#ef4444", "#3b82f6", "#10b981", "#8b5cf6",
          "#ec4899", "#06b6d4", "#f97316", "#14b8a6", "#6366f1"
        ][i % 10];
      });

      const scatterData = properties.map(p => ({
        x: p.area_sqft,
        y: p.price,
        label: p.title,
        color: colorMap[p.location],
        bhk: p.bhk
      }));

      window.Charts.drawScatterPlot("chart-price-area", scatterData, {
        title: "Price vs Area (sq.ft)"
      });
    });

    // 3. BHK Distribution (Donut)
    window.Charts.observeChart("chart-bhk-dist", () => {
      const bhkCounts = {};
      properties.forEach(p => {
        const key = p.bhk + " BHK";
        bhkCounts[key] = (bhkCounts[key] || 0) + 1;
      });

      const donutData = Object.entries(bhkCounts)
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => parseInt(a.label) - parseInt(b.label));

      window.Charts.drawDonutChart("chart-bhk-dist", donutData, {
        title: "BHK Distribution"
      });
    });

    // 4. Property Type Distribution (Donut)
    window.Charts.observeChart("chart-type-dist", () => {
      const typeCounts = {};
      properties.forEach(p => {
        typeCounts[p.property_type] = (typeCounts[p.property_type] || 0) + 1;
      });

      const typeData = Object.entries(typeCounts)
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value);

      window.Charts.drawDonutChart("chart-type-dist", typeData, {
        title: "Property Type Distribution"
      });
    });
  }

  // ── Scroll Reveal ──
  function setupScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
  }

  // ── Toast ──
  function showToast(message) {
    const container = document.querySelector(".toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = message;
    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 3000);
  }

  // ── Boot ──
  document.addEventListener("DOMContentLoaded", init);

  // Export
  window.HouseUI = {
    showToast,
    openPropertyModal,
    closeModal,
    runPreferenceSearch,
    renderResults,
    state
  };
})();
