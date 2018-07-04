const bot = require('../index');
const { dbPromise } = require('../db');

function getCommand () {
  try {
    return bot.registry.commands.get('cult').constructor;
  } catch (e) {
    return undefined;
  }
}

bot.on('message', async msg => {
  const db = await dbPromise;
  if(msg.author.id === bot.user.id) return;

  const cultCount = (msg.content.match(/cult/gi) || []).length;
  if (cultCount <= 0) return;

  const Cult = getCommand();
  if(!Cult) return;

  if(!Object.values(Cult.trackUsers()).includes(msg.author.id)) return;
  const counts = JSON.parse((await db().get('SELECT value FROM jokes WHERE identifier = ?', 'cult') || {value: '{}'}).value);
  counts[msg.author.id] = (counts[msg.author.id] || 0) + cultCount;
  db.run('INSERT OR REPLACE INTO jokes (identifier, value) VALUES (?, ?);', 'cult', JSON.stringify(counts));
});
