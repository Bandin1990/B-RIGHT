import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 8787);
const apiKey = process.env.OPENAI_API_KEY || '';
const model = process.env.OPENAI_MODEL || 'gpt-5';
const geminiKey = process.env.GEMINI_API_KEY || '';
const geminiModel = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

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

const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.md': 'text/plain; charset=utf-8' };
const server = http.createServer(async (req, res) => {
  try {
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
