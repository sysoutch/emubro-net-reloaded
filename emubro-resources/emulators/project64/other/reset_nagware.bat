@echo off
echo attempting to delete key "user" in HKCU\SOFTWARE\Project64
reg delete "HKCU\SOFTWARE\Project64" /v "user" /f /reg:64
reg delete "HKCU\SOFTWARE\Project64" /v "user" /f /reg:32
pause