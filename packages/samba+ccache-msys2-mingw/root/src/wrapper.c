
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
  snprintf(cmdLine, _countof(cmdLine), "ccache.exe %s", GetCommandLine());

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