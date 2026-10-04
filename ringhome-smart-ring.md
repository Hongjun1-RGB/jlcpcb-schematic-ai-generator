# RingHome Smart Ring Reference

This is the finalized reference style that future RingHome schematic requests
should follow.

## Project

- Project: `智能戒指`
- Board: `智能戒指主板`
- Schematic: `智能戒指原理图`
- Sheet: `主图`
- Page UUID: `716871b9f863f7a9`
- Schematic UUID: `58d3fb9cf19289a5`
- Project UUID: `5dd251d401b34b68d39600ea349a9b4cd95eb97ed13521691a9720cd6549bf57`
- Sheet size: A2, 2338 x 1654
- Physical component count: 36

The preview asset is `assets/smart-ring-schematic.png`.

## Final Functional Blocks

Use colored, unfilled rectangles and a short block header:

| Block | Components | Purpose |
| --- | --- | --- |
| Main control | U1 | ESP32-C3-MINI-1-N4 Wi-Fi/BLE and GPIO |
| Motion sensor | U2, C9, C11, C12 | MPU6050 gesture and motion sensing |
| Heart-rate sensor | U3, C13, C14, C15, C17 | MAX30102 heart-rate and SpO2 sensing |
| Power | U6, R3, U4, U5, C1-C3, C6-C8 | TTL 5V input, TP4056 charging, 3.3V and 1.8V rails |
| TTL programming | J4 | Detachable 5V/GND/TX/RX programming header |
| Battery | J2 | 1S LiPo battery connector |
| Trackball | J3 | IT-5005A Hall-sensor adapter interface |
| Reset | SW1, R8, C16 | ESP32-C3 EN reset and RC delay |
| IR emitter | R1, Q1, D1, R2 | 940nm IR LED with transistor driver |
| Pull-ups | R6-R9 | I2C, EN, and BOOT pull-ups |
| Decoupling | C1-C17 | Local rail decoupling and regulator stability |

The final rectangle coordinates, in page coordinates, are:

| Block | Left | Top | Width | Height |
| --- | ---: | ---: | ---: | ---: |
| Main control | 250 | 160 | 480 | 470 |
| Motion sensor | 1030 | 260 | 500 | 250 |
| Heart-rate sensor | 1750 | 300 | 550 | 220 |
| Power | 300 | 810 | 1500 | 270 |
| TTL programming | 1920 | 810 | 350 | 220 |
| Battery | 1980 | 1040 | 320 | 140 |
| Trackball | 280 | 1080 | 300 | 240 |
| Reset | 700 | 1110 | 350 | 190 |
| IR emitter | 1150 | 1100 | 1050 | 190 |
| Pull-ups | 1150 | 1340 | 1000 | 110 |
| Decoupling | 220 | 1450 | 2180 | 200 |

In the current EasyEDA rectangle API, pass the screen-coordinate bottom edge
as the `topLeftY` argument, then verify the returned primitive bounding box.

## Final Component Placement

Top row:

- U1 `(450, 400)`
- U2 `(1300, 400)`
- U3 `(2050, 400)`

Power row:

- U6 `(450, 900)`
- R3 `(800, 1000)`
- U4 `(1100, 900)`
- U5 `(1650, 900)`
- J4 `(2100, 900)`
- J2 `(2150, 1100)`

Interface and IR row:

- J3 `(450, 1200)`
- SW1 `(850, 1200)`
- R1 `(1250, 1200)`
- Q1 `(1500, 1200)`
- D1 `(1800, 1200)`
- R2 `(2050, 1200)`

Pull-ups:

- R6 `(1250, 1400)`
- R7 `(1500, 1400)`
- R8 `(1750, 1400)`
- R9 `(2000, 1400)`

Decoupling rows:

- C1-C8 at `y=1500`, `x=300, 550, 800, 1050, 1300, 1550, 1800, 2050`
- C9-C17 at `y=1600`, `x=300, 550, 800, 1050, 1300, 1550, 1800, 2050, 2300`

## Firmware Pin Map

| Function | ESP32-C3 GPIO | U1 pin |
| --- | --- | ---: |
| Trackball UP | GPIO0 | 12 |
| Trackball DOWN | GPIO1 | 13 |
| Trackball LEFT | GPIO3 | 6 |
| Trackball RIGHT | GPIO4 | 18 |
| Trackball button | GPIO5 | 19 |
| I2C SDA | GPIO6 | 20 |
| I2C SCL | GPIO7 | 21 |
| IR emitter | GPIO10 | 16 |
| UART0 RX | GPIO20 | 30 |
| UART0 TX | GPIO21 | 31 |
| Chip enable | EN | 8 |
| Boot strap | GPIO9 | 23 |

The existing firmware uses this map. Do not change it unless the user asks for
a functional improvement.

## Final Net Map

U1:

- `1,2,11,14,36-53 = GND`
- `3 = 3V3`
- `6 = TB_LEFT`
- `8 = EN`
- `12 = TB_UP`
- `13 = TB_DOWN`
- `16 = IR_DRIVE`
- `18 = TB_RIGHT`
- `19 = TB_BUTTON`
- `20 = I2C_SDA`
- `21 = I2C_SCL`
- `23 = BOOT`
- `30 = TTL_RX`
- `31 = TTL_TX`
- unused pins are marked no-connect

U2:

- `1,9,11,18,25 = GND`
- `8,13 = 3V3`
- `10 = MPU_REGOUT`
- `20 = MPU_CPOUT`
- `23 = I2C_SCL`
- `24 = I2C_SDA`
- unused pins are marked no-connect

U3:

- `2 = I2C_SCL`
- `3 = I2C_SDA`
- `4,12 = GND`
- `9,10 = 3V3`
- `11 = 1V8`
- unused pins are marked no-connect

U4:

- `1 = GND`
- `2 = 3V3`
- `3 = VBAT`

U5:

- `1 = GND`
- `2 = 1V8`
- `3 = 3V3`

U6:

- `1,3,9 = GND`
- `2 = PROG`
- `4,8 = VBUS`
- `5 = VBAT`
- `6,7` are unused status outputs

J4:

- `1 = VBUS`
- `2 = GND`
- `3 = TTL_TX`
- `4 = TTL_RX`

J2:

- `1 = VBAT`
- `2,3,4 = GND`

J3:

- `1 = 3V3`
- `2,8,9 = GND`
- `3 = TB_UP`
- `4 = TB_DOWN`
- `5 = TB_LEFT`
- `6 = TB_RIGHT`
- `7 = TB_BUTTON`

SW1:

- `1,2 = EN`
- `3,4 = GND`

Q1:

- `1 = IR_BASE`
- `2 = GND`
- `3 = IR_LED_K`

D1:

- `1 = IR_LED_A`
- `2 = IR_LED_K`

Two-terminal parts:

- R1 `IR_DRIVE / IR_BASE`
- R2 `3V3 / IR_LED_A`
- R3 `PROG / GND`
- R6 `3V3 / I2C_SDA`
- R7 `3V3 / I2C_SCL`
- R8 `3V3 / EN`
- R9 `3V3 / BOOT`
- C1 `VBUS / GND`
- C2 `VBAT / GND`
- C3 `VBAT / GND`
- C4 `3V3 / GND`; value 10nF
- C5 `3V3 / GND`
- C6 `1V8 / GND`
- C7 `3V3 / GND`
- C8 `3V3 / GND`
- C9 `3V3 / GND`
- C10 `3V3 / GND`
- C11 `MPU_REGOUT / GND`; 100nF
- C12 `MPU_CPOUT / GND`; 2.2nF
- C13 `1V8 / GND`
- C14 `1V8 / GND`
- C15 `3V3 / GND`; 4.7uF
- C16 `EN / GND`
- C17 `3V3 / GND`

## Datasheet Decisions

ESP32-C3-MINI-1:

- Use the module as the minimum RF system; it includes RF matching, module
  clocking, and a PCB antenna.
- Add 3V3 bulk and local decoupling.
- Add the EN RC delay, approximately 10k and 1uF.
- Do not leave EN floating.
- UART0 is the programming/log interface.
- Mark all NC pins no-connect.

MPU6050:

- `CLKIN` and `FSYNC` connect to GND when unused.
- `AD0` connects to GND for address `0x68`.
- `VLOGIC` and `VDD` connect to 3.3V.
- `VLOGIC` bypass is 10nF.
- `REGOUT` bypass is 100nF.
- `CPOUT` bypass is 2.2nF.
- Reserved pins are no-connect; EP connects to GND.

MAX30102:

- `VDD` connects to 1.8V.
- `VLED+` connects to 3.3V.
- VDD uses 1uF plus 100nF local bypass.
- VLED+ uses 4.7uF plus 100nF local bypass for pulsed LED current.
- PGND and GND both connect to ground.
- INT is unused and marked no-connect for the existing firmware.

TP4056:

- `TEMP` is grounded to disable temperature sensing.
- `CE` connects to 5V to enable charging.
- `PROG = 10k`, approximately 130mA charge current for a small battery.
- VCC and BAT each use 10uF local capacitance.
- STDBY and CHRG remain unused for minimum part count.

ME6211:

- 3V3 regulator.
- Preserve input and output capacitance.
- SOT23-3 pinout: 1=VSS, 2=VOUT, 3=VIN.

XC6206:

- 1.8V regulator for MAX30102 VDD.
- Preserve input and output capacitance.
- SOT23-3 pinout: 1=GND, 2=VOUT, 3=VIN.

IT-5005A-5.5-B:

- Magnetic trackball, not a four-direction switch.
- Requires an adapter board with four Hall sensors and a center button.
- J3 carries 3V3, GND, UP, DOWN, LEFT, RIGHT, BTN, and shield/ground.
- The adapter must output active-low pulses compatible with the existing
  `INPUT_PULLUP` firmware.

## Final Checks

The finalized project has:

- 36 physical components;
- 122 wires;
- no component bounding-box overlaps;
- no different-net wire crossings;
- no overlapping compact labels or block titles;
- no used pin without its expected net;
- unused pins explicitly marked no-connect;
- netlist entries for J4, SW1, TTL_TX, TTL_RX, I2C, and all rails;
- a live DRC summary of 4 non-fatal warnings in this EDA version.

The installed EDA version returns only the DRC aggregate `{ type, count }`.
Do not claim to know the individual warning text unless a newer API returns it.
