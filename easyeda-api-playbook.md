# EasyEDA API Playbook

Use this reference with the `easyeda-api` skill. The live API runs inside
EasyEDA Pro and is reached through the bridge.

## Bridge

Check ports 49620-49629:

```powershell
$ports = 49620..49629
foreach($p in $ports){
  try {
    $r = Invoke-RestMethod -Uri "http://127.0.0.1:$p/health" -TimeoutSec 1
    if($r.service -eq "easyeda-bridge"){ $r | ConvertTo-Json -Compress }
  } catch {}
}
```

Execute code:

```powershell
$body = @{ code = $code } | ConvertTo-Json -Compress
Invoke-RestMethod -Uri "http://127.0.0.1:49620/execute" `
  -Method Post -ContentType "application/json" -Body $body -TimeoutSec 120
```

Always open the target page explicitly when a result looks stale:

```javascript
await eda.dmt_EditorControl.openDocument('PAGE_UUID');
await new Promise(r => setTimeout(r, 300));
```

## Component and Pin Inspection

Get components and their placement:

```javascript
const comps = await eda.sch_PrimitiveComponent.getAll();
const component = comps.find(c => c.getState_Designator() === 'U1');
const id = component.getState_PrimitiveId();
const bbox = await eda.sch_Primitive.getPrimitivesBBox([id]);
const pins = await eda.sch_PrimitiveComponent.getAllPinsByPrimitiveId(id);
```

Pin state methods include:

- `getState_PinNumber()`
- `getState_PinName()`
- `getState_X()`
- `getState_Y()`
- `getState_NoConnected()`

`sch_PrimitivePin.modify(pin, { noConnected: true })` can report success while
failing to persist in some versions. Use:

```javascript
const pin = pins.find(p => String(p.getState_PinNumber()) === '4');
const asyncPin = pin.toAsync();
asyncPin.setState_NoConnected(true);
await asyncPin.done();
```

## Wires and Nets

Create a real wire between two points:

```javascript
await eda.sch_PrimitiveWire.create(
  [x1, y1, x2, y2],
  'NET_NAME',
  '#37474F',
  1,
  null
);
```

The wire's `net` argument is the electrical connectivity source. A plain
`sch_PrimitiveText` is only decoration and does not connect pins by itself.

The automatic wire attributes can be inspected per wire:

```javascript
const attrs = await eda.sch_PrimitiveAttribute.getAll(wireId);
const name = attrs.find(a => a.getState_Key() === 'Name');
```

This is more reliable than `sch_PrimitiveAttribute.getAll()` without a parent
in the current version.

If automatic wire-name attributes and manual compact labels are both visible,
they look duplicated and can produce a rendering artifact. In the final
RingHome style:

- keep each wire's hidden `Name` attribute for connectivity;
- set `valueVisible: false` on automatic wire names;
- place compact attached text or a visible attribute only at the chosen label
  position.

`sch_PrimitiveAttribute.createNetLabel()` exists in the docs but returns
`undefined` on the tested EDA build. Do not rely on it without testing.

## Text Labels

Create compact labels:

```javascript
await eda.sch_PrimitiveText.create(
  x,
  y,
  'I2C_SDA',
  0,
  '#1565C0',
  null,
  7,
  false,
  false,
  false,
  2
);
```

Alignment values used in this project:

- `2`: left middle
- `5`: center
- `6`: center bottom
- `8`: right middle

Keep adjacent labels in alternating offset rows. A stagger of roughly
`+/-16` coordinate units prevented overlap for 10-unit pin pitch.

## Functional Block Rectangles

The API signature is:

```javascript
await eda.sch_PrimitiveRectangle.create(
  left,
  yArgument,
  width,
  height,
  8,
  0,
  '#1565C0',
  'none',
  2,
  0,
  0
);
```

In the current build, the second argument behaves like the bottom edge for
vertical placement even though the docs call it `topLeftY`. To draw a box with
screen bounds `top = y` and `height = h`, pass `y + h` as the second argument,
then verify:

```javascript
const bbox = await eda.sch_Primitive.getPrimitivesBBox([rectId]);
```

Use `fillColor: 'none'` so wires remain visible.

## Verification

Component overlap:

```javascript
const boxes = await Promise.all(
  components.map(c =>
    eda.sch_Primitive.getPrimitivesBBox([c.getState_PrimitiveId()])
  )
);
```

Used-pin endpoint check:

```javascript
const wirePoints = [];
for (const w of await eda.sch_PrimitiveWire.getAll()) {
  const flat = [];
  const walk = value => {
    if (typeof value === 'number') flat.push(value);
    else if (Array.isArray(value)) value.forEach(walk);
  };
  walk(w.getState_Line());
  for (let i = 0; i + 1 < flat.length; i += 2) {
    wirePoints.push([flat[i], flat[i + 1], w.getState_Net()]);
  }
}
```

Netlist check:

```javascript
const netlist = await eda.sch_Netlist.getNetlist('Protel2');
```

Check that expected connector pins, UART, I2C, and power nets appear in the
result.

DRC:

```javascript
const drc = await eda.sch_Drc.check(true, false, true);
```

The tested version returns an aggregate such as
`[{ type: 'warn', count: 4 }]`, not individual messages. Report that
limitation rather than inventing details.

## Preview Export

If `sch_ManufactureData.getPngFile()` is unavailable, navigate to the sheet
region and capture the rendered canvas:

```javascript
await eda.sch_Document.navigateToRegion(0, 2338, 0, 1654);
const blob = await eda.dmt_EditorControl.getCurrentRenderedAreaImage();
```

Convert the returned Blob to base64 inside the EDA runtime and save it from
the bridge client.
