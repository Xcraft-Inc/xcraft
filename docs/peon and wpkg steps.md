                    +--------------+-----------------------+-------------------------+------------------+
                    |              |                       |                         |                  |
                    |  phase       |        embedded       |           non embedded  |                  |
                    +-----------------------------------------------------------------------------------+
                    |              |                       |                         |                  |
 +--------------+   | packaging    |   1. prefetch         |   nothing to do         |                  |
 |   toolchain  |   |              |                       |                         |                  |
 |   space      |   |              |   2. fetch            |                         |                  |
 +--------------+   |              |                       |                         |                  |
                    |              |   4. configure        |                         |                  |
                    |              |                       |                         |                  |
                    |              |                       |                         |                  |
                    +-----------------------------------------------------------------------------------+
                    |              |                       |                         |                  |
                    | installing   |   nothing to do       |  1. prefetch            |  postinst        |
                    |              |                       |                         |                  |
+---------------+   |              |                       |  2. fetch               |                  |
|               |   |              |                       |                         |                  |
|   wpkg        |   |              |                       |  3. prepare index       |                  |
|   space       |   |              |                       |                         |                  |
|               |   |              |                       |  4. configure           |                  |
|               |   |              |                       |                         |                  |
|               |   |              |                       |  5. create index        |                  |
|               |   +--------------------------------------+--------------------------------------------+
|               |   | building     |  4. configure                                   | makeall          |
|               |   +--------------------------------------+--------------------------------------------+
|               |   |              |                       |                         |                  |
+---------------+   | removing     |   nothing to do       |  6. remove indexed files| prerm            |
                    |              |                       |                         |                  |
                    +--------------+-----------------------+-------------------------+------------------+



# building git-src example

- prefetch, fetch src
- installing (never prepare index, or configure)
- building step (configure)

```yaml
subpackage:
  - "runtime*"
name: toolchain+git
version: 2.2.0
maintainer:
  name: Mathieu Schroeter
  email: "schroeter@epsitec.ch"
architecture:
  - source
architectureHost:
  - linux-i386
  - linux-amd64
  - darwin-i386
  - darwin-amd64
  - solaris-i386
  - solaris-amd64
  - freebsd-i386
  - freebsd-amd64
description:
  brief: Git is a free and open source distributed version control system.
  long: Git is a free and open source distributed version control system designed to handle everything from small to very large projects with speed and efficiency.
dependency:
  toolchain+xcraft-peon:
    - ""
data:
  uri: "https://github.com/git/git/archive/v2.2.0.tar.gz"
  type: src
  configure:
    type: shell-script
    args: ./configure --disable-open-ssl
  rules:
    type: make
    location: git-2.2.0/
    args:
      postinst: ""
      prerm: ""
      makeall: ""
  embedded: true
distribution: toolchain/
```
# non embedded steps

## 3. prepare index

- ignore inner cached files
- list all files (minus ignored files)

## 4. configure

## 5. create index

- list all files (minus ignored files)
- make diff between 2 lists, keep delta in pkgRoot/prerm.index

## 6. remove

- remove files from pkgRoot/prerm.index if present

# package.yaml embedded 7zip

```yaml
data:
  uri: "https://.../7z.zip"
  type: bin
  configure:
    type: peon-script
    args: mkdir ('usr/bin) && mv ('7zip.exe', 'usr/bin')
  rules:
    type: copy
    location: ""
    hooks:
      postinst: ""
      prerm: ""
      makeall: ""
  embedded: true
```
# package.yaml embedded 7zip

```yaml
data:
  uri: "https://.../7z.zip"
  type: bin
  configure:
    type: peon-script
    args: mkdir ('usr/bin) && mv ('7zip.exe', 'usr/bin')
  rules:
    type: copy
    location: ""
    hooks:
      postinst: ""
      prerm: ""
      makeall: ""
  embedded: false
```

# Peon Script backend

Evaluate args and do commands on platforms:
ex:

```yaml
type: peon-script
args: mkdir ('/usr/bin) && mv ('7zip.exe', '/usr/bin');

type: peon-script
args: configure.js
```
