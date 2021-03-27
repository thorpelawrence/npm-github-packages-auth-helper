import os from "os";

export const PASSWORD_SERVICE_ENV_VAR = "NPM_GITHUB_PACKAGES_TOKEN";
export const PASSWORD_ACCOUNT = os.userInfo().username;
export const PROCESS_NAME = `${
  os.platform() === "win32" ? "node " : ""
}npm-github-packages-auth-helper`;
