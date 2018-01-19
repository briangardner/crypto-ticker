const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const port = process.env.PORT || 4001;
const index = require("./routes/index");
const app = express();
const gdax = require("gdax");

app.use(index);

const gdaxClient = new gdax.WebsocketClient([], 
  "wss://ws-feed.gdax.com",
  null,
  {
    "channels": [
    {
        "name": "ticker",
        "product_ids": [
          'BTC-USD',
          'ETH-USD',
          "ETH-BTC",
        ]
    }
  ]});

const server = http.createServer(app);
const io = socketIo(server);

io.on("connection", socket => {
  console.log("New client connected");
  console.log("# listeners: " + io.engine.clientsCount);

  gdaxClient.on('message', async (data) =>{
    if(data.type == "ticker")
      socket.emit("FromGDAX", data);
  });
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    console.log("# listeners: " + io.engine.clientsCount);
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));