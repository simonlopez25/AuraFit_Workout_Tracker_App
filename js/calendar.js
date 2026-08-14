/** Planificador semanal: vacío hasta que la persona programe una sesión. */
class CalendarManager {
  constructor() {
    this.scheduleKey = "aurafit_v3_schedule";
    this.completedKey = "aurafit_v3_completed_days";
    this.weeklyKey = "aurafit_v4_weekly_schedule";
    this.scheduleMap = this.read(this.scheduleKey);
    this.completedDaysMap = this.read(this.completedKey);
    this.weeklyMap = this.read(this.weeklyKey);
  }
  read(key) { try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; } }
  persist() {
    localStorage.setItem(this.scheduleKey, JSON.stringify(this.scheduleMap));
    localStorage.setItem(this.completedKey, JSON.stringify(this.completedDaysMap));
    localStorage.setItem(this.weeklyKey, JSON.stringify(this.weeklyMap));
  }
  getCurrentWeekDays() {
    const today = new Date();
    const monday = new Date(today);
    monday.setHours(12, 0, 0, 0);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, dayIndex) => {
      const date = new Date(monday); date.setDate(monday.getDate() + dayIndex);
      const isoDate = this.iso(date);
      return {
        dayIndex, isoDate, date,
        dayName: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][dayIndex],
        dayNumber: date.getDate(),
        isToday: this.iso(today) === isoDate,
        scheduled: this.getScheduledForDate(isoDate, dayIndex),
        isCompleted: Boolean(this.completedDaysMap[isoDate])
      };
    });
  }
  iso(date) { const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000); return local.toISOString().slice(0, 10); }
  getScheduledForDate(isoDate, dayIndex) {
    const specific = this.scheduleMap[isoDate];
    if (specific?.type === "rest") return null;
    if (specific) return { ...specific, recurring: false };
    const recurring = this.weeklyMap[dayIndex];
    return recurring ? { ...recurring, recurring: true } : null;
  }
  assignStrengthToDay(isoDate, routineId) { if (routineId) this.scheduleMap[isoDate] = { type: "strength", routineId }; this.persist(); }
  assignStrengthWeekly(dayIndex, routineId, isoDate = null) {
    if (routineId) this.weeklyMap[dayIndex] = { type: "strength", routineId };
    if (isoDate) delete this.scheduleMap[isoDate];
    this.persist();
  }
  replaceRoutineWeeklyAssignments(routineId, dayIndexes = []) {
    Object.keys(this.weeklyMap).forEach(dayIndex => {
      if (this.weeklyMap[dayIndex]?.type === "strength" && this.weeklyMap[dayIndex].routineId === routineId) delete this.weeklyMap[dayIndex];
    });
    dayIndexes.forEach(dayIndex => { this.weeklyMap[dayIndex] = { type: "strength", routineId }; });
    this.persist();
  }
  removeRoutineAssignments(routineId) {
    Object.keys(this.weeklyMap).forEach(dayIndex => {
      if (this.weeklyMap[dayIndex]?.type === "strength" && this.weeklyMap[dayIndex].routineId === routineId) delete this.weeklyMap[dayIndex];
    });
    Object.keys(this.scheduleMap).forEach(isoDate => {
      if (this.scheduleMap[isoDate]?.type === "strength" && this.scheduleMap[isoDate].routineId === routineId) delete this.scheduleMap[isoDate];
    });
    this.persist();
  }
  assignCardioToDay(isoDate, activity = "Carrera") { this.scheduleMap[isoDate] = { type: "cardio", activity }; this.persist(); }
  assignCardioWeekly(dayIndex, activity = "Carrera", isoDate = null) {
    this.weeklyMap[dayIndex] = { type: "cardio", activity };
    if (isoDate) delete this.scheduleMap[isoDate];
    this.persist();
  }
  clearDay(isoDate) { this.scheduleMap[isoDate] = { type: "rest" }; delete this.completedDaysMap[isoDate]; this.persist(); }
  markCompleted(isoDate, sessionData) { this.completedDaysMap[isoDate] = { ...sessionData, completedAt: new Date().toISOString() }; this.persist(); }
}
const calendarManager = new CalendarManager();
