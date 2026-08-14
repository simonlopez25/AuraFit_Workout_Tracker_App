document.addEventListener("DOMContentLoaded", async () => {
  await routineManager.init();
  const $ = id => document.getElementById(id);
  let activeRoutineId = null, activeDay = null, plannedDay = null, editingId = null, draft = [], mode = "traditional", workoutStartedAt = null, activeSession = null, importImageData = null;
  const els = {
    strength: $("strengthPanel"), cardio: $("cardioPanel"), action: $("actionBarStrength"),
    tabs: $("routineTabs"), stream: $("activeRoutineContainer"), analyst: $("analystMessage"), grid: $("calendarWeekGrid"),
    editor: $("modalNewRoutine"), name: $("newRoutineName"), weekdays: $("newRoutineWeekdays"), exercises: $("newExercisesList"),
    assign: $("modalDayAssign"), assignTitle: $("dayAssignTitle"), assignSub: $("dayAssignSubtitle"), assignSelect: $("dayAssignRoutineSelect"),
    summary: $("modalPostWorkoutSummary"), cardioDigits: $("cardioDigits"),
    importer: $("modalSmartImport"), importText: $("importTextContent"), importPreview: $("importPreviewContainer"), importFile: $("importFileInput"),
    scheduledActions: $("scheduledWorkoutActions"), repeatStrength: $("dayAssignRepeatWeekly"), repeatCardio: $("dayAssignCardioRepeatWeekly")
  };
  const esc = value => String(value ?? "").replace(/[&<>'"]/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" }[char]));
  const uid = prefix => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  function selectModule(name) {
    const strength = name === "strength";
    $("btnSwitchStrength").className = `module-btn${strength ? " active-strength" : ""}`;
    $("btnSwitchCardio").className = `module-btn${strength ? "" : " active-cardio"}`;
    $("btnSwitchStrength").setAttribute("aria-selected", String(strength));
    $("btnSwitchCardio").setAttribute("aria-selected", String(!strength));
    els.strength.classList.toggle("hidden", !strength); els.action.classList.toggle("hidden", !strength); els.cardio.classList.toggle("hidden", strength);
  }
  function renderWorkoutActions() {
    const running = Boolean(activeSession && activeSession.type === "strength");
    $("btnStartWorkout").classList.toggle("hidden", running);
    $("btnFinishWorkout").classList.toggle("hidden", !running);
    $("btnStartWorkout").textContent = plannedDay ? "▶ Iniciar rutina programada" : "▶ Iniciar rutina seleccionada";
  }
  function startStrengthWorkout(routineId = activeRoutineId, isoDate = null) {
    const routine = routineManager.getRoutineById(routineId);
    if (!routine) return alert("Primero guarda o selecciona una rutina.");
    if (!routine.exercises.length) return alert("Añade ejercicios a esta rutina antes de iniciarla.");
    activeRoutineId = routineId;
    plannedDay = isoDate;
    activeSession = { type: "strength", routineId, isoDate };
    workoutStartedAt = Date.now();
    selectModule("strength"); renderTabs(); renderWorkout(); renderWorkoutActions();
  }
  function renderProgress() {
    const state = gamificationEngine.state, level = gamificationEngine.getLevelInfo();
    $("totalSessionsText").textContent = state.totalSessions;
    $("totalVolumeText").textContent = `${Math.round(state.totalKgLifted)} kg`;
    $("totalMinutesText").textContent = `${Math.round(state.totalMinutes)} min`;
    $("xpCurrentLabel").textContent = `${state.xp} XP`;
    $("athleteLevelIcon").textContent = level.badgeIcon; $("athleteLevelTitle").textContent = level.title;
    $("xpLevelLabel").textContent = `Nivel ${level.level}`; $("xpNextLabel").textContent = level.level === 5 ? "Nivel máximo" : `Siguiente: ${level.nextLevelXP} XP`; $("xpFillBar").style.width = `${level.pct}%`;
    $("badgesContainer").innerHTML = gamificationEngine.getBadgesCatalog().map(badge => `<article class="badge-item ${state.unlockedBadges.includes(badge.id) ? "unlocked" : ""}" title="${esc(badge.desc)}"><span>${badge.icon}</span><span>${esc(badge.name)}</span></article>`).join("");
  }
  function renderCalendar() {
    const routines = routineManager.getAllRoutines(); els.grid.innerHTML = "";
    calendarManager.getCurrentWeekDays().forEach(day => {
      const card = document.createElement("button"); card.type = "button"; card.className = `calendar-day-card ${day.isToday ? "today" : ""}`;
      let status = "<span class='day-status-badge status-rest'>Sin sesión</span>";
      if (day.isCompleted) status = "<span class='day-status-badge status-completed'>✓ Completado</span>";
      else if (day.scheduled?.type === "cardio") status = `<span class='day-status-badge status-cardio-scheduled'>🏃 ${esc(day.scheduled.activity)}</span>`;
      else if (day.scheduled) status = `<span class='day-status-badge status-scheduled'>${esc(routines.find(r => r.id === day.scheduled.routineId)?.name || "Rutina eliminada")}</span>`;
      card.innerHTML = `<span class="day-name">${day.dayName}</span><span class="day-number">${day.dayNumber}</span>${status}`;
      card.addEventListener("click", () => openDay(day)); els.grid.appendChild(card);
    });
  }
  function openDay(day) {
    activeDay = day; els.assignTitle.textContent = `Planificar ${day.dayName} ${day.dayNumber}`; els.assignSub.textContent = day.isCompleted ? "Esta sesión ya fue completada." : "Elige una actividad puntual o repítela cada semana.";
    els.assignSelect.innerHTML = `<option value="">Selecciona una rutina…</option>${routineManager.getAllRoutines().map(r => `<option value="${esc(r.id)}" ${day.scheduled?.routineId === r.id ? "selected" : ""}>${esc(r.name)}</option>`).join("")}`;
    els.repeatStrength.checked = false; els.repeatCardio.checked = false;
    const scheduled = day.scheduled;
    if (scheduled?.type === "strength") {
      const routine = routineManager.getRoutineById(scheduled.routineId);
      els.scheduledActions.innerHTML = `<p>Rutina programada: <strong>${esc(routine?.name || "Rutina eliminada")}</strong></p><button type="button" class="btn-primary btn-full">▶ Realizar esta rutina ahora</button>`;
      els.scheduledActions.classList.remove("hidden");
      els.scheduledActions.querySelector("button").onclick = () => { els.assign.classList.add("hidden"); startStrengthWorkout(scheduled.routineId, day.isoDate); };
    } else if (scheduled?.type === "cardio") {
      els.scheduledActions.innerHTML = `<p>Cardio programado: <strong>${esc(scheduled.activity)}</strong></p><button type="button" class="btn-cardio-assign btn-full">▶ Iniciar cardio ahora</button>`;
      els.scheduledActions.classList.remove("hidden");
      els.scheduledActions.querySelector("button").onclick = () => { plannedDay = day.isoDate; els.assign.classList.add("hidden"); selectModule("cardio"); };
    } else { els.scheduledActions.classList.add("hidden"); els.scheduledActions.innerHTML = ""; }
    els.assign.classList.remove("hidden");
  }
  function renderTabs() {
    const routines = routineManager.getAllRoutines();
    if (!activeRoutineId && routines.length) activeRoutineId = routines[0].id;
    els.tabs.innerHTML = routines.length ? "" : "<span class='empty-inline'>Aún no has guardado ninguna rutina.</span>";
    routines.forEach(routine => { const button = document.createElement("button"); button.className = `tab-btn ${routine.id === activeRoutineId ? "active" : ""}`; button.textContent = routine.name; button.onclick = () => { if (activeSession) return alert("Finaliza o abandona la sesión actual antes de cambiar de rutina."); activeRoutineId = routine.id; plannedDay = null; workoutStartedAt = null; renderTabs(); renderWorkout(); renderWorkoutActions(); }; els.tabs.appendChild(button); });
  }
  function circuitState(routine) {
    const checks = [...els.stream.querySelectorAll(".set-check.completed")];
    const done = new Set(checks.map(button => `${button.dataset.exercise}:${button.dataset.set}`));
    const totalRounds = Math.max(...routine.exercises.map(exercise => Number(exercise.sets)), 0);
    for (let round = 1; round <= totalRounds; round++) for (let ex = 0; ex < routine.exercises.length; ex++) if (round <= Number(routine.exercises[ex].sets) && !done.has(`${ex}:${round}`)) return { ex, round, totalRounds, done };
    return { ex: -1, round: totalRounds, totalRounds, done };
  }
  function renderWorkout() {
    const routine = routineManager.getRoutineById(activeRoutineId); els.stream.innerHTML = "";
    if (!routine) { els.stream.innerHTML = "<div class='empty-state'><h3>Tu espacio de fuerza está vacío</h3><p>Crea una rutina con tus propios ejercicios para comenzar.</p></div>"; els.analyst.innerHTML = "<p class='analyst-empty-state'>El análisis aparecerá cuando selecciones una rutina guardada.</p>"; return; }
    if (!routine.exercises.length) { els.stream.innerHTML = `<div class='empty-state'>${routine.referenceImage ? `<img class='routine-reference-image' src='${routine.referenceImage}' alt='Foto de referencia de ${esc(routine.name)}'>` : ""}<h3>${esc(routine.name)}</h3><p>Rutina guardada como referencia. Pulsa «Editar» para añadir ejercicios antes de realizarla.</p></div>`; els.analyst.innerHTML = "<p class='analyst-empty-state'>Añade ejercicios para recibir el análisis.</p>"; renderWorkoutActions(); return; }
    $("circuitRoundIndicator").classList.toggle("hidden", mode !== "circuit");
    const totalRounds = Math.max(...routine.exercises.map(exercise => Number(exercise.sets)), 0); $("circuitRoundOf").textContent = `/ ${totalRounds} rondas`;
    els.analyst.innerHTML = routine.exercises.map((ex, index) => `<article class='analyst-exercise'><div><strong>${index + 1}. ${esc(ex.name)}</strong><span class='badge-muscle'>${Number(ex.sets)} × ${Number(ex.defaultReps)}${ex.perSide ? " por lado" : ""}</span></div><ul><li>Prioriza técnica estable y rango de movimiento controlado.</li><li>Ajusta la carga/repeticiones a tu esfuerzo real.</li></ul></article>`).join("");
    routine.exercises.forEach((ex, exIndex) => {
      const card = document.createElement("article"); card.className = "exercise-card";
      const disabled = activeSession ? "" : "disabled";
      const rows = Array.from({ length: Number(ex.sets) }, (_, index) => { const set = index + 1; return `<div class='set-row'><span class='set-number'>S${set}</span><div class='stepper-group'><button class='btn-step weight-minus' type='button' ${disabled}>−</button><input class='stepper-input input-weight' type='number' min='0' step='0.5' value='${Number(ex.defaultWeight) || 0}' ${disabled}><button class='btn-step weight-plus' type='button' ${disabled}>+</button></div><div class='stepper-group'><button class='btn-step reps-minus' type='button' ${disabled}>−</button><input class='stepper-input input-reps' type='number' min='1' value='${Number(ex.defaultReps) || 1}' ${disabled}><button class='btn-step reps-plus' type='button' ${disabled}>+</button></div><button class='set-check' type='button' data-exercise='${exIndex}' data-set='${set}' aria-label='Completar serie ${set}' ${disabled}>✓</button></div>`; }).join("");
      card.innerHTML = `<header class='exercise-header'><div><h3 class='exercise-title'>${exIndex + 1}. ${esc(ex.name)}</h3><div class='badges-row'><span class='badge-load load-${esc(ex.loadType || "bodyweight")}'>${ex.loadType === "bodyweight" ? "Peso corporal" : "Carga"}</span><span class='badge-muscle'>${Number(ex.sets)} series · ${Number(ex.defaultReps)} reps${ex.perSide ? " por lado" : ""}</span></div></div></header><div class='sets-table'><div class='set-table-header'><span>Serie</span><span>Carga</span><span>Reps</span><span>Listo</span></div>${rows}</div>`;
      els.stream.appendChild(card);
    });
    bindWorkoutEvents(routine); updateCircuitIndicator(routine); renderWorkoutActions();
  }
  function updateCircuitIndicator(routine) { if (mode !== "circuit") return; const next = circuitState(routine); $("currentRoundNum").textContent = Math.min(next.round, next.totalRounds || 1); $("circuitExerciseProgress").textContent = next.ex < 0 ? "Circuito completo" : `Siguiente: ${routine.exercises[next.ex].name}`; }
  function bindWorkoutEvents(routine) {
    els.stream.querySelectorAll(".btn-step").forEach(button => button.onclick = () => { const input = button.parentElement.querySelector("input"); const delta = button.className.includes("minus") ? -Number(input.step || 1) : Number(input.step || 1); input.value = Math.max(Number(input.min || 0), Number(input.value) + delta); });
    els.stream.querySelectorAll(".set-check").forEach(button => button.onclick = () => {
      if (button.classList.contains("completed")) { button.classList.remove("completed"); updateCircuitIndicator(routine); return; }
      if (mode === "circuit") { const next = circuitState(routine); if (next.ex !== Number(button.dataset.exercise) || next.round !== Number(button.dataset.set)) { alert(`En circuito, completa primero: ${next.ex >= 0 ? routine.exercises[next.ex].name + ", serie " + next.round : "la sesión"}.`); return; } }
      workoutStartedAt ||= Date.now(); button.classList.add("completed");
      const after = mode === "circuit" ? circuitState(routine) : null;
      const shouldRest = mode === "traditional" ? Boolean(els.stream.querySelector(".set-check:not(.completed)")) : after.ex >= 0 && after.round !== Number(button.dataset.set);
      if (shouldRest && restTimerInstance) restTimerInstance.start(90);
      updateCircuitIndicator(routine);
    });
  }
  function setMode(nextMode) { mode = nextMode; $("btnModeTraditional").classList.toggle("mode-btn-active", mode === "traditional"); $("btnModeCircuit").classList.toggle("mode-btn-active", mode === "circuit"); $("workoutModeHelp").textContent = mode === "circuit" ? "Descanso al cerrar cada ronda" : "Descanso entre series"; renderWorkout(); }
  function renderImportPreview() { const routines = SmartRoutineParser.parseTextToRoutines(els.importText.value); const image = importImageData ? `<img class="import-image-preview" src="${importImageData}" alt="Foto de referencia de la rutina">` : ""; if (!routines.length && !image) { els.importPreview.innerHTML = "<p class='import-empty'>Escribe ejercicios con el formato: Nombre: 3 x 10.</p>"; return []; } els.importPreview.innerHTML = `${image}${routines.map(routine => `<article class="preview-routine-card"><div class="preview-routine-title">${esc(routine.name)}</div>${routine.exercises.map(ex => `<div class="preview-ex-item">${esc(ex.name)} · ${ex.sets} × ${ex.defaultReps}</div>`).join("")}</article>`).join("") || "<p class='import-empty'>La foto se guardará como referencia. Después podrás editar la rutina y añadir sus ejercicios.</p>"}`; return routines; }
  function openImporter() { importImageData = null; els.importText.value = ""; els.importFile.value = ""; renderImportPreview(); els.importer.classList.remove("hidden"); }
  async function importRoutines() { const routines = renderImportPreview(); if (!routines.length && !importImageData) return alert("Pega una rutina en texto o selecciona una foto."); if (routines.length) { for (const routine of routines) await routineManager.saveRoutine({ ...routine, referenceImage: importImageData || null }); activeRoutineId = routines[0].id; } else { const saved = await routineManager.saveRoutine({ id: uid("routine"), name: "Rutina desde foto", day: "", exercises: [], referenceImage: importImageData }); activeRoutineId = saved.id; } els.importer.classList.add("hidden"); renderTabs(); renderWorkout(); renderCalendar(); }
  function openEditor(id = null) { editingId = id; const routine = id && routineManager.getRoutineById(id); $("modalRoutineTitle").textContent = routine ? "Editar rutina" : "Nueva rutina"; els.name.value = routine?.name || ""; const selectedDays = new Set(routine?.weekdays || []); els.weekdays.querySelectorAll("input").forEach(input => { input.checked = selectedDays.has(Number(input.value)); }); draft = routine ? structuredClone(routine.exercises) : []; renderDraft(); els.editor.classList.remove("hidden"); }
  function renderDraft() { els.exercises.innerHTML = draft.length ? "" : "<p class='analyst-empty-state'>Añade solo los ejercicios que quieras incluir.</p>"; draft.forEach((ex, index) => { const row = document.createElement("article"); row.className = "ex-input-row"; row.innerHTML = `<div class='ex-row-header'><strong>Ejercicio ${index + 1}</strong><button class='btn-delete-row' type='button'>×</button></div><div class='ex-fields-grid'><div class='form-group'><label>Ejercicio</label><input class='draft-name' value='${esc(ex.name)}'></div><div class='form-group'><label>Series</label><input class='draft-sets' type='number' min='1' value='${ex.sets}'></div><div class='form-group'><label>Reps</label><input class='draft-reps' type='number' min='1' value='${ex.defaultReps}'></div><div class='form-group'><label>Carga kg</label><input class='draft-weight' type='number' min='0' step='.5' value='${ex.defaultWeight || 0}'></div></div><label class='check-label'><input class='draft-side' type='checkbox' ${ex.perSide ? "checked" : ""}> Repeticiones por lado</label>`;
      row.querySelector(".btn-delete-row").onclick = () => { draft.splice(index, 1); renderDraft(); }; els.exercises.appendChild(row); }); }
  async function saveRoutine() { const name = els.name.value.trim(); if (!name) return alert("Pon un nombre a la rutina."); const rows = [...els.exercises.querySelectorAll(".ex-input-row")]; const weekdays = [...els.weekdays.querySelectorAll("input:checked")].map(input => Number(input.value)); draft = rows.map((row, index) => ({ id: draft[index]?.id || uid("exercise"), name: row.querySelector(".draft-name").value.trim(), sets: Number(row.querySelector(".draft-sets").value), defaultReps: Number(row.querySelector(".draft-reps").value), defaultWeight: Number(row.querySelector(".draft-weight").value), loadType: "bodyweight", perSide: row.querySelector(".draft-side").checked })).filter(ex => ex.name && ex.sets > 0 && ex.defaultReps > 0); if (!draft.length) return alert("Añade al menos un ejercicio válido."); const saved = await routineManager.saveRoutine({ id: editingId || uid("routine"), name, weekdays, exercises: draft }); calendarManager.replaceRoutineWeeklyAssignments(saved.id, weekdays); activeRoutineId = saved.id; els.editor.classList.add("hidden"); renderTabs(); renderWorkout(); renderCalendar(); }
  async function finishStrength() { const routine = routineManager.getRoutineById(activeRoutineId); const completed = [...els.stream.querySelectorAll(".set-check.completed")]; const expected = routine?.exercises.reduce((sum, ex) => sum + Number(ex.sets), 0) || 0; if (!activeSession || !routine || !expected) return alert("Inicia una rutina antes de finalizarla."); if (completed.length !== expected) return alert(`Faltan ${expected - completed.length} series por completar.`); const volume = completed.reduce((sum, check) => { const row = check.closest(".set-row"); return sum + Number(row.querySelector(".input-weight").value || 0) * Number(row.querySelector(".input-reps").value || 0); }, 0); const minutes = Math.max(1, Math.round((Date.now() - workoutStartedAt) / 60000)); await dbAdapter.logWorkoutSession({ type: "strength", routineId: routine.id, routineName: routine.name, completedSets: expected, totalVolumeKg: volume, minutes }); const reward = gamificationEngine.recordWorkoutCompletion("strength", { completedSets: expected, totalVolumeKg: volume, minutes }); calendarManager.markCompleted(plannedDay || calendarManager.getCurrentWeekDays().find(day => day.isToday).isoDate, { type: "strength", routineId: routine.id, totalVolume: volume, completedSets: expected, minutes }); activeSession = null; plannedDay = null; $("summaryVolume").textContent = `${Math.round(volume)} kg`; $("summarySets").textContent = `${expected} series · ${minutes} min`; $("summaryXP").textContent = `+${reward.xpGained} XP`; $("summarySessionsText").textContent = reward.totalSessions; els.summary.classList.remove("hidden"); renderProgress(); renderCalendar(); renderWorkout(); }
  function initCardio() {
    document.querySelectorAll(".btn-activity").forEach(button => button.onclick = () => { document.querySelectorAll(".btn-activity").forEach(item => item.classList.remove("active")); button.classList.add("active"); cardioManager.selectedActivity = button.dataset.act; metrics(); });
    const metrics = () => { $("cardioDistanceVal").textContent = cardioManager.distanceKm.toFixed(2); $("cardioPaceVal").textContent = cardioManager.calculatePace(cardioManager.distanceKm); $("cardioCaloriesVal").textContent = cardioManager.estimateCalories(cardioManager.selectedActivity, cardioManager.distanceKm); };
    $("btnCardioStart").onclick = () => { $("btnCardioStart").classList.add("hidden"); $("btnCardioPause").classList.remove("hidden"); cardioManager.startStopwatch(time => { els.cardioDigits.textContent = time; metrics(); }); }; $("btnCardioPause").onclick = () => { cardioManager.pauseStopwatch(); $("btnCardioPause").classList.add("hidden"); $("btnCardioStart").classList.remove("hidden"); }; $("btnCardioReset").onclick = () => { cardioManager.resetStopwatch(); els.cardioDigits.textContent = "00:00"; metrics(); }; $("btnDecDist").onclick = () => { cardioManager.distanceKm = Math.max(.1, cardioManager.distanceKm - .25); metrics(); }; $("btnIncDist").onclick = () => { cardioManager.distanceKm += .25; metrics(); };
    $("rpeRangeInput").oninput = event => { cardioManager.rpeValue = Number(event.target.value); $("rpeValueText").textContent = `${event.target.value} — esfuerzo percibido`; };
    $("btnSaveCardioSession").onclick = async () => { if (!cardioManager.getTotalElapsedSeconds()) return alert("Inicia el cronómetro antes de guardar."); const session = await cardioManager.saveCardioSession({}); const minutes = Math.max(1, Math.round(session.durationSeconds / 60)); const reward = gamificationEngine.recordWorkoutCompletion("cardio", { distanceKm: session.distanceKm, minutes }); calendarManager.markCompleted(plannedDay || calendarManager.getCurrentWeekDays().find(day => day.isToday).isoDate, { type: "cardio", distanceKm: session.distanceKm, minutes }); plannedDay = null; $("summaryVolume").textContent = `${session.distanceKm} km`; $("summarySets").textContent = session.formattedTime; $("summaryXP").textContent = `+${reward.xpGained} XP`; $("summarySessionsText").textContent = reward.totalSessions; els.summary.classList.remove("hidden"); renderProgress(); renderCalendar(); metrics(); };
    metrics();
  }
  $("btnSwitchStrength").onclick = () => selectModule("strength"); $("btnSwitchCardio").onclick = () => selectModule("cardio"); $("btnModeTraditional").onclick = () => setMode("traditional"); $("btnModeCircuit").onclick = () => setMode("circuit");
  $("btnNewRoutineModal").onclick = () => openEditor(); $("btnEditCurrentRoutine").onclick = () => activeRoutineId ? openEditor(activeRoutineId) : openEditor(); $("btnCloseModal").onclick = $("btnCancelRoutine").onclick = () => els.editor.classList.add("hidden"); $("btnAddExerciseRow").onclick = () => { draft.push({ id: uid("exercise"), name: "", sets: 3, defaultReps: 10, defaultWeight: 0, perSide: false }); renderDraft(); }; $("btnSaveRoutine").onclick = saveRoutine;
  $("btnDeleteCurrentRoutine").onclick = async () => { if (!activeRoutineId || !confirm("¿Eliminar esta rutina?")) return; calendarManager.removeRoutineAssignments(activeRoutineId); await routineManager.deleteRoutine(activeRoutineId); activeRoutineId = null; renderTabs(); renderWorkout(); renderCalendar(); };
  $("btnAssignRoutineToDay").onclick = () => { if (!activeDay || !els.assignSelect.value) return alert("Selecciona una rutina guardada."); if (els.repeatStrength.checked) calendarManager.assignStrengthWeekly(activeDay.dayIndex, els.assignSelect.value); else calendarManager.assignStrengthToDay(activeDay.isoDate, els.assignSelect.value); els.assign.classList.add("hidden"); renderCalendar(); };
  $("btnAssignCardioToDay").onclick = () => { if (!activeDay) return; if (els.repeatCardio.checked) calendarManager.assignCardioWeekly(activeDay.dayIndex); else calendarManager.assignCardioToDay(activeDay.isoDate); els.assign.classList.add("hidden"); renderCalendar(); }; $("btnClearDayAssign").onclick = () => { if (activeDay) calendarManager.clearDay(activeDay.isoDate); els.assign.classList.add("hidden"); renderCalendar(); }; $("btnCloseDayAssign").onclick = () => els.assign.classList.add("hidden");
  $("btnStartWorkout").onclick = () => startStrengthWorkout(); $("btnFinishWorkout").onclick = finishStrength; $("btnCloseSummary").onclick = () => els.summary.classList.add("hidden");
  $("btnOpenSmartImport").onclick = openImporter; $("btnCloseImport").onclick = $("btnCancelImport").onclick = () => els.importer.classList.add("hidden"); els.importText.oninput = renderImportPreview; $("btnLoadUserWppPreset").onclick = () => { els.importText.value = "Torso - Fuerza\nFlexiones diamante: 4 x 12\nDominadas: 4 x 8\nFondos: 3 x 10"; renderImportPreview(); }; $("dropzoneImage").onclick = () => els.importFile.click(); els.importFile.onchange = () => { const file = els.importFile.files[0]; if (!file) return; if (file.type === "text/plain") { const reader = new FileReader(); reader.onload = () => { els.importText.value = reader.result; renderImportPreview(); }; reader.readAsText(file); return; } if (!file.type.startsWith("image/")) return alert("Selecciona una imagen o un archivo de texto."); const reader = new FileReader(); reader.onload = () => { importImageData = reader.result; renderImportPreview(); }; reader.readAsDataURL(file); }; $("btnConfirmImport").onclick = importRoutines;
  $("btnExportRoutines").onclick = () => { const blob = new Blob([JSON.stringify(routineManager.getAllRoutines(), null, 2)], { type: "application/json" }); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "aurafit-rutinas-respaldo.json"; link.click(); URL.revokeObjectURL(link.href); };
  $("currentDateText").textContent = new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
  renderProgress(); renderCalendar(); renderTabs(); renderWorkout(); initCardio();
});
