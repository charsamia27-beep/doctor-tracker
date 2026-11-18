import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../src/app.js';
import { User } from '../src/models/User.js';

export const ORIGIN = 'http://localhost:3000';
export const ADMIN = { email: 'admin@test.com', password: 'Str0ng!Passw0rd' };

let mongod;
export async function startDb() {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  await Promise.all(Object.values(mongoose.models).map((m) => m.init()));
}
export async function stopDb() {
  await mongoose.disconnect();
  await mongod?.stop();
}
export async function resetDb() {
  await Promise.all(Object.values(mongoose.connection.collections).map((c) => c.deleteMany({})));
  await User.create({ name: 'Admin', ...ADMIN });
}

/** A supertest agent that keeps cookies and sends the CSRF header like the real SPA. */
export async function client() {
  const agent = request.agent(createApp());
  const res = await agent.get('/api/auth/csrf');
  const csrf = res.body.data.csrfToken;
  const withHeaders = (req) => req.set('Origin', ORIGIN).set('X-CSRF-Token', csrf);
  return {
    agent,
    csrf,
    get: (url) => agent.get(url),
    post: (url, body) => withHeaders(agent.post(url)).send(body),
    patch: (url, body) => withHeaders(agent.patch(url)).send(body),
    delete: (url) => withHeaders(agent.delete(url)),
  };
}

export async function loggedIn() {
  const c = await client();
  const res = await c.post('/api/auth/login', ADMIN);
  if (res.status !== 200) throw new Error(`login failed: ${res.status} ${JSON.stringify(res.body)}`);
  // login rotates the CSRF cookie — fetch the new value from Set-Cookie
  const fresh = res.headers['set-cookie'].find((c2) => c2.startsWith('dt_csrf='));
  const token = decodeURIComponent(fresh.split(';')[0].split('=')[1]);
  const withHeaders = (req) => req.set('Origin', ORIGIN).set('X-CSRF-Token', token);
  const sessionCookie = res.headers['set-cookie'].find((c2) => c2.startsWith('dt_token=')).split(';')[0];
  return {
    ...c,
    sessionCookie,
    post: (url, body) => withHeaders(c.agent.post(url)).send(body),
    patch: (url, body) => withHeaders(c.agent.patch(url)).send(body),
    delete: (url) => withHeaders(c.agent.delete(url)),
  };
}

export const doctorPayload = (n = 1) => ({
  name: `Dr. Test ${n}`,
  specialization: 'Cardiology',
  hospital: 'Square Hospital',
  phone: '+8801711000000',
  email: `doc${n}@test.com`,
});

export const patientPayload = (extra = {}) => ({
  name: 'Rahim Uddin',
  age: 42,
  gender: 'Male',
  phone: '+8801811000000',
  condition: 'Stable',
  ...extra,
});
