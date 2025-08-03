Write-Host "Starting development servers..." -ForegroundColor Green
Write-Host ""

Write-Host "Starting Frontend server..." -ForegroundColor Yellow
Set-Location Frontend
npm run dev

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error starting Frontend server" -ForegroundColor Red
    Read-Host "Press Enter to continue"
    exit 1
}

Write-Host ""
Write-Host "Frontend server started successfully!" -ForegroundColor Green
Write-Host "You can now access the application at http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to continue" 