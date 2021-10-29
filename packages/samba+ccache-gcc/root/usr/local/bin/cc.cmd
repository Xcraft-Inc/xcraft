@echo off

if not [%PEON_SHARE%]==[] (
    set CCACHE_BASEDIR=%PEON_SHARE%
) else (
    set CCACHE_BASEDIR=%XCRAFT_DEVROOT%
)

set COMMAND=%~dp0%\..\..\bin\cc.exe
if not exist %COMMAND% (
    set COMMAND=cc.exe
)

set ARGS=%*
ccache %COMMAND% %ARGS%
