#!/bin/sh

echo "Change macOS maxfiles limit"
echo "Current limits:"
ulimit -a | grep "open files"
sysctl kern.maxfiles
echo ""
echo "New limits is 524288"
echo ""

sudo tee -a /Library/LaunchDaemons/limit.maxfiles.plist > /dev/null << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
        "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>limit.maxfiles</string>
    <key>ProgramArguments</key>
    <array>
      <string>launchctl</string>
      <string>limit</string>
      <string>maxfiles</string>
      <string>524288</string>
      <string>524288</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>ServiceIPC</key>
    <false/>
  </dict>
</plist>
EOF

echo ""
echo "A reboot is required"