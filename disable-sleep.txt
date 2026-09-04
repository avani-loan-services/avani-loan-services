@echo off
rem Prevent the display from turning off
powercfg -change -monitor-timeout-ac 0
powercfg -change -monitor-timeout-dc 0

rem Prevent the system from sleeping
powercfg -change -standby-timeout-ac 0
powercfg -change -standby-timeout-dc 0

echo All power settings updated.
