'use strict';

const dgram = require('dgram');
const dgramData = require('./');

{ //server
  const server = dgram.createSocket('udp4');
  const collector = new dgramData.Collector();

  collector.onMessage = (message, rinfo) => {
    const data = JSON.parse(message.getPayload())
    console.log(data);
    /** data =
     *   { test: 123 }
     */
  };

  server.on('message', (buffer, rinfo) => collector.processBuffer(buffer, rinfo));
  server.bind(12346, '127.0.0.1');
}

{ //client
  const client = dgram.createSocket('udp4');
  const body = {
    test: 123
  };

  dgramData.Message.createFromObject(body)
    .send(client, 12346, '127.0.0.1')
    .then(result => console.log(result)); //{ bytes_sent: 26 }
}
