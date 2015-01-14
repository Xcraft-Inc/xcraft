@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\..\share\toolchain\xcraft-atom\bin\xcraft-atom" %*
) ELSE (
  @SETLOCAL
  @SET PATHEXT=%PATHEXT:;.JS;=;%
  node  "%~dp0\..\share\toolchain\xcraft-atom\bin\xcraft-atom" %*
)
