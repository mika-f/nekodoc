/* eslint-disable no-console */
import chalk from "chalk";

const stringify = (msg: unknown): string => {
  const str = String(msg);
  if (str === "[object Object]") {
    return JSON.stringify(msg);
  }

  return str;
};

const error = (msg: unknown): void => {
  console.error(`${chalk.red.bold("error")} ${stringify(msg)}`);
};

const info = (msg: unknown): void => {
  console.info(`${chalk.cyan.bold("info")} ${stringify(msg)}`);
};

const nl = (): void => {
  console.log();
};

const success = (msg: unknown): void => {
  console.log(`${chalk.green.bold("success")} ${stringify(msg)}`);
};

const warn = (msg: unknown): void => {
  console.warn(`${chalk.yellow.bold("warn")} ${stringify(msg)}`);
};

export { error, info, nl, success, warn };
