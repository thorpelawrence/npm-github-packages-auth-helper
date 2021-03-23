import chalk from "chalk";
import inquirer from "inquirer";
import keytar from "keytar";
import { unsetNpmConfig } from "../npm-config";
import { PASSWORD_ACCOUNT, PASSWORD_SERVICE_ENV_VAR } from "../constants";

export async function resetToken(secretToken?: string, yes?: boolean) {
  const existingToken = !!(await keytar.getPassword(
    PASSWORD_SERVICE_ENV_VAR,
    PASSWORD_ACCOUNT
  ));
  const {
    token: secretGithubToken,
    overwrite,
  }: { token: string; overwrite: boolean } = await inquirer.prompt([
    {
      type: "confirm",
      name: "overwrite",
      message: `Access token $${PASSWORD_SERVICE_ENV_VAR} already exists. Overwrite?`,
      when: !yes && existingToken,
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
        !secretToken && (yes || !existingToken || answers.overwrite),
    },
  ]);
  if (yes || !existingToken || overwrite) {
    await keytar.setPassword(
      PASSWORD_SERVICE_ENV_VAR,
      PASSWORD_ACCOUNT,
      secretToken ?? secretGithubToken
    );
  }
}

export async function deleteToken(yes?: boolean) {
  const { confirmDelete }: { confirmDelete: boolean } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmDelete",
      message: `Delete token $${PASSWORD_SERVICE_ENV_VAR}?`,
      when: !yes,
      default: false,
    },
  ]);
  if (yes || confirmDelete) {
    await keytar.deletePassword(PASSWORD_SERVICE_ENV_VAR, PASSWORD_ACCOUNT);
  }
  unsetNpmConfig("//npm.pkg.github.com/:_authToken");
  console.log(
    chalk`{yellow {inverse WARN:} Make sure to run init again to reconfigure .npmrc}`
  );
}
