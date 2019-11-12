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
