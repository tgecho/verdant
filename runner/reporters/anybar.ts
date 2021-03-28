import { promisify } from "util";
import dgram, { Socket } from "dgram";
import { exec } from "child_process";
import net from "net";

type Status =
  | "white"
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "cyan"
  | "blue"
  | "purple"
  | "black"
  | "question"
  | "exclamation"
  | "filled"
  | "hollow";

function udpClient(host: string, port: number) {
  const socket = dgram.createSocket("udp4");
  const send: Socket["send"] = promisify(socket.send.bind(socket));
  return {
    send(message: string) {
      return send(message, port, host);
    },
    close() {
      socket.close();
    },
  };
}

let portrange = 1738 + 2;
function getPort() {
  // https://gist.github.com/mikeal/1840641
  return new Promise(function get(resolve: (port: number) => void) {
    let port = portrange;
    portrange += 1;

    let server = net.createServer();
    server.listen(port, () => {
      server.once("close", () => resolve(port));
      server.close();
    });
    server.on("error", () => get(resolve));
  });
}

async function startAnybarApp(port?: number) {
  port ??= await getPort();
  // Obviously this isn't too portable/robust...
  const app = exec("/Applications/AnyBar.app/Contents/MacOS/AnyBar", {
    env: {
      ANYBAR_PORT: `${port}`,
    },
  });
  process.on("exit", () => {
    app.kill(0);
  });
  return app;
}

export function anybar(options?: {
  managed?: boolean;
  host?: string;
  port?: number;
}) {
  const managed = options?.managed ?? true;
  const host = options?.host ?? "localhost";
  const port = options?.port ?? managed ? getPort() : Promise.resolve(1738);
  const app = port.then((port) => startAnybarApp(port));
  const client = Promise.all([port, app]).then(([port]) =>
    udpClient(host, port)
  );
  return {
    async set(status: Status) {
      return (await client).send(status);
    },
    async close() {
      (await client).close();
      (await app).kill();
    },
  };
}
