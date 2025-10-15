const MQTT_TOPIC = `emakefun/sensor/${control.deviceSerialNumber()}/testtopic`

let last_publish_time = 0
let next_display_on = true
serial.redirect(
    SerialPin.P1,
    SerialPin.P0,
    BaudRate.BaudRate115200
)
emakefun.initEspAtModule()
emakefun.wifiConnect("emakefun", "501416wf")
emakefun.mqttUserConfig(
    emakefun.connectionScheme.kMqttOverTcp,
    "my_client_id",
    "my_user_name",
    "my_password",
    ""
)
emakefun.mqttConnect("broker.emqx.io", 1883, true)
emakefun.mqttSubscribe(MQTT_TOPIC, 0)
basic.showIcon(IconNames.Happy)
basic.forever(function () {
    const message_info = emakefun.mqttReceive(100)
    if (message_info != null) {
        let received_data = ""

        const end_time = input.runningTime() + 200
        while (received_data.length < message_info.length) {
            const current_byte = emakefun.readSerialByte()
            if (current_byte > 0) {
                received_data = "" + received_data + String.fromCharCode(current_byte)
            }
            if (input.runningTime() >= end_time) {
                break;
            }
        }
        if (message_info.topic == MQTT_TOPIC && received_data.length == message_info.length) {
            if (received_data == "display on") {
                led.enable(true)
                next_display_on = false
            } else if (received_data == "display off") {
                led.enable(false)
                next_display_on = true
            }
        }
    }
    if (input.runningTime() - last_publish_time > 1000) {
        emakefun.mqttPublish(
            next_display_on ? "display on" : "display off",
            MQTT_TOPIC,
            1000,
            0,
            false
        )
        last_publish_time = input.runningTime()
    }
})
