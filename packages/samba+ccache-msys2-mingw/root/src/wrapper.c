
#define WIN32_LEAN_AND_MEAN
#include <stdio.h>
#include <stdlib.h>
#include <windows.h>

/* Trivial forwarding of arguments to ccache.
 * Note that some features are not implemented like the support
 * for CCACHE_BASEDIR environment variable.
 */

static _Bool endsWith(const char *base, const char *str) {
  int blen = strlen(base);
  int slen = strlen(str);
  return (blen >= slen) && !strcmp(base + blen - slen, str);
}

int main(int argc, const char *const argv[]) {
  STARTUPINFO structStartupInfo;
  PROCESS_INFORMATION structProcInfo;
  BOOL bSuccess;

  GetStartupInfo(&structStartupInfo);

  TCHAR cmdLine[1 << 15] = {0};
  TCHAR compiler[64] = {0};

  if (!strncmp(argv[0], "gcc", strlen(argv[0])) ||
      !strncmp(argv[0], "gcc.exe", strlen(argv[0])) ||
      !strncmp(argv[0], "cc", strlen(argv[0])) ||
      !strncmp(argv[0], "cc.exe", strlen(argv[0])) ||
      endsWith(argv[0], "/gcc") || endsWith(argv[0], "/gcc.exe") ||
      endsWith(argv[0], "\\gcc") || endsWith(argv[0], "\\gcc.exe") ||
      endsWith(argv[0], "/cc") || endsWith(argv[0], "/cc.exe") ||
      endsWith(argv[0], "\\cc") || endsWith(argv[0], "\\cc.exe")) {
    snprintf(compiler, _countof(compiler), "x86_64-w64-mingw32-gcc");
  }

  if (!strncmp(argv[0], "g++", strlen(argv[0])) ||
      !strncmp(argv[0], "g++.exe", strlen(argv[0])) ||
      !strncmp(argv[0], "c++", strlen(argv[0])) ||
      !strncmp(argv[0], "c++.exe", strlen(argv[0])) ||
      endsWith(argv[0], "/g++") || endsWith(argv[0], "/g++.exe") ||
      endsWith(argv[0], "\\g++") || endsWith(argv[0], "\\g++.exe") ||
      endsWith(argv[0], "/c++") || endsWith(argv[0], "/c++.exe") ||
      endsWith(argv[0], "\\c++") || endsWith(argv[0], "\\c++.exe")) {
    snprintf(compiler, _countof(compiler), "x86_64-w64-mingw32-g++");
  }

  if (argc <= 1)
    snprintf(cmdLine, _countof(cmdLine), "ccache %s", compiler);
  else
    snprintf(cmdLine, _countof(cmdLine), "ccache %s %s", compiler,
             strstr(GetCommandLine(), argv[1]));

  bSuccess = CreateProcess(0, cmdLine, 0, 0, TRUE, 0, 0, 0, &structStartupInfo,
                           &structProcInfo);
  if (bSuccess) {
    if ((WaitForSingleObject(structProcInfo.hProcess, INFINITE)) ==
        WAIT_OBJECT_0) {
      DWORD exitCode;
      GetExitCodeProcess(structProcInfo.hProcess, &exitCode);
      return exitCode;
    }
    CloseHandle(structProcInfo.hProcess);
    CloseHandle(structProcInfo.hThread);
  }

  return 1;
}