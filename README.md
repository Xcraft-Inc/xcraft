# Multi-platform toolchain based on Node.js

**IT IS A WORK IN PROGRESS PROJECT**

The main prupose of this project is the ability to work on all major platforms
like Unices and Windows platforms. It is mainly tested on Linux (Debian like),
Darwin (OS X) and Windows (NT 6).

You should be able to easily build, test and deploy your software on all
platforms or just accordingly to the supported platforms. The core of this
project is written in JavaScript and powered by Node.js. The package managing
is forwarded to WPKG (a dpkg/apt-get like package manager).

## Why Xcraft?

The name comes from X for Cross and craft for WarCraft (the video game). You
will see sometimes tools with funny names like zog or lokthar.

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
? Xcraft> init /mysysroot/bin /mysysroot/usr/bin
```

#### prepare

This command is mandatory for the other commands which are using the local
NPM registry. It should be used in order to install the `unpm` package.

```shell
? Xcraft> prepare unpm unpm-fs-backend
```

#### deploy

The uNPM registry server can be configured by this command. You must just pass
the hostname and the port to use.

```shell
? Xcraft> deploy localhost:8485
```

#### defaults

Some Xcraft packages have they own configuration file. This command provides a
way in order to generate these files with the default values.

```shell
? Xcraft> defaults
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
? Xcraft> publish [packages...]
```

#### unpublish

This command offers a way in order to unpublish a packages in a registry. The
version must be specified explicitly.

```shell
? Xcraft> unpublish <package>@<version>
```

#### install

The packages available in the registry can be installed by this command.

```
? Xcraft> install [packages...]
```

#### verify

It checks the versions between `lib/` and `node_modules/`.

### Zog shell

The Zog shell is only available if it was installed by `./xcraft install`. This
shell is used in order to work with the high level functionalities of Xcraft.
It is the common shell for the toolchain.

The commands provided by the Zog shell depends directly of the xcraft packages
which were installed. The Zog shell starts the Xcraft server, then it asks for
the list of commands to the commands registry.

## Goblin Environnement

Xcraft is shipped with pluggable front-end's running on the same infrastructure.
The Goblin is able to display gagdet's for tweaking and playing with
the toolchain under all platforms.

## XDK (Xcraft Development Kit)

The XDK pretend to help non-core developpers to extend Xcraft features.
It's an early set of shell commands for generating UI gadgets and
high level 'contrib' modules.

## Advanced

1. [The package make process overview](docs/package.make.overview.md)
   - [The package definitions](docs/package.def.md)
