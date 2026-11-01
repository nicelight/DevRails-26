export interface Route { provider: string; model: string; reasoningEffort?: string }
export interface Settings {
  selected: { design: boolean; local_checks: boolean; red_verify: boolean; feature_red_verify: boolean; verify: string[]; protocols: string[] };
  driverColor?: 'blue' | 'orange' | 'purple' | 'white' | 'black';
  judgeSlots?: Route[]; judgeSlot?: number;
  planning?: { featureReview?: boolean; taskReview?: boolean; doctor?: boolean; premortem?: boolean };
  routes: Record<string, Route>;
}
export interface View {
  proof: string[];
  facts: Record<string, { occupancy: number | null; compactions: number | null }>; judgeSession: string | null; proposedTarget: string | null;
  runId: string; revision: number; phase: string; hold: string | null; taskId: string | null;
  sides: SideBinding[];
  mainSession: string | null; childSession: string | null; blocker: string | null;
  participants: Array<{ role: string; session: string; state: string; diagnostic: string | null }>; verification: string; settings: Settings; settingsRevision: number; editable: boolean; pending: string | null; requestId: string | null; autonomous: boolean; inspection: string | null; commands: string[]; mainError: string | null;
}
export interface Control { runId: string; revision: number; action: 'play' | 'pause' | 'red' | 'green' | 'stop' | 'resume' | 'repair' | 'inspect' | 'autonomous' | 'start-command'; command?: string; inputs?: { source?: string; sourceRef?: string; feature?: string; taskId?: string; contextRefs?: string[]; sync?: boolean; update?: boolean }; requestId?: string; taskId?: string }
export interface SettingsRequest { runId: string; revision: number; settingsRevision: number; settings: Settings }

export interface SideRequest { runId: string; revision: number; anchor: { x: number; y: number } }
export interface DeleteSideRequest { runId: string; revision: number; sessionId: string }
export interface SideBinding { id: string; anchor: { x: number; y: number }; route: Route; error?: string }
