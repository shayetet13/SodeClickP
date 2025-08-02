@echo off
echo Starting SodeClick Development Environment...
echo.

echo Starting Backend Server...
cd Backend
start "Backend" cmd /k "npm start"
cd ..

echo Starting Frontend Server...
cd Frontend  
start "Frontend" cmd /k "npm run dev"
cd ..

echo.
echo ========================================
echo   SodeClick Development Started!
echo ========================================
echo   Backend: http://localhost:5000
echo   Frontend: http://localhost:5173
echo   MongoDB: Atlas Cloud (love database)
echo ========================================
echo.
pause 