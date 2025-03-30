### Prepare the SD card

```
dd if=/dev/zero of=/dev/sde bs=1024 count=1024
umount /dev/sde

sfdisk /dev/sde <<EOF
label: dos
63,144522,0x0C,*
160650,,,-
EOF

mkfs.vfat -F32 /dev/sde1 -n boot
mkfs.ext4 /dev/sde2 -L rootfs
```

### Settings

```
# TFTP /srv/tftp 192.168.254.10
setenv bootcmd "mmc init; tftp 0x80000000 uImage; bootm 0x80000000"
setenv bootargs "console=ttyO2,115200n8 root=/dev/mmcblk0p2 rootwait omapfb.mode=dvi:1280x720MR-32@60 omapfb.vram=0:8M,1:4M mem=442M"
boot
```

```
# TFTP /srv/tftp 192.168.254.10
setenv bootcmd "mmc init; tftp 0x80000000 uImage; bootm 0x80000000"
setenv bootargs "console=ttyO2,115200n8 root=/dev/mmcblk0p2 rootwait omapfb.mode=dvi:1280x720MR-32@60 mem=512M"
boot
```
