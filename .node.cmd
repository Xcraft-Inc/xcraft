@echo off

for /F "delims=" %%a in ('findstr /i "nodejs" .zogrc') do (
  for %%b in (%%a) do set node=%%b\node
)

if [%node%]==[] (
  echo Node.js is not available
) else (
  if not [%1]==[passive] (
    %node% %*
  )
)
