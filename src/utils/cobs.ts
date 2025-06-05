const DELIMITER = 0x02;
const NO_DELIMITER = 0xff;
const COBS_CODE_OFFSET = DELIMITER;
const MAX_BLOCK_SIZE = 84;
const XOR = 3;

function encode(data: Uint8Array): Uint8Array {
  const buffer: number[] = [];
  let codeIndex = 0;
  let block = 0;

  const beginBlock = () => {
    codeIndex = buffer.length; // index of incomplete code word
    buffer.push(NO_DELIMITER); // updated later if delimiter is encountered
    block = 1; // number of bytes in block (including code word)
  };

  beginBlock();
  data.forEach((byte) => {
    if (byte > DELIMITER) {
      // non-delimiter value, write as-is
      buffer.push(byte);
      block += 1;
    }

    if (byte <= DELIMITER || block > MAX_BLOCK_SIZE) {
      // block completed because size limit reached or delimiter found
      if (byte <= DELIMITER) {
        // reason for block completion is delimiter
        // update code word to reflect block size
        const delimiterBase = byte * MAX_BLOCK_SIZE;
        const blockOffset = block + COBS_CODE_OFFSET;
        buffer[codeIndex] = delimiterBase + blockOffset;
      }
      // begin new block
      beginBlock();
    }
  });

  // update final code word
  buffer[codeIndex] = block + COBS_CODE_OFFSET;

  return new Uint8Array(buffer);
}

function decode(data: Uint8Array): Uint8Array {
  const buffer: number[] = [];

  const unescape = (code: number): [number | null, number] => {
    if (code === 0xff) {
      // no delimiter in block
      return [null, MAX_BLOCK_SIZE + 1];
    }
    const [value, block] = [
      (code - COBS_CODE_OFFSET) / MAX_BLOCK_SIZE,
      (code - COBS_CODE_OFFSET) % MAX_BLOCK_SIZE,
    ];
    if (block === 0) {
      // maximum block size ending with delimiter
      return [value - 1, MAX_BLOCK_SIZE];
    }
    return [value, block];
  };

  let [value, block] = unescape(data[0]);

  for (let i = 1; i < data.length; i++) {
    // first byte already processed
    block -= 1;
    if (block > 0) {
      buffer.push(data[i]);
      continue;
    }

    // block completed
    if (value !== null) {
      buffer.push(value);
    }

    [value, block] = unescape(data[i]);
  }

  return new Uint8Array(buffer);
}

function pack(data: Uint8Array): Uint8Array {
  let buffer = encode(data);

  // XOR buffer to remove problematic ctrl+C
  for (let i = 0; i < buffer.length; i++) {
    buffer[i] ^= XOR;
  }

  // add delimiter
  const finalBuffer = new Uint8Array(buffer.length + 1);
  finalBuffer.set(buffer);
  finalBuffer[buffer.length] = DELIMITER;

  return finalBuffer;
}

function unpack(frame: Uint8Array): Uint8Array {
  let start = 0;
  if (frame[0] === 0x01) {
    // unused priority byte
    start += 1;
  }

  // unframe and XOR
  const unframed = new Uint8Array(
    frame.slice(start, frame.length - 1).map((byte) => byte ^ XOR)
  );

  return decode(unframed);
}

export default { pack, unpack, encode, decode, DELIMITER };
