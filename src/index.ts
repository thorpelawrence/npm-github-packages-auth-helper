#!/usr/bin/env node

import meow from "meow";
import { printEnv, printShellHelp } from "./util";
import { execWithEnv } from "./util/exec";
import { setNpmConfig } from "./util/npm-config";
import { deleteToken, resetToken } from "./util/token";
import { PASSWORD_SERVICE_ENV_VAR, PROCESS_NAME } from "./util/constants";

const cli = meow(
  `
  Usage
    $ ${PROCESS_NAME} <command> <...options>

  Examples
    $ ${PROCESS_NAME} init
    $ ${PROCESS_NAME} exec -- yarn install
    $ ${PROCESS_NAME} reset-token # interactive
    $ ${PROCESS_NAME} reset-token $NEW_TOKEN
    $ ${PROCESS_NAME} setup-shell

  Commands
    env          Usage: eval this (see also: setup-shell) to set environment variable $${PASSWORD_SERVICE_ENV_VAR}
    init         Sets up .npmrc and token for consuming GitHub packages
    exec         Run single command with access token set, alternative to env which exists for entire session
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

(async () => {
  switch (cli.input[0]) {
    case "env":
      printEnv();
      break;
    case "exec":
      execWithEnv(cli.input);
      break;
    case "setup-shell":
      printShellHelp(PROCESS_NAME);
      break;
    case "init":
      await resetToken(cli.input[1], cli.flags.yes);
      // there's no easy way to check this is set, as it's (understandably) protected from reading by npm config
      // so, overwrite anyway it knowing that the token should now be in the keychain
      setNpmConfig(
        "//npm.pkg.github.com/:_authToken",
        `$\{${PASSWORD_SERVICE_ENV_VAR}}`
      );
      printShellHelp(PROCESS_NAME);
      break;
    case "reset-token":
      await resetToken(cli.input[1]);
      break;
    case "clear-token":
      await deleteToken(cli.flags.yes);
      break;
    default:
      cli.showHelp();
      break;
  }
})();
