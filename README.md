# Led Alarm

```
% git clone https://github.com/furuya02/led-alarm.git
% cd led-alarm
```

## CDK

```
% cd led-alarm-cdk
% cdk deploy
```

## MicroPython

```
% cd led-alarm-miropython

> rshell -p /dev/cu.SLAB_USBtoUART
> cp cert.pem.crt /pyboard
> cp private.pem.key /pyboard
> cp simple.py /pyboard
> cp main.py /pyboard
```

