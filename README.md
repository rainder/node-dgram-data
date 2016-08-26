# JSON Datagram

```json
'use strict';

const dgram = require('dgram');
const jsonDgram = require('@rainder/json-dgram');

{ //server
  const server = dgram.createSocket('udp4');
  const collector = new jsonDgram.Collector();

  collector.onMessage = (data) => {
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
