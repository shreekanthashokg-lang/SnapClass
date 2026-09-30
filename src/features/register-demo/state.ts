import { SAMPLE_STUDENTS, type Method } from "./data";

/**
 * The demo mirrors the real attendance flow:
 * run analysis -> review the report -> confirm (saved) or discard.
 */
export type Phase = "idle" | "scanning" | "review" | "saved" | "discarded";

export interface DemoState {
  method: Method;
  phase: Phase;
  /** How many rows have been resolved so far. */
  revealed: number;
}

export type DemoAction =
  | { type: "selectMethod"; method: Method }
  | { type: "start" }
  | { type: "tick" }
  | { type: "finishNow" }
  | { type: "confirm" }
  | { type: "discard" }
  | { type: "reset" };

export const initialState: DemoState = { method: "photo", phase: "idle", revealed: 0 };

const TOTAL = SAMPLE_STUDENTS.length;

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case "selectMethod":
      return action.method === state.method ? state : { method: action.method, phase: "idle", revealed: 0 };
    case "start":
      return state.phase === "idle" || state.phase === "discarded"
        ? { ...state, phase: "scanning", revealed: 0 }
        : state;
    case "tick": {
      if (state.phase !== "scanning") return state;
      const revealed = state.revealed + 1;
      return revealed >= TOTAL ? { ...state, phase: "review", revealed: TOTAL } : { ...state, revealed };
    }
    case "finishNow":
      return state.phase === "idle" || state.phase === "scanning" || state.phase === "discarded"
        ? { ...state, phase: "review", revealed: TOTAL }
        : state;
    case "confirm":
      return state.phase === "review" ? { ...state, phase: "saved" } : state;
    case "discard":
      return state.phase === "review" ? { ...state, phase: "discarded", revealed: 0 } : state;
    case "reset":
      return { ...state, phase: "idle", revealed: 0 };
  }
}
