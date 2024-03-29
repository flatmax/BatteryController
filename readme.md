# Networked micro batteries

This repository provides free software and free hardware for you to make your
own network of batteries.

Get a top view of the project here : https://hackaday.io/project/182846-networked-home-battery-v2

## Free embedded software

src has software to run either a networked battery (HardwareServer.js)
or a battery controller (files which inherit BatteryController.js).

Typically there is one battery controller and as many networked batteries as
you like.

For a deep dive into the code, start by reading this comment block here :
https://github.com/flatmax/BatteryController/blob/master/src/BatteryController.js#L38

## Free hardware

See [BatteryController.electronics](https://github.com/flatmax/BatteryController.electronics)

## Web application

Still not functional - requires more work.

webApp provides a simple web application. It allows you to serve up log data
from the battery controller and look at a graphical history of the system state.

## buildroot bootable SDCard image

Build an sdCard to boot off [using this buildroot external repo](https://github.com/Audio-Injector/RaspberryPi.buildroot.external/tree/BatteryController).
