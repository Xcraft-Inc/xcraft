@echo off

call .\.node.cmd passive
setlocal enabledelayedexpansion
for %%F in ("%node%") do set PATH=%%~dpF;!PATH!

.\node_modules\.bin\zog.cmd %*
