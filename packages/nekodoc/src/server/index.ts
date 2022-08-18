import * as logger from "@nekodoc/logger";
import express from "express";
import getPort from "get-port";
import { Server } from "http";

type ServerOptions = {
  port?: number;
  host?: string;
  staticResources: (path: string) => Promise<string | undefined>;
  dynamicResource: (path: string) => Promise<string>;
  onClose?: () => void;
};

const clean = <T extends Record<string, unknown>>(obj: T): T => {
  // eslint-disable-next-line no-restricted-syntax
  for (const key of Object.keys(obj)) {
    // eslint-disable-next-line no-param-reassign
    if (obj[key] === undefined) delete obj[key];
  }

  return obj;
};

const run = async (options: ServerOptions): Promise<void> => {
  const opts = { port: 7225, host: "localhost", ...clean(options) };
  const port = await getPort({ port: opts.port });
  const app = express();

  app.get("/_nekodoc/*", async (req, res) => {
    const prefix = "/_nekodoc/".length;

    switch (true) {
      case req.path.endsWith(".js"): {
        const asset = await opts.staticResources(req.path.substring(prefix));
        if (asset)
          return res.header("Content-Type", "text/javascript").send(asset);

        return res.status(404).send();
      }

      case req.path.endsWith(".css"): {
        const asset = await opts.staticResources(req.path.substring(prefix));
        if (asset) return res.header("Content-Type", "text/css").send(asset);

        return res.status(404).send();
      }
      default:
        break;
    }

    return res.status(404).send();
  });

  app.get("/*", async (req, res) => {
    const resource = await opts.dynamicResource(req.path);
    if (resource === undefined) return res.status(404).send();

    return res.send(resource);
  });

  const server = app.listen(port, opts.host, () => {
    logger.info(`NekoDoc start listening at http://${opts.host}:${port}`);
  });

  const signals = ["SIGINT", "SIGTERM"];
  const exit = (svr: Server) => {
    svr.close();

    logger.info("NekoDoc server exited");

    if (opts.onClose) opts.onClose();

    process.exit();
  };

  if (process.platform === "win32") {
    const rl = (await import("readline")).createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    signals.forEach((sig) => {
      rl.on(sig, () => exit(server));
    });
  } else {
    signals.forEach((sig) => process.on(sig, () => exit(server)));
  }
};

export default run;
