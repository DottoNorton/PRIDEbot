const { dbPromise } = require('../db');
const { Collection, User, GuildMember, Message } = require('discord.js');
const { CommandMessage } = require('discord.js-commando');
const userDataCollection = new Collection();

async function resolveUserId(user) {
  if (user instanceof Function) user = await user();
  if (user instanceof GuildMember || user instanceof User) return user.id;
  if (user instanceof Message || user instanceof CommandMessage) return user.author.id;
  if (typeof user === 'string' && user.match(/^\d+$/)) return user;
  throw new Error("User is not a user object or user id");
}

async function updateUser(userId) {
  const db = await dbPromise;

  const user = await fetchUser(userId);
  db.run("INSERT OR REPLACE INTO users (user, data) VALUES (?, ?);", userId, JSON.stringify(user));
}

async function fetchUser(userId) {
  if(userDataCollection.has(userId)) return userDataCollection.get(userId);

  const db = await dbPromise;
  const data = JSON.parse((await db.get('SELECT data FROM users WHERE user = ?', userId) || { data: "{}"}).data);
  await userDataCollection.set(userId, data);
  return data;
}

async function getData(user) {
  const userId = await resolveUserId(user);
  return await fetchUser(userId);
}

async function getProp(user, prop, defValue) {
  const data = await getData(user);
  if(!data.hasOwnProperty(prop)) return defValue;
  return data[prop];
}

async function setData(user, data) {
  const userId = await resolveUserId(user);
  if(data && data instanceof Function) data = data(userId);
  if(!data || data.constructor !== Object) throw new Error(`Data must be object. Got: ${data ? String(data) : data.constructor.name}`);
  userDataCollection.set(userId, data);
}

async function setProp(user, prop, value) {
  const userId = await resolveUserId(user);
  const data = await fetchUser(userId);
  data[prop] = value;
  await updateUser(userId);
}

module.exports = {
  getData,
  setData,
  getProp,
  setProp,
}
