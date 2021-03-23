import { delimiter as pathDelimiter } from "path";
import chalk from "chalk";
import keytar from "keytar";
import {
  PASSWORD_ACCOUNT,
  PASSWORD_SERVICE_ENV_VAR,
  PROCESS_NAME,
} from "./constants";

export function printShellHelp(processName: string) {
  console.log(
    chalk`{green.inverse INFO:} To configure your shell to set the token on startup:`
  );
  console.log(chalk`
    {bold.underline Bash}
      Append to {bold ~/.bashrc}:
        eval \"\$(${processName} env)\"
    {bold.underline Zsh}
      Append to {bold ~/.zshrc}:
        eval \"\$(${processName} env)\"
    {bold.underline Fish}
      Append to {bold ~/.config/fish/config.fish}:
        ${processName} env | source
    {bold.underline PowerShell}
      Append {bold Microsoft.PowerShell_profile.ps1}
        Invoke-Expression (&${processName} env)
      {italic Check the location of this file in PowerShell $PROFILE variable.
      E.g. ~\\Documents\\PowerShell\\Microsoft.PowerShell_profile.ps1
      or ~/.config/powershell/Microsoft.PowerShell_profile.ps1 on *nix.}
  `);
}

export async function printEnv() {
  const secretNpmToken = await keytar.getPassword(
    PASSWORD_SERVICE_ENV_VAR,
    PASSWORD_ACCOUNT
  );
  if (secretNpmToken) {
    const secretEnvVar = secretNpmToken ?? "";
    const isPowerShell =
      (process.env.PSModulePath || "").split(pathDelimiter).length >= 3;
    if (isPowerShell) {
      console.log(`$env:${PASSWORD_SERVICE_ENV_VAR}='${secretEnvVar}'`);
    } else {
      console.log(`export ${PASSWORD_SERVICE_ENV_VAR}='${secretEnvVar}'`);
    }
    process.exit(0);
  }
  console.log(
    "echo",
    chalk`'{blue [${PROCESS_NAME}]} {yellow {inverse WARN:} No keychain entry found for {blue $${PASSWORD_SERVICE_ENV_VAR}}; try running:} {bold ${PROCESS_NAME} init}'`
  );
  process.exit(1);
}
