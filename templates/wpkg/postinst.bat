@echo off

set ACTION=__ACTION__
set SYSROOT=__SYSROOT__
set CONFIG=__CONFIG__

for /f "delims=" %%i in ('node -e "process.stdout.write (require ('path').resolve (require ('%SYSROOT%%CONFIG%').bin));"') do set PEON=%%i

node %PEON% %ACTION%
