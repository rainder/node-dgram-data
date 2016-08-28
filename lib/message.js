'use strict';

const bson = require('bson');
const Packet = require('./packet');

module.exports = class Message {
  constructor(id, packet_size = Packet.SIZE) {
    this.id = id;
    this.version = Packet.VERSION;
    this.packets = 0;
    this.size = 0;
    this.chunks = [];
    this.packet_size = packet_size;
  }

  /**
   *
   * @param buffer
   * @returns {Message}
   */
  static createFromBuffer(buffer) {
    const message = new Message(bson.ObjectID().toString());
    
    message.size = Math.ceil(buffer.length / message.packet_size);
    message.packets = message.size;

    for (let i = 0; i < message.size; i++) {
      message.chunks.push(buffer.slice(i * message.packet_size, (i + 1) * message.packet_size));
    }

    return message;
  }

  /**
   *
   * @param object
   * @returns {Message}
   */
  static createFromObject(object) {
    const buffer = new Buffer(JSON.stringify(object));
    return Message.createFromBuffer(buffer);
  }

  /**
   *
   * @param index {number}
   * @returns {Packet}
   */
  getPacket(index) {
    return new Packet(
      this.version,
      this.id,
      index,
      index === this.size - 1,
      this.chunks[index]
    );
  }

  /**
   *
   * @param packet {Packet}
   */
  addPacket(packet) {
    this.packets++;
    
    if (!this.timer) {
      this.timer = setTimeout(this.onTimeout, 30000).unref();
    }

    if (packet.is_last) {
      this.size = packet.seq + 1;
    }
    
    this.chunks[packet.seq] = packet.chunk;

    if (this.packets === this.size) {
      clearTimeout(this.timer);
      this.timer = undefined;
      this.onFin();
    }
  }

  /**
   * 
   * @returns {Array.<T>|string}
   */
  getPayload() {
    if (this.packets !== this.size) {
      throw new Error('Message is not ready');
    }
    
    return Buffer.concat(this.chunks);
  }

  /**
   *
   * @param client
   * @param port
   * @param host
   */
  send(client, port, host) {
    const result = [];
    let bytes_sent = 0;

    for (let i = 0; i < this.size; i++) {
      const buffer = this.getPacket(i).toBuffer();
      bytes_sent += buffer.length;

      result[result.length] = new Promise((resolve, reject) => {
        client.send(buffer, port, host, err => {
          err ? reject(err) : resolve();
        });
      });
    }

    return Promise.all(result).then(() => ({
      bytes_sent
    }));
  }

  onFin() {
    throw new Error('not implemented');
  }

  onTimeout() {
    throw new Error('not implemented');
  }
}
