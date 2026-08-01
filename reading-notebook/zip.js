/* ==========================================================================
   zip.js — minimal, dependency-free ZIP writer (store method, no compression)
   Used to bundle exported Markdown notes into a single downloadable .zip
   without pulling in an external library.
   ========================================================================== */

/* CRC-32 lookup table, generated once. */
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function stringToBytes(str) {
  return new TextEncoder().encode(str);
}

/* Writes a little-endian unsigned integer of `size` bytes into `arr` at `offset`. */
function writeUint(arr, offset, value, size) {
  for (let i = 0; i < size; i++) {
    arr[offset + i] = (value >>> (8 * i)) & 0xff;
  }
}

/**
 * Builds a ZIP file (uncompressed/"stored" entries) from a list of files.
 * @param {{name: string, content: string}[]} files
 * @returns {Blob}
 */
function createZip(files) {
  const localChunks = [];
  const centralChunks = [];
  let offset = 0;

  files.forEach((file) => {
    const nameBytes = stringToBytes(file.name);
    const dataBytes = stringToBytes(file.content);
    const crc = crc32(dataBytes);

    const localHeader = new Uint8Array(30 + nameBytes.length);
    writeUint(localHeader, 0, 0x04034b50, 4);   // local file header signature
    writeUint(localHeader, 4, 20, 2);           // version needed
    writeUint(localHeader, 6, 0, 2);            // flags
    writeUint(localHeader, 8, 0, 2);            // compression: 0 = stored
    writeUint(localHeader, 10, 0, 2);           // mod time
    writeUint(localHeader, 12, 0, 2);           // mod date
    writeUint(localHeader, 14, crc, 4);
    writeUint(localHeader, 18, dataBytes.length, 4); // compressed size
    writeUint(localHeader, 22, dataBytes.length, 4); // uncompressed size
    writeUint(localHeader, 26, nameBytes.length, 2);
    writeUint(localHeader, 28, 0, 2);           // extra field length
    localHeader.set(nameBytes, 30);

    localChunks.push(localHeader, dataBytes);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    writeUint(centralHeader, 0, 0x02014b50, 4); // central dir header signature
    writeUint(centralHeader, 4, 20, 2);         // version made by
    writeUint(centralHeader, 6, 20, 2);         // version needed
    writeUint(centralHeader, 8, 0, 2);          // flags
    writeUint(centralHeader, 10, 0, 2);         // compression
    writeUint(centralHeader, 12, 0, 2);         // mod time
    writeUint(centralHeader, 14, 0, 2);         // mod date
    writeUint(centralHeader, 16, crc, 4);
    writeUint(centralHeader, 20, dataBytes.length, 4);
    writeUint(centralHeader, 24, dataBytes.length, 4);
    writeUint(centralHeader, 28, nameBytes.length, 2);
    writeUint(centralHeader, 30, 0, 2);         // extra field length
    writeUint(centralHeader, 32, 0, 2);         // comment length
    writeUint(centralHeader, 34, 0, 2);         // disk number start
    writeUint(centralHeader, 36, 0, 2);         // internal attrs
    writeUint(centralHeader, 38, 0, 4);         // external attrs
    writeUint(centralHeader, 42, offset, 4);    // local header offset
    centralHeader.set(nameBytes, 46);

    centralChunks.push(centralHeader);

    offset += localHeader.length + dataBytes.length;
  });

  const centralDirSize = centralChunks.reduce((sum, c) => sum + c.length, 0);
  const centralDirOffset = offset;

  const eocd = new Uint8Array(22);
  writeUint(eocd, 0, 0x06054b50, 4);
  writeUint(eocd, 4, 0, 2);                    // disk number
  writeUint(eocd, 6, 0, 2);                    // disk with central dir
  writeUint(eocd, 8, files.length, 2);         // entries on this disk
  writeUint(eocd, 10, files.length, 2);        // total entries
  writeUint(eocd, 12, centralDirSize, 4);
  writeUint(eocd, 16, centralDirOffset, 4);
  writeUint(eocd, 20, 0, 2);                   // comment length

  return new Blob([...localChunks, ...centralChunks, eocd], { type: 'application/zip' });
}
