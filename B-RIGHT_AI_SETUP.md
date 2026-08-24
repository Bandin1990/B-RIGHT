# เชื่อม AI จริงกับ B-RIGHT

1. ติดตั้ง Node.js 18 ขึ้นไป
2. ตั้งค่า `GEMINI_API_KEY` หรือ `OPENAI_API_KEY` อย่างใดอย่างหนึ่ง
3. ตั้งค่า environment variable ก่อนรันเซิร์ฟเวอร์ เช่น PowerShell:

```powershell
$env:GEMINI_API_KEY="ใส่ Gemini API Key จริง"
$env:GEMINI_MODEL="gemini-3.6-flash"
node server.mjs
```

4. เปิด `http://localhost:8787`
5. กด `เรียก AI จริง` ในหน้าแบบประเมินความเสี่ยง

ถ้ามีทั้งสองคีย์ ระบบจะเลือก Gemini ก่อน ส่วน OpenAI เป็นทางเลือกสำรอง API Key ต้องอยู่ฝั่ง server เท่านั้น ห้ามใส่ใน HTML หรือส่งไป browser โดยตรง ระบบส่งข้อมูลคดีแบบลดทอนตัวระบุบุคคลในต้นแบบ

ถ้าไม่ได้ตั้งค่า key ระบบจะแสดงสถานะ `ยังไม่ได้เชื่อม AI จริง` และผู้ใช้ยังใช้ปุ่มวิเคราะห์แบบสาธิตได้
