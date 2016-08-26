'use strict';

module.exports = class Packet {
  /**
   *
   * @param id
   * @param seq
   * @param is_last
   * @param chunk
   */
  constructor(id, seq, is_last, chunk) {
    this.id = id;
    this.seq = seq;
    this.is_last = is_last;
    this.chunk = chunk;
  }

  /**
   *
   * @param buffer
   * @returns {Packet}
   */
  static createFromBuffer(buffer) {
    return new Packet(
      buffer.slice(0, 12).toString('hex'),
      buffer.readIntBE(13, 1),
      buffer.readIntBE(12, 1) === 1,
      buffer.slice(14)
    );
  }

  /**
   *
   * @returns {Buffer|NodeBuffer}
   */
  toBuffer() {
    return Buffer.concat([
      new Buffer(this.id, 'hex'),
      new Buffer([
        this.is_last,
        this.seq
      ]),
      this.chunk
    ])
  }
}
