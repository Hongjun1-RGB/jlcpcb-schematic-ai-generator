---
name: easyeda-schematic-builder
description: Build, repair, and explain production-minded circuit schematics in EasyEDA Pro / 嘉立创EDA. Use when the user asks to draw or revise a schematic, preserve firmware pin compatibility, select smaller or fewer parts, inspect datasheets, work through the live EasyEDA API, remove overlaps or bad adjacent labels, frame functional blocks, or verify nets and DRC.
metadata:
  short-description: Draw and verify EasyEDA schematics
---

# EasyEDA Schematic Builder

Use this skill for live schematic construction in EasyEDA Pro / 嘉立创EDA,
especially when the result must be readable, electrically credible, and close
to production rather than a loose collection of symbols.

Read [ringhome-smart-ring.md](ringhome-smart-ring.md)
when the request is for the RingHome smart ring or should follow the final
reference style from that project.

Read [easyeda-api-playbook.md](easyeda-api-playbook.md)
when using the live EDA bridge or when API behavior is uncertain.

Use [check_schematic_layout.js](check_schematic_layout.js) as a
starting point for layout, endpoint, net, and crossing checks. If the bridge
does not expose the required API, inspect the installed EasyEDA docs instead
of guessing method names.

## Outcome Standard

Deliver a schematic that is:

- electrically complete for the requested behavior;
- compatible with the existing firmware unless the user explicitly approves a
  code change;
- built from the selected chips whenever practical;
- stable with required decoupling, pull-ups, reset, and strap-pin handling;
- compact without forcing unrelated parts into one region;
- visually separated by function, with no component or label overlap;
- accompanied by a concise explanation of each functional block and the
  datasheet reason for the connections.

Do not replace the user's chosen chips merely because another part is easier.
Do not place a complete finished module where the request calls for a
component-level circuit, except when the module is the deliberate minimum
radio/system solution, such as ESP32-C3-MINI-1 for RF and antenna integration.

## Required Workflow

1. Gather the firmware pin map, existing wiring notes, mechanical constraints,
   and any user-provided datasheets before editing the schematic.
2. Look up the relevant official datasheets. Verify power rails, required
   capacitors, reset and strap pins, unused-pin treatment, and pin type.
3. Make a complete net map before drawing. Mark every used pin and every unused
   non-connect pin explicitly.
4. Lay out by function. Keep large chips, headers, connectors, and polar parts
   separated. Reserve open routing channels between blocks.
5. Draw real wires with explicit net names. A plain text label alone is not an
   electrical connection.
6. Use short stubs and compact labels. Avoid large power flags or duplicated
   labels unless the user requests them. Keep repeated label text from
   overlapping adjacent pins.
7. Add colored, unfilled rectangles around functional blocks. Put a concise
   role title inside each rectangle. In the RingHome reference, use the block
   layout in `ringhome-smart-ring.md`.
8. Save the page, then verify:
   - every used pin has a wire with the expected net;
   - every unused pin has `noConnected` set;
   - component bounding boxes do not overlap;
   - different-net wire segments do not cross;
   - visible label rectangles do not overlap components or each other;
   - the exported netlist contains the expected connectors and UART/I2C/power
     nets;
   - DRC is checked and every residual warning is explained.
9. Export or capture the current schematic preview and update the project's
   schematic notes.

## Schematic Style

Use quiet engineering colors and functional grouping. Keep the schematic
dense enough to scan but not compressed:

- one block per purpose;
- one clear net name per connection or bus;
- labels attached to the wire they describe;
- no isolated labels floating in empty space;
- no overlapping designators, values, net labels, or pin names;
- no giant text from duplicated visibility attributes;
- no short parallel runs so close that adjacent pins visually merge.

If the EDA version displays both automatic wire-name attributes and manually
created labels, keep only one visible form. The reference project hides the
automatic visible names and uses compact attached text at the stub endpoints,
while retaining the wire's hidden net attribute for electrical connectivity.

## Firmware Compatibility

Preserve the existing GPIO assignment unless the user explicitly asks for a
functional improvement. If a new peripheral cannot fit the existing pin map,
state the tradeoff, update the desktop firmware documentation if authorized,
and make the schematic and code agree.

For RingHome, the final pin map and exact net names are in
[ringhome-smart-ring.md](ringhome-smart-ring.md).

## Validation Rules

Do not call a schematic finished just because the symbols are placed. Use the
live API or exported netlist to prove the relevant connections.

When the installed EDA version only returns a DRC summary, report that
limitation accurately. Do not invent individual DRC messages. State which
checks were performed independently and what remains unresolved.

Never include credentials, tokens, private repository data, or customer data
in the skill, its references, screenshots, or examples.
