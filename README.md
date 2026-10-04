# EasyEDA Schematic Builder Skill

A Codex/OpenCode skill for drawing, repairing, framing, and verifying
production-minded schematics in EasyEDA Pro / 嘉立创EDA.

The skill enforces:

- datasheet verification before drawing;
- firmware-compatible GPIO and peripheral mappings;
- compact component selection without replacing user-chosen chips;
- real wire nets instead of decorative floating labels;
- separated functional blocks with colored outlines and role titles;
- component, label, and adjacent-pin overlap checks;
- different-net crossing checks;
- netlist and DRC verification;
- the finalized RingHome smart-ring schematic as a concrete reference.

## Install

From PowerShell:

```powershell
.\install.ps1 -InstallFor All
```

This installs the skill to:

- Codex: `~/.codex/skills/easyeda-schematic-builder`
- OpenCode: `~/.config/opencode/skills/easyeda-schematic-builder`

Use `-InstallFor Codex` or `-InstallFor OpenCode` to install only one target.

## Files

- `SKILL.md`: main instructions loaded by Codex/OpenCode.
- `ringhome-smart-ring.md`: finalized RingHome component, pin, net, and block
  reference.
- `easyeda-api-playbook.md`: live bridge, wire, label, rectangle, netlist, and
  DRC API notes.
- `check_schematic_layout.js`: reusable EasyEDA-side layout and connection
  checker.
- `smart-ring-schematic.png`: finalized reference preview.

## Use

Ask the agent to use `easyeda-schematic-builder` whenever the task is to draw
or revise an EasyEDA/嘉立创EDA schematic. For RingHome requests, the skill
automatically routes to the finalized smart-ring reference.
