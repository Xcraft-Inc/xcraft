### uenv.txt

```
video_args_hdmi=setenv video_args $video_args video=mxcfb${fb}:dev=hdmi,1280x720M@60,if=RGB24
ipaddr=192.168.2.132
mmcargs=run video_args_script; setenv bootargs console=${console},${baudrate} root=${mmcroot} rootwait ${video_args}
setup_ip=192.168.2.132:192.168.2.77:192.168.2.1:255.255.255.0:S35:eth0:off:192.168.2.220:192.168.2.1
serverip=192.168.2.77
netargs=setenv bootargs console=${console},${baudrate}n8 root=/dev/nfs rw rootwait ip=${setup_ip} nfsroot=${serverip}:${rootnfs},v3,tcp ${video_args}
mmcpart=2
bootdir=/boot/
loadbootenv=ext4load mmc ${mmcdev}:${mmcpart} ${loadaddr} ${bootdir}${bootenv}
loadfdt=ext4load mmc ${mmcdev}:${mmcpart} ${fdt_addr} ${bootdir}${fdt_file}
loadimage=ext4load mmc ${mmcdev}:${mmcpart} ${loadaddr} ${bootdir}${image}
```

### uenv_nfs.txt

```
fdt_file=imx6q-igep-base0040rd102.dtb
video_args_hdmi=setenv video_args $video_args video=mxcfb${fb}:dev=hdmi,1280x720M@60,if=RGB24
ipaddr=192.168.2.133
mmcargs=run video_args_script; setenv bootargs console=${console},${baudrate} root=${mmcroot} rootwait ${video_args}
setup_ip=192.168.2.133:192.168.2.77:192.168.2.1:255.255.255.0:S35:eth0:off:192.168.2.220:192.168.2.1
serverip=192.168.2.77
rootnfs=/opt/nfs-server/rootfs/Fubuntu
netargs=setenv bootargs console=${console},${baudrate}n8 root=/dev/nfs rw rootwait ip=${setup_ip} nfsroot=${serverip}:${rootnfs},v3,tcp ${video_args} fec.macaddr=0x02,0x00,0x00,0x00,0x00,0x17
mmcpart=2
bootdir=/opt/nfs-server/rootfs/Fubuntu/boot/
loadbootenv=ext4load mmc ${mmcdev}:${mmcpart} ${loadaddr} ${bootdir}${bootenv}
loadfdt=ext4load mmc ${mmcdev}:${mmcpart} ${fdt_addr} ${bootdir}${fdt_file}
loadimage=ext4load mmc ${mmcdev}:${mmcpart} ${loadaddr} ${bootdir}${image}
```
