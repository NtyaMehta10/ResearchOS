# Auto-Git-Pull.ps1
# Put this file in the ROOT of a Git project.
# Checks GitHub every 2 minutes and pulls safe updates.

$RepoPath = $PSScriptRoot
$IntervalSeconds = 120
Set-Location $RepoPath

git rev-parse --is-inside-work-tree *> $null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: This folder is not a Git repository." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Auto Git Pull started. Checking every 2 minutes."
Write-Host "Repository: $RepoPath"
Write-Host "Press Ctrl+C to stop.`n"

while ($true) {
    $status = @(git status --porcelain 2>$null)
    $time = Get-Date -Format "HH:mm:ss"

    if ($status.Count -eq 0) {
        git fetch origin 2>$null

        if ($LASTEXITCODE -eq 0) {
            $result = @(git pull --ff-only 2>&1)

            if ($LASTEXITCODE -eq 0) {
                if ($result -match "Already up to date") {
                    Write-Host "[$time] Already up to date."
                } else {
                    Write-Host "[$time] GitHub changes pulled." -ForegroundColor Green
                    $result | ForEach-Object { Write-Host "  $_" }
                }
            } else {
                Write-Host "[$time] Pull stopped: manual Git action needed." -ForegroundColor Yellow
            }
        } else {
            Write-Host "[$time] GitHub unavailable. Retrying in 2 minutes." -ForegroundColor Yellow
        }
    } else {
        Write-Host "[$time] Local changes detected - pull skipped." -ForegroundColor Yellow
    }

    Start-Sleep -Seconds $IntervalSeconds
}
