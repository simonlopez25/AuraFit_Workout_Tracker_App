/**
 * AuraFit Pro — ui.js
 * Controlador del "shell" de escritorio: conecta los accesos de la sidebar
 * con los componentes reales de la app, reutilizando los botones existentes
 * (disparando su .click()) para no duplicar lógica ni IDs.
 *
 * @module ui
 */
(function () {
  "use strict";

  /* ----------------------------------------------------------------------
     Mapa: data-nav-action -> id del botón/control real que debe activarse.
     ---------------------------------------------------------------------- */
  const ACTIONS = {
    "go-strength": "btnSwitchStrength",
    "go-cardio": "btnSwitchCardio",
    "open-new-routine": "btnNewRoutineModal",
    "open-profile": "btnOpenProfileBadges",
    "open-analyst": "btnOpenAnalyst",
    "open-import": "btnOpenSmartImport",
    "open-backup": "btnExportRoutines",
    "open-sync": "btnOpenAuthModal",
  };

  /* ----------------------------------------------------------------------
     Resaltado del item activo en la sidebar.
     ---------------------------------------------------------------------- */
  function setActive(item) {
    document.querySelectorAll(".desktop-sidebar [data-nav-action]").forEach((el) => {
      el.classList.remove("is-active");
    });
    if (item) item.classList.add("is-active");
  }

  /* ----------------------------------------------------------------------
     Sincroniza el item activo con el módulo actual (Fuerza vs Cardio).
     ---------------------------------------------------------------------- */
  function syncWithModule() {
    const strength = document.getElementById("btnSwitchStrength");
    const cardio = document.getElementById("btnSwitchCardio");
    if (!strength || !cardio) return;
    const strengthActive = strength.classList.contains("active-strength");
    document.querySelectorAll(".desktop-sidebar [data-nav-action]").forEach((el) => {
      const action = el.dataset.navAction;
      if (action === "go-strength") el.classList.toggle("is-active", strengthActive);
      if (action === "go-cardio") el.classList.toggle("is-active", !strengthActive);
    });
  }

  /* ----------------------------------------------------------------------
     Refleja el usuario en la sidebar (desde los elementos del header).
     ---------------------------------------------------------------------- */
  function syncUserPill() {
    const nameEl = document.getElementById("sidebarUserName");
    const levelEl = document.getElementById("sidebarUserLevel");
    if (!nameEl) return;
    const emailEl = document.getElementById("headerUserEmail");
    const levelLabel = document.getElementById("xpLevelLabel");
    const xpLabel = document.getElementById("xpCurrentLabel");
    if (emailEl && emailEl.textContent.trim() !== "usuario" && emailEl.textContent.trim()) {
      nameEl.textContent = emailEl.textContent.trim();
    }
    if (levelEl && levelLabel) {
      const xp = xpLabel ? xpLabel.textContent.trim() : "";
      levelEl.textContent = levelLabel.textContent.trim() + (xp ? " · " + xp : "");
    }
  }

  /* ----------------------------------------------------------------------
     Inicialización.
     ---------------------------------------------------------------------- */
  function init() {
    const sidebar = document.getElementById("desktopSidebar");
    if (!sidebar) return;

    sidebar.addEventListener("click", (ev) => {
      const item = ev.target.closest("[data-nav-action]");
      if (!item) return;
      const coreId = ACTIONS[item.dataset.navAction];
      if (coreId) {
        const btn = document.getElementById(coreId);
        if (btn) btn.click();
      }
      setActive(item);
    });

    // Mantener sincronía entre el conmutador y la sidebar.
    ["btnSwitchStrength", "btnSwitchCardio"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("click", syncWithModule);
    });

    syncWithModule();
    syncUserPill();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();