# npm-auth-helper

Tool to help manage `.npmrc` and token storage/access **securely** and **automatically** on shell startup, using the [system keychain](https://github.com/atom/node-keytar).

For convenience, the package is compiled using [ncc](https://github.com/vercel/ncc), which means that you don't need to have the npm dependencies installed locally.

Make sure when extracting the `.zip` files, you include the `build` folder next to the `npm-auth-helper`, which contains necessary native binaries for your platform.

## Usage

Use the `--help` command.

```shell
npm-auth-helper --help
```

### Windows

> On Windows, you might need to explicitly run with `node`, i.e. `node npm-auth-helper`

### Linux

> You may need [install libsecret](https://github.com/atom/node-keytar#on-linux) on linux.

## Build from source

[Keytar](https://github.com/atom/node-keytar) uses native bindings, so must be built for each platform, this can be done by setting the environment variable `npm_config_platform=` when installing, which will fetch the relevant platform binaries.

See [NodeJS docs on platform](https://nodejs.org/api/process.html#process_process_platform) for more info.

### Build locally

```shell
yarn
yarn build
```

The output will be in the `dist` folder.
