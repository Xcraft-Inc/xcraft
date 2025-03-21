# Kernel AArch64 and ARM

How to try these kernels

```
qemu-system-aarch64 -machine virt -cpu cortex-a57 -nographic -smp 2 -m 2048 -kernel Image
qemu-system-arm -M versatilepb -kernel zImage -dtb versatile-pb.dtb  -serial stdio -append "serial=ttyAMA0"
```
