'use strict';

const Message = require('./message');
const Packet = require('./packet');

module.exports = class Collector {
  constructor({ onMessage } = {}) {
    this.stack = new Map();

    if (onMessage) {
      this.onMessage = onMessage;
    }
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
    const key = `${rinfo.family}/${rinfo.address}/${rinfo.port}/${packet.id}`;

    if (!this.stack.has(key)) {
      const message = new Message(packet.id);

      this.stack.set(key, message);

      message.onFin = () => {
        this.stack.delete(key);
        this.onMessage(message, rinfo);
      };

      message.onTimeout = () => {
        this.stack.delete(key);
      };
    }

    this.stack.get(key).addPacket(packet);
  }

  /**
   *
   */
  onMessage() {
    throw new Error('not implemented');
  }
}
