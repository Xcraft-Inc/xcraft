# Multi-platform toolchain based on node.js

## Why Xcraft?

...

## Shells

There are two shells. The hight level shell is named `zog`, the second one
(low level) is named `xcraft`.

Look for `zog -h` and `xcraft -h` for the common help.

### Xcraft shell

The `xcraft` command will open the Xcraft shell if no argument are provided.
The main purpose of this shell concerns the deployment of the toolchain. This
one should not be used in a common use case.

#### init

This command is used in order to init the main xcraft configuration file. This
file will be located to `./etc/xcraft/config.json`. You can provide some paths
to add to the PATH environment variable.

```shell
? Xcraft> init /mysysroot/bin,/mysysroot/usr/bin
```

#### prepare

This command is mandatory for the other commands which are using the local
NPM registry. It should be used in order to install the `unpm` package.

```shell
? Xcraft> prepare unpm,unpm-fs-backend
```

#### deploy

The uNPM registry server can be configured by this command. You must just pass
the hostname and the port to use.

```shell
? Xcraft> deploy localhost,8485
```

#### defaults

Some Xcraft packages have they own configuration file. This command provides a
way in order to generate these files with the default values.

```shell
? Xcraft> defaults all
```

#### configure

Instead of just having the default values for the Xcraft packages configuration
files, you can edit these values with this command.

```shell
? Xcraft> configure
```

#### publish

The Xcraft packages are not usable directly. This command offers a way in order
to publish the packages in a registry. Then it will publish the packages in
the registry deployed (uNPM).

```shell
? Xcraft> deploy
```

#### install

The packages available in the registry can be installed by this command.

```
? Xcraft> install
```

#### verify

...

### Zog shell

The Zog shell is only available if it was installed by `./xcraft install`. This
shell is used in order to work with the high level functionalities of Xcraft.
It is the common shell for the toolchain.

### Lokthar shell

...

## Advanced

1. [The package make process overview](docs/package.make.overview.md)
   * [The package definitions](docs/package.def.md)
