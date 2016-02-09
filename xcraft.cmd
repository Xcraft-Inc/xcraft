@echo off

call .\.node.cmd passive
setlocal enabledelayedexpansion
for %%F in ("%node%") do set PATH=%%~dpF;!PATH!

for /F "delims=" %%F in ('node -p -e "Boolean(process.stdout.isTTY)"') do set isTTY=%%F
if [%isTTY%]==[false] (
  set exec=winpty node
) else (
  set exec=node
)

%exec% .\lib\xcraft\bin\xcraft.js %*
