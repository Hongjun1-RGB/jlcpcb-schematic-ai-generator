# EasyEDA API Playbook

Use this reference with the `easyeda-api` skill. Code runs inside EasyEDA Pro
through the bridge.

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

Open the active page explicitly if results appear stale:

```javascript
await eda.dmt_EditorControl.openDocument('PAGE_UUID');
await new Promise(r => setTimeout(r, 300));
```

## Components and Pins

```javascript
const components = await eda.sch_PrimitiveComponent.getAll();
const component = components.find(
  item => item.getState_Designator() === 'U1'
);
const id = component.getState_PrimitiveId();
const bbox = await eda.sch_Primitive.getPrimitivesBBox([id]);
const pins = await eda.sch_PrimitiveComponent.getAllPinsByPrimitiveId(id);
```

Common pin state methods:

- `getState_PinNumber()`
- `getState_PinName()`
- `getState_X()`
- `getState_Y()`
- `getState_NoConnected()`

`sch_PrimitivePin.modify(pin, { noConnected: true })` may not persist in some
EDA builds. Use the async state path:

```javascript
const pin = pins.find(
  item => String(item.getState_PinNumber()) === '4'
);
const asyncPin = pin.toAsync();
asyncPin.setState_NoConnected(true);
await asyncPin.done();
```

## Wires and Nets

Create a wire with an electrical net:

```javascript
await eda.sch_PrimitiveWire.create(
  [x1, y1, x2, y2],
  'NET_NAME',
  '#37474F',
  1,
  null
);
```

A plain `sch_PrimitiveText` is not an electrical connection. The wire's net
argument is the source of connectivity.

Inspect automatic wire attributes through the parent wire:

```javascript
const attrs = await eda.sch_PrimitiveAttribute.getAll(wireId);
const name = attrs.find(attr => attr.getState_Key() === 'Name');
```

If automatic wire-name attributes and manual compact labels are both visible,
they can look duplicated or trigger rendering artifacts. Keep one visible form:

- retain the wire's `Name` attribute for connectivity;
- hide automatic visible names when manual labels are used;
- do not place two text objects for the same net at the same point.

`sch_PrimitiveAttribute.createNetLabel()` is not reliable on every EDA build.
Test it before relying on it.

## Compact Labels

```javascript
await eda.sch_PrimitiveText.create(
  x,
  y,
  'NET_NAME',
  0,
  '#37474F',
  null,
  7,
  false,
  false,
  false,
  2
);
```

Alignment values commonly used:

- `2`: left middle
- `5`: center
- `6`: center bottom
- `8`: right middle

For dense adjacent pins, alternate label offsets above and below the wire.
Verify estimated text rectangles instead of assuming they fit.

## Functional Block Frames

```javascript
await eda.sch_PrimitiveRectangle.create(
  left,
  bottomY,
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

The current API's vertical argument can behave like the bottom edge even
though documentation calls it `topLeftY`. Verify the result:

```javascript
const bbox = await eda.sch_Primitive.getPrimitivesBBox([rectangleId]);
```

Use `fillColor: 'none'` so wires and labels remain visible.

## Verification

Component overlap:

```javascript
const boxes = await Promise.all(
  components.map(component =>
    eda.sch_Primitive.getPrimitivesBBox([
      component.getState_PrimitiveId(),
    ])
  )
);
```

Wire endpoint and net check:

```javascript
const wirePoints = [];
for (const wire of await eda.sch_PrimitiveWire.getAll()) {
  const flat = [];
  const walk = value => {
    if (typeof value === 'number') flat.push(value);
    else if (Array.isArray(value)) value.forEach(walk);
  };
  walk(wire.getState_Line());
  for (let i = 0; i + 1 < flat.length; i += 2) {
    wirePoints.push([flat[i], flat[i + 1], wire.getState_Net()]);
  }
}
```

Netlist:

```javascript
const netlist = await eda.sch_Netlist.getNetlist('Protel2');
```

DRC:

```javascript
const drc = await eda.sch_Drc.check(true, false, true);
```

Some versions return only an aggregate such as
`[{ type: 'warn', count: 4 }]`. Report the limitation rather than inventing
individual messages.

## Preview Export

If high-resolution export is unavailable, fit the whole page and capture the
rendered canvas:

```javascript
await eda.sch_Document.navigateToRegion(0, pageWidth, 0, pageHeight);
const blob = await eda.dmt_EditorControl.getCurrentRenderedAreaImage();
```

Convert the Blob to base64 inside the EDA runtime and save it from the bridge
client. In the final response, embed the saved image with an absolute local
path.
