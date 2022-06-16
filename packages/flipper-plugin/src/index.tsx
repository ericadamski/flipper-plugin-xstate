import {
  PluginClient,
  Layout,
  useValue,
  usePlugin,
  createState,
} from "flipper-plugin";
import { WebSocket } from "ws";
import type { InspectorOptions } from "@xstate/inspect";

type XStateInspectorOptions = Pick<InspectorOptions, "url">;

type Events = {
  event: { type: string } & Record<string, any>;
  start: XStateInspectorOptions;
};

type Methods = {
  message(payload: Events["event"]): Promise<any>;
};

export function plugin(client: PluginClient<Events, Methods>) {
  const port = createState<number>(8189);
  const options = createState<XStateInspectorOptions>({
    url: "https://statecharts.io/inspect",
  });
  const wss = new WebSocket.Server({ port: port.get() });

  const sendMessage = (message: Events["event"]) => {
    try {
      if (client.isConnected) {
        client.send("message", message);
      } else {
        console.log("Not sending start event because we are not connected");
      }
    } catch (e) {
      console.error("Failed to communicate with the inspector: ", e);
    }
  };

  wss.on("connection", (ws) => {
    client.onMessage("start", (event) => {
      options.set(event);

      sendMessage({ type: "xstate.inspecting" });
    });

    client.onMessage("event", (event) => {
      try {
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify(event));
        }
      } catch {}
    });

    ws.on("message", (data) => {
      sendMessage(JSON.parse(data.toString()));
    });
  });

  client.onConnect(() => {});

  client.onDisconnect(() => {
    wss.close();
  });

  return {
    options,
    port,
  };
}

export function Component() {
  const instance = usePlugin(plugin);
  const options = useValue(instance.options);
  const port = useValue(instance.port);

  return (
    <Layout.Container rounded={false} grow={true}>
      <iframe
        width="100%"
        height="100%"
        src={`${options.url}?server=localhost:${port}`}
      />
    </Layout.Container>
  );
}
