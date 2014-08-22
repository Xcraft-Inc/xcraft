@echo off

call .\.node.cmd passive

setlocal enabledelayedexpansion

for %%F in ("%node%") do set PATH=%%~dpF;!PATH!

if exist .\node_modules\grunt-contrib-jshint (
  if exist .\node_modules\grunt-jshint2 (
    .\node_modules\.bin\grunt --force jshint jshint2 %*

  ) else (
    echo Install node-inspector first
    echo ^> .npm.cmd install grunt-jshint2
  )
) else (
  echo Install node-inspector first
  echo ^> .npm.cmd install grunt-contrib-jshint grunt-jshint2
)
