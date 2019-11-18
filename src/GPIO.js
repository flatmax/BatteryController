/**
Copyright (c) 2019 The Battery Controller Authors. All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are
 met:

    * Redistributions of source code must retain the above copyright
 notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above
 copyright notice, this list of conditions and the following disclaimer
 in the documentation and/or other materials provided with the
 distribution.
    * Neither the name of Flatmax Pty. Ltd. nor the names of its
 contributors may be used to endorse or promote products derived from
 this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
'use strict';
const spawnSync = require('child_process').spawnSync;

/** Uses system calls to operate GPIO lines. Operates the /sys/class/gpio file system.
NOTE: the direction of the GPIO is set to output or input depending whether the first operation is a read or write.
NOTE: If the first operation is a write, then the gpio is exported as an output gpio
NOTE: If the first operation is a read, then the gpio is exported as an input gpio
NOTE: You can manually undo the direction of operation by calling uneport followed by read or write
*/
class GPIO {

  spawnCheck(r){
    if (r.stderr.length)
      throw new Error(r.stderr);
    else
      if (r.stdout.length)
        return r.stdout.toString();
  }

  /** export and use a GPIO line as output
  @which The GPIO to export and set the direction as output
  */
  exportOut(which){
    var r = spawnSync('./bash/gpioReserveOut.sh', [''+which]);
    this.spawnCheck(r);
  }

  /** export and use a GPIO line as an input
  @which The GPIO to export and set the direction as input
  */
  exportIn(which){
    var r = spawnSync('./bash/gpioReserveIn.sh', [''+which]);
    this.spawnCheck(r);
  }

  /** unexport (free) a GPIO
  @which The GPIO to unexport and free up
  */
  unexport(which){
    var r = spawnSync('./bash/gpioUnexport.sh', [''+which]);
    this.spawnCheck(r);
  }

  /** Write a value to a GPIO line
  @which The GPIO to use
  @val The new value for this GPIO line (0|1)
  */
  write(which, val){
    this.exportOut(which); // this will set to output if the gpio hasn't previously been exported
    let r = spawnSync('./bash/gpioWrite.sh', [''+which, ''+val]);
    this.spawnCheck(r);
  }

  /** Read a value from a GPIO line
  @which The GPIO to use
  @return The value of this GPIO line (0|1)
  */
  read(which){
    this.exportIn(which); // this will set to input if the gpio hasn't previously been exported
    let r = spawnSync('./bash/gpioRead.sh', [''+which]);
    return parseInt(this.spawnCheck(r));
  }
}

module.exports = {
  GPIO
}
