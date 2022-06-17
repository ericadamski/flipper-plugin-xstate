import type { InspectorOptions } from "@xstate/inspect";

declare global {
  type XStateInspectorOptions = Pick<InspectorOptions, "url">;
}

export {};
