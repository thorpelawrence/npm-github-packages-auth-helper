# npm-github-packages-auth-helper

Tool to help manage `.npmrc` and token storage/access **securely** and **automatically** on shell startup, using the [system keychain](https://github.com/atom/node-keytar).

Compiled using [ncc](https://github.com/vercel/ncc), no need to have the npm dependencies installed locally.

Make sure when extracting the archives, to also include the files alongside `npm-github-packages-helper`, which contain configs and necessary native binaries for your platform.

## Usage

Use the `--help` command.

```shell
npm-github-packages-helper --help
```

### Windows

> On Windows, might need to explicitly run with `node`, i.e. `node npm-github-packages-helper`

### Linux

> May need [install libsecret](https://github.com/atom/node-keytar#on-linux) on linux.

## Build from source

[Keytar](https://github.com/atom/node-keytar) uses native bindings, so must be built for each platform, this can be done by setting the environment variable `npm_config_platform=` when installing, which will fetch the relevant platform binaries.

See [NodeJS docs on platform](https://nodejs.org/api/process.html#process_process_platform) for more info.

### Build locally

```shell
yarn
yarn build
```

The output will be in the `dist` folder.

## References

- <https://docs.github.com/en/packages/guides/configuring-npm-for-use-with-github-packages#authenticating-to-github-packages>
