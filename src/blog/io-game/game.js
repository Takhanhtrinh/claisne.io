
import raf from 'raf';
import CBOR from 'cbor-js';
import WebSocket from 'reconnecting-websocket';

export default function (canvas) {
  // const ws = new WebSocket('wss://ws.claisne.io/io-game');
  const ws = new WebSocket('ws://localhost:4001');
  ws.binaryType = 'arraybuffer';

  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientWidth * (1080 / 1920);
  canvas.style.height = `${canvas.height}px`;

  const context = canvas.getContext('2d');

  let playerId;
  const players = {};
  let foods = [];

  let serverTime;

  ws.onmessage = (messageEvent) => {
    const message = CBOR.decode(messageEvent.data);

    if (message.states != null) {
      message.states.forEach(([id, x, y, s]) => {
        const state = { id, x, y, s, timestamp: message.timestamp };

        if (players[state.id] == null) {
          players[state.id] = [state];
        } else {
          players[state.id].push(state);
          if (players[state.id].length > 30) {
            players[state.id].shift();
          }
        }
      });

      Object.keys(players).forEach((id) => {
        if (message.states.find(([oid]) => oid === parseInt(id, 10)) == null) {
          delete players[id];
        }
      });
    }

    if (message.foods != null) {
      foods = message.foods.map(([x, y]) => ({ x, y }));
    }

    if (message.id != null) {
      playerId = message.id;
    }

    if (message.timestamp != null) {
      serverTime = message.timestamp;
    }
  };

  const sXtoX = x => (x / 1920) * canvas.width;
  const sYtoY = y => (y / 1080) * canvas.height;
  const xtoSX = x => (x * 1920) / canvas.width;
  const ytoSY = y => (y * 1080) / canvas.height;

  const drawCircle = (x, y, s, color) => {
    context.beginPath();
    context.arc(sXtoX(x), sYtoY(y), s * (canvas.width / 1920), 0, 2 * Math.PI, false);

    context.strokeStyle = color;
    context.stroke();
    context.closePath();
  };

  const drawDisk = (x, y, s, color) => {
    context.beginPath();
    context.arc(sXtoX(x), sYtoY(y), s * (canvas.width / 1920), 0, 2 * Math.PI, false);

    context.fillStyle = color;
    context.fill();
    context.closePath();
  };

  const drawFood = ({ x, y }) => {
    const hue = ((x * y) / (1920 * 1080)) * 360;
    const color = `hsl(${Math.floor(hue)}, 80%, 60%)`;

    drawDisk(x, y, 4, color);
  };

  const drawPlayer = ({ id, x, y, s }, t) => {
    if (playerId === parseInt(id, 10)) {
      drawCircle(x, y, s + ((t / 50) % 20), '#ccc');
    }

    drawDisk(x, y, s, '#000');
  };

  let mouse;
  document.onmousemove = (evt) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = evt.clientX - rect.left;
    const mouseY = evt.clientY - rect.top;

    mouse = {
      x: Math.floor(xtoSX(mouseX)),
      y: Math.floor(ytoSY(mouseY)),
    };
  };

  let lastT = 0;
  const getDeltaTime = (t) => {
    const dt = t - lastT;
    lastT = t;
    return dt;
  };

  let tSent = 0;
  const sendInput = (t) => {
    if (t - tSent > 80 && mouse != null && playerId != null) {
      ws.send(JSON.stringify(mouse));
      tSent = t;
    }
  };

  raf(function tick(t) {
    sendInput(t);

    const dt = getDeltaTime(t);

    if (serverTime != null) {
      serverTime += dt;
    }

    const renderTime = serverTime - 200;

    context.clearRect(0, 0, canvas.width, canvas.height);

    foods.forEach(drawFood);

    Object.keys(players).forEach((id) => {
      const states = players[id];
      const i = states.findIndex(state => state.timestamp > renderTime);

      if (i !== -1 && i > 0) {
        const stateBefore = states[i - 1];
        const stateAfter = states[i];

        const rt =
          (renderTime - stateBefore.timestamp) / (stateAfter.timestamp - stateBefore.timestamp);

        const renderState = {
          id,
          x: stateBefore.x + ((stateAfter.x - stateBefore.x) * rt),
          y: stateBefore.y + ((stateAfter.y - stateBefore.y) * rt),
          s: stateBefore.s + ((stateAfter.s - stateBefore.s) * rt),
        };

        drawPlayer(renderState, t);
      }
    });

    raf(tick);
  });
}
