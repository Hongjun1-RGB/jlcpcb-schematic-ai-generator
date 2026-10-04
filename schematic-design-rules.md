# Schematic Design Rules

## Functional Planning

Before drawing, write down:

- power sources and required voltage rails;
- every external connector and its pin order;
- every IC's required support pins;
- the firmware pin map and electrical direction of each signal;
- straps, reset pins, boot pins, enable pins, and unused pins;
- test/programming access that must remain removable;
- current, voltage, thermal, and package constraints.

## Component Selection

- Preserve the user's selected chips unless a functional improvement requires
  a change and the user approves it.
- Prefer small packages when the voltage, current, thermal, and assembly
  requirements allow.
- Reduce part count by removing redundant passives, not by removing required
  decoupling or protection.
- Use a module when it is deliberately the minimum RF or power solution.
- Use a bare IC or small functional block when the user asks for a
  component-level implementation.
- Check availability and package compatibility before finalizing.

## Datasheet Checklist

For each IC, verify:

- supply voltage range and separate analog/digital rails;
- input and output capacitor values and placement;
- oscillator, reference, charge-pump, and regulator bypass pins;
- reset, enable, boot, strap, and mode pins;
- unused-pin treatment;
- open-drain versus push-pull outputs;
- current limits and LED/load drive requirements;
- thermal pad and ground requirements;
- I2C addresses and required pull-ups;
- programming interface requirements.

## Layout and Visual Style

- Place parts by function, not in a single undifferentiated row.
- Use generous spacing around pin-dense ICs and headers.
- Keep components, designators, values, pin names, and net labels from
  overlapping.
- Route short stubs to compact labels instead of long crossing wires.
- Keep one- or two-unit label offsets so adjacent pins remain visually
  distinct.
- Use colored, unfilled block frames with short titles.
- Reserve open channels between power, digital, analog, connector, and
  high-current sections.
- Do not place large power flags or decorative labels unless requested.
- Do not duplicate automatic wire-name attributes and manually created labels.

## Connection Rules

- A wire must carry the correct net name.
- A plain text label is only visual decoration; it does not replace a real
  electrical net.
- Use wire endpoints at the actual component pin coordinates.
- If two nets cross, redesign the routing or split the connections by net.
- Mark unused pins no-connect rather than leaving them visually ambiguous.
- Keep connector and header pins in the order the user or mechanical interface
  requires.

## Verification Checklist

- Used-pin endpoint check: expected net at each used pin.
- Unused-pin check: no-connect state set.
- Component overlap check: all bounding boxes disjoint.
- Label overlap check: estimated text rectangles disjoint from components and
  each other.
- Crossing check: different-net line segments do not intersect.
- Netlist check: expected connectors, UART, I2C, buses, and power rails are
  present in the exported netlist.
- DRC check: run it and report the exact returned status. If only a summary is
  returned, say so.
- Image check: inspect or export the final schematic and make sure it is not
  blank, clipped, or obscured.

## Final Response

Explain:

- what each functional block does;
- why its main connections follow the datasheet or interface requirement;
- which pins are unused and why;
- what verification was performed;
- what warnings or limitations remain.

Display the final image in chat with an absolute local Markdown image path.
