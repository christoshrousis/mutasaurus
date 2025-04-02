const CRC = function (): Uint32Array {
    const array = new Uint32Array(256);
    for (let i = 0; i < 256; ++i) {
      let x = i;
      for (let j = 0; j < 8; ++j) {
        x = (x & 1) ? 0xEDB88320 ^ (x >>> 1) : x >>> 1;
      }
      array[i] = x;
    }
    return array;
  }();
  
  export function calcCRC(buffer: Uint8Array | Uint8ClampedArray): number {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < buffer.length; ++i) {
      const byte = buffer[i] as number;
      crc = CRC[(crc ^ byte) & 0xFF]! ^ (crc >>> 8);
    }
    return ~crc >>> 0;
  }