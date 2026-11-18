import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { doctorPayload, loggedIn, patientPayload, resetDb, startDb, stopDb } from './helpers.js';

beforeAll(startDb);
afterAll(stopDb);
beforeEach(resetDb);

describe('doctors', () => {
  it('creates, searches by prefix, filters and paginates', async () => {
    const c = await loggedIn();
    for (let i = 1; i <= 12; i++) {
      const r = await c.post('/api/doctors', { ...doctorPayload(i), specialization: i % 2 ? 'Cardiology' : 'Neurology' });
      expect(r.status).toBe(201);
    }
    const page2 = await c.get('/api/doctors?page=2&limit=5');
    expect(page2.body.data).toHaveLength(5);
    expect(page2.body.pagination).toMatchObject({ page: 2, limit: 5, total: 12, totalPages: 3 });

    const search = await c.get(`/api/doctors?search=${encodeURIComponent('dr. test 1')}`);
    expect(search.body.pagination.total).toBe(4); // 1, 10, 11, 12

    const filtered = await c.get('/api/doctors?specialization=Neurology');
    expect(filtered.body.pagination.total).toBe(6);
  });

  it('rejects duplicate emails with 409', async () => {
    const c = await loggedIn();
    await c.post('/api/doctors', doctorPayload(1));
    const dup = await c.post('/api/doctors', doctorPayload(1));
    expect(dup.status).toBe(409);
    expect(dup.body.errors.email).toBeDefined();
  });
});

describe('patients & denormalised patientCount', () => {
  it('keeps patientCount in sync across add, reassign and delete', async () => {
    const c = await loggedIn();
    const a = (await c.post('/api/doctors', doctorPayload(1))).body.data;
    const b = (await c.post('/api/doctors', doctorPayload(2))).body.data;

    const p1 = (await c.post(`/api/doctors/${a._id}/patients`, patientPayload())).body.data;
    await c.post('/api/patients', patientPayload({ name: 'Second', doctor: a._id }));
    expect((await c.get(`/api/doctors/${a._id}`)).body.data.patientCount).toBe(2);

    await c.patch(`/api/patients/${p1._id}`, { doctor: b._id });
    expect((await c.get(`/api/doctors/${a._id}`)).body.data.patientCount).toBe(1);
    expect((await c.get(`/api/doctors/${b._id}`)).body.data.patientCount).toBe(1);

    // scoped delete: removing via the wrong doctor must fail
    expect((await c.delete(`/api/doctors/${a._id}/patients/${p1._id}`)).status).toBe(404);
    expect((await c.delete(`/api/doctors/${b._id}/patients/${p1._id}`)).status).toBe(200);
    expect((await c.get(`/api/doctors/${b._id}`)).body.data.patientCount).toBe(0);
  });

  it('filters by condition and writes audit entries', async () => {
    const c = await loggedIn();
    const d = (await c.post('/api/doctors', doctorPayload(1))).body.data;
    await c.post(`/api/doctors/${d._id}/patients`, patientPayload({ condition: 'Critical' }));
    await c.post(`/api/doctors/${d._id}/patients`, patientPayload({ name: 'Other', condition: 'Stable' }));

    const critical = await c.get('/api/patients?condition=Critical');
    expect(critical.body.pagination.total).toBe(1);

    const logs = await c.get('/api/audit-logs?entity=patient');
    expect(logs.body.pagination.total).toBe(2);
    expect(logs.body.data[0]).not.toHaveProperty('ip'); // not exposed by the API
  });

  it('returns dashboard stats', async () => {
    const c = await loggedIn();
    const d = (await c.post('/api/doctors', doctorPayload(1))).body.data;
    await c.post(`/api/doctors/${d._id}/patients`, patientPayload());
    const res = await c.get('/api/stats/overview?range=30d');
    expect(res.status).toBe(200);
    expect(res.body.data.totals.patients).toBe(1);
    expect(res.body.data.patientsPerDoctor[0].patients).toBe(1);
    expect(res.body.data.timeline.length).toBe(30);
  });
});
