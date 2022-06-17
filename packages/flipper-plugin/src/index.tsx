import {
  createWebSocketReceiver,
  createWindowReceiver,
  ReceiverCommand,
} from "@xstate/inspect";
import {
  createState,
  Layout,
  PluginClient,
  usePlugin,
  useValue,
} from "flipper-plugin";
import { useEffect, useMemo, useRef } from "react";
import { WebSocket } from "ws";

type Events = {
  event: ReceiverCommand;
  start: XStateInspectorOptions;
};

type Methods = {
  message(payload: Events["event"]): Promise<any>;
};

const START_INSPECTING_MESSAGE: Events["event"] = { type: "xstate.inspecting" };

export function plugin(rnClient: PluginClient<Events, Methods>) {
  const port = createState<number>(8189);
  const options = createState<XStateInspectorOptions>({
    url: "https://statecharts.io/inspect",
  });
  const localServer = new WebSocket.Server({ port: port.get() });

  const sendMessageToRN = (message: Events["event"]) => {
    try {
      if (rnClient.isConnected) {
        rnClient.send("message", message);
      } else {
        console.log("Not sending event because we are not connected");
      }
    } catch (e) {
      console.error("Failed to communicate with the inspector: ", e);
    }
  };

  rnClient.onMessage("start", (event) => {
    options.set(event);

    sendMessageToRN(START_INSPECTING_MESSAGE);
  });

  /** When the browser connects to our local server */
  localServer.on("connection", (ws) => {
    rnClient.onMessage("event", (event) => {
      try {
        /**
         * send event messages to the machine in the browser
         */
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify(event));
        }
      } catch {}
    });
  });

  rnClient.onConnect(() => {});

  rnClient.onDisconnect(() => localServer.close());

  return {
    options,
    port,
  };
}

export function Component() {
  const instance = usePlugin(plugin);
  const options = useValue(instance.options);
  const port = useValue(instance.port);
  const frameRef = useRef<HTMLIFrameElement>(null);

  const src = useMemo(() => {
    if (options.url == null) return options.url;

    const url = new URL(options.url);
    url.searchParams.set("server", `ws://localhost:${port}`);

    return url.toString();
  }, [options.url, port]);

  useEffect(() => {
    if (frameRef.current?.contentWindow == null) return;

    const localReceiver = createWebSocketReceiver({
      server: `localhost:${port}`,
      protocol: "ws",
      serialize: undefined,
    });

    return localReceiver.subscribe((event) => {
      // console.log("fromPlugin", { event });
    }).unsubscribe;
  }, [src]);

  return (
    <Layout.Container rounded={false} grow={true}>
      <iframe
        data-xstate
        width="100%"
        height="100%"
        ref={frameRef}
        src={src}
        onLoad={(event) => {
          if (event.currentTarget.contentWindow) {
            // This doenst' seem to get events, so we cannot interact both ways.
            createWindowReceiver({
              targetWindow: event.currentTarget.contentWindow,
            }).subscribe((event) => {
              console.log("afterload", { event });
            });
          }
        }}
      />
    </Layout.Container>
  );
}
