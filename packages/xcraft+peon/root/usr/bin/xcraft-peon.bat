@echo off

set ARGS=%*
set PEON=%~dp0%\..\share\xcraft\peon\peon.js
node %PEON% %ARGS%
