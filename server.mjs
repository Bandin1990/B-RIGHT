import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 8787);
const apiKey = process.env.OPENAI_API_KEY || '';
const model = process.env.OPENAI_MODEL || 'gpt-5';
const geminiKey = process.env.GEMINI_API_KEY || '';
const geminiModel = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
const dbPath = process.env.BRIGHT_DB_PATH || path.join(root, 'data', 'b-right.sqlite');
await fs.mkdir(path.dirname(dbPath), { recursive: true });
const db = new DatabaseSync(dbPath);
db.exec(`CREATE TABLE IF NOT EXISTS cases (id TEXT PRIMARY KEY, case_no TEXT NOT NULL UNIQUE, charge TEXT NOT NULL, legal_basis TEXT, suspect_name TEXT, suspect_reference TEXT, custody_started_at TEXT, status TEXT NOT NULL DEFAULT 'draft', created_by TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL); CREATE TABLE IF NOT EXISTS risk_assessments (id TEXT PRIMARY KEY, case_id TEXT NOT NULL, factor_answers_json TEXT NOT NULL, group_scores_json TEXT NOT NULL, total_percent REAL NOT NULL, risk_level TEXT NOT NULL, legal_gates_json TEXT NOT NULL DEFAULT '[]', officer_opinion TEXT, assessed_by TEXT NOT NULL, assessed_at TEXT NOT NULL); CREATE TABLE IF NOT EXISTS guarantees (id TEXT PRIMARY KEY, case_id TEXT NOT NULL, guarantee_type TEXT NOT NULL, description TEXT NOT NULL, declared_value REAL, encumbrance_value REAL DEFAULT 0, usable_value REAL, source_type TEXT NOT NULL, source_reference TEXT, verification_status TEXT NOT NULL DEFAULT 'pending', created_at TEXT NOT NULL); CREATE TABLE IF NOT EXISTS audit_logs (id TEXT PRIMARY KEY, case_id TEXT, actor_id TEXT NOT NULL, action TEXT NOT NULL, metadata_json TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL);`);

function now() { return new Date().toISOString(); }
function id() { return crypto.randomUUID(); }
function audit(caseId, actorId, action, metadata = {}) { db.prepare('INSERT INTO audit_logs (id, case_id, actor_id, action, metadata_json, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(id(), caseId || null, actorId, action, JSON.stringify(metadata), now()); }

function json(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(body));
}

async function body(req) {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  return JSON.parse(raw || '{}');
}

async function analyze(req, res) {
  if (!apiKey && !geminiKey) return json(res, 503, { ok: false, code: 'AI_NOT_CONFIGURED', message: 'ยังไม่ได้ตั้งค่า GEMINI_API_KEY หรือ OPENAI_API_KEY' });
  const payload = await body(req);
  const instructions = `คุณเป็นผู้ช่วยวิเคราะห์ข้อมูลสำหรับพนักงานสอบสวนในประเทศไทย ไม่ใช่ผู้พิพากษาและไม่มีอำนาจอนุมัติปล่อยชั่วคราว\nตอบเป็นภาษาไทยแบบสั้น กระชับ และตรวจสอบได้\nห้ามตัดสินว่าต้องปล่อยหรือฝากขัง ห้ามกำหนดวงเงินแทนกฎหมาย และห้ามแต่งข้อเท็จจริง\nให้ตอบ JSON เท่านั้นตามโครงสร้าง: {"summary":string,"missing":[string],"inconsistencies":[string],"next_steps":[string],"sources":[string],"human_review":string}\nทุกข้อเสนอให้ใช้คำว่า 'ควรตรวจสอบ/ควรพิจารณา' และระบุข้อมูลที่ยังไม่พอถ้ามี`;
  if (geminiKey) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel)}:generateContent`, {
      method: 'POST',
      headers: { 'x-goog-api-key': geminiKey, 'content-type': 'application/json' },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: instructions }] }, contents: [{ role: 'user', parts: [{ text: JSON.stringify(payload) }] }], generationConfig: { responseMimeType: 'application/json' } })
    });
    const data = await response.json();
    if (!response.ok) return json(res, response.status, { ok: false, code: 'GEMINI_ERROR', message: data?.error?.message || 'เรียก Gemini ไม่สำเร็จ' });
    const text = (data.candidates?.[0]?.content?.parts || []).map(part => part.text || '').join('');
    try { return json(res, 200, { ok: true, provider: 'gemini', model: geminiModel, result: JSON.parse(text) }); }
    catch { return json(res, 200, { ok: true, provider: 'gemini', model: geminiModel, result: { summary: text, missing: [], inconsistencies: [], next_steps: [], sources: [], human_review: 'ต้องตรวจสอบผลลัพธ์โดยเจ้าหน้าที่' } }); }
  }
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({ model, instructions, input: JSON.stringify(payload), store: false })
  });
  const data = await response.json();
  if (!response.ok) return json(res, response.status, { ok: false, code: 'OPENAI_ERROR', message: data?.error?.message || 'เรียก AI ไม่สำเร็จ' });
  let text = data.output_text || '';
  try { return json(res, 200, { ok: true, model: data.model || model, result: JSON.parse(text) }); }
  catch { return json(res, 200, { ok: true, model: data.model || model, result: { summary: text, missing: [], inconsistencies: [], next_steps: [], sources: [], human_review: 'ต้องตรวจสอบผลลัพธ์โดยเจ้าหน้าที่' } }); }
}

async function generateDemoCase(req, res) {
  if (!apiKey && !geminiKey) return json(res, 503, { ok: false, code: 'AI_NOT_CONFIGURED', message: 'ยังไม่ได้ตั้งค่า GEMINI_API_KEY หรือ OPENAI_API_KEY' });
  const payload = await body(req);
  const instructions = `สร้างข้อมูลคดีสมมติภาษาไทยเพื่อสาธิตหน้าจอระบบ B-RIGHT เท่านั้น ห้ามใช้ชื่อจริง เลขประชาชนจริง ที่อยู่จริง หรือข้อมูลที่ระบุตัวบุคคลได้ ให้ตอบ JSON เท่านั้นตามโครงสร้าง {"suspect":"ชื่อสมมติ","nationality":"ไทย","phone":"000-000-0000","address":"ที่อยู่สมมติ จังหวัดสมมติ","circumstance":"พฤติการณ์คดีสมมติ 2-3 ประโยค","custody_facts":"ข้อเท็จจริงการจับกุมและควบคุมตัวสมมติ 1-2 ประโยค","interview_notes":"สรุปผลสอบปากคำสมมติ 2-3 ประโยค","occupation":"อาชีพสมมติ","relative_contact":"ญาติ/ผู้ไว้วางใจสมมติ","warning":"ข้อมูลจำลองเพื่อการนำเสนอ ไม่ใช่ข้อเท็จจริง"}`;
  const prompt = JSON.stringify({ charge: payload.charge || 'ไม่ระบุข้อหา', rule: payload.rule || 'ไม่ระบุ', purpose: 'presentation demo' });
  if (geminiKey) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel)}:generateContent`, { method: 'POST', headers: { 'x-goog-api-key': geminiKey, 'content-type': 'application/json' }, body: JSON.stringify({ systemInstruction: { parts: [{ text: instructions }] }, contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json' } }) });
    const data = await response.json();
    if (!response.ok) return json(res, response.status, { ok: false, code: 'GEMINI_ERROR', message: data?.error?.message || 'เรียก Gemini ไม่สำเร็จ' });
    const text = (data.candidates?.[0]?.content?.parts || []).map(part => part.text || '').join('');
    try { return json(res, 200, { ok: true, provider: 'gemini', model: geminiModel, result: JSON.parse(text) }); } catch { return json(res, 502, { ok: false, message: 'Gemini ส่งข้อมูลไม่ตรงรูปแบบ JSON' }); }
  }
  const response = await fetch('https://api.openai.com/v1/responses', { method: 'POST', headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' }, body: JSON.stringify({ model, instructions, input: prompt, store: false }) });
  const data = await response.json();
  if (!response.ok) return json(res, response.status, { ok: false, code: 'OPENAI_ERROR', message: data?.error?.message || 'เรียก OpenAI ไม่สำเร็จ' });
  try { return json(res, 200, { ok: true, provider: 'openai', model: data.model || model, result: JSON.parse(data.output_text || '') }); } catch { return json(res, 502, { ok: false, message: 'AI ส่งข้อมูลไม่ตรงรูปแบบ JSON' }); }
}

async function createCase(req, res) {
  const payload = await body(req);
  if (!payload.case_no || !payload.charge) return json(res, 400, { ok: false, message: 'ต้องระบุเลขคดีและข้อกล่าวหา' });
  const actor = String(payload.actor_id || 'local-officer');
  const timestamp = now();
  const caseId = id();
  try {
    db.prepare('INSERT INTO cases (id, case_no, charge, legal_basis, suspect_name, suspect_reference, custody_started_at, status, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(caseId, payload.case_no, payload.charge, payload.legal_basis || null, payload.suspect_name || null, payload.suspect_reference || null, payload.custody_started_at || null, 'draft', actor, timestamp, timestamp);
    audit(caseId, actor, 'case.created', { case_no: payload.case_no });
    return json(res, 201, { ok: true, case: db.prepare('SELECT * FROM cases WHERE id = ?').get(caseId) });
  } catch (error) { return json(res, 409, { ok: false, code: 'CASE_CREATE_FAILED', message: error.message }); }
}

async function getCase(req, res, caseId) {
  const record = db.prepare('SELECT * FROM cases WHERE id = ?').get(caseId);
  if (!record) return json(res, 404, { ok: false, message: 'ไม่พบคดี' });
  const assessments = db.prepare('SELECT * FROM risk_assessments WHERE case_id = ? ORDER BY assessed_at DESC').all(caseId).map(row => ({ ...row, factor_answers: JSON.parse(row.factor_answers_json), group_scores: JSON.parse(row.group_scores_json), legal_gates: JSON.parse(row.legal_gates_json) }));
  const guarantees = db.prepare('SELECT * FROM guarantees WHERE case_id = ? ORDER BY created_at DESC').all(caseId);
  return json(res, 200, { ok: true, case: record, assessments, guarantees });
}

async function createAssessment(req, res, caseId) {
  const exists = db.prepare('SELECT id FROM cases WHERE id = ?').get(caseId);
  if (!exists) return json(res, 404, { ok: false, message: 'ไม่พบคดี' });
  const payload = await body(req);
  if (!payload.risk_level || payload.total_percent == null) return json(res, 400, { ok: false, message: 'ข้อมูลผลประเมินไม่ครบ' });
  const actor = String(payload.assessed_by || 'local-officer');
  const assessmentId = id();
  db.prepare('INSERT INTO risk_assessments (id, case_id, factor_answers_json, group_scores_json, total_percent, risk_level, legal_gates_json, officer_opinion, assessed_by, assessed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(assessmentId, caseId, JSON.stringify(payload.factor_answers || []), JSON.stringify(payload.group_scores || {}), Number(payload.total_percent), payload.risk_level, JSON.stringify(payload.legal_gates || []), payload.officer_opinion || null, actor, now());
  audit(caseId, actor, 'assessment.created', { assessment_id: assessmentId, risk_level: payload.risk_level });
  return json(res, 201, { ok: true, assessment_id: assessmentId });
}

const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.md': 'text/plain; charset=utf-8' };
const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'POST' && req.url === '/api/cases') return await createCase(req, res);
    const caseMatch = (req.url || '').match(/^\/api\/cases\/([^/?]+)$/);
    if (req.method === 'GET' && caseMatch) return await getCase(req, res, caseMatch[1]);
    const assessmentMatch = (req.url || '').match(/^\/api\/cases\/([^/?]+)\/assessments$/);
    if (req.method === 'POST' && assessmentMatch) return await createAssessment(req, res, assessmentMatch[1]);
    if (req.method === 'POST' && req.url === '/api/ai/analyze') return await analyze(req, res);
    if (req.method === 'POST' && req.url === '/api/ai/demo-case') return await generateDemoCase(req, res);
    if (req.method !== 'GET') return json(res, 405, { ok: false, message: 'Method not allowed' });
    const requested = decodeURIComponent((req.url || '/').split('?')[0]);
    const relative = requested === '/' ? 'B-RIGHT_MVP_Prototype.html' : requested.replace(/^\/+/, '');
    const file = path.resolve(root, relative);
    if (!file.startsWith(path.resolve(root))) return json(res, 403, { ok: false });
    const data = await fs.readFile(file);
    res.writeHead(200, { 'content-type': mime[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  } catch (error) { json(res, error.code === 'ENOENT' ? 404 : 500, { ok: false, message: error.message }); }
});
server.listen(port, () => console.log(`B-RIGHT server listening at http://localhost:${port}`));
