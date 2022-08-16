import chokidar from "chokidar";

const watch = (
  path: string | string[],
  callback: (event: "add" | "change" | "unlink" | "unlinkDir") => void
): chokidar.FSWatcher => {
  const watcher = chokidar.watch(path);
  watcher.on("add", () => callback("add"));
  watcher.on("change", () => callback("change"));
  watcher.on("unlink", () => callback("unlink"));
  watcher.on("unlinkDir", () => callback("unlinkDir"));

  return watcher;
};

export default watch;
