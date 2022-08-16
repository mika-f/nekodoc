import { createCommand } from "commander";
import * as logger from "@nekodoc/logger";

import build from "./commands/build.js";
import init from "./commands/init.js";
import start from "./commands/start.js";

const program = createCommand("nekodoc");
program.version("1.0.0");

program
  .command("build")
  .description("build static website")
  .option("--out-dir <dir>", "the path for output directory")
  .option("--no-minify", "build website without minimizing JS bundle")
  .action(build);

program
  .command("init")
  .description("create startup configuration files")
  .action(init);

program
  .command("start")
  .description("start development server")
  .option("-p, --port <port>", "use specified port (default: 7225)")
  .option("-h, --host <host>", "use specified host (default: localhost)")
  .option(
    "-c, --config <config>",
    "path to NekoDoc configuration file (default: `./nekodoc.config.js`)"
  )
  .option("--no-minify", "build website without minimizing JS bundle")
  .action(start);

program.parse(process.argv);

process.on("unhandledRejection", (err) => {
  if (err instanceof Error) {
    logger.error(err.stack);
  } else {
    logger.error(err);
  }

  process.exit(1);
});
