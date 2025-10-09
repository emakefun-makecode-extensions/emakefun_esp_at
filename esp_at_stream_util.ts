namespace emakefun {

    /**
     * Simultaneously search for multiple target strings in a serial data stream.
     * @param targets The target string array to be searched for.
     * @param timeout_ms Timeout for waiting for response (milliseconds).
     * @returns Find the index of the target string in the array, return -1 if not found.
     */
    export function multiFindUtil(targets: string[], timeout_ms: number): number {
        if (!targets || targets.length == 0 || timeout_ms < 0) {
            throw "Error: 'multiFindUtil' function, invalid parameters.";
        }
        const byte_targets = targets.map(t => Buffer.fromUTF8(t));
        let offsets: number[] = [];
        for (let i = 0; i < byte_targets.length; i++) {
            offsets.push(0);
        }
        const end_time = input.runningTime() + timeout_ms;
        while (true) {
            const current_byte = emakefun.readSerialByte();
            if (current_byte > 0) {
                for (let j = 0; j < byte_targets.length; j++) {
                    const byte_target = byte_targets[j];
                    let offset = offsets[j];

                    if (current_byte == byte_target[offset]) {
                        offset++;
                        if (offset == byte_target.length) {
                            return j;
                        }
                        offsets[j] = offset;
                        continue;
                    }
                    if (offset == 0) {
                        continue
                    }
                    const original_offset = offset
                    while (offset > 0) {
                        offset -= 1;
                        if (current_byte != byte_target[offset]) {
                            continue;
                        }
                        if (offset == 0) {
                            offset += 1;
                            break;
                        }
                        const offset_diff = original_offset - offset;
                        let k = 0;
                        for (k = 0; k < offset; k++) {
                            if (byte_target[k] != byte_target[k + offset_diff]) {
                                break;
                            }
                        }
                        if (k == offset) {
                            offset += 1;
                            break;
                        }
                    }
                }
            }
            if (input.runningTime() >= end_time) {
                return NaN;
            }
        }
    }

    /**
     * Search for a single target string in the serial data stream.
     * @param target The target string to be searched for.
     * @param timeout_ms Timeout for waiting for response (milliseconds).
     * @returns Whether the target string has been found, true: found, false: not found.
     */
    export function singleFindUtil(target: string, timeout_ms: number): boolean {
        if (!target || timeout_ms < 0) {
            throw "Error: 'singleFindUtil' function, invalid parameters.";
        }
        let byte_target = Buffer.fromUTF8(target)
        let offset = 0;

        const end_time = input.runningTime() + timeout_ms;
        while (true) {
            const current_byte = emakefun.readSerialByte();
            if (current_byte > 0) {
                if (current_byte == byte_target[offset]) {
                    offset += 1;
                    if (offset == byte_target.length) {
                        return true
                    }
                    continue
                }
                if (0 == offset) {
                    continue;
                }

                const original_offset = offset;
                while (offset > 0) {
                    offset -= 1;
                    if (current_byte != byte_target[offset]) {
                        continue;
                    }
                    if (offset == 0) {
                        offset += 1;
                        break;
                    }
                    const offset_diff = original_offset - offset;
                    let k = 0;
                    for (k = 0; k < offset; k++) {
                        if (byte_target[k] != byte_target[k + offset_diff]) {
                            break;
                        }
                    }
                    if (k == offset) {
                        offset += 1;
                        break;
                    }
                }
            }
            if (input.runningTime() >= end_time) {
                return false;
            }
        }
    }

    /**
     * Skip the next character and return true if it matches the target character.
     * @param target Target characters.
     * @param timeout_ms Timeout for waiting for response (milliseconds).
     * @returns Match and skip target characters, true: successful, false: failed.
     */
    export function skipNext(target: string, timeout_ms: number): boolean {
        if (!target || target.length != 1 || timeout_ms < 0) {
            throw "Error: 'skipNext' function, invalid parameters.";
        }
        const target_byte = Buffer.fromUTF8(target)[0];
        const end_time = input.runningTime() + timeout_ms;
        while (true) {
            const current_byte = emakefun.readSerialByte();
            if (current_byte > 0) {
                return current_byte == target_byte;
            }
            if (input.runningTime() >= end_time) {
                return false;
            }
        }
    }

    /**
     * Parse integers from serial data streams.
     * @param timeout_ms Timeout for waiting for response (milliseconds).
     * @returns The parsed integer value returns -1 upon timeout or failure.
     */
    export function parseNumber(timeout_ms: number): number {
        if (timeout_ms < 0) {
            throw "Error: 'parseNumber' function, invalid parameters.";
        }
        let num_str = "";

        const end_time = input.runningTime() + timeout_ms;
        while (true) {
            const current_byte = emakefun.readSerialByte();
            if (current_byte > 0) {
                const read_char = String.fromCharCode(current_byte);
                if ((read_char == "-" && num_str == "") || ("0" <= read_char && read_char <= "9")) {
                    num_str += read_char;
                } else {
                    if (num_str != "" && num_str != "-") {
                        return parseInt(num_str);
                    }
                    return NaN;
                }
            }
            if (input.runningTime() >= end_time) {
                return NaN;
            }
        }
    }

    /**
     * Read from serial until delimiter is found.
     * @param delimiter The delimiter character.
     * @param timeout_ms Timeout for waiting for response (milliseconds).
     * @returns The read string until delimiter, or null if timeout.
     */
    export function readUntil(delimiter: string, timeout_ms: number): string {
        if (!delimiter || delimiter.length !== 1 || timeout_ms < 0) {
            throw "Error: 'readUntil' function, invalid parameters.";
        }

        const delimiter_byte = Buffer.fromUTF8(delimiter)[0];
        let result = "";

        const end_time = input.runningTime() + timeout_ms;
        while (true) {
            const current_byte = emakefun.readSerialByte();
            if (current_byte > 0) {
                if (current_byte == delimiter_byte) {
                    return result;
                } else {
                    result += String.fromCharCode(current_byte);
                }
            }
            if (input.runningTime() >= end_time) {
                return null;
            }
        }
    }

    /**
     * Clear the serial receive buffer.
     * @param timeout_ms Timeout for clearing operation (milliseconds).
     */
    export function emptyRx(timeout_ms: number): void {
        if (timeout_ms < 0) {
            throw "Error: 'emptyRx' function, invalid parameters.";
        }
        const end_time = input.runningTime() + timeout_ms;
        while (true) {
            emakefun.readSerialByte();
            if (input.runningTime() >= end_time) {
                return;
            }
        }
    }

}