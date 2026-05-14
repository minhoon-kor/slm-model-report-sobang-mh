@echo off
setlocal
cd /d "%~dp0"
set "PATH=C:\Program Files\nodejs;C:\Users\hotmh\AppData\Roaming\npm;%PATH%"
call "C:\Program Files\nodejs\npm.cmd" run server
