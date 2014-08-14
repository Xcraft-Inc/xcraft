@echo off

set node=node
for /F "delims=" %%a in ('find /i "nodejs" .zogrc') do (
  for %%b in (%%a) do set node=%%b\node
)

%node% %*
