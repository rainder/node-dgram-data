'use strict';

const VERSION = 1;
const SIZE = 1024;

class Packet {
  /**
   *
   * @param id
   * @param seq
   * @param is_last
   * @param chunk
   */
  constructor(version, id, seq, is_last, chunk) {
    this.version = version;
    this.id = id;
    this.seq = seq;
    this.is_last = is_last;
    this.chunk = chunk;

    if (this.version !== VERSION) {
      throw new Error(`Unsupported packet version: ${this.version}`);
    }
  }

  /**
   *
   * @param buffer
   * @returns {Packet}
   */
  static createFromBuffer(buffer) {
    return new Packet(
      buffer.readIntBE(0, 1),
      buffer.slice(1, 12).toString('hex'),
      buffer.readIntBE(14, 1),
      buffer.readIntBE(13, 1) === 1,
      buffer.slice(15)
    );
  }

  /**
   *
   * @returns {Buffer|NodeBuffer}
   */
  toBuffer() {
    return Buffer.concat([
      new Buffer([VERSION]),
      new Buffer(this.id, 'hex'),
      new Buffer([
        this.is_last,
        this.seq
      ]),
      this.chunk
    ])
  }
}

Packet.VERSION = VERSION;
Packet.SIZE = SIZE;

module.exports = Packet;
