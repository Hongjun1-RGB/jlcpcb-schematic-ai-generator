async function checkSchematicLayout(eda, config) {
  const page = config.page;
  const expected = config.expected || {};
  const expectedNetlistTokens = config.expectedNetlistTokens || [];

  if (page) {
    await eda.dmt_EditorControl.openDocument(page);
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  const components = (await eda.sch_PrimitiveComponent.getAll()).filter(
    component => component.getState_ComponentType() === 'part'
  );
  const byDesignator = Object.fromEntries(
    components.map(component => [
      component.getState_Designator(),
      component,
    ])
  );

  const componentOverlaps = [];
  const componentBoxes = {};
  for (const component of components) {
    const designator = component.getState_Designator();
    componentBoxes[designator] =
      await eda.sch_Primitive.getPrimitivesBBox([
        component.getState_PrimitiveId(),
      ]);
  }

  const designators = Object.keys(componentBoxes);
  for (let i = 0; i < designators.length; i += 1) {
    for (let j = i + 1; j < designators.length; j += 1) {
      const a = componentBoxes[designators[i]];
      const b = componentBoxes[designators[j]];
      if (
        a &&
        b &&
        a.minX < b.maxX &&
        a.maxX > b.minX &&
        a.minY < b.maxY &&
        a.maxY > b.minY
      ) {
        componentOverlaps.push([designators[i], designators[j]]);
      }
    }
  }

  const wires = await eda.sch_PrimitiveWire.getAll();
  const wirePoints = [];
  const segments = [];

  for (const wire of wires) {
    const net = wire.getState_Net();
    const flat = [];
    const walk = value => {
      if (typeof value === 'number') flat.push(value);
      else if (Array.isArray(value)) value.forEach(walk);
    };
    walk(wire.getState_Line());

    for (let i = 0; i + 1 < flat.length; i += 2) {
      wirePoints.push([flat[i], flat[i + 1], net]);
      if (i + 3 < flat.length) {
        segments.push({
          a: [flat[i], flat[i + 1]],
          b: [flat[i + 2], flat[i + 3]],
          net,
        });
      }
    }
  }

  const pinErrors = [];
  for (const designator of Object.keys(expected)) {
    const component = byDesignator[designator];
    if (!component) {
      pinErrors.push([designator, '*', 'component missing']);
      continue;
    }

    const pins =
      (await eda.sch_PrimitiveComponent.getAllPinsByPrimitiveId(
        component.getState_PrimitiveId()
      )) || [];
    const expectedPins = expected[designator];

    for (const pinNumber of Object.keys(expectedPins)) {
      const pin = pins.find(
        candidate => String(candidate.getState_PinNumber()) === pinNumber
      );
      if (!pin) {
        pinErrors.push([designator, pinNumber, 'pin missing']);
        continue;
      }

      const expectedNet = expectedPins[pinNumber];
      const point = [pin.getState_X(), pin.getState_Y()];
      const matched = wirePoints.some(
        candidate =>
          Math.abs(candidate[0] - point[0]) < 0.1 &&
          Math.abs(candidate[1] - point[1]) < 0.1 &&
          candidate[2] === expectedNet
      );
      if (!matched) pinErrors.push([designator, pinNumber, expectedNet]);
    }
  }

  const orientation = (p, q, r) =>
    Math.sign(
      (q[0] - p[0]) * (r[1] - p[1]) -
        (q[1] - p[1]) * (r[0] - p[0])
    );
  const onSegment = (p, q, r) =>
    Math.min(p[0], r[0]) - 1e-6 <= q[0] &&
    q[0] <= Math.max(p[0], r[0]) + 1e-6 &&
    Math.min(p[1], r[1]) - 1e-6 <= q[1] &&
    q[1] <= Math.max(p[1], r[1]) + 1e-6;
  const intersects = (first, second) => {
    const p = first.a;
    const q = first.b;
    const r = second.a;
    const u = second.b;
    const o1 = orientation(p, q, r);
    const o2 = orientation(p, q, u);
    const o3 = orientation(r, u, p);
    const o4 = orientation(r, u, q);
    return (
      (o1 * o2 < 0 && o3 * o4 < 0) ||
      (o1 === 0 && onSegment(p, r, q)) ||
      (o2 === 0 && onSegment(p, u, q)) ||
      (o3 === 0 && onSegment(r, p, u)) ||
      (o4 === 0 && onSegment(r, q, u))
    );
  };

  const crossings = [];
  for (let i = 0; i < segments.length; i += 1) {
    for (let j = i + 1; j < segments.length; j += 1) {
      if (
        segments[i].net !== segments[j].net &&
        intersects(segments[i], segments[j])
      ) {
        crossings.push([segments[i].net, segments[j].net]);
      }
    }
  }

  let netlist = '';
  try {
    netlist = await eda.sch_Netlist.getNetlist('Protel2');
  } catch (error) {
    netlist = `NETLIST_ERROR: ${String(error)}`;
  }

  const missingNetlistTokens = expectedNetlistTokens.filter(
    token => !netlist.includes(token)
  );

  let drc;
  try {
    drc = await eda.sch_Drc.check(true, false, true);
  } catch (error) {
    drc = `DRC_ERROR: ${String(error)}`;
  }

  return {
    componentCount: components.length,
    wireCount: wires.length,
    componentOverlaps,
    pinErrors,
    crossingCount: crossings.length,
    crossings,
    missingNetlistTokens,
    drc: JSON.stringify(drc),
  };
}

// The default configuration validates the finalized RingHome smart-ring page.
// Change the page UUID and expected map when reusing this script elsewhere.
checkSchematicLayout(eda, {
  page: '716871b9f863f7a9',
  expected: {
    U1: {
      1: 'GND',
      2: 'GND',
      3: '3V3',
      6: 'TB_LEFT',
      8: 'EN',
      11: 'GND',
      12: 'TB_UP',
      13: 'TB_DOWN',
      14: 'GND',
      16: 'IR_DRIVE',
      18: 'TB_RIGHT',
      19: 'TB_BUTTON',
      20: 'I2C_SDA',
      21: 'I2C_SCL',
      23: 'BOOT',
      30: 'TTL_RX',
      31: 'TTL_TX',
      36: 'GND',
      37: 'GND',
      38: 'GND',
      39: 'GND',
      40: 'GND',
      41: 'GND',
      42: 'GND',
      43: 'GND',
      44: 'GND',
      45: 'GND',
      46: 'GND',
      47: 'GND',
      48: 'GND',
      49: 'GND',
      50: 'GND',
      51: 'GND',
      52: 'GND',
      53: 'GND',
    },
    U2: {
      1: 'GND',
      8: '3V3',
      9: 'GND',
      10: 'MPU_REGOUT',
      11: 'GND',
      13: '3V3',
      18: 'GND',
      20: 'MPU_CPOUT',
      23: 'I2C_SCL',
      24: 'I2C_SDA',
      25: 'GND',
    },
    U3: {
      2: 'I2C_SCL',
      3: 'I2C_SDA',
      4: 'GND',
      9: '3V3',
      10: '3V3',
      11: '1V8',
      12: 'GND',
    },
    U4: { 1: 'GND', 2: '3V3', 3: 'VBAT' },
    U5: { 1: 'GND', 2: '1V8', 3: '3V3' },
    U6: {
      1: 'GND',
      2: 'PROG',
      3: 'GND',
      4: 'VBUS',
      5: 'VBAT',
      8: 'VBUS',
      9: 'GND',
    },
    J4: { 1: 'VBUS', 2: 'GND', 3: 'TTL_TX', 4: 'TTL_RX' },
    J2: { 1: 'VBAT', 2: 'GND', 3: 'GND', 4: 'GND' },
    J3: {
      1: '3V3',
      2: 'GND',
      3: 'TB_UP',
      4: 'TB_DOWN',
      5: 'TB_LEFT',
      6: 'TB_RIGHT',
      7: 'TB_BUTTON',
      8: 'GND',
      9: 'GND',
    },
    SW1: { 1: 'EN', 2: 'EN', 3: 'GND', 4: 'GND' },
    Q1: { 1: 'IR_BASE', 2: 'GND', 3: 'IR_LED_K' },
    D1: { 1: 'IR_LED_A', 2: 'IR_LED_K' },
    R1: { 1: 'IR_DRIVE', 2: 'IR_BASE' },
    R2: { 1: '3V3', 2: 'IR_LED_A' },
    R3: { 1: 'PROG', 2: 'GND' },
    R6: { 1: '3V3', 2: 'I2C_SDA' },
    R7: { 1: '3V3', 2: 'I2C_SCL' },
    R8: { 1: '3V3', 2: 'EN' },
    R9: { 1: '3V3', 2: 'BOOT' },
    C1: { 1: 'VBUS', 2: 'GND' },
    C2: { 1: 'VBAT', 2: 'GND' },
    C3: { 1: 'VBAT', 2: 'GND' },
    C4: { 1: '3V3', 2: 'GND' },
    C5: { 1: '3V3', 2: 'GND' },
    C6: { 1: '1V8', 2: 'GND' },
    C7: { 1: '3V3', 2: 'GND' },
    C8: { 1: '3V3', 2: 'GND' },
    C9: { 1: '3V3', 2: 'GND' },
    C10: { 1: '3V3', 2: 'GND' },
    C11: { 1: 'MPU_REGOUT', 2: 'GND' },
    C12: { 1: 'MPU_CPOUT', 2: 'GND' },
    C13: { 1: '1V8', 2: 'GND' },
    C14: { 1: '1V8', 2: 'GND' },
    C15: { 1: '3V3', 2: 'GND' },
    C16: { 1: 'EN', 2: 'GND' },
    C17: { 1: '3V3', 2: 'GND' },
  },
  expectedNetlistTokens: [
    'J4-',
    'SW1-',
    'TTL_TX',
    'TTL_RX',
    'I2C_SDA',
    'I2C_SCL',
    'VBUS',
    'VBAT',
    '3V3',
    '1V8',
    'GND',
  ],
});
