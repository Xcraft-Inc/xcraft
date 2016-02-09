@echo off

call .\.node.cmd passive
setlocal enabledelayedexpansion
for %%F in ("%node%") do set PATH=%%~dpF;!PATH!

where winpty >NUL 2>&1
if [%errorlevel%]==[0] (
  set exec=winpty node
) else (
  set exec=node
)

%exec% .\lib\xcraft\bin\xcraft.js %*
