const { connectToMongoDB } = require("./config/db");
const cron = require("node-cron");
const express = require("express");
const User = require("./app/models/User");
const DailyCache = require("./app/models/DailyCache");
const ws = require('ws');
const app = express();

connectToMongoDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("", require("./routes/api"));


cron.schedule("55 23 * * *", async function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaySignupCount = await User.count({
    createdAt: {
      $gte: today,
    },
  });
  let data = new DailyCache({count:todaySignupCount});
  await data.save();
  console.log(data);
});

const wss = new ws.Server({ noServer: true });
wss.on('connection', socket => {
  socket.on('message', message => console.log(message.toString('utf8')));
});

const server = app.listen("3000", () => {
  console.log("server has been started");
});

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, socket => {
    wss.emit('connection', socket, request);
  });
});