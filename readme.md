# Networked micro batteries

This repository provides free software and open hardware for you to make your
own network of batteries.

## Free embedded software

src has software to run either a networked battery (HardwareServer.js)
or a battery controller (files which inherit BatteryController.js).

Typically there is one battery controller and as many networked batteries as
you like.

## Free hardware

## Web application

webApp provides a simple web application. It allows you to serve up log data
from the battery controller and look at a graphical history of the system state.