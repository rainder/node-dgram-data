'use strict';

const Message = require('./message');
const Packet = require('./packet');

module.exports = class Collector {
  constructor() {
    this.stack = new Map();
  }

  /**
   *
   * @param buffer {Buffer}
   * @param rinfo {*}
   */
  processBuffer(buffer, rinfo) {
    const packet = Packet.createFromBuffer(buffer);
    this.processPacket(packet, rinfo);
  }

  /**
   *
   * @param packet {Packet}
   * @param rinfo
   */
  processPacket(packet, rinfo) {
    if (!this.stack.has(packet.id)) {
      const message = new Message(packet.id);

      this.stack.set(packet.id, message);

      message.onFin = () => {
        this.stack.delete(packet.id);
        this.onMessage(message, rinfo);
      };

      message.onTimeout = () => {
        this.stack.delete(packet.id);
      };
    }

    this.stack.get(packet.id).addPacket(packet);
  }

  /**
   *
   */
  onMessage() {
    throw new Error('not implemented');
  }
}
