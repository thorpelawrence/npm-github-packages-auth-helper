import chalk from "chalk";
import { commandSync } from "execa";
import { getEnv } from "..";
import { PROCESS_NAME } from "../constants";

export async function execWithEnv(cliInput: string[]) {
  const commandInput = cliInput.slice(1);
  if (commandInput.length === 0) {
    console.log(
      chalk`{yellow {inverse WARN:} Command not specified, make sure to include it after the delimiter {bold.underline '--'}}`
    );
    console.log(
      chalk`{green {inverse INFO:} Example:}`,
      chalk`{grey ${PROCESS_NAME} exec {bold.underline --} yarn install}`
    );
    process.exit(1);
  }
  const command = commandInput.join(" ");
  const env = await getEnv(true);
  const { exitCode } = commandSync(command, { env, stdio: "inherit" });
  process.exit(exitCode);
}
