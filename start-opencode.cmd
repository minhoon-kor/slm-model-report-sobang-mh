@echo off
setlocal
cd /d "%~dp0"
set "PATH=C:\Program Files\nodejs;C:\Users\hotmh\AppData\Roaming\npm;%PATH%"
if "%~1"=="" (
  call "C:\Users\hotmh\AppData\Roaming\npm\opencode.cmd" .
) else (
  call "C:\Users\hotmh\AppData\Roaming\npm\opencode.cmd" %*
)
