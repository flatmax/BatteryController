host=192.168.1.187
# scp -r ../BatteryController root@$host:
rsync -azz ../../BatteryController root@$host:
# ssh root@$host "killall pigpiod; rm /var/run/pigpio.pid; node ./test.js"
# ssh root@$host "cd BatteryController; node ./HardwareController.js"
# ssh root@$host "cd BatteryController; node ./BatteryControllerEnvoyMeter.js"
