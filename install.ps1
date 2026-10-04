param(
    [ValidateSet("All", "Codex", "OpenCode")]
    [string]$InstallFor = "All",
    [string]$OpenCodeInstallRoot,
    [string]$CodexInstallRoot
)

$ErrorActionPreference = "Stop"

$skillRoot = $PSScriptRoot
$skillFile = Join-Path $skillRoot "SKILL.md"

if (-not (Test-Path -LiteralPath $skillFile)) {
    throw "SKILL.md was not found at $skillRoot"
}

function Get-Targets {
    if ($OpenCodeInstallRoot -or $CodexInstallRoot) {
        $targets = @()
        if ($OpenCodeInstallRoot) {
            $targets += [pscustomobject]@{
                Name = "OpenCode"
                Root = $OpenCodeInstallRoot
            }
        }
        if ($CodexInstallRoot) {
            $targets += [pscustomobject]@{
                Name = "Codex"
                Root = $CodexInstallRoot
            }
        }
        return $targets
    }

    $homePath = [Environment]::GetFolderPath("UserProfile")
    $targets = @()
    if ($InstallFor -in @("All", "OpenCode")) {
        $targets += [pscustomobject]@{
            Name = "OpenCode"
            Root = Join-Path $homePath ".config\opencode\skills"
        }
    }
    if ($InstallFor -in @("All", "Codex")) {
        $targets += [pscustomobject]@{
            Name = "Codex"
            Root = Join-Path $homePath ".codex\skills"
        }
    }
    return $targets
}

foreach ($target in Get-Targets) {
    $destination = Join-Path $target.Root "easyeda-schematic-builder"
    New-Item -ItemType Directory -Path $destination -Force | Out-Null

    Get-ChildItem -LiteralPath $skillRoot -Force |
        Where-Object { $_.Name -ne ".git" } |
        Copy-Item -Destination $destination -Recurse -Force

    $installedSkill = Join-Path $destination "SKILL.md"
    if (-not (Test-Path -LiteralPath $installedSkill)) {
        throw "Install failed for $($target.Name): SKILL.md is missing"
    }

    $frontmatter = Get-Content -LiteralPath $installedSkill -TotalCount 20
    if (-not ($frontmatter | Where-Object {
        $_ -match "^name:\s*easyeda-schematic-builder\s*$"
    })) {
        throw "Install failed for $($target.Name): skill name is incorrect"
    }

    Write-Host "$($target.Name) installed to:"
    Write-Host "  $destination"
}
