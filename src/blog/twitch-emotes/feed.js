
import autoBind from 'auto-bind';
import WebSocket from 'reconnecting-websocket';

class Feed {
  constructor(element) {
    this.element = element;
    autoBind(this);
  }

  initDOM() {
    this.element.innerHTML = '';

    for (let i = 0; i < 10; i += 1) {
      const line = document.createElement('div');
      line.className = 'twitch-emotes-line';
      this.element.appendChild(line);
    }
  }

  initWs() {
    const ws = new WebSocket('wss://ws.claisne.io/twitch-emotes');

    ws.onmessage = (wsMessage) => {
      const message = JSON.parse(wsMessage.data);

      if (message.type === 'KAPPA_SPEED') {
        this.render(message.payload);
      }
    };
  }

  render(channels) {
    channels.forEach((channel, i) => {
      const line = this.element.children[i];
      line.className = 'twitch-emotes-line';
      line.innerHTML = '';

      const icon = document.createElement('img');
      icon.src = channel.channel_data.logo;

      line.appendChild(icon);

      const name = document.createElement('div');
      name.className = 'name';
      name.textContent = channel.channel_data.display_name;
      line.appendChild(name);

      const last = document.createElement('div');
      last.className = 'last-message';
      last.textContent = channel.last_kappa_message;
      last.innerHTML = last.innerHTML.replace(/\bKappa\b/g, '<img src="https://static-cdn.jtvnw.net/emoticons/v1/25/1.0" />');
      line.appendChild(last);

      const speed = document.createElement('div');
      speed.className = 'speed';
      speed.innerHTML = `<strong>${channel.kappa_speed}</strong>` +
        '<img src="https://static-cdn.jtvnw.net/emoticons/v1/25/1.0" /> per minute';

      line.appendChild(speed);
    });
  }

  launch() {
    this.initDOM();
    this.initWs();
  }
}

export default Feed;

