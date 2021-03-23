import chalk from "chalk";
import execa from "execa";

let npmrcPath: string;

function updateNpmrcPath() {
  if (!npmrcPath) {
    const { stdout } = execa.sync("npm", ["config", "get", "userconfig"]);
    npmrcPath = stdout;
  }
}

export function setNpmConfig(key: string, value: string) {
  updateNpmrcPath();
  console.log(
    chalk`{green.inverse INFO:} Setting {green ${key}}={blue ${value}} in {red.underline ${npmrcPath}}`
  );
  const { command } = execa.sync("npm", ["config", "set", key, value], {
    stdio: "inherit",
  });
  console.log(
    chalk`{green {inverse INFO:} Executing}`,
    chalk`{grey ${command}}`
  );
}

export function unsetNpmConfig(key: string) {
  updateNpmrcPath();
  console.log(
    chalk`{green.inverse INFO:} Unsetting {green ${key}} in {red.underline ${npmrcPath}}`
  );
  const { command } = execa.sync("npm", ["config", "delete", key], {
    stdio: "inherit",
  });
  console.log(
    chalk`{green {inverse INFO:} Executing}`,
    chalk`{grey ${command}}`
  );
}
