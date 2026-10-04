async function checkSchematicLayout(eda, config) {
  const {
    page,
    expected = {},
    expectedNetlistTokens = [],
  } = config;

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

  const componentBoxes = {};
  for (const component of components) {
    const designator = component.getState_Designator();
    componentBoxes[designator] =
      await eda.sch_Primitive.getPrimitivesBBox([
        component.getState_PrimitiveId(),
      ]);
  }

  const componentOverlaps = [];
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

    for (const pinNumber of Object.keys(expected[designator])) {
      const pin = pins.find(
        candidate => String(candidate.getState_PinNumber()) === pinNumber
      );
      if (!pin) {
        pinErrors.push([designator, pinNumber, 'pin missing']);
        continue;
      }

      const expectedNet = expected[designator][pinNumber];
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

// Call from the EasyEDA bridge with the current page UUID, expected pin map,
// and netlist tokens. The function returns a compact verification report.

if (typeof module !== 'undefined') {
  module.exports = { checkSchematicLayout };
}
