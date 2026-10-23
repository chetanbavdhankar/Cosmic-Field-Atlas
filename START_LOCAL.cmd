@echo off
cd /d "%~dp0"
echo Open http://localhost:8080 in your browser. Close this window to stop.
py -m http.server 8080 --bind 127.0.0.1
pause
