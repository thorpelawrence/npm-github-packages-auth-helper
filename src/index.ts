#!/usr/bin/env node

import os from "os";
import { delimiter as pathDelimiter } from "path";
import execa from "execa";
import meow from "meow";
import inquirer from "inquirer";
import chalk from "chalk";
import keytar from "keytar";

const NPM_SCOPE_NAME = "@example";
const NPM_REGISTRY_NAME = `${NPM_SCOPE_NAME}:registry`;
const NPM_REGISTRY_URL = "https://npm.pkg.github.com";
const PASSWORD_SERVICE = "NPM_TOKEN";
const PASSWORD_ACCOUNT = os.userInfo().username;

const PROCESS_NAME = `${
  os.platform() === "win32" ? "node " : ""
}npm-auth-helper`;

const cli = meow(
  `
  Usage
    $ ${PROCESS_NAME} <command> <...options>

  Examples
    $ ${PROCESS_NAME} init
    $ ${PROCESS_NAME} reset-token # interactive
    $ ${PROCESS_NAME} reset-token $NEW_TOKEN
    $ ${PROCESS_NAME} setup-shell

  Commands
    env          Usage: eval this (see example) to set environment variable $${PASSWORD_SERVICE}
    init         Sets up .npmrc and token for consuming ${NPM_SCOPE_NAME} GitHub packages
    reset-token  Reset access token
    clear-token  Remove access token
    setup-shell  Print instructions for setting up shell

  Options
    --yes, -y  Skip confirmation prompts
  `,
  {
    description: "Helper for GitHub packages NPM authentication",
    flags: {
      yes: {
        type: "boolean",
        alias: "y",
        default: false,
      },
    },
  }
);

function printShellHelp() {
  console.log(
    chalk`{green.inverse INFO:} To configure your shell to set the token on startup:`
  );
  console.log(chalk`
    {bold.underline Bash}
      Append to {bold ~/.bashrc}:
        eval \"\$(${PROCESS_NAME} env)\"
    {bold.underline Zsh}
      Append to {bold ~/.zshrc}:
        eval \"\$(${PROCESS_NAME} env)\"
    {bold.underline Fish}
      Append to {bold ~/.config/fish/config.fish}:
        ${PROCESS_NAME} env | source
    {bold.underline PowerShell}
      Append {bold Microsoft.PowerShell_profile.ps1}
        Invoke-Expression (&${PROCESS_NAME} env)
      {italic Check the location of this file in PowerShell $PROFILE variable.
      E.g. ~\\Documents\\PowerShell\\Microsoft.PowerShell_profile.ps1
      or ~/.config/powershell/Microsoft.PowerShell_profile.ps1 on *nix.}
  `);
}

let npmrcPath: string;

function updateNpmrcPath() {
  if (!npmrcPath) {
    const { stdout } = execa.sync("npm", ["config", "get", "userconfig"]);
    npmrcPath = stdout;
  }
}

function setNpmConfig(key: string, value: string) {
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

function unsetNpmConfig(key: string) {
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

async function resetToken(secretToken?: string) {
  const existingToken = !!(await keytar.getPassword(
    PASSWORD_SERVICE,
    PASSWORD_ACCOUNT
  ));
  const {
    token: secretGithubToken,
    overwrite,
  }: { token: string; overwrite: boolean } = await inquirer.prompt([
    {
      type: "confirm",
      name: "overwrite",
      message: `Access token $${PASSWORD_SERVICE} already exists. Overwrite?`,
      when: !cli.flags.yes && existingToken,
      default: false,
    },
    {
      type: "password",
      name: "token",
      message: "GitHub personal access token",
      validate: (input: string) =>
        input.length > 0 ? true : "Not a valid access token",
      mask: "*",
      suffix:
        " (https://github.com/settings/tokens/new, make sure to enable SSO)",
      when: (answers) =>
        !secretToken && (cli.flags.yes || !existingToken || answers.overwrite),
    },
  ]);
  if (cli.flags.yes || !existingToken || overwrite) {
    await keytar.setPassword(
      PASSWORD_SERVICE,
      PASSWORD_ACCOUNT,
      secretToken ?? secretGithubToken
    );
  }
}

async function deleteToken() {
  const { confirmDelete }: { confirmDelete: boolean } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmDelete",
      message: `Delete token $${PASSWORD_SERVICE}?`,
      when: !cli.flags.yes,
      default: false,
    },
  ]);
  if (cli.flags.yes || confirmDelete) {
    await keytar.deletePassword(PASSWORD_SERVICE, PASSWORD_ACCOUNT);
  }
  unsetNpmConfig("//npm.pkg.github.com/:_authToken");
  console.log(
    chalk`{yellow {inverse WARN:} Make sure to run init again to reconfigure .npmrc}`
  );
}

async function printEnv() {
  const secretNpmToken = await keytar.getPassword(
    PASSWORD_SERVICE,
    PASSWORD_ACCOUNT
  );
  if (secretNpmToken) {
    const secretEnvVar = secretNpmToken ?? "";
    const isPowerShell =
      (process.env.PSModulePath || "").split(pathDelimiter).length >= 3;
    if (isPowerShell) {
      console.log(`$env:${PASSWORD_SERVICE}='${secretEnvVar}'`);
    } else {
      console.log(`export ${PASSWORD_SERVICE}='${secretEnvVar}'`);
    }
    process.exit(0);
  }
  console.log(
    "echo",
    chalk`'{blue [${PROCESS_NAME}]} {yellow {inverse WARN:} No keychain entry found for {blue $${PASSWORD_SERVICE}}; try running:} {bold ${PROCESS_NAME} init}'`
  );
  process.exit(1);
}

(async () => {
  switch (cli.input[0]) {
    case "env":
      printEnv();
      break;
    case "setup-shell":
      printShellHelp();
      break;
    case "init":
      await resetToken(cli.input[1]);
      setNpmConfig(NPM_REGISTRY_NAME, NPM_REGISTRY_URL);
      // there's no easy way to check this is set, as it's (understandably) protected from reading by npm config
      // so, overwrite anyway it knowing that the token should now be in the keychain
      setNpmConfig(
        "//npm.pkg.github.com/:_authToken",
        `$\{${PASSWORD_SERVICE}}`
      );
      printShellHelp();
      break;
    case "reset-token":
      await resetToken(cli.input[1]);
      break;
    case "clear-token":
      await deleteToken();
      break;
    default:
      cli.showHelp();
      break;
  }
})();
