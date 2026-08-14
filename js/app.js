/**
 * AuraFit Pro — Main Application Engine (app.js)
 * Refactorizado bajo los principios de Mínima Fricción durante el Entrenamiento.
 */

document.addEventListener("DOMContentLoaded", async () => {
  if (typeof authManager !== "undefined") {
    await authManager.init();
  }
  await routineManager.init();

  const $ = id => document.getElementById(id);

  let activeRoutineId = null;
  let activeDay = null;
  let plannedDay = null;
  let editingId = null;
  let draft = [];
  let mode = "traditional";
  let workoutStartedAt = null;
  let workoutTimerInterval = null;
  let activeSession = null;
  let importImageData = null;
  let activeModule = "strength";

  // Estado del selector muscular modal
  let musclePickerSelectedCategory = "Todos";
  let musclePickerSelectedSub = "Todos";
  let musclePickerTargetRowIndex = null;

  const els = {
    strength: $("strengthPanel"),
    cardio: $("cardioPanel"),
    tabs: $("routineTabs"),
    stream: $("activeRoutineContainer"),
    analyst: $("analystMessage"),
    grid: $("calendarWeekGrid"),
    editor: $("modalNewRoutine"),
    name: $("newRoutineName"),
    weekdays: $("newRoutineWeekdays"),
    exercises: $("newExercisesList"),
    assign: $("modalDayAssign"),
    assignTitle: $("dayAssignTitle"),
    assignSub: $("dayAssignSubtitle"),
    assignSelect: $("dayAssignRoutineSelect"),
    summary: $("modalPostWorkoutSummary"),
    importer: $("modalSmartImport"),
    importText: $("importTextContent"),
    importPreview: $("importPreviewContainer"),
    importFile: $("importFileInput"),
    scheduledActions: $("scheduledWorkoutActions"),
    repeatStrength: $("dayAssignRepeatWeekly"),
    repeatCardio: $("dayAssignCardioRepeatWeekly"),
    repeatStrengthLabel: $("dayAssignRepeatStrengthLabel"),
    repeatCardioLabel: $("dayAssignRepeatCardioLabel"),
    cardioDistance: $("cardioDistanceInput"),
    cardioWeight: $("cardioWeightInput"),
    cardioDigits: $("cardioDigits"),
    cardioConfigView: $("cardioConfigView"),
    cardioActiveView: $("cardioActiveView"),
    cardioActiveActivityName: $("cardioActiveActivityName"),
    cardioActivePace: $("cardioActivePace"),
    cardioActiveDist: $("cardioActiveDist"),
    cardioActiveKcal: $("cardioActiveKcal"),
    modalProfileBadges: $("modalProfileBadges"),
    modalMusclePicker: $("modalMusclePicker"),
    modalAnalyst: $("modalAnalyst"),
    contextActionBar: $("contextActionBar"),
    contextTimerDisplay: $("contextTimerDisplay"),
    contextElapsed: $("contextElapsed"),
    contextPrimaryBtn: $("contextPrimaryBtn"),
    btnContextSecondary: $("btnContextSecondary")
  };

  const esc = value =>
    String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  const uid = prefix => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  // =========================================================================
  // GESTIÓN DE MÓDULOS (FUERZA VS CARDIO)
  // =========================================================================
  function selectModule(name) {
    activeModule = name;
    const isStrength = name === "strength";

    $("btnSwitchStrength").className = `module-btn${isStrength ? " active-strength" : ""}`;
    $("btnSwitchCardio").className = `module-btn${isStrength ? "" : " active-cardio"}`;
    $("btnSwitchStrength").setAttribute("aria-selected", String(isStrength));
    $("btnSwitchCardio").setAttribute("aria-selected", String(!isStrength));

    els.strength.classList.toggle("hidden", !isStrength);
    els.cardio.classList.toggle("hidden", isStrength);

    updateContextActionBar();
  }

  // =========================================================================
  // BARRA CONTEXTUAL INFERIOR DINÁMICA (CTA ÚNICO)
  // =========================================================================
  function updateContextActionBar() {
    if (activeModule === "strength") {
      const isRunning = Boolean(activeSession && activeSession.type === "strength");
      const routine = routineManager.getRoutineById(activeRoutineId);
      const hasValidRoutine = Boolean(routine && routine.exercises && routine.exercises.length);

      if (isRunning) {
        els.contextTimerDisplay.classList.remove("hidden");
        els.btnContextSecondary.classList.add("hidden");
        els.contextPrimaryBtn.textContent = "🏁 Finalizar Entrenamiento";
        els.contextPrimaryBtn.classList.add("finish-mode");
        els.contextPrimaryBtn.classList.remove("btn-disabled");
        els.contextPrimaryBtn.disabled = false;
        els.contextPrimaryBtn.title = "";
      } else {
        els.contextTimerDisplay.classList.add("hidden");
        els.btnContextSecondary.classList.add("hidden");
        els.contextPrimaryBtn.textContent = plannedDay ? "▶ Iniciar rutina programada" : "▶ Iniciar rutina seleccionada";
        els.contextPrimaryBtn.classList.remove("finish-mode");

        if (!hasValidRoutine) {
          els.contextPrimaryBtn.disabled = true;
          els.contextPrimaryBtn.classList.add("btn-disabled");
          els.contextPrimaryBtn.title = "Selecciona o crea una rutina para comenzar";
        } else {
          els.contextPrimaryBtn.disabled = false;
          els.contextPrimaryBtn.classList.remove("btn-disabled");
          els.contextPrimaryBtn.title = "";
        }
      }
    } else {
      // Cardio
      const isRunning = cardioManager.isActiveWorkout;

      if (isRunning) {
        els.contextTimerDisplay.classList.add("hidden");
        els.btnContextSecondary.classList.remove("hidden");
        els.btnContextSecondary.textContent = cardioManager.isPaused ? "▶ Reanudar" : "⏸ Pausa";
        els.contextPrimaryBtn.textContent = "🏁 Finalizar Cardio";
        els.contextPrimaryBtn.classList.add("finish-mode");
        els.contextPrimaryBtn.classList.remove("btn-disabled");
        els.contextPrimaryBtn.disabled = false;
        els.contextPrimaryBtn.title = "";
      } else {
        els.contextTimerDisplay.classList.add("hidden");
        els.btnContextSecondary.classList.add("hidden");
        els.contextPrimaryBtn.textContent = `▶ Iniciar ${cardioManager.selectedActivity}`;
        els.contextPrimaryBtn.classList.remove("finish-mode");
        els.contextPrimaryBtn.classList.remove("btn-disabled");
        els.contextPrimaryBtn.disabled = false;
        els.contextPrimaryBtn.title = "";
      }
    }
  }

  function handlePrimaryCtaClick() {
    if (activeModule === "strength") {
      if (activeSession && activeSession.type === "strength") {
        finishStrength();
      } else {
        const routine = routineManager.getRoutineById(activeRoutineId);
        if (!routine || !routine.exercises.length) {
          return alert("Selecciona o crea una rutina con ejercicios antes de iniciar.");
        }
        startStrengthWorkout();
      }
    } else {
      // Cardio
      if (cardioManager.isActiveWorkout) {
        finishCardioWorkout();
      } else {
        startCardioWorkout();
      }
    }
  }

  function handleSecondaryCtaClick() {
    if (activeModule === "cardio" && cardioManager.isActiveWorkout) {
      toggleCardioPauseResume();
    }
  }

  // =========================================================================
  // GAMIFICACIÓN & PROGRESO DEL ATLETA
  // =========================================================================
  function renderProgress() {
    const state = gamificationEngine.state;
    const level = gamificationEngine.getLevelInfo();

    // Banner compacto de 1 línea
    $("xpLevelLabel").textContent = `Nivel ${level.level}`;
    $("totalSessionsText").textContent = state.totalSessions;
    $("totalVolumeText").textContent = `${Math.round(state.totalKgLifted)} kg`;
    $("xpCurrentLabel").textContent = `${state.xp} XP`;
    $("athleteLevelIcon").textContent = level.badgeIcon;

    // Modal de perfil / logros
    $("profileLevelIconModal").textContent = level.badgeIcon;
    $("athleteLevelTitle").textContent = level.title;
    $("profileLevelSub").textContent = `Nivel ${level.level} de Atleta AuraFit Pro`;
    $("profileModalSessions").textContent = state.totalSessions;
    $("profileModalVolume").textContent = `${Math.round(state.totalKgLifted)} kg`;
    $("totalMinutesText").textContent = `${Math.round(state.totalMinutes)} min`;
    $("profileModalXpText").textContent = `${state.xp} XP`;
    $("xpNextLabel").textContent = level.level === 5 ? "Nivel máximo" : `Siguiente: ${level.nextLevelXP} XP`;
    $("xpFillBar").style.width = `${level.pct}%`;

    // Badges en el modal secundario
    $("badgesContainer").innerHTML = gamificationEngine
      .getBadgesCatalog()
      .map(
        badge => `
        <article class="badge-item ${state.unlockedBadges.includes(badge.id) ? "unlocked" : ""}" title="${esc(badge.desc)}">
          <span>${badge.icon}</span>
          <span>${esc(badge.name)}</span>
        </article>
      `
      )
      .join("");
  }

  function openProfileBadgesModal() {
    renderProgress();
    els.modalProfileBadges.classList.remove("hidden");
  }

  function closeProfileBadgesModal() {
    els.modalProfileBadges.classList.add("hidden");
  }

  // =========================================================================
  // ANALISTA DEPORTIVO IA (MODAL BAJO DEMANDA)
  // =========================================================================
  function openAnalystModal() {
    const routine = routineManager.getRoutineById(activeRoutineId);
    if (!routine || !routine.exercises.length) {
      els.analyst.innerHTML = "<p class='analyst-empty-state'>Selecciona o crea una rutina con ejercicios para ver sugerencias biomecánicas.</p>";
    } else {
      els.analyst.innerHTML = routine.exercises
        .map((ex, index) => {
          const catalogItem = findExerciseInCatalog(ex.name);
          const benefit = catalogItem?.benefit || "Optimiza el reclutamiento muscular mediante un rango completo y tempo controlado.";
          const cues = catalogItem?.technique || ["Mantén tensión en la fase excéntrica.", "Evita impulsos o compensaciones articulares."];

          return `
            <article class='analyst-exercise'>
              <div>
                <strong>${index + 1}. ${esc(ex.name)}</strong>
                <span class='badge-muscle'>${Number(ex.sets)} × ${Number(ex.defaultReps)}${ex.perSide ? " por lado" : ""}</span>
              </div>
              <p style="font-size:0.8rem; color:var(--text-subtle); margin-top:4px;">💡 ${esc(benefit)}</p>
              <ul>
                ${cues.slice(0, 2).map(c => `<li>${esc(c)}</li>`).join("")}
              </ul>
            </article>
          `;
        })
        .join("");
    }
    els.modalAnalyst.classList.remove("hidden");
  }

  function closeAnalystModal() {
    els.modalAnalyst.classList.add("hidden");
  }

  // =========================================================================
  // SELECTOR MUSCULAR JERÁRQUICO DETALLADO (MODAL)
  // =========================================================================
  function openMusclePicker(targetRowIndex = null) {
    musclePickerTargetRowIndex = targetRowIndex;
    musclePickerSelectedCategory = "Todos";
    musclePickerSelectedSub = "Todos";
    $("musclePickerSearchInput").value = "";
    renderMusclePicker();
    els.modalMusclePicker.classList.remove("hidden");
  }

  function closeMusclePicker() {
    els.modalMusclePicker.classList.add("hidden");
    musclePickerTargetRowIndex = null;
  }

  function renderMusclePicker() {
    // 1. Pestañas de categorías principales
    const categories = getMuscleCategories();
    $("muscleCategoryTabs").innerHTML = categories
      .map(
        cat => `
        <button type="button" class="muscle-cat-tab ${cat === musclePickerSelectedCategory ? "active" : ""}" data-cat="${esc(cat)}">
          ${esc(cat)}
        </button>
      `
      )
      .join("");

    $("muscleCategoryTabs").querySelectorAll(".muscle-cat-tab").forEach(btn => {
      btn.onclick = () => {
        musclePickerSelectedCategory = btn.dataset.cat;
        musclePickerSelectedSub = "Todos";
        renderMusclePicker();
      };
    });

    // 2. Chips de sub-regiones anatómicas detalladas
    const subMuscles = getSubMusclesForCategory(musclePickerSelectedCategory);
    if (subMuscles.length) {
      $("subMuscleChipsContainer").classList.remove("hidden");
      $("subMuscleChipsContainer").innerHTML = `
        <button type="button" class="submuscle-chip ${musclePickerSelectedSub === "Todos" ? "active" : ""}" data-sub="Todos">
          Todos (${musclePickerSelectedCategory})
        </button>
        ${subMuscles
          .map(
            sub => `
          <button type="button" class="submuscle-chip ${sub === musclePickerSelectedSub ? "active" : ""}" data-sub="${esc(sub)}">
            ${esc(sub)}
          </button>
        `
          )
          .join("")}
      `;

      $("subMuscleChipsContainer").querySelectorAll(".submuscle-chip").forEach(btn => {
        btn.onclick = () => {
          musclePickerSelectedSub = btn.dataset.sub;
          renderMusclePicker();
        };
      });
    } else {
      $("subMuscleChipsContainer").classList.add("hidden");
      $("subMuscleChipsContainer").innerHTML = "";
    }

    // 3. Grid de ejercicios filtrados
    const query = $("musclePickerSearchInput").value.trim();
    const matches = filterExercises(
      query,
      musclePickerSelectedCategory === "Todos" ? null : musclePickerSelectedCategory,
      musclePickerSelectedSub === "Todos" ? null : musclePickerSelectedSub
    );

    if (!matches.length) {
      $("musclePickerBody").innerHTML = `<p class="analyst-empty-state" style="grid-column: 1 / -1;">No se encontraron ejercicios coincidentes. Puedes escribir cualquier nombre personalizado en la rutina.</p>`;
      return;
    }

    $("musclePickerBody").innerHTML = matches
      .map(
        ex => `
      <article class="muscle-picker-card">
        <div class="muscle-card-header">
          <div class="muscle-card-title">${esc(ex.name)}</div>
          <div class="muscle-card-badges">
            <span class="badge-muscle">${esc(ex.category)}${ex.subMuscle ? ` · ${esc(ex.subMuscle)}` : ""}</span>
          </div>
        </div>
        <p class="muscle-card-desc">${esc(ex.benefit || "")}</p>
        <button type="button" class="btn-add-muscle-ex" data-name="${esc(ex.name)}" data-load="${esc(ex.type)}">
          + Seleccionar para la rutina
        </button>
      </article>
    `
      )
      .join("");

    $("musclePickerBody").querySelectorAll(".btn-add-muscle-ex").forEach(btn => {
      btn.onclick = () => {
        const exName = btn.dataset.name;
        if (musclePickerTargetRowIndex !== null && draft[musclePickerTargetRowIndex]) {
          draft[musclePickerTargetRowIndex].name = exName;
        } else {
          draft.push({
            id: uid("exercise"),
            name: exName,
            sets: 3,
            defaultReps: 10,
            defaultWeight: 0,
            perSide: false
          });
        }
        renderDraft();
        closeMusclePicker();
      };
    });
  }

  // =========================================================================
  // EDITOR DE RUTINAS CON BÚSQUEDA PREDICTIVA CUSTOM
  // =========================================================================
  function openEditor(id = null) {
    editingId = id;
    const routine = id && routineManager.getRoutineById(id);
    $("modalRoutineTitle").textContent = routine ? "Editar Rutina" : "Nueva Rutina";
    els.name.value = routine?.name || "";

    const selectedDays = new Set(routine?.weekdays || []);
    els.weekdays.querySelectorAll("input").forEach(input => {
      input.checked = selectedDays.has(Number(input.value));
    });

    draft = routine ? structuredClone(routine.exercises) : [];
    if (!draft.length) {
      draft.push({ id: uid("exercise"), name: "", sets: 3, defaultReps: 10, defaultWeight: 0, perSide: false });
    }
    renderDraft();
    els.editor.classList.remove("hidden");
  }

  function renderDraft() {
    els.exercises.innerHTML = draft.length ? "" : "<p class='analyst-empty-state'>Añade ejercicios para comenzar.</p>";

    draft.forEach((ex, index) => {
      const row = document.createElement("article");
      row.className = "ex-input-row";
      row.innerHTML = `
        <div class='ex-row-header'>
          <strong>Ejercicio ${index + 1}</strong>
          <div style="display:flex; gap:6px;">
            <button class='btn-secondary-sm btn-browse-row' type='button' title='Explorar por músculo' style='min-height:34px; padding:4px 8px; font-size:0.75rem;'>
              📋 Explorar
            </button>
            <button class='btn-delete-row' type='button' title='Eliminar ejercicio'>×</button>
          </div>
        </div>
        <div class='ex-fields-grid'>
          <div class='form-group'>
            <label>Nombre del Ejercicio</label>
            <div class='predictive-search-wrap'>
              <input class='predictive-input draft-name' type='text' autocomplete='off' placeholder='Escribe o selecciona...' value='${esc(ex.name)}'>
              <div class='predictive-dropdown hidden'></div>
            </div>
          </div>
          <div class='form-group'>
            <label>Series</label>
            <input class='draft-sets' type='number' min='1' max='30' value='${ex.sets || 3}'>
          </div>
          <div class='form-group'>
            <label>Reps</label>
            <input class='draft-reps' type='number' min='1' max='100' value='${ex.defaultReps || 10}'>
          </div>
          <div class='form-group'>
            <label>Carga kg</label>
            <input class='draft-weight' type='number' min='0' step='0.5' value='${ex.defaultWeight || 0}'>
          </div>
        </div>
        <label class='check-label'>
          <input class='draft-side' type='checkbox' ${ex.perSide ? "checked" : ""}> Repeticiones por lado
        </label>
      `;

      // Eliminar fila
      row.querySelector(".btn-delete-row").onclick = () => {
        draft.splice(index, 1);
        renderDraft();
      };

      // Abrir selector muscular para esta fila
      row.querySelector(".btn-browse-row").onclick = () => {
        openMusclePicker(index);
      };

      // Autocomplete predictivo inteligente sin selects nativos
      const input = row.querySelector(".draft-name");
      const dropdown = row.querySelector(".predictive-dropdown");

      const showSuggestions = () => {
        const query = input.value.trim();
        const matches = filterExercises(query).slice(0, 7);

        if (!matches.length) {
          dropdown.classList.add("hidden");
          dropdown.innerHTML = "";
          return;
        }

        dropdown.innerHTML = matches
          .map(
            m => `
          <div class='predictive-item' data-name='${esc(m.name)}'>
            <span class='predictive-item-name'>${esc(m.name)}</span>
            <span class='predictive-item-badge'>${esc(m.category)}${m.subMuscle ? ` · ${esc(m.subMuscle)}` : ""}</span>
          </div>
        `
          )
          .join("");

        dropdown.classList.remove("hidden");

        dropdown.querySelectorAll(".predictive-item").forEach(item => {
          item.onmousedown = e => {
            e.preventDefault();
            input.value = item.dataset.name;
            draft[index].name = item.dataset.name;
            dropdown.classList.add("hidden");
          };
        });
      };

      input.addEventListener("input", () => {
        draft[index].name = input.value;
        showSuggestions();
      });

      input.addEventListener("focus", showSuggestions);
      input.addEventListener("blur", () => {
        setTimeout(() => dropdown.classList.add("hidden"), 200);
      });

      row.querySelector(".draft-sets").onchange = e => {
        draft[index].sets = Number(e.target.value) || 1;
      };
      row.querySelector(".draft-reps").onchange = e => {
        draft[index].defaultReps = Number(e.target.value) || 1;
      };
      row.querySelector(".draft-weight").onchange = e => {
        draft[index].defaultWeight = Number(e.target.value) || 0;
      };
      row.querySelector(".draft-side").onchange = e => {
        draft[index].perSide = e.target.checked;
      };

      els.exercises.appendChild(row);
    });
  }

  async function saveRoutine() {
    const name = els.name.value.trim();
    if (!name) return alert("Por favor, introduce un nombre para la rutina.");

    const rows = [...els.exercises.querySelectorAll(".ex-input-row")];
    const weekdays = [...els.weekdays.querySelectorAll("input:checked")].map(input => Number(input.value));

    const finalDraft = rows
      .map((row, index) => ({
        id: draft[index]?.id || uid("exercise"),
        name: row.querySelector(".draft-name").value.trim(),
        sets: Math.max(1, Number(row.querySelector(".draft-sets").value) || 1),
        defaultReps: Math.max(1, Number(row.querySelector(".draft-reps").value) || 1),
        defaultWeight: Number(row.querySelector(".draft-weight").value) || 0,
        loadType: "bodyweight",
        perSide: row.querySelector(".draft-side").checked
      }))
      .filter(ex => ex.name.length > 0);

    if (!finalDraft.length) return alert("Añade al menos un ejercicio con nombre a la rutina.");

    const saved = await routineManager.saveRoutine({
      id: editingId || uid("routine"),
      name,
      weekdays,
      exercises: finalDraft
    });

    calendarManager.replaceRoutineWeeklyAssignments(saved.id, weekdays);
    activeRoutineId = saved.id;
    els.editor.classList.add("hidden");
    renderTabs();
    renderWorkout();
    renderCalendar();
  }

  // =========================================================================
  // PLANIFICADOR SEMANAL
  // =========================================================================
  function renderCalendar() {
    const routines = routineManager.getAllRoutines();
    els.grid.innerHTML = "";

    calendarManager.getCurrentWeekDays().forEach(day => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = `calendar-day-card ${day.isToday ? "today" : ""}`;

      let status = "<span class='day-status-badge status-rest'>Libre</span>";
      if (day.isCompleted) {
        status = "<span class='day-status-badge status-completed'>✓ Completado</span>";
      } else if (day.scheduled?.type === "cardio") {
        status = `<span class='day-status-badge status-cardio-scheduled'>${day.scheduled.recurring ? "↻ " : "🏃 "}${esc(day.scheduled.activity)}</span>`;
      } else if (day.scheduled) {
        const found = routines.find(r => r.id === day.scheduled.routineId);
        status = `<span class='day-status-badge status-scheduled'>${day.scheduled.recurring ? "↻ " : ""}${esc(found?.name || "Rutina")}</span>`;
      }

      card.innerHTML = `<span class="day-name">${day.dayName}</span><span class="day-number">${day.dayNumber}</span>${status}`;
      card.addEventListener("click", () => openDay(day));
      els.grid.appendChild(card);
    });
  }

  function openDay(day) {
    activeDay = day;
    const weekdayName = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"][day.dayIndex];
    els.assignTitle.textContent = `Planificar ${day.dayName} ${day.dayNumber}`;
    els.assignSub.textContent = day.isCompleted
      ? "Esta sesión ya fue completada."
      : day.scheduled?.recurring
        ? `Esta actividad se repite todos los ${weekdayName}.`
        : "Elige una actividad puntual o repítela semanalmente.";

    els.assignSelect.innerHTML = `<option value="">Selecciona una rutina…</option>${routineManager
      .getAllRoutines()
      .map(r => `<option value="${esc(r.id)}" ${day.scheduled?.routineId === r.id ? "selected" : ""}>${esc(r.name)}</option>`)
      .join("")}`;

    els.repeatStrength.checked = day.scheduled?.type === "strength" && Boolean(day.scheduled.recurring);
    els.repeatCardio.checked = day.scheduled?.type === "cardio" && Boolean(day.scheduled.recurring);
    els.repeatStrengthLabel.textContent = `Repetir todos los ${weekdayName}`;
    els.repeatCardioLabel.textContent = `Repetir todos los ${weekdayName}`;

    $("btnAssignRoutineToDay").textContent = `✓ Guardar ${els.repeatStrength.checked ? `todos los ${weekdayName}` : "solo este día"}`;
    $("btnAssignCardioToDay").textContent = `🏃 Guardar ${els.repeatCardio.checked ? `todos los ${weekdayName}` : "solo este día"}`;

    els.repeatStrength.onchange = () => {
      $("btnAssignRoutineToDay").textContent = `✓ Guardar ${els.repeatStrength.checked ? `todos los ${weekdayName}` : "solo este día"}`;
    };
    els.repeatCardio.onchange = () => {
      $("btnAssignCardioToDay").textContent = `🏃 Guardar ${els.repeatCardio.checked ? `todos los ${weekdayName}` : "solo este día"}`;
    };

    const scheduled = day.scheduled;
    if (scheduled?.type === "strength") {
      const routine = routineManager.getRoutineById(scheduled.routineId);
      els.scheduledActions.innerHTML = `<p>Rutina programada: <strong>${esc(routine?.name || "Rutina eliminada")}</strong></p><button type="button" class="btn-primary btn-full">▶ Realizar esta rutina ahora</button>`;
      els.scheduledActions.classList.remove("hidden");
      els.scheduledActions.querySelector("button").onclick = () => {
        els.assign.classList.add("hidden");
        startStrengthWorkout(scheduled.routineId, day.isoDate);
      };
    } else if (scheduled?.type === "cardio") {
      els.scheduledActions.innerHTML = `<p>Cardio programado: <strong>${esc(scheduled.activity)}</strong></p><button type="button" class="btn-cardio-assign btn-full">▶ Iniciar cardio ahora</button>`;
      els.scheduledActions.classList.remove("hidden");
      els.scheduledActions.querySelector("button").onclick = () => {
        plannedDay = day.isoDate;
        els.assign.classList.add("hidden");
        selectModule("cardio");
      };
    } else {
      els.scheduledActions.classList.add("hidden");
      els.scheduledActions.innerHTML = "";
    }

    els.assign.classList.remove("hidden");
  }

  // =========================================================================
  // EJECUCIÓN DE ENTRENAMIENTO DE FUERZA
  // =========================================================================
  function renderTabs() {
    const routines = routineManager.getAllRoutines();
    const managementActions = document.querySelector(".routine-management-actions");
    const tabsWrapper = document.querySelector(".routine-tabs-wrapper");

    if (!routines.length) {
      activeRoutineId = null;
      els.tabs.innerHTML = "";
      if (tabsWrapper) tabsWrapper.classList.add("hidden");
      if (managementActions) managementActions.classList.add("hidden");
      return;
    }

    if (tabsWrapper) tabsWrapper.classList.remove("hidden");
    if (managementActions) managementActions.classList.remove("hidden");

    if (!activeRoutineId || !routines.some(r => r.id === activeRoutineId)) {
      activeRoutineId = routines[0].id;
    }

    els.tabs.innerHTML = "";
    routines.forEach(routine => {
      const button = document.createElement("button");
      button.className = `tab-btn ${routine.id === activeRoutineId ? "active" : ""}`;
      button.textContent = routine.name;
      button.onclick = () => {
        if (activeSession) return alert("Finaliza la sesión actual antes de cambiar de rutina.");
        activeRoutineId = routine.id;
        plannedDay = null;
        workoutStartedAt = null;
        renderTabs();
        renderWorkout();
        updateContextActionBar();
      };
      els.tabs.appendChild(button);
    });
  }

  function startStrengthWorkout(routineId = activeRoutineId, isoDate = null) {
    const routine = routineManager.getRoutineById(routineId);
    if (!routine) return alert("Primero guarda o selecciona una rutina.");
    if (!routine.exercises.length) return alert("Añade ejercicios a esta rutina antes de iniciarla.");

    activeRoutineId = routineId;
    plannedDay = isoDate;
    activeSession = { type: "strength", routineId, isoDate };
    workoutStartedAt = Date.now();

    // Iniciar cronómetro de sesión para la barra flotante
    if (workoutTimerInterval) clearInterval(workoutTimerInterval);
    workoutTimerInterval = setInterval(() => {
      const elapsedSec = Math.floor((Date.now() - workoutStartedAt) / 1000);
      const mins = Math.floor(elapsedSec / 60).toString().padStart(2, "0");
      const secs = (elapsedSec % 60).toString().padStart(2, "0");
      els.contextElapsed.textContent = `${mins}:${secs}`;
    }, 1000);

    selectModule("strength");
    renderTabs();
    renderWorkout();
    updateContextActionBar();
  }

  function circuitState(routine) {
    const checks = [...els.stream.querySelectorAll(".set-check.completed")];
    const done = new Set(checks.map(button => `${button.dataset.exercise}:${button.dataset.set}`));
    const totalRounds = Math.max(...routine.exercises.map(exercise => Number(exercise.sets)), 0);
    for (let round = 1; round <= totalRounds; round++) {
      for (let ex = 0; ex < routine.exercises.length; ex++) {
        if (round <= Number(routine.exercises[ex].sets) && !done.has(`${ex}:${round}`)) {
          return { ex, round, totalRounds, done };
        }
      }
    }
    return { ex: -1, round: totalRounds, totalRounds, done };
  }

  function renderWorkout() {
    const routine = routineManager.getRoutineById(activeRoutineId);
    els.stream.innerHTML = "";

    if (!routine) {
      els.stream.innerHTML = `
        <div class='empty-state-card'>
          <div class='empty-icon'>🏋️</div>
          <h3>Tu espacio de rutinas está listo</h3>
          <p>Aún no has creado ninguna rutina de entrenamiento personalizada.</p>
          <button id='btnCreateFirstRoutine' class='btn-primary' style='margin-top:14px;'>
            + Crear mi primera rutina
          </button>
        </div>
      `;
      const btnCreate = $("btnCreateFirstRoutine");
      if (btnCreate) btnCreate.onclick = () => openEditor();
      updateContextActionBar();
      return;
    }

    if (!routine.exercises.length) {
      els.stream.innerHTML = `
        <div class='empty-state-card'>
          ${routine.referenceImage ? `<img class='routine-reference-image' src='${routine.referenceImage}' alt='Foto de referencia'>` : ""}
          <div class='empty-icon'>📝</div>
          <h3>${esc(routine.name)}</h3>
          <p>Esta rutina aún no tiene ejercicios configurados.</p>
          <button id='btnAddExToEmptyRoutine' class='btn-primary' style='margin-top:14px;'>
            ✏️ Añadir ejercicios a la rutina
          </button>
        </div>
      `;
      const btnAdd = $("btnAddExToEmptyRoutine");
      if (btnAdd) btnAdd.onclick = () => openEditor(routine.id);
      updateContextActionBar();
      return;
    }

    $("circuitRoundIndicator").classList.toggle("hidden", mode !== "circuit");
    const totalRounds = Math.max(...routine.exercises.map(exercise => Number(exercise.sets)), 0);
    $("circuitRoundOf").textContent = `/ ${totalRounds} rondas`;

    routine.exercises.forEach((ex, exIndex) => {
      const card = document.createElement("article");
      card.className = "exercise-card";
      const disabled = activeSession ? "" : "disabled";

      const rows = Array.from({ length: Number(ex.sets) }, (_, index) => {
        const set = index + 1;
        return `
          <div class='set-row'>
            <span class='set-number'>S${set}</span>
            <div class='stepper-group'>
              <button class='btn-step weight-minus' type='button' ${disabled}>−</button>
              <input class='stepper-input input-weight' type='number' min='0' step='0.5' value='${Number(ex.defaultWeight) || 0}' ${disabled}>
              <button class='btn-step weight-plus' type='button' ${disabled}>+</button>
            </div>
            <div class='stepper-group'>
              <button class='btn-step reps-minus' type='button' ${disabled}>−</button>
              <input class='stepper-input input-reps' type='number' min='1' value='${Number(ex.defaultReps) || 1}' ${disabled}>
              <button class='btn-step reps-plus' type='button' ${disabled}>+</button>
            </div>
            <button class='set-check' type='button' data-exercise='${exIndex}' data-set='${set}' aria-label='Completar serie ${set}' ${disabled}>✓</button>
          </div>
        `;
      }).join("");

      card.innerHTML = `
        <header class='exercise-header'>
          <div>
            <h3 class='exercise-title'>${exIndex + 1}. ${esc(ex.name)}</h3>
            <div class='badges-row'>
              <span class='badge-load load-${esc(ex.loadType || "bodyweight")}'>${ex.loadType === "bodyweight" ? "Peso corporal" : "Carga"}</span>
              <span class='badge-muscle'>${Number(ex.sets)} series · ${Number(ex.defaultReps)} reps${ex.perSide ? " por lado" : ""}</span>
            </div>
          </div>
        </header>
        <div class='sets-table'>
          <div class='set-table-header'>
            <span>Serie</span>
            <span>Carga (kg)</span>
            <span>Reps</span>
            <span>Listo</span>
          </div>
          ${rows}
        </div>
      `;

      els.stream.appendChild(card);
    });

    bindWorkoutEvents(routine);
    updateCircuitIndicator(routine);
    updateContextActionBar();
  }

  function updateCircuitIndicator(routine) {
    if (mode !== "circuit") return;
    const next = circuitState(routine);
    $("currentRoundNum").textContent = Math.min(next.round, next.totalRounds || 1);
    $("circuitExerciseProgress").textContent = next.ex < 0 ? "Circuito completo" : `Siguiente: ${routine.exercises[next.ex].name}`;
  }

  function bindWorkoutEvents(routine) {
    els.stream.querySelectorAll(".btn-step").forEach(button => {
      button.onclick = () => {
        const input = button.parentElement.querySelector("input");
        const delta = button.className.includes("minus") ? -Number(input.step || 1) : Number(input.step || 1);
        input.value = Math.max(Number(input.min || 0), Number(input.value) + delta);
      };
    });

    els.stream.querySelectorAll(".set-check").forEach(button => {
      button.onclick = () => {
        if (button.classList.contains("completed")) {
          button.classList.remove("completed");
          updateCircuitIndicator(routine);
          return;
        }

        if (mode === "circuit") {
          const next = circuitState(routine);
          if (next.ex !== Number(button.dataset.exercise) || next.round !== Number(button.dataset.set)) {
            alert(`En modo circuito, completa primero: ${next.ex >= 0 ? routine.exercises[next.ex].name + ", serie " + next.round : "la sesión"}.`);
            return;
          }
        }

        workoutStartedAt ||= Date.now();
        button.classList.add("completed");

        const after = mode === "circuit" ? circuitState(routine) : null;
        const shouldRest = mode === "traditional"
          ? Boolean(els.stream.querySelector(".set-check:not(.completed)"))
          : after.ex >= 0 && after.round !== Number(button.dataset.set);

        if (shouldRest && typeof restTimerInstance !== "undefined") {
          restTimerInstance.start(90);
        }

        updateCircuitIndicator(routine);
      };
    });
  }

  function setMode(nextMode) {
    mode = nextMode;
    $("btnModeTraditional").classList.toggle("mode-btn-active", mode === "traditional");
    $("btnModeCircuit").classList.toggle("mode-btn-active", mode === "circuit");
    $("workoutModeHelp").textContent = mode === "circuit" ? "Descanso al cerrar cada ronda" : "Descanso entre series";
    renderWorkout();
  }

  async function finishStrength() {
    const routine = routineManager.getRoutineById(activeRoutineId);
    const completed = [...els.stream.querySelectorAll(".set-check.completed")];
    const expected = routine?.exercises.reduce((sum, ex) => sum + Number(ex.sets), 0) || 0;

    if (!activeSession || !routine || !expected) return alert("Inicia una rutina antes de finalizarla.");
    if (completed.length !== expected) {
      if (!confirm(`Faltan ${expected - completed.length} series por completar. ¿Deseas finalizar de todas formas?`)) {
        return;
      }
    }

    const volume = completed.reduce((sum, check) => {
      const row = check.closest(".set-row");
      return sum + Number(row.querySelector(".input-weight").value || 0) * Number(row.querySelector(".input-reps").value || 0);
    }, 0);

    const minutes = Math.max(1, Math.round((Date.now() - workoutStartedAt) / 60000));

    if (workoutTimerInterval) {
      clearInterval(workoutTimerInterval);
      workoutTimerInterval = null;
    }

    await dbAdapter.logWorkoutSession({
      type: "strength",
      routineId: routine.id,
      routineName: routine.name,
      completedSets: completed.length,
      totalVolumeKg: volume,
      minutes
    });

    const reward = gamificationEngine.recordWorkoutCompletion("strength", {
      completedSets: completed.length,
      totalVolumeKg: volume,
      minutes
    });

    calendarManager.markCompleted(plannedDay || calendarManager.getCurrentWeekDays().find(day => day.isToday).isoDate, {
      type: "strength",
      routineId: routine.id,
      totalVolume: volume,
      completedSets: completed.length,
      minutes
    });

    activeSession = null;
    plannedDay = null;

    $("summaryVolume").textContent = `${Math.round(volume)} kg`;
    $("summarySets").textContent = `${completed.length} series · ${minutes} min`;
    $("summaryXP").textContent = `+${reward.xpGained} XP`;
    $("summarySessionsText").textContent = reward.totalSessions;
    els.summary.classList.remove("hidden");

    renderProgress();
    renderCalendar();
    renderWorkout();
    updateContextActionBar();
  }

  // =========================================================================
  // MÓDULO DE CARDIO & IN-WORKOUT MODE
  // =========================================================================
  function initCardio() {
    cardioManager.weightKg ??= 72;

    // Renderizar selector de actividades ampliado
    const selector = $("cardioActivitySelector");
    selector.innerHTML = CARDIO_ACTIVITIES.map(
      (act, i) => `
      <button type="button" class="btn-activity ${i === 0 ? "active" : ""}" data-act="${esc(act.name)}">
        ${esc(act.label)}
      </button>
    `
    ).join("");

    selector.querySelectorAll(".btn-activity").forEach(btn => {
      btn.onclick = () => {
        selector.querySelectorAll(".btn-activity").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        cardioManager.selectedActivity = btn.dataset.act;
        cardioManager.selectedActivityMeta = cardioManager.getActivityMeta(btn.dataset.act);
        syncCardioMetrics();
        updateContextActionBar();
      };
    });

    const syncCardioMetrics = (syncInputs = false) => {
      if (syncInputs) {
        els.cardioDistance.value = cardioManager.distanceKm.toFixed(2);
        els.cardioWeight.value = cardioManager.weightKg.toFixed(1);
      }
      $("cardioPaceVal").textContent = cardioManager.calculatePace(cardioManager.distanceKm);
      $("cardioCaloriesVal").textContent = cardioManager.estimateCalories(cardioManager.selectedActivity);
    };

    const updateDistance = () => {
      const val = Number(els.cardioDistance.value);
      if (Number.isFinite(val) && val >= 0.01 && val <= 999.99) {
        cardioManager.distanceKm = val;
        syncCardioMetrics();
      }
    };

    const updateWeight = () => {
      const val = Number(els.cardioWeight.value);
      if (Number.isFinite(val) && val >= 30 && val <= 250) {
        cardioManager.weightKg = val;
        syncCardioMetrics();
      }
    };

    els.cardioDistance.addEventListener("input", updateDistance);
    els.cardioDistance.addEventListener("change", () => {
      updateDistance();
      syncCardioMetrics(true);
    });
    els.cardioWeight.addEventListener("input", updateWeight);
    els.cardioWeight.addEventListener("change", () => {
      updateWeight();
      syncCardioMetrics(true);
    });

    $("btnDecDist").onclick = () => {
      cardioManager.distanceKm = Math.max(0.01, Number((cardioManager.distanceKm - 0.25).toFixed(2)));
      syncCardioMetrics(true);
    };
    $("btnIncDist").onclick = () => {
      cardioManager.distanceKm = Number((cardioManager.distanceKm + 0.25).toFixed(2));
      syncCardioMetrics(true);
    };

    if ($("btnDecWeight")) {
      $("btnDecWeight").onclick = () => {
        cardioManager.weightKg = Math.max(30, Number((cardioManager.weightKg - 0.5).toFixed(1)));
        syncCardioMetrics(true);
      };
    }
    if ($("btnIncWeight")) {
      $("btnIncWeight").onclick = () => {
        cardioManager.weightKg = Math.min(250, Number((cardioManager.weightKg + 0.5).toFixed(1)));
        syncCardioMetrics(true);
      };
    }

    const RPE_LABELS = {
      1: "1 — Muy Suave (Recuperación)",
      2: "2 — Suave",
      3: "3 — Moderado Bajo",
      4: "4 — Moderado",
      5: "5 — Desafiante",
      6: "6 — Difícil",
      7: "7 — Intenso",
      8: "8 — Muy Intenso",
      9: "9 — Casi Máximo",
      10: "10 — Máximo Absoluto"
    };

    const updateRpeDisplay = val => {
      const num = Number(val) || 7;
      cardioManager.rpeValue = num;
      $("rpeValueText").textContent = RPE_LABELS[num] || `${num} — Intenso`;
    };

    $("rpeRangeInput").oninput = event => {
      updateRpeDisplay(event.target.value);
    };
    updateRpeDisplay($("rpeRangeInput").value || 7);

    // In-Workout Controls
    $("btnCardioPauseResume").onclick = toggleCardioPauseResume;
    $("btnCardioFinishWorkout").onclick = finishCardioWorkout;

    syncCardioMetrics(true);
  }

  function startCardioWorkout() {
    const isHiit = cardioManager.isHiit();

    // Activar vista In-Workout (oculta configuración)
    els.cardioConfigView.classList.add("hidden");
    els.cardioActiveView.classList.remove("hidden");
    els.cardioActiveActivityName.textContent = cardioManager.selectedActivity;

    $("cardioPauseResumeIcon").textContent = "⏸";
    $("cardioPauseResumeText").textContent = "Pausar";

    if (isHiit) {
      $("cardioHiitLabel").classList.remove("hidden");
      $("cardioHiitCountdown").classList.remove("hidden");
      cardioManager.startHiit(
        hiitState => {
          $("cardioHiitLabel").textContent = `${hiitState.label} · Ronda ${hiitState.round}/${hiitState.totalRounds}`;
          $("cardioHiitCountdown").textContent = hiitState.remainingSec;
        },
        timeStr => {
          els.cardioDigits.textContent = timeStr;
          updateLiveCardioStats();
        }
      );
    } else {
      $("cardioHiitLabel").classList.add("hidden");
      $("cardioHiitCountdown").classList.add("hidden");
      cardioManager.startStopwatch(timeStr => {
        els.cardioDigits.textContent = timeStr;
        updateLiveCardioStats();
      });
    }

    updateContextActionBar();
  }

  function updateLiveCardioStats() {
    const elapsed = cardioManager.getTotalElapsedSeconds();
    els.cardioActivePace.textContent = cardioManager.calculatePace(cardioManager.distanceKm, elapsed);
    els.cardioActiveDist.textContent = `${cardioManager.distanceKm.toFixed(2)} km`;
    els.cardioActiveKcal.textContent = `${cardioManager.estimateCalories(cardioManager.selectedActivity, elapsed / 60)} kcal`;
  }

  function toggleCardioPauseResume() {
    if (!cardioManager.isActiveWorkout) return;

    if (cardioManager.isRunning) {
      cardioManager.pauseStopwatch();
      $("cardioPauseResumeIcon").textContent = "▶";
      $("cardioPauseResumeText").textContent = "Reanudar";
    } else {
      cardioManager.resumeStopwatch(timeStr => {
        els.cardioDigits.textContent = timeStr;
        updateLiveCardioStats();
      });
      $("cardioPauseResumeIcon").textContent = "⏸";
      $("cardioPauseResumeText").textContent = "Pausar";
    }
    updateContextActionBar();
  }

  async function finishCardioWorkout() {
    if (!cardioManager.getTotalElapsedSeconds()) {
      cardioManager.resetStopwatch();
      els.cardioActiveView.classList.add("hidden");
      els.cardioConfigView.classList.remove("hidden");
      updateContextActionBar();
      return;
    }

    const session = await cardioManager.saveCardioSession({
      activity: cardioManager.selectedActivity,
      distanceKm: cardioManager.distanceKm,
      weightKg: cardioManager.weightKg,
      rpe: cardioManager.rpeValue
    });

    const minutes = Math.max(1, Math.round(session.durationSeconds / 60));
    const reward = gamificationEngine.recordWorkoutCompletion("cardio", {
      distanceKm: session.distanceKm,
      minutes
    });

    calendarManager.markCompleted(plannedDay || calendarManager.getCurrentWeekDays().find(day => day.isToday).isoDate, {
      type: "cardio",
      activity: session.activity,
      distanceKm: session.distanceKm,
      minutes
    });

    plannedDay = null;

    // Resetear UI
    els.cardioDigits.textContent = "00:00";
    els.cardioActiveView.classList.add("hidden");
    els.cardioConfigView.classList.remove("hidden");

    // Modal de resumen
    $("summaryVolume").textContent = session.distanceKm > 0 ? `${session.distanceKm} km` : `${session.caloriesBurned} kcal`;
    $("summarySets").textContent = session.formattedTime;
    $("summaryXP").textContent = `+${reward.xpGained} XP`;
    $("summarySessionsText").textContent = reward.totalSessions;
    els.summary.classList.remove("hidden");

    renderProgress();
    renderCalendar();
    updateContextActionBar();
  }

  // =========================================================================
  // IMPORTADOR INTELIGENTE (TEXTO & FOTO)
  // =========================================================================
  function renderImportPreview() {
    const routines = SmartRoutineParser.parseTextToRoutines(els.importText.value);
    const image = importImageData ? `<img class="import-image-preview" src="${importImageData}" alt="Foto de referencia">` : "";

    if (!routines.length && !image) {
      els.importPreview.innerHTML = "<p class='import-empty'>Pega un texto en formato: Ejercicio: 3 x 10</p>";
      return [];
    }

    els.importPreview.innerHTML = `${image}${
      routines
        .map(
          routine => `
        <article class="preview-routine-card">
          <div class="preview-routine-title">${esc(routine.name)}</div>
          ${routine.exercises.map(ex => `<div class="preview-ex-item">${esc(ex.name)} · ${ex.sets} × ${ex.defaultReps}</div>`).join("")}
        </article>
      `
        )
        .join("") || "<p class='import-empty'>La foto se guardará como referencia.</p>"
    }`;

    return routines;
  }

  function openImporter() {
    importImageData = null;
    els.importText.value = "";
    els.importFile.value = "";
    renderImportPreview();
    els.importer.classList.remove("hidden");
  }

  async function importRoutines() {
    const routines = renderImportPreview();
    if (!routines.length && !importImageData) return alert("Pega una rutina en texto o sube una imagen.");

    if (routines.length) {
      for (const routine of routines) {
        await routineManager.saveRoutine({ ...routine, referenceImage: importImageData || null });
      }
      activeRoutineId = routines[0].id;
    } else {
      const saved = await routineManager.saveRoutine({
        id: uid("routine"),
        name: "Rutina desde foto",
        day: "",
        exercises: [],
        referenceImage: importImageData
      });
      activeRoutineId = saved.id;
    }

    els.importer.classList.add("hidden");
    renderTabs();
    renderWorkout();
    renderCalendar();
  }

  // =========================================================================
  // VINCULACIÓN DE EVENTOS GENERALES
  // =========================================================================
  // Módulos
  $("btnSwitchStrength").onclick = () => selectModule("strength");
  $("btnSwitchCardio").onclick = () => selectModule("cardio");

  // Header & Modales Secundarios
  $("progressBanner").onclick = openProfileBadgesModal;
  $("btnOpenProfileBadges").onclick = openProfileBadgesModal;
  $("btnCloseProfileBadges").onclick = closeProfileBadgesModal;

  $("btnOpenAnalyst").onclick = openAnalystModal;
  $("btnCloseAnalyst").onclick = closeAnalystModal;

  $("btnOpenMusclePickerFromEditor").onclick = () => openMusclePicker();
  $("btnCloseMusclePicker").onclick = closeMusclePicker;
  $("btnMusclePickerCancel").onclick = closeMusclePicker;
  $("musclePickerSearchInput").addEventListener("input", renderMusclePicker);

  // Modos de Fuerza
  $("btnModeTraditional").onclick = () => setMode("traditional");
  $("btnModeCircuit").onclick = () => setMode("circuit");

  // Gestión de Rutinas
  $("btnNewRoutineModal").onclick = () => openEditor();
  $("btnEditCurrentRoutine").onclick = () => (activeRoutineId ? openEditor(activeRoutineId) : openEditor());
  $("btnCloseModal").onclick = $("btnCancelRoutine").onclick = () => els.editor.classList.add("hidden");
  $("btnAddExerciseRow").onclick = () => {
    draft.push({ id: uid("exercise"), name: "", sets: 3, defaultReps: 10, defaultWeight: 0, perSide: false });
    renderDraft();
  };
  $("btnSaveRoutine").onclick = saveRoutine;

  $("btnDeleteCurrentRoutine").onclick = async () => {
    if (!activeRoutineId || !confirm("¿Eliminar esta rutina permanentemente?")) return;
    calendarManager.removeRoutineAssignments(activeRoutineId);
    await routineManager.deleteRoutine(activeRoutineId);
    activeRoutineId = null;
    renderTabs();
    renderWorkout();
    renderCalendar();
  };

  // Planificador
  $("btnAssignRoutineToDay").onclick = () => {
    if (!activeDay || !els.assignSelect.value) return alert("Selecciona una rutina guardada.");
    if (els.repeatStrength.checked) {
      calendarManager.assignStrengthWeekly(activeDay.dayIndex, els.assignSelect.value, activeDay.isoDate);
    } else {
      calendarManager.assignStrengthToDay(activeDay.isoDate, els.assignSelect.value);
    }
    els.assign.classList.add("hidden");
    renderCalendar();
  };

  $("btnAssignCardioToDay").onclick = () => {
    if (!activeDay) return;
    if (els.repeatCardio.checked) {
      calendarManager.assignCardioWeekly(activeDay.dayIndex, "Carrera", activeDay.isoDate);
    } else {
      calendarManager.assignCardioToDay(activeDay.isoDate);
    }
    els.assign.classList.add("hidden");
    renderCalendar();
  };

  $("btnClearDayAssign").onclick = () => {
    if (activeDay) calendarManager.clearDay(activeDay.isoDate);
    els.assign.classList.add("hidden");
    renderCalendar();
  };
  $("btnCloseDayAssign").onclick = () => els.assign.classList.add("hidden");

  // Summary post-workout
  $("btnCloseSummary").onclick = () => els.summary.classList.add("hidden");

  // Smart Import
  $("btnOpenSmartImport").onclick = openImporter;
  $("btnCloseImport").onclick = $("btnCancelImport").onclick = () => els.importer.classList.add("hidden");
  els.importText.oninput = renderImportPreview;
  $("btnLoadUserWppPreset").onclick = () => {
    els.importText.value = "Torso - Empuje y Tracción\nPress de banca plano: 4 x 10\nDominadas pronas: 4 x 8\nPress militar: 3 x 10\nFondos en paralelas: 3 x 12";
    renderImportPreview();
  };
  $("dropzoneImage").onclick = () => els.importFile.click();
  els.importFile.onchange = () => {
    const file = els.importFile.files[0];
    if (!file) return;
    if (file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = () => {
        els.importText.value = reader.result;
        renderImportPreview();
      };
      reader.readAsText(file);
      return;
    }
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        importImageData = reader.result;
        renderImportPreview();
      };
      reader.readAsDataURL(file);
      return;
    }
    alert("Selecciona una imagen o archivo de texto.");
  };
  $("btnConfirmImport").onclick = importRoutines;

  // Exportar respaldo JSON
  $("btnExportRoutines").onclick = () => {
    const blob = new Blob([JSON.stringify(routineManager.getAllRoutines(), null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `aurafit-rutinas-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // Barra de acción contextual unificada (CTA)
  els.contextPrimaryBtn.onclick = handlePrimaryCtaClick;
  els.btnContextSecondary.onclick = handleSecondaryCtaClick;

  // Menú desplegable responsive de más opciones en cabecera
  const btnHeaderMore = $("btnHeaderMore");
  const headerDropdownMenu = $("headerDropdownMenu");

  if (btnHeaderMore && headerDropdownMenu) {
    btnHeaderMore.onclick = e => {
      e.stopPropagation();
      const isHidden = headerDropdownMenu.classList.contains("hidden");
      headerDropdownMenu.classList.toggle("hidden", !isHidden);
      btnHeaderMore.classList.toggle("active", isHidden);
      btnHeaderMore.setAttribute("aria-expanded", String(isHidden));
    };

    document.addEventListener("click", e => {
      if (!btnHeaderMore.contains(e.target) && !headerDropdownMenu.contains(e.target)) {
        headerDropdownMenu.classList.add("hidden");
        btnHeaderMore.classList.remove("active");
        btnHeaderMore.setAttribute("aria-expanded", "false");
      }
    });

    headerDropdownMenu.querySelectorAll(".dropdown-menu-item").forEach(item => {
      item.addEventListener("click", () => {
        headerDropdownMenu.classList.add("hidden");
        btnHeaderMore.classList.remove("active");
        btnHeaderMore.setAttribute("aria-expanded", "false");
      });
    });
  }

  // =========================================================================
  // SUPABASE AUTHENTICATION & CLOUD SYNC
  // =========================================================================
  let authMode = "login"; // 'login' | 'signup'

  const btnOpenAuthModal = $("btnOpenAuthModal");
  const btnCloseAuthModal = $("btnCloseAuthModal");
  const modalAuth = $("modalAuth");
  const btnTabLogin = $("btnTabLogin");
  const btnTabSignUp = $("btnTabSignUp");
  const authForm = $("authForm");
  const authEmail = $("authEmail");
  const authPassword = $("authPassword");
  const authAlertMessage = $("authAlertMessage");
  const btnSubmitAuth = $("btnSubmitAuth");
  const authSubmitText = $("authSubmitText");
  const authSubmitSpinner = $("authSubmitSpinner");
  const authPasswordHint = $("authPasswordHint");
  const headerUserPill = $("headerUserPill");
  const headerUserEmail = $("headerUserEmail");
  const btnLogout = $("btnLogout");
  const btnDropdownSync = $("btnDropdownSync");

  function updateHeaderAuth(user) {
    if (user) {
      btnOpenAuthModal.classList.add("hidden");
      headerUserPill.classList.remove("hidden");
      headerUserEmail.textContent = authManager.userLabel || user.email || "Usuario";
      headerUserEmail.title = user.email || "";
    } else {
      btnOpenAuthModal.classList.remove("hidden");
      headerUserPill.classList.add("hidden");
      headerUserEmail.textContent = "";
      headerUserEmail.title = "";
    }
  }

  function setAuthMode(mode) {
    authMode = mode;
    const isLogin = mode === "login";
    btnTabLogin.classList.toggle("active", isLogin);
    btnTabSignUp.classList.toggle("active", !isLogin);
    btnTabLogin.setAttribute("aria-selected", String(isLogin));
    btnTabSignUp.setAttribute("aria-selected", String(!isLogin));
    authSubmitText.textContent = isLogin ? "Iniciar Sesión" : "Crear Cuenta";
    authPasswordHint.classList.toggle("hidden", isLogin);
    hideAuthAlert();
  }

  function showAuthAlert(msg, type = "error") {
    authAlertMessage.textContent = msg;
    authAlertMessage.className = `auth-alert alert-${type}`;
    authAlertMessage.classList.remove("hidden");
  }

  function hideAuthAlert() {
    authAlertMessage.classList.add("hidden");
    authAlertMessage.textContent = "";
  }

  function openAuthModal() {
    hideAuthAlert();
    authEmail.value = "";
    authPassword.value = "";
    setAuthMode("login");
    modalAuth.classList.remove("hidden");
    setTimeout(() => authEmail.focus(), 50);
  }

  function closeAuthModal() {
    modalAuth.classList.add("hidden");
  }

  if (btnOpenAuthModal) btnOpenAuthModal.onclick = openAuthModal;
  if (btnCloseAuthModal) btnCloseAuthModal.onclick = closeAuthModal;
  if (btnDropdownSync) btnDropdownSync.onclick = openAuthModal;

  if (btnTabLogin) btnTabLogin.onclick = () => setAuthMode("login");
  if (btnTabSignUp) btnTabSignUp.onclick = () => setAuthMode("signup");

  if (authForm) {
    authForm.onsubmit = async e => {
      e.preventDefault();
      hideAuthAlert();

      const email = authEmail.value.trim();
      const password = authPassword.value;

      if (!email || !password) {
        showAuthAlert("Por favor introduce email y contraseña.");
        return;
      }

      btnSubmitAuth.disabled = true;
      authSubmitSpinner.classList.remove("hidden");

      try {
        if (authMode === "signup") {
          const { user, error } = await authManager.signUp(email, password);
          if (error) {
            showAuthAlert(AuthManager.friendlyError(error));
          } else {
            showAuthAlert("¡Cuenta creada exitosamente! Comprueba tu correo para verificar la cuenta si es necesario.", "success");
            setTimeout(async () => {
              closeAuthModal();
              await onUserLoggedIn();
            }, 1200);
          }
        } else {
          const { user, error } = await authManager.signIn(email, password);
          if (error) {
            showAuthAlert(AuthManager.friendlyError(error));
          } else {
            showAuthAlert("¡Sesión iniciada con éxito!", "success");
            setTimeout(async () => {
              closeAuthModal();
              await onUserLoggedIn();
            }, 600);
          }
        }
      } catch (err) {
        showAuthAlert("Error al conectar con el servidor. Revisa tu conexión.");
      } finally {
        btnSubmitAuth.disabled = false;
        authSubmitSpinner.classList.add("hidden");
      }
    };
  }

  async function onUserLoggedIn() {
    updateHeaderAuth(authManager.currentUser);

    // Comprobar si hay rutinas locales para sincronizar
    const localRoutines = dbAdapter._readLocal("aurafit_saas_routines", []);
    if (localRoutines && localRoutines.length > 0) {
      const wantSync = confirm(`Tienes ${localRoutines.length} rutina(s) guardadas en este dispositivo. ¿Deseas sincronizarlas en tu cuenta de la nube?`);
      if (wantSync) {
        await dbAdapter.syncLocalToCloud();
      }
    }

    // Recargar datos desde la nube
    await routineManager.init();
    renderTabs();
    renderWorkout();
    renderCalendar();
    renderProgress();
    updateContextActionBar();
  }

  if (btnLogout) {
    btnLogout.onclick = async () => {
      if (!confirm("¿Cerrar sesión de tu cuenta?")) return;
      await authManager.signOut();
      updateHeaderAuth(null);
      await routineManager.init();
      renderTabs();
      renderWorkout();
      renderCalendar();
      updateContextActionBar();
    };
  }

  // Suscripción al estado de autenticación
  if (typeof authManager !== "undefined") {
    authManager.onChange(user => {
      updateHeaderAuth(user);
    });
    updateHeaderAuth(authManager.currentUser);
  }

  // Fecha actual
  $("currentDateText").textContent = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });

  // Inicialización
  renderProgress();
  renderCalendar();
  renderTabs();
  renderWorkout();
  initCardio();
  updateContextActionBar();
});
