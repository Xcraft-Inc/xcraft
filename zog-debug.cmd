@echo off

if exist .\node_modules\.bin\node-debug.cmd (
  .\node_modules\.bin\node-debug -p 8181 scripts\zog.js %*
) else (
  echo Install node-inspector first
  echo > npm install node-inspector
)
