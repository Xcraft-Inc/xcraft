@echo off

set ARGS=%*
set ENCRYPT=%~dp0%\xorencrypt
node %ENCRYPT% %ARGS%
