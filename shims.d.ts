// shims.d.ts
declare namespace emakefun {
    /**
    * Read a single byte from the serial port
    * @returns Read bytes, if there is no data, return -1
    */
    //% shim=emakefun::readSerialByte
    //% blockHidden=true
    function readSerialByte(): number;
}