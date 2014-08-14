@echo off

for /F "delims=" %%a in ('find /i "nodejs" .zogrc') do (
  for %%b in (%%a) do set node=%%b\node
)

if [%node%]==[] (
  echo Node.js is not available
) else (
  %node% %*
)
