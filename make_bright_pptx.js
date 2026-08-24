const pptxgen = require('pptxgenjs');
const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'Codex';
pptx.subject = 'B-RIGHT One-page interactive infographic';
pptx.title = 'B-RIGHT';
pptx.company = 'B-RIGHT';
pptx.lang = 'th-TH';
pptx.theme = { headFontFace: 'Bai Jamjuree', bodyFontFace: 'Bai Jamjuree', lang: 'th-TH' };
const S=pptx.ShapeType;
const C={navy:'17324A',ink:'253746',muted:'647887',line:'A8B6BF',blue:'E2EEFA',blueE:'4D88BA',purple:'EEE9FA',purpleE:'7666C6',green:'DDF3E7',greenE:'2D9968',greenD:'146846',amber:'FFF0C7',amberE:'D89A12',amberD:'815500',red:'F9DCDC',redE:'C94B4B',redD:'8C2929',paper:'F6F8FA',white:'FFFFFF'};
const slide=pptx.addSlide(); slide.background={color:C.paper};
function text(t,x,y,w,h,fs=12,color=C.ink,bold=false,align='center'){slide.addText(t,{x,y,w,h,fontFace:'Bai Jamjuree',fontSize:fs,color,bold,align,valign:'mid',margin:0,breakLine:false,fit:'shrink',paraSpaceAfterPt:0});}
function rr(x,y,w,h,fill,lineColor,rad=0.12){slide.addShape(S.roundRect,{x,y,w,h,rectRadius:rad,fill:{color:fill},line:{color:lineColor,width:1.2}});}
function card(x,y,w,h,fill,edge,title,body,titleColor=C.ink,icon=null){rr(x,y,w,h,fill,edge); if(icon){slide.addShape(S.ellipse,{x:x+0.10,y:y+(h-0.34)/2,w:0.34,h:0.34,fill:{color:C.white},line:{color:titleColor,width:1.2}}); text(icon,x+0.10,y+(h-0.34)/2+0.01,0.34,0.30,12,titleColor,true); text(title,x+0.51,y+0.09,w-0.60,0.23,12,titleColor,true); text(body,x+0.51,y+0.35,w-0.60,h-0.42,9,titleColor,false);} else {text(title,x+0.08,y+0.09,w-0.16,0.24,12,titleColor,true); text(body,x+0.10,y+0.37,w-0.20,h-0.43,9,titleColor,false);}}
function section(t,x,y,w){text(t,x,y,w,0.22,11,C.navy,true,'left');}
function arrow(x1,y1,x2,y2,color=C.line){slide.addShape(S.line,{x:x1,y:y1,w:x2-x1,h:y2-y1,line:{color,width:1.4,beginArrowType:'none',endArrowType:'triangle'}});}
function iconCircle(x,y,s,label,color){slide.addShape(S.ellipse,{x,y,w:s,h:s,fill:{color:C.white},line:{color,width:1.2}}); text(label,x,y+0.01,s,s-0.02,12,color,true);}

// Header
text('B-RIGHT',0.42,0.24,2.0,0.42,28,C.navy,true,'left');
text('Bail Rights  •  Risk-assessment  •  Guarantee Help Tool',0.44,0.67,5.2,0.22,12,C.blueE,true,'left');
text('กลไกนวัตกรรมเพื่อให้การปล่อยตัวชั่วคราวในชั้นสอบสวนเข้าถึงได้ทุกคน',0.44,0.94,6.5,0.24,11,C.muted,false,'left');
rr(10.55,0.25,2.30,0.68,C.navy,C.navy,0.18); text('จาก “รอให้ร้องขอ”\nสู่ “รัฐประเมินและเสนอทางเลือก”',10.68,0.37,2.04,0.42,11,C.white,true);

// left column
section('WHY  |  ปัญหาที่กลไกเข้าไปแก้',0.42,1.38,2.2);
card(0.42,1.64,2.52,0.60,'F0F3F5','C9D3D9','ระบบตั้งรับ','ผู้ต้องหาต้องรู้สิทธิและยื่นคำร้องเอง',C.navy,'✉');
card(0.42,2.32,2.52,0.60,'F0F3F5','C9D3D9','ดุลพินิจไม่เป็นมาตรฐาน','ไม่มีแบบประเมินความเสี่ยงที่ใช้ร่วมกัน',C.navy,'⚖');
card(0.42,3.00,2.52,0.60,'F0F3F5','C9D3D9','หลักประกันไม่เชื่อมต่อ','คนไม่มีทรัพย์เข้าถึงกองทุน/ทางเลือกได้ยาก',C.navy,'↔');
section('HOW  |  กลไก 3 เครื่องยนต์',0.42,3.84,2.2);
card(0.42,4.10,2.52,0.70,C.blue,C.blueE,'01  Risk Assessment','ประเมินเหตุเสี่ยงตามกฎหมาย\nหลบหนี • ยุ่งเหยิงพยาน • อันตรายอื่น','#245A8A','✓');
card(0.42,4.89,2.52,0.70,C.purple,C.purpleE,'02  Government Data','เชื่อมข้อมูลทรัพย์สิน ประวัติ\nและสถานะคดี ลดเวลาข้ามหน่วยงาน','#4F439A','▤');
card(0.42,5.68,2.52,0.70,'EAF4FC',C.blueE,'03  Guarantee Help','เสนอผู้ค้ำ/ตำแหน่งหน้าที่\nและเชื่อมกองทุนยุติธรรม','#245A8A','↔');

// Center flow
rr(3.16,1.38,7.35,5.72,C.white,'D5DEE4',0.20); text('FLOW  |  กระบวนการ B-RIGHT',3.42,1.58,3.2,0.28,15,C.navy,true,'left'); rr(8.88,1.57,1.35,0.28,C.blue,C.blueE,0.12); text('ตรวจสอบย้อนหลังได้',8.92,1.63,1.26,0.14,8,'245A8A',true);
card(4.55,1.98,4.55,0.48,'F0EEE8','C9C3B5','1  รับตัวผู้ต้องหา + แจ้งสิทธิ','เริ่มนับเวลาการควบคุมตัว ไม่เกิน 48 ชั่วโมง',C.ink);
arrow(6.82,2.46,6.82,2.57);
card(4.55,2.66,4.55,0.48,C.blue,C.blueE,'2  ดึงข้อมูลจากระบบภาครัฐ','ทางรัฐ / CRIMES / DXC  •  ทรัพย์สิน / ประวัติ / สถานะคดี','#245A8A');
arrow(6.82,3.14,6.82,3.25);
card(4.55,3.34,4.55,0.48,C.purple,C.purpleE,'3  สัมภาษณ์และตรวจสอบข้อเท็จจริง','ข้อมูลออนไลน์ + ข้อมูลจากผู้ต้องหา','#4F439A');
arrow(6.82,3.82,6.82,3.93);
card(4.05,4.02,5.55,0.56,'F8F8FA','8797A1','4  ระบบประเมินและแสดงระดับความเสี่ยง','ผลประเมินเป็นหลักฐานรองรับการใช้ดุลพินิจ • ส่งภาพรวมไปยัง Policy Dashboard',C.ink);
// branches
const laneY=4.77, laneW=1.70; lineX=[4.00,6.20,8.40]; arrow(6.82,4.58,6.82,4.68); slide.addShape(S.line,{x:4.00,y:4.68,w:6.10,h:0,line:{color:C.line,width:1.2}}); lineX.forEach(x=>arrow(x,4.68,x,laneY));
card(3.42,laneY,laneW,0.64,C.green,C.greenE,'สีเขียว  |  เสี่ยงต่ำ','ปล่อยตัวทันที • ไม่ต้องมีหลักประกัน',C.greenD);
card(5.58,laneY,laneW,0.64,C.amber,C.amberE,'สีเหลือง  |  ปานกลาง','คำนวณหลักประกันตามความเสี่ยง',C.amberD);
card(7.74,laneY,laneW,0.64,C.red,C.redE,'สีแดง  |  เสี่ยงสูง','ไม่อนุญาต • แจ้งเหตุผลเป็นหนังสือ',C.redD);
arrow(4.27,5.41,4.27,5.50,C.greenE); card(3.42,5.55,laneW,0.62,C.green,'73B995','บันทึกผลการประเมิน','เป็นหลักฐานและหลังพิงของพนักงานสอบสวน',C.greenD);
arrow(6.43,5.41,6.43,5.50,C.amberE); card(5.58,5.55,laneW,0.62,C.amber,'E5B94D','ตรวจสอบหลักประกัน','มีผู้ค้ำ/หลักทรัพย์ผ่านระบบ → ปล่อยชั่วคราว',C.amberD);
arrow(8.59,5.41,8.59,5.50,C.redE); card(7.74,5.55,laneW,0.62,C.red,'DB8080','หากครบ 48 ชม. ยังไม่เสร็จ','ขอฝากขังต่อศาล ตาม ป.วิ.อาญา ม.87',C.redD);
card(3.66,6.31,3.72,0.48,'EAF4FC',C.blueE,'หากไม่มีหรือหลักประกันไม่เพียงพอ','เสนอผู้ค้ำ/ตำแหน่งหน้าที่ → หาหลักประกันเพิ่ม → ประเมินซ้ำ','#245A8A');
card(7.52,6.31,2.06,0.48,'EAF4FC',C.blueE,'ช่องทางช่วยเหลือ','กองทุนยุติธรรม + Offline','#245A8A');

// right column
section('RESULT  |  ผลลัพธ์',10.72,1.38,2.2);
card(10.72,1.64,2.16,0.82,C.green,C.greenE,'ประชาชน','ได้รับการพิจารณาทุกราย\nไม่ขึ้นกับความรู้หรือฐานะ\nมีทางออกเมื่อไม่มีหลักทรัพย์',C.greenD,'♧');
card(10.72,2.58,2.16,0.82,C.blue,C.blueE,'พนักงานสอบสวน','มีเกณฑ์และหลักฐานรองรับ\nลดความเสี่ยงทางวินัย\nลดข้อครหา 2 มาตรฐาน','#245A8A','♙');
card(10.72,3.52,2.16,0.82,C.purple,C.purpleE,'ระบบยุติธรรม','ลดผู้ต้องขังระหว่างสอบสวน\nลดภาระควบคุมตัว\nเพิ่มความเชื่อมั่น','#4F439A','▤');
rr(10.72,4.54,2.16,1.05,C.navy,C.navy,0.18); text('PRINCIPLE',10.86,4.70,1.88,0.14,9,'A9C9E4',true); text('แยกทางเดินด้วย “ระดับความเสี่ยง”',10.84,4.94,1.92,0.20,11,C.white,true); text('ไม่ใช่ฐานะทางเศรษฐกิจ\nหรือความสามารถในการร้องขอ',10.84,5.22,1.92,0.25,9,'DCEBF7');
rr(10.86,5.82,1.88,0.28,C.green,C.greenE,0.14); text('เป้าหมาย: ภายใน 48 ชม.',10.90,5.89,1.80,0.13,8,C.greenD,true);

// footer
rr(0.42,7.16,12.45,0.30,'EDF3F6','C8D5DC',0.14); text('นำไปสู่การปฏิบัติ',0.58,7.23,1.15,0.13,9,C.navy,true,'left');
[['ระเบียบ','กำหนดหน้าที่ประเมินทุกกรณี'],['ข้อมูล','กำหนดสิทธิ์เข้าถึง/MOU'],['บุคลากร','อบรมแบบประเมินและระบบ'],['ติดตาม','KPI + ตรวจสอบผลเป็นระยะ']].forEach((a,i)=>{let x=1.85+i*2.75;rr(x,7.20,0.78,0.20,C.blue,C.blueE,0.10);text(a[0],x+0.04,7.24,0.70,0.08,7,'245A8A',true);text(a[1],x+0.90,7.23,1.75,0.11,8,C.muted,false,'left');});

pptx.writeFile({fileName:'B-RIGHT_Editable_Infographic.pptx'});
