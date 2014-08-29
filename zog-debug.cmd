@echo off

call .\.node.cmd passive

setlocal enabledelayedexpansion

for %%F in ("%node%") do set PATH=%%~dpF;!PATH!

if exist .\node_modules\.bin\node-debug.cmd (
  .\node_modules\.bin\node-debug -p 8181 scripts\zog.js %*
) else (
  echo Install node-inspector first
  echo ^> npm install node-inspector
)
