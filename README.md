# JSON Datagram

JSON for UDP

## Example

```js
'use strict';

const dgram = require('dgram');
const jsonDgram = require('@rainder/json-dgram');

{ //server
  const server = dgram.createSocket('udp4');
  const collector = new jsonDgram.Collector();

  collector.onMessage = (message, rinfo) => {
    const data = JSON.parse(message.getPayload())
    console.log(data);
    /** data =
     * { info: { address: '127.0.0.1', family: 'IPv4', port: 52831 },
     *   body: { test: 123 } }
     */
  };

  server.on('message', (buffer, rinfo) => collector.processBuffer(buffer, rinfo));
  server.bind(12345, '127.0.0.1');
}

{ //client
  const client = dgram.createSocket('udp4');
  const body = {
    test: 123
  };

  jsonDgram.Message.createFromObject(body)
    .send(client, 12345, '127.0.0.1')
    .then(result => console.log(result)); //{ bytes_sent: 26 }
}
```

## API

### Collector
#### processBuffer(buffer: Buffer, rinfo: *): void
#### processPacket(packet: Packet, rinfo: *): void
#### onMessage(message: Message, rinfo: *): void
Callback function. Get called whenever all chunks of `Message` are collected.

### Message
#### static createFromBuffer(buffer: Buffer): Message
#### static createFromObject(object: *): Message
#### static getPacket(index: Number): Packet
#### send(client: Socket, [port: Number], [host: String]): Promise
Sends a message to the servers and returns a `Promise`

#### onFin(data: *): void
called whenever all chunks of `Message` ar collected.

#### onTimeout(): void
called on timeout

### Packet
#### constructor(id: String(12), seq: Number, is_last: Boolean, chunk: Buffer)
#### static createFromBuffer(buffer): Packet
#### toBuffer(): Buffer
