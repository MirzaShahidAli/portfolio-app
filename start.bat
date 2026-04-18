@echo off
echo.
echo  =============================================
echo   Alex Mercer Portfolio - Setup ^& Start
echo  =============================================
echo.

echo [1/3] Installing server dependencies...
cd server
call npm install
if errorlevel 1 ( echo ERROR: Server install failed & pause & exit /b 1 )
cd ..

echo.
echo [2/3] Installing and building React admin panel...
cd client
call npm install
if errorlevel 1 ( echo ERROR: Client install failed & pause & exit /b 1 )
call npm run build
if errorlevel 1 ( echo ERROR: Client build failed & pause & exit /b 1 )
cd ..

echo.
echo [3/3] Starting server...
echo.
echo  Make sure MongoDB is running before continuing!
echo  Start it with:  net start MongoDB
echo.
echo  Once started:
echo    Portfolio  -^>  http://localhost:5000/
echo    Admin      -^>  http://localhost:5000/admin/login
echo.
cd server
node index.js
pause
