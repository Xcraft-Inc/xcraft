@echo off

call .\.node.cmd passive

setlocal enabledelayedexpansion

for %%F in ("%node%") do set PATH=%%~dpF;!PATH!

if exist .\node_modules\grunt-contrib-jshint (
    .\node_modules\.bin\grunt --force jshint %*
) else (
  echo Install grunt-contrib-jshint first
  echo ^> .npm.cmd install grunt-contrib-jshint
)
