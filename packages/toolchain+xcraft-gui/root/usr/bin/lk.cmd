@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\..\share\toolchain\xcraft-gui\bin\xcraft-gui" %*
) ELSE (
  @SETLOCAL
  @SET PATHEXT=%PATHEXT:;.JS;=;%
  node  "%~dp0\..\share\toolchain\xcraft-gui\bin\xcraft-gui" %*
)
