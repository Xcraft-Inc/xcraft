@echo off

setlocal enabledelayedexpansion

for /F "delims=" %%a in ('findstr /i "nodejs" .zogrc') do (
  for %%b in (%%a) do set PATH=%%b;!PATH!
)

if exist .\node_modules\.bin\node-debug.cmd (
  .\node_modules\.bin\node-debug -p 8181 scripts\zog.js %*
) else (
  echo Install node-inspector first
  echo ^> npm install node-inspector
)
