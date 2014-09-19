@echo off

call .\.node.cmd passive

setlocal enabledelayedexpansion

for %%F in ("%node%") do set PATH=%%~dpF;!PATH!

if exist .\node_modules\.bin\mocha (
    .\node_modules\.bin\mocha %*
) else (
  echo Install mocha and should first
  echo ^> .npm.cmd install mocha should
)
