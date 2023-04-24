const express = require('express');
const { WebSocketServer } = require('ws');
const sockserver = new WebSocketServer({ port: 3333 });

const webserver = express()
  .use((req, res) =>
    res.sendFile('', { root: __dirname })
  )
  .listen(3001, () => console.log(`Listening on ${3001}`));

sockserver.on('connection', ws => {
  let canvas;
  ws.on('close', () => console.log('Client has disconnected!'));
  ws.on('message', data => {
    sockserver.clients.forEach(client => {
      const jsonData = JSON.parse(data);
      if (jsonData.type === 'setCanvas') {
        console.log('set canvas');
        canvas = jsonData.canvas;
      }
      if (jsonData.type === 'getCanvas') {
        client.send(JSON.stringify({ type: 'getCanvas', canvas }));
        console.log('get canvas');
      }
    })
  });
  ws.onerror = function () {
    console.log('websocket error')
  }
})
