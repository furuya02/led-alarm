import os
import time
import json
import machine
import network
from simple import MQTTClient

state = "OK"

wifi_ssid = "XXX"
wifi_password = "XXXXXXXX"

aws_endpoint = b"xxxxxxxxxxxx-ats.iot.ap-northeast-1.amazonaws.com"
private_key = "private.pem.key"
private_cert = "cert.pem.crt"


with open(private_key, "r") as f:
    key = f.read()
with open(private_cert, "r") as f:
    cert = f.read()

device_id = "0001"
topic_sub = "alarm-sample/" + device_id
ssl_params = {"key": key, "cert": cert, "server_side": False}

led_tape = machine.Pin(13, machine.Pin.OUT)
led_onboard = machine.Pin(2, machine.Pin.OUT)

wlan = network.WLAN(network.STA_IF)
wlan.active(True)
if not wlan.isconnected():
    print("Connecting to network...")
    wlan.connect(wifi_ssid, wifi_password)
    while not wlan.isconnected():
        pass
    print("Connection successful")
    print("Network config:", wlan.ifconfig())


def mqtt_connect(client=device_id, endpoint=aws_endpoint, sslp=ssl_params):
    mqtt = MQTTClient(
        client_id=client,
        server=endpoint,
        port=8883,
        keepalive=1200,
        ssl=True,
        ssl_params=sslp,
    )
    print("Connecting to AWS IoT...")
    mqtt.connect()
    print("Connected.")
    return mqtt


def mqtt_subscribe(topic, msg):
    print("on received...")
    global state
    state = json.loads(msg.decode())["state"]
    print("state {}".format(state))


try:
    mqtt = mqtt_connect()
    mqtt.set_callback(mqtt_subscribe)
    mqtt.subscribe(topic_sub)
except:
    print("Unable to connect to MQTT.")

led_onboard.value(1)

toggle = False

while True:
    try:
        mqtt.check_msg()
    except:
        print("Unable to check for messages.")

    if state == "ALARM":  # 点滅
        if toggle:
            led_tape.value(1)
            toggle = False
        else:
            led_tape.value(0)
            toggle = True
    else:  # 消灯
        led_tape.value(0)

    print("sleep for 1 seconds state:{}".format(state))
    time.sleep(1)
