const { WebhookClient } = require('discord.js');
const { id, token } = require('../secrets.json').webhook;

class WebhookPride {
  constructor() {
    this.client = new WebhookClient(id, token);
    this.timeout = null;
    this.embeds = [];
  }

  send(embed) {
    this.embeds.push(embed);
    if(!this.timeout) this.timeout = setTimeout(() => this.doSend(), 1000);
  }

  doSend() {
    this.client.send(this.embeds);
    this.embeds = [];
    this.timeout = null;
  }
}

const instance = new WebhookPride();

module.exports = instance;
