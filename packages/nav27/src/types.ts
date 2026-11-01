export interface View {
  runId: string; revision: number; phase: string; hold: string | null; taskId: string | null;
  mainSession: string | null; childSession: string | null; blocker: string | null;
  verification: string;
}
export interface Control { runId: string; revision: number; action: 'play' | 'pause' | 'red' | 'green' | 'stop'; taskId?: string }
