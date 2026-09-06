// Catálogo definitivo por licencia y comuna: incorporar desde fuentes revisadas.
export type StudyGoal =
  | { unit: 'minutes'; dailyTarget: number }
  | { unit: 'tests'; dailyTarget: number };

export interface StudyPreferences {
  licenseClass: string;
  communeCode: string;
  goal: StudyGoal;
  studyRemindersEnabled: boolean;
}
