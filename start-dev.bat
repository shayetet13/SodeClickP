@echo off
echo Starting development servers...
echo.

echo Starting Frontend server...
cd Frontend
npm run dev
if %errorlevel% neq 0 (
    echo Error starting Frontend server
    pause
    exit /b 1
)

echo.
echo Frontend server started successfully!
echo You can now access the application at http://localhost:5173
echo.
pause 