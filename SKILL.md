---
name: jlcpcb-schematic-ai-generator
description: Generate, revise, and verify production-minded circuit schematics in EasyEDA Pro / 嘉立创EDA. Use when the user asks to draw a PCB schematic, preserve firmware pin compatibility, select smaller or fewer parts, inspect chip datasheets, remove component or label overlap, frame functional blocks, validate nets and DRC, or display the finished schematic image.
metadata:
  short-description: 嘉立创PCB原理图AI生成
---

# 嘉立创PCB原理图AI生成

Use this skill for live schematic work in EasyEDA Pro / 嘉立创EDA. The goal is
a readable, electrically credible schematic that is close to production, not a
loose collection of symbols.

Read [schematic-design-rules.md](schematic-design-rules.md)
for the reusable engineering and visual rules.

Read [easyeda-api-playbook.md](easyeda-api-playbook.md)
when using the live EDA bridge or when API behavior is uncertain.

Use [check_schematic_layout.js](check_schematic_layout.js) for
layout, endpoint, net, and crossing checks.

## Required Outcome

The finished schematic must:

- implement the requested behavior and interfaces;
- preserve the agreed chip choices and firmware pin mapping unless the user
  explicitly approves a code or architecture change;
- use datasheet-required decoupling, power rails, pull-ups, reset behavior, and
  strap-pin handling;
- minimize component count without sacrificing stability or reliability;
- contain no overlapping components, labels, or block frames;
- have no electrically distinct wires crossing;
- use real wire nets, not decorative floating text;
- be split into clearly framed functional blocks with short role titles;
- pass independent endpoint, netlist, overlap, and DRC checks;
- include an exported or captured finished image in the final response.

## Workflow

1. Gather requirements, firmware pin maps, interface definitions, mechanical
   constraints, and any existing wiring documents.
2. Inspect the relevant official datasheets. Record the required power rails,
   decoupling, pull-ups, reset pins, straps, reserved pins, and unused-pin
   treatment before drawing.
3. Build the complete pin-to-net map. Mark every used pin and every unused
   no-connect pin explicitly.
4. Place components by function. Keep ICs, connectors, headers, and polar parts
   separated enough that designators, pin names, and labels remain readable.
5. Draw real wires with explicit net names. Use compact attached labels. Avoid
   large power flags, duplicated labels, floating labels, and labels so close
   that adjacent pins visually merge.
6. Add colored, unfilled rectangles around functional blocks and place a short
   role title inside each frame.
7. Save the page and run the verification pass:
   - every used pin has the expected net;
   - every unused pin is marked no-connect;
   - component bounding boxes do not overlap;
   - visible labels do not overlap components or each other;
   - different-net wire segments do not cross;
   - the exported netlist includes all expected connectors, buses, and power
     rails;
   - DRC is checked and every remaining warning is explained accurately.
8. Export or capture the finished schematic.
9. In the final response, embed the finished image using an absolute local
   Markdown image path and explain each functional block and the datasheet
   basis for its connections.

## Engineering Rules

- Do not replace the user's chosen chip merely because another part is easier
  to place.
- Do not place a complete finished module where the request calls for a
  component-level circuit, except when the module is deliberately the minimum
  RF, power, or interface solution.
- Prefer small packages only when voltage, current, thermal, and assembly
  constraints permit them.
- Keep required decoupling even when reducing component count.
- Preserve the original GPIO assignment unless the user asks for a functional
  improvement. If a pin map must change, state the consequence and update the
  schematic and code together.
- Treat unused pins according to the datasheet and the chosen device pin type.
- Do not invent DRC details. If the EDA version returns only a summary, report
  that limitation and state what was verified independently.

## Visual Rules

- One functional purpose per framed block.
- One clear net name per connection or bus.
- Small labels attached to the wire they describe.
- No duplicated automatic and manual net names.
- No giant text from hidden/visible attribute conflicts.
- Quiet engineering colors; use color to distinguish function, not decoration.
- Leave routing channels between blocks.
- Keep the final image clean enough to inspect without zooming into every pin.

Never include credentials, tokens, private repository data, or customer data
in the skill, its references, images, or examples.
