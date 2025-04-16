https://download.visualstudio.microsoft.com/download/pr/8fada5c7-8417-4239-acc3-bd499af09222/662cfafc84e8b026c2a0c57850d7e0ba3e736d5d774520401a63f55b9fdd7ff9/vs_BuildTools.exe

```batch
vs_BuildTools.exe --layout microsoft+buildtools-2022 --lang En-us --locale En-us --add Microsoft.VisualStudio.Component.Roslyn.Compiler --add Microsoft.Component.MSBuild --add Microsoft.VisualStudio.Component.CoreBuildTools --add Microsoft.VisualStudio.Workload.MSBuildTools --add Microsoft.VisualStudio.Component.Windows10SDK --add Microsoft.VisualStudio.Component.VC.CoreBuildTools --add Microsoft.Net.Component.4.8.SDK --add Microsoft.Net.Component.4.7.2.TargetingPack --add Microsoft.VisualStudio.Component.VC.CoreIde --add Microsoft.VisualStudio.Component.Windows10SDK.18362 --add Microsoft.Component.VC.Runtime.UCRTSDK --add Microsoft.VisualStudio.Component.NuGet.BuildTools --add Microsoft.NetCore.Component.Runtime.9.0 --add Microsoft.NetCore.Component.Runtime.8.0 --add Microsoft.NetCore.Component.SDK --add Microsoft.Net.Component.4.6.1.TargetingPack --add Microsoft.NetCore.Component.Runtime.6.0 --add Microsoft.VisualStudio.Component.VC.14.42.17.12.x86.x64 --add Microsoft.VisualStudio.Component.VC.14.42.17.12.ATL --add Microsoft.VisualStudio.Component.VC.14.42.17.12.CLI.Support --add Microsoft.VisualStudio.Component.VC.14.42.17.12.MFC
```

### .vsconfig

```json
{
  "version": "1.0",
  "components": [
    "Microsoft.VisualStudio.Component.Roslyn.Compiler",
    "Microsoft.Component.MSBuild",
    "Microsoft.VisualStudio.Component.CoreBuildTools",
    "Microsoft.VisualStudio.Workload.MSBuildTools",
    "Microsoft.VisualStudio.Component.Windows10SDK",
    "Microsoft.VisualStudio.Component.VC.CoreBuildTools",
    "Microsoft.Net.Component.4.8.SDK",
    "Microsoft.Net.Component.4.7.2.TargetingPack",
    "Microsoft.VisualStudio.Component.VC.CoreIde",
    "Microsoft.VisualStudio.Component.Windows10SDK.18362",
    "Microsoft.Component.VC.Runtime.UCRTSDK",
    "Microsoft.VisualStudio.Component.NuGet.BuildTools",
    "Microsoft.NetCore.Component.Runtime.9.0",
    "Microsoft.NetCore.Component.Runtime.8.0",
    "Microsoft.NetCore.Component.SDK",
    "Microsoft.Net.Component.4.6.1.TargetingPack",
    "Microsoft.NetCore.Component.Runtime.6.0",
    "Microsoft.VisualStudio.Component.VC.14.42.17.12.x86.x64",
    "Microsoft.VisualStudio.Component.VC.14.42.17.12.ATL",
    "Microsoft.VisualStudio.Component.VC.14.42.17.12.CLI.Support",
    "Microsoft.VisualStudio.Component.VC.14.42.17.12.MFC"
  ],
  "extensions": []
}
```
