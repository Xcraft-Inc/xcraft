https://download.visualstudio.microsoft.com/download/pr/1192d0de-5c6d-4274-b64d-c387185e4f45/605089bf72da4da4d27eb0cfcec569ed61f5cf5671aa6d3dece1487abfd62cab/vs_BuildTools.exe

```sh
./vs_BuildTools.exe \
  --layout microsoft+buildtools-vcxx \
  --lang En-us \
  --locale En-us \
  --add Microsoft.VisualStudio.Component.Windows10SDK \
  --add Microsoft.VisualStudio.Component.TestTools.BuildTools \
  --add Microsoft.VisualStudio.Component.VC.Tools.x86.x64 \
  --add Microsoft.VisualStudio.Component.VC.ATL \
  --add Microsoft.VisualStudio.Component.VC.ATLMFC \
  --add Microsoft.VisualStudio.Workload.VCTools
```
