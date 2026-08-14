/** Rutinas creadas por el usuario. No existen rutinas ni ejercicios de muestra. */
class RoutineManager {
  constructor() { this.routines = []; }
  async init() { this.routines = (await dbAdapter.getRoutines()) || []; }
  getAllRoutines() { return [...this.routines]; }
  getRoutineById(id) { return this.routines.find(routine => routine.id === id) || null; }
  async saveRoutine(routine) {
    const clean = { ...routine, id: routine.id || this.id("routine"), weekdays: Array.isArray(routine.weekdays) ? routine.weekdays.map(Number).filter(day => day >= 0 && day <= 6) : [], updatedAt: new Date().toISOString() };
    const index = this.routines.findIndex(item => item.id === clean.id);
    if (index === -1) this.routines.push(clean); else this.routines[index] = clean;
    await dbAdapter.saveRoutines(this.routines);
    return clean;
  }
  async deleteRoutine(id) { this.routines = this.routines.filter(routine => routine.id !== id); await dbAdapter.saveRoutines(this.routines); }
  id(prefix) { return `${prefix}-${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0].toString(36)}`; }
}
class SmartRoutineParser {
  static parseTextToRoutines(text) {
    const lines = (text || "").split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    const exercises = lines.map(line => this.parseExerciseLine(line)).filter(Boolean);
    const title = lines.find(line => !this.parseExerciseLine(line)) || "Rutina importada";
    return exercises.length ? [{ id: routineManager.id("routine"), name: title.replace(/^[#*\-\s]+/, "").slice(0, 80), day: "", exercises }] : [];
  }
  static parseExerciseLine(line) {
    const clean = line.replace(/^[*•\-\d.\s]+/, "").trim();
    const match = clean.match(/^(.*?)(?:\s*:\s*|\s+)(\d+)\s*[x×*]\s*(\d+)/i);
    if (!match) return null;
    return { id: routineManager.id("exercise"), name: match[1].trim(), sets: Number(match[2]), defaultReps: Number(match[3]), defaultWeight: 0, loadType: "bodyweight", perSide: /por lado/i.test(clean) };
  }
}
const routineManager = new RoutineManager();
