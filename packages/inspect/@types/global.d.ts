import { XStateDevInterface } from "xstate/lib/devTools";

declare global {
  var __xstate__: XStateDevInterface;
}

export {};
