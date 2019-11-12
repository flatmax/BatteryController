host=192.168.1.45
scp -r ../../BatteryController root@$host:
# ssh root@$host "killall pigpiod; rm /var/run/pigpio.pid; node ./test.js"
ssh root@$host "cd BatteryController/test; node ./test.js"
