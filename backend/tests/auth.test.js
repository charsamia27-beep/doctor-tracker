import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { ADMIN, ORIGIN, client, loggedIn, resetDb, startDb, stopDb } from './helpers.js';

beforeAll(startDb);
afterAll(stopDb);
beforeEach(resetDb);

describe('authentication', () => {
  it('rejects protected routes without a session', async () => {
    const res = await request(createApp()).get('/api/doctors');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('logs in, sets an httpOnly cookie and never returns the password', async () => {
    const c = await client();
    const res = await c.post('/api/auth/login', ADMIN);
    expect(res.status).toBe(200);
    expect(res.body.data.user.password).toBeUndefined();
    const cookie = res.headers['set-cookie'].find((h) => h.startsWith('dt_token='));
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
  });

  it('uses the same message for unknown email and wrong password', async () => {
    const c = await client();
    const a = await c.post('/api/auth/login', { email: 'nobody@test.com', password: 'whatever' });
    const b = await c.post('/api/auth/login', { email: ADMIN.email, password: 'wrong-password' });
    expect(a.status).toBe(401);
    expect(b.status).toBe(401);
    expect(a.body.message).toBe(b.body.message);
  });

  it('locks the account after too many failed attempts', async () => {
    const c = await client();
    for (let i = 0; i < 3; i++) await c.post('/api/auth/login', { email: ADMIN.email, password: 'nope' });
    const res = await c.post('/api/auth/login', ADMIN); // correct password, but locked
    expect(res.status).toBe(423);
  });

  it('revokes the token on logout (copied cookie stops working)', async () => {
    const c = await loggedIn();
    expect((await c.get('/api/auth/me')).status).toBe(200);
    await c.post('/api/auth/logout');
    const replay = await request(createApp()).get('/api/auth/me').set('Cookie', c.sessionCookie);
    expect(replay.status).toBe(401);
  });
});

describe('CSRF protection', () => {
  it('blocks state-changing requests without the CSRF header', async () => {
    const c = await loggedIn();
    const res = await c.agent.post('/api/doctors').set('Origin', ORIGIN).send({});
    expect(res.status).toBe(403);
  });

  it('blocks requests from a foreign origin', async () => {
    const c = await loggedIn();
    const res = await c.agent.post('/api/doctors').set('Origin', 'https://evil.example').set('X-CSRF-Token', c.csrf).send({});
    expect(res.status).toBe(403);
  });
});

describe('input hardening', () => {
  it('rejects NoSQL operator injection in query strings', async () => {
    const c = await loggedIn();
    const res = await c.get('/api/doctors?specialization[$ne]=x');
    expect(res.status).toBe(400);
  });

  it('rejects unknown body fields (mass assignment)', async () => {
    const c = await loggedIn();
    const res = await c.post('/api/doctors', {
      name: 'Dr. X', specialization: 'ENT', hospital: 'H', phone: '+8801711000000', email: 'x@test.com', patientCount: 999,
    });
    expect(res.status).toBe(400);
  });

  it('returns a request id on errors for tracing', async () => {
    const res = await request(createApp()).get('/api/nope');
    expect(res.status).toBe(401);
    expect(res.headers['x-request-id']).toBeTruthy();
  });
});
