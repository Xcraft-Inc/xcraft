
#include <stdio.h>
#include <windows.h>

/* Trivial forwarding of arguments to ccache.
 * Note that some features are not implemented like the support
 * for CCACHE_BASEDIR environment variable.
 */

int main(int argc, const char *const argv[]) {
  STARTUPINFO structStartupInfo;
  PROCESS_INFORMATION structProcInfo;
  BOOL bSuccess;
  DWORD dwCharsRead;

  if (argc <= 1) {
    fprintf(stderr, "Missing arguments for the wrapper\n");
    return 1;
  }

  GetStartupInfo(&structStartupInfo);

  TCHAR cmdLine[1 << 15];
  TCHAR compiler[64];

  if (!strncmp(argv[0], "gcc", strlen(argv[0])) ||
      !strncmp(argv[0], "gcc.exe", strlen(argv[0])) ||
      !strncmp(argv[0], "cc", strlen(argv[0])) ||
      !strncmp(argv[0], "cc.exe", strlen(argv[0]))) {
    snprintf(compiler, _countof(compiler), "x86_64-w64-mingw32-gcc.exe");
  }

  if (!strncmp(argv[0], "g++", strlen(argv[0])) ||
      !strncmp(argv[0], "g++.exe", strlen(argv[0])) ||
      !strncmp(argv[0], "c++", strlen(argv[0])) ||
      !strncmp(argv[0], "c++.exe", strlen(argv[0]))) {
    snprintf(compiler, _countof(compiler), "x86_64-w64-mingw32-g++.exe");
  }

  snprintf(cmdLine, _countof(cmdLine), "ccache.exe %s", GetCommandLine());

  SetEnvironmentVariable("CCACHE_COMPILER", compiler);
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