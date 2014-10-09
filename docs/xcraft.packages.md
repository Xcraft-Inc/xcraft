# Xcraft packages roadmap
✓ = converted zog module to xcraft package format


1. xcraft-core-etc -> wizard-work (default values, per/packages json config)
2. fix all zogConfig to -> xcraft-core-etc
3. xcraft.js (future root/toolchain main package, stage1 replacement)
4. xcraft-zog


## Xcraft.js (low lvl shell)
- xcraft
  replace staging phase

### deps:
  - commander
  - shell
  - xcraft-zog (high lvl shell)

### Commands:
  - prepare : npm install third packages
  - deploy  : configure uNPM with backend
  - publish : npm publish xcraft-core in local registry
  - configure xcraft  : create zogRc config in etc
  //configure modules : create xcraft-* config in etc
  - install : install xcraft-zog from local registry
              shrink deps
  - verify  : check outdated packages

## Core lib
- xcraft-core-etc
    create from each default package config an /etc/x-pack/config.json
    provide config file for packages
- xcraft-core-bin
    shell extension for binaries : node, npm, wpkg, cmake... prefixed by '.'
- xcraft-core-bus ✓
- xcraft-core-bus-client ✓
  shell extension for each command in registry
- xcraft-core-fs ✓
- xcraft-core-log ✓
- xcraft-core-extract ✓
- xcraft-core-http ✓
- xcraft-core-peon ✓
- xcraft-core-platform ✓
- xcraft-core-process ✓
- xcraft-core-scm ✓
- xcraft-core-devel ✓
- xcraft-core-uri ✓


## Frontends

- xcraft-zog (the shell)
- xcraft-lokthar


## Modules

- xcraft-contrib-pacman `[list, edit, make, install, remove]` ✓
- xcraft-contrib-cmake
- ccraft-contrib-wpkg
- xcraft-contrib-chest `[start, stop, restart, send]`  ✓
- xcraft-contrib-gitlab (todo)
