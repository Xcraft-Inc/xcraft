@echo off

call .\.node.cmd passive

setlocal enabledelayedexpansion

for %%F in ("%node%") do set PATH=%%~dpF;!PATH!

if exist .\node_modules\grunt-jscs (
    .\node_modules\.bin\grunt --force jscs %*
) else (
  echo Install grunt-jscs first
  echo ^> .npm.cmd install grunt-jscs
)
