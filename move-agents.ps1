# move-agents.ps1
# ============================================================================
# v2 - aggiornato dopo code-review
#
#  Sposta i due repo di sub-agent estratti in C:\Users\Ruman\concorso-ai
#  dentro la corretta struttura .claude\ del PROGETTO concorso-ai.
#
#  Uso (doppio click o da terminale PowerShell):
#    powershell -ExecutionPolicy Bypass -File "C:\Users\Ruman\Desktop\concorso-ai\move-agents.ps1"
#
#  Parametri opzionali (-WhatIf mostra azioni senza eseguirle):
#    powershell -ExecutionPolicy Bypass -File ".\move-agents.ps1" -WhatIf
#
# Miglioramenti rispetto a v1:
#   * Rimosso -ErrorAction SilentlyContinue (ora gli errori sono visibili)
#   * try/catch su Copy-Item: se fallisce, NON esegue Remove-Item (no data loss)
#   * Conferma interattiva [Y/N] prima della cancellazione sorgenti
#   * Percorsi come parametri della funzione (facile da cambiare)
#   * Supporto -WhatIf (dry-run) per anteprima
#   * Log finale persistito in .claude\setup-report.txt
# ============================================================================

[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [string]$ProjectRoot   = "C:\Users\Ruman\Desktop\concorso-ai",
    [string]$WshobsonSrc   = "C:\Users\Ruman\concorso-ai\agents-main",
    [string]$Lst97Src      = "C:\Users\Ruman\concorso-ai\claude-code-sub-agents-main"
)

$ErrorActionPreference = "Stop"

$ClaudeDir     = Join-Path $ProjectRoot ".claude"
$AgentsDest    = Join-Path $ClaudeDir "agents"
$SubAgentsDest = Join-Path $ClaudeDir "sub-agents"
$ReportPath    = Join-Path $ClaudeDir "setup-report.txt"

# --- Header -------------------------------------------------------------------
Clear-Host
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Move agent repos into .claude\         " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Project : $ProjectRoot"
Write-Host "Source 1: $WshobsonSrc          (wshobson/agents, ~203 agents)"
Write-Host "Source 2: $Lst97Src  (lst97/claude-code-sub-agents, 33 agents)"
Write-Host ""

if ($WhatIfPreference) {
    Write-Host "[DRY-RUN MODE] Nessuna modifica verra scritta su disco." -ForegroundColor Magenta
    Write-Host ""
}

# --- Pre-flight check --------------------------------------------------------
$missingSource = $false
foreach ($src in @($WshobsonSrc, $Lst97Src)) {
    if (-not (Test-Path $src)) {
        Write-Host "[ERRORE] Cartella sorgente non trovata: $src" -ForegroundColor Red
        $missingSource = $true
    }
}
if ($missingSource) {
    Write-Host ""
    Write-Host "Operazione annullata. Verifica i percorsi ed estrai gli zip." -ForegroundColor Red
    Read-Host "Premi INVIO per uscire"
    exit 1
}

if (-not (Test-Path $ProjectRoot)) {
    Write-Host "[ERRORE] Project root non trovato: $ProjectRoot" -ForegroundColor Red
    Read-Host "Premi INVIO per uscire"
    exit 1
}

# --- Guard di idempotenza: blocca se le destinazioni hanno gia contenuti ----
# (previene merge silenziosi se lo script viene rieseguito o se la cartella
#  .claude e stata pre-popolata da un setup precedente)
foreach ($dest in @($AgentsDest, $SubAgentsDest)) {
    if (Test-Path $dest -PathType Container) {
        $existing = @(Get-ChildItem -Path $dest -Recurse -Force -File -ErrorAction Stop)
        if ($existing.Count -gt 0) {
            Write-Host ""
            Write-Host "[ERRORE] Destinazione non vuota: $dest" -ForegroundColor Red
            Write-Host "          Contiene $($existing.Count) file. Per evitare merge silenziosi, lo script si interrompe." -ForegroundColor Red
            Write-Host ""
            Write-Host "Opzioni:" -ForegroundColor Yellow
            Write-Host "  1. Svuota la cartella .claude\agents o .claude\sub-agents e rilancia" -ForegroundColor Yellow
            Write-Host "  2. Oppure lancia con -WhatIf per vedere cosa farebbe senza toccare nulla" -ForegroundColor Yellow
            Read-Host "Premi INVIO per uscire"
            exit 4
        }
    }
}

# --- Crea cartelle destinazione ----------------------------------------------
foreach ($dest in @($AgentsDest, $SubAgentsDest)) {
    if (-not (Test-Path $dest)) {
        if ($PSCmdlet.ShouldProcess($dest, "Create directory")) {
            New-Item -ItemType Directory -Force -Path $dest | Out-Null
            Write-Host "[Setup] Creata $dest" -ForegroundColor DarkGray
        }
    }
}

# --- wshobson -> .claude\agents ----------------------------------------------
Write-Host ""
Write-Host "[1/2] Copia wshobson/agents-main  ->  .claude\agents\" -ForegroundColor Yellow
Write-Host "      sorgente: $WshobsonSrc"
Write-Host "      dest:     $AgentsDest"
try {
    $wshobsonFiles = (Get-ChildItem -Path $WshobsonSrc -Recurse -File).Count
    Write-Host ("      Trovati {0} file da copiare" -f $wshobsonFiles) -ForegroundColor DarkGray
    if ($PSCmdlet.ShouldProcess($AgentsDest, "Copy-Item -Recurse from wshobson")) {
        Copy-Item -Path (Join-Path $WshobsonSrc "*") -Destination $AgentsDest -Recurse -Force -Confirm:$false
        Write-Host ("      OK - {0} file copiati" -f $wshobsonFiles) -ForegroundColor Green
    }
} catch {
    Write-Host ""
    Write-Host "[ERRORE FATALE] Copia wshobson fallita: $_" -ForegroundColor Red
    Write-Host "Le cartelle sorgente NON verranno eliminate. Stato del progetto: sicuro." -ForegroundColor Yellow
    Read-Host "Premi INVIO per uscire"
    exit 2
}

# --- lst97 -> .claude\sub-agents ---------------------------------------------
Write-Host ""
Write-Host "[2/2] Copia lst97/*  ->  .claude\sub-agents\" -ForegroundColor Yellow
Write-Host "      sorgente: $Lst97Src"
Write-Host "      dest:     $SubAgentsDest"
try {
    $lst97Files = (Get-ChildItem -Path $Lst97Src -Recurse -File).Count
    Write-Host ("      Trovati {0} file da copiare" -f $lst97Files) -ForegroundColor DarkGray
    if ($PSCmdlet.ShouldProcess($SubAgentsDest, "Copy-Item -Recurse from lst97")) {
        Copy-Item -Path (Join-Path $Lst97Src "*") -Destination $SubAgentsDest -Recurse -Force -Confirm:$false
        Write-Host ("      OK - {0} file copiati" -f $lst97Files) -ForegroundColor Green
    }
} catch {
    Write-Host ""
    Write-Host "[ERRORE FATALE] Copia lst97 fallita: $_" -ForegroundColor Red
    Write-Host "Le cartelle sorgente NON verranno eliminate." -ForegroundColor Yellow
    Read-Host "Premi INVIO per uscire"
    exit 3
}

# --- Conferma interattiva prima della cancellazione sorgenti -----------------
Write-Host ""
Write-Host "=========================================" -ForegroundColor Yellow
Write-Host "  CONFERMA CANCELLAZIONE SORGENTI       " -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Yellow
Write-Host "Le copie sono complete. Le cartelle ORIGINE in"
Write-Host "  $WshobsonSrc"
Write-Host "  $Lst97Src"
Write-Host "verranno ora eliminate per fare pulizia."

if ($WhatIfPreference) {
    Write-Host "[DRY-RUN] Saltato: rimozione sorgenti." -ForegroundColor Magenta
} else {
    $ans = Read-Host "Procedere con la cancellazione delle sorgenti? [Y/N]"
    if ($ans -notin @('Y','y','YES','yes','S','s','SI','si')) {
        Write-Host ""
        Write-Host "Copia completata, sorgenti preservate come richiesto." -ForegroundColor Yellow
        Write-Host "(Puoi rilanciare lo script in seguito per cancellarle.)"
    } else {
        Write-Host ""
        Write-Host "[Cleanup] Rimozione cartelle sorgente ..." -ForegroundColor Yellow
        try {
            Remove-Item -Path $WshobsonSrc -Recurse -Force
            Write-Host "          Rimossa: $WshobsonSrc"
            Remove-Item -Path $Lst97Src   -Recurse -Force
            Write-Host "          Rimossa: $Lst97Src"
            Write-Host "          OK" -ForegroundColor Green
        } catch {
            Write-Host "[ERRORE] Rimozione sorgenti fallita: $_" -ForegroundColor Red
            Write-Host "Le copie sono .claude\, pulizia sorgenti da fare manualmente." -ForegroundColor Yellow
        }
    }
}

# --- Report finale a schermo + persistito -----------------------------------
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  STRUTTURA FINALE .claude\             " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

function Show-Dir-Summary {
    param([string]$Path, [string]$Label)
    $files    = (Get-ChildItem -Path $Path -Recurse -File).Count
    $subdirs  = (Get-ChildItem -Path $Path -Recurse -Directory).Count
    Write-Host ""
    Write-Host "  $Label" -ForegroundColor Yellow
    Write-Host ("    {0}" -f $Path) -ForegroundColor DarkGray
    Write-Host ("    Files          : {0}" -f $files)
    Write-Host ("    Sub-directory  : {0}" -f ($subdirs + 1))
    Write-Host ""
    Write-Host "  Top-level entries:"
    Get-ChildItem -Path $Path -Force | Sort-Object Name | ForEach-Object {
        if ($_.PSIsContainer) {
            $subFiles = (Get-ChildItem -Path $_.FullName -Recurse -File).Count
            $line = "    [DIR]  {0,-40} ({1} file)" -f $_.Name, $subFiles
        } else {
            $line = "    [FILE] {0,-40} ({1} bytes)" -f $_.Name, $_.Length
        }
        Write-Host $line
    }
}

Show-Dir-Summary -Path $AgentsDest    -Label ".claude\agents\    (wshobson)"
Show-Dir-Summary -Path $SubAgentsDest -Label ".claude\sub-agents\ (lst97)"

# --- Salva report persistente -----------------------------------------------
$report = @"
.concorso-ai/.claude structure setup report
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
============================================

$ProjectRoot
+-- .claude/
    +-- README.md        (pre-existing marker)
    +-- setup-report.txt (this file)
    +-- agents/          (wshobson) -
$(@(Get-ChildItem $AgentsDest -Recurse -File).Count) files in $((Get-ChildItem $AgentsDest -Recurse -Directory).Count + 1) directories
    +-- sub-agents/      (lst97)    -
$(@(Get-ChildItem $SubAgentsDest -Recurse -File).Count) files in $((Get-ChildItem $SubAgentsDest -Recurse -Directory).Count + 1) directories
"@
if ($PSCmdlet.ShouldProcess($ReportPath, "Write setup report")) {
    $report | Out-File -FilePath $ReportPath -Encoding utf8
    Write-Host ""
    Write-Host "Report salvato in: $ReportPath" -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "  Fatto. Operazione completata.        " -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
if (-not $WhatIfPreference) {
    Read-Host "Premi INVIO per chiudere"
}
