export interface Route { provider: string; model: string; reasoningEffort?: string }
export interface Settings {
  selected: { design: boolean; local_checks: boolean; red_verify: boolean; feature_red_verify: boolean; verify: string[]; protocols: string[] };
  routes: Record<string, Route>;
}
export interface View {
  runId: string; revision: number; phase: string; hold: string | null; taskId: string | null;
  mainSession: string | null; childSession: string | null; blocker: string | null;
  participants: Array<{ role: string; state: string; diagnostic: string | null }>; verification: string; settings: Settings; settingsRevision: number; editable: boolean; pending: string | null;
}
export interface Control { runId: string; revision: number; action: 'play' | 'pause' | 'red' | 'green' | 'stop' | 'resume' | 'repair'; taskId?: string }
export interface SettingsRequest { runId: string; revision: number; settingsRevision: number; settings: Settings }
