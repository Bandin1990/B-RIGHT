from PIL import Image, ImageDraw, ImageFont
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A3, landscape
from reportlab.lib.utils import ImageReader
import os, math, textwrap

OUT=r'C:\Users\tongd\ยธต 1 - กาสะลอง'
PNG=os.path.join(OUT,'B-RIGHT_One_Page_Summary.png')
PDF=os.path.join(OUT,'B-RIGHT_One_Page_Summary.pdf')
FONT=os.path.join(OUT,'fonts','BaiJamjuree-Regular.ttf'); BOLD=os.path.join(OUT,'fonts','BaiJamjuree-Bold.ttf')
S=2; W,H=1800,1200
BG='#F6F8FA'; NAVY='#17324A'; INK='#253746'; MUTED='#647887'; LINE='#A8B6BF'
BLUE='#E2EEFA'; BLUE_E='#4D88BA'; PURPLE='#EEE9FA'; PURPLE_E='#7666C6'
GREEN='#DDF3E7'; GREEN_E='#2D9968'; GREEN_D='#146846'
AMBER='#FFF0C7'; AMBER_E='#D89A12'; AMBER_D='#815500'
RED='#F9DCDC'; RED_E='#C94B4B'; RED_D='#8C2929'
WHITE='#FFFFFF'; DARK_BLUE='#D6E7FA'

def rgb(h): return tuple(int(h[i:i+2],16) for i in (1,3,5))
im=Image.new('RGB',(W*S,H*S),rgb(BG)); d=ImageDraw.Draw(im)
def font(sz,b=False): return ImageFont.truetype(BOLD if b else FONT,int(sz*S))
def rounded(x,y,w,h,fill,outline=None,r=18,width=2):
    d.rounded_rectangle((x*S,y*S,(x+w)*S,(y+h)*S),radius=r*S,fill=rgb(fill),outline=rgb(outline or fill),width=width*S)
def txt(x,y,s,sz=16,col=INK,b=False,anchor='la',spacing=4):
    d.multiline_text((x*S,y*S),s,font=font(sz,b),fill=rgb(col),anchor=anchor,spacing=spacing,align='center' if anchor in ('mm','ma','mt') else 'left')
def line(x1,y1,x2,y2,col=LINE,width=2,arrow=False):
    d.line((x1*S,y1*S,x2*S,y2*S),fill=rgb(col),width=width*S)
    if arrow:
        a=math.atan2(y2-y1,x2-x1); q=10
        pts=[(x2*S,y2*S),((x2-q*math.cos(a-math.pi/6))*S,(y2-q*math.sin(a-math.pi/6))*S),((x2-q*math.cos(a+math.pi/6))*S,(y2-q*math.sin(a+math.pi/6))*S)]
        d.polygon(pts,fill=rgb(col))
def icon(cx,cy,kind,color=BLUE_E):
    c=rgb(color); d.ellipse(((cx-17)*S,(cy-17)*S,(cx+17)*S,(cy+17)*S),fill=rgb(WHITE),outline=c,width=2*S)
    if kind in ('person','people','officer'):
        d.ellipse(((cx-5)*S,(cy-10)*S,(cx+5)*S,(cy)*S),outline=c,width=2*S)
        d.arc(((cx-11)*S,(cy-1)*S,(cx+11)*S,(cy+17)*S),180,360,fill=c,width=2*S)
        if kind=='people': d.ellipse(((cx+5)*S,(cy-6)*S,(cx+12)*S,(cy+1)*S),outline=c,width=2*S)
    elif kind in ('data','system'):
        for yy in (-8,0,8): d.rounded_rectangle(((cx-10)*S,(cy+yy-3)*S,(cx+10)*S,(cy+yy+3)*S),radius=2*S,outline=c,width=2*S)
    elif kind in ('link','help'):
        d.arc(((cx-12)*S,(cy-8)*S,(cx+3)*S,(cy+8)*S),80,280,fill=c,width=2*S); d.arc(((cx-3)*S,(cy-8)*S,(cx+12)*S,(cy+8)*S),260,100,fill=c,width=2*S)
    elif kind in ('risk','shield'):
        pts=[((cx)*S,(cy-11)*S),((cx+10)*S,(cy-5)*S),((cx+7)*S,(cy+8)*S),((cx)*S,(cy+13)*S),((cx-7)*S,(cy+8)*S),((cx-10)*S,(cy-5)*S)]
        d.line(pts+[pts[0]],fill=c,width=2*S); d.line(((cx-5)*S,cy*S,(cx-1)*S,(cy+4)*S,(cx+6)*S,(cy-5)*S),fill=c,width=2*S,joint='curve')
    elif kind=='scale':
        d.line((cx*S,(cy-11)*S,cx*S,(cy+10)*S),fill=c,width=2*S); d.line(((cx-11)*S,(cy-7)*S,(cx+11)*S,(cy-7)*S),fill=c,width=2*S); d.line(((cx-8)*S,(cy-7)*S,(cx-12)*S,(cy+3)*S),fill=c,width=2*S); d.line(((cx+8)*S,(cy-7)*S,(cx+12)*S,(cy+3)*S),fill=c,width=2*S); d.arc(((cx-17)*S,(cy-1)*S,(cx-7)*S,(cy+7)*S),0,180,fill=c,width=2*S); d.arc(((cx+7)*S,(cy-1)*S,(cx+17)*S,(cy+7)*S),0,180,fill=c,width=2*S)
    elif kind=='inbox':
        d.rectangle(((cx-11)*S,(cy-8)*S,(cx+11)*S,(cy+8)*S),outline=c,width=2*S); d.line(((cx-9)*S,(cy-2)*S,(cx-3)*S,(cy+4)*S,(cx+3)*S,(cy-2)*S,(cx+9)*S,(cy+4)*S),fill=c,width=2*S)
def card(x,y,w,h,fill,edge,title,body='',title_col=INK,title_sz=16,body_sz=12,ic=None):
    rounded(x,y,w,h,fill,edge,16,2)
    shift=24 if ic else 0
    if ic: icon(x+27,y+h/2,ic,title_col)
    txt(x+w/2+shift,y+16,title,title_sz+2,title_col,True,'ma')
    if body:
        nlines=body.count('\n')+1
        body_y=y+h-30 if nlines>=3 else (y+h-23 if nlines==2 else y+h-18)
        txt(x+w/2+shift,body_y,body,body_sz+2,title_col,False,'mm',6)
def pill(x,y,w,label,fill,edge,col=INK):
    rounded(x,y,w,28,fill,edge,14,2); txt(x+w/2,y+14,label,12,col,True,'mm')

# Header
txt(55,42,'B-RIGHT',42,NAVY,True)
txt(55,94,'Bail Rights  •  Risk-assessment  •  Guarantee Help Tool',19,BLUE_E,True)
txt(55,133,'กลไกนวัตกรรมเพื่อให้การปล่อยตัวชั่วคราวในชั้นสอบสวนเข้าถึงได้ทุกคน',18,MUTED)
rounded(1420,38,315,92,NAVY,NAVY,20,1)
txt(1577,67,'จาก “รอให้ร้องขอ”',17,WHITE,True,'mm'); txt(1577,103,'สู่ “รัฐประเมินและเสนอทางเลือก”',14,'#DCEBF7',False,'mm')

# left problem / engines column
txt(55,176,'WHY  |  ปัญหาที่กลไกนี้เข้าไปแก้',15,NAVY,True)
card(55,202,330,76,'#F0F3F5','#C9D3D9','ระบบตั้งรับ','ผู้ต้องหาต้องรู้สิทธิและยื่นคำร้องเอง',NAVY,15,12,'inbox')
card(55,292,330,76,'#F0F3F5','#C9D3D9','ดุลพินิจไม่เป็นมาตรฐาน','ไม่มีแบบประเมินความเสี่ยงที่ใช้ร่วมกัน',NAVY,15,12,'scale')
card(55,382,330,76,'#F0F3F5','#C9D3D9','หลักประกันไม่เชื่อมต่อ','คนไม่มีทรัพย์เข้าถึงกองทุน/ทางเลือกได้ยาก',NAVY,15,12,'link')

txt(55,490,'HOW  |  กลไก 3 เครื่องยนต์',15,NAVY,True)
card(55,516,330,86,BLUE,BLUE_E,'01  Risk Assessment','ประเมินเหตุเสี่ยงตามกฎหมาย\nหลบหนี • ยุ่งเหยิงพยาน • อันตรายอื่น','#245A8A',15,12,'risk')
card(55,616,330,86,PURPLE,PURPLE_E,'02  Government Data','เชื่อมข้อมูลทรัพย์สิน ประวัติ\nและสถานะคดี ลดเวลาข้ามหน่วยงาน','#4F439A',15,12,'data')
card(55,716,330,86,'#EAF4FC',BLUE_E,'03  Guarantee Help','เสนอผู้ค้ำ/ตำแหน่งหน้าที่\nและเชื่อมกองทุนยุติธรรม','#245A8A',15,12,'help')

# Main flow frame
rounded(425,174,1015,782,WHITE,'#D5DEE4',22,2)
txt(458,205,'FLOW  |  กระบวนการ B-RIGHT',20,NAVY,True)
pill(1190,196,205,'บันทึกตรวจสอบย้อนหลังได้',BLUE,BLUE_E,'#245A8A')

# shared spine
card(675,250,515,58,'#F0EEE8','#C9C3B5','1  รับตัวผู้ต้องหา + แจ้งสิทธิ','เริ่มนับเวลาการควบคุมตัว ไม่เกิน 48 ชั่วโมง',INK,15,11)
line(932,308,932,328,LINE,2,True)
card(675,342,515,58,BLUE,BLUE_E,'2  ดึงข้อมูลจากระบบภาครัฐ','ThaiD / CRIMES / DXC  •  ทรัพย์สิน / ประวัติ / สถานะคดี','#245A8A',15,11)
line(932,400,932,420,LINE,2,True)
card(675,434,515,58,PURPLE,PURPLE_E,'3  สัมภาษณ์และตรวจสอบข้อเท็จจริง','ข้อมูลออนไลน์ + ข้อมูลจากผู้ต้องหา','#4F439A',15,11)
line(932,492,932,515,LINE,2,True)
card(625,530,615,70,'#F8F8FA','#8797A1','4  ระบบประเมินและแสดงระดับความเสี่ยง','ผลประเมินเป็นหลักฐานรองรับการใช้ดุลพินิจ • ส่งข้อมูลภาพรวมไปยัง Policy Dashboard',INK,15,11)

# Branch lanes
lane_y=630; lane_w=285; xg=450; xy=755; xr=1060
line(932,600,932,617,LINE,2); line(xg+lane_w/2,617,xr+lane_w/2,617,LINE,2)
for x in [xg+lane_w/2,xy+lane_w/2,xr+lane_w/2]: line(x,617,x,lane_y-6,LINE,2,True)
card(xg,lane_y,lane_w,58,GREEN,GREEN_E,'สีเขียว  |  เสี่ยงต่ำ','ปล่อยตัวทันที • ไม่ต้องมีหลักประกัน',GREEN_D,14,11)
card(xy,lane_y,lane_w,58,AMBER,AMBER_E,'สีเหลือง  |  เสี่ยงปานกลาง','คำนวณหลักประกันตามระดับความเสี่ยง',AMBER_D,14,11)
card(xr,lane_y,lane_w,58,RED,RED_E,'สีแดง  |  เสี่ยงสูง','ไม่อนุญาตชั่วคราว • แจ้งเหตุผลเป็นหนังสือ',RED_D,14,11)

# branch details
line(xg+lane_w/2,lane_y+58,xg+lane_w/2,724,GREEN_E,2,True)
card(xg,740,lane_w,74,GREEN,'#73B995','บันทึกผลการประเมิน','เป็นหลักฐานและหลังพิง\nของพนักงานสอบสวน',GREEN_D,13,11)

line(xy+lane_w/2,lane_y+58,xy+lane_w/2,724,AMBER_E,2,True)
card(xy,740,lane_w,74,AMBER,'#E5B94D','ตรวจสอบหลักประกัน','มีผู้ค้ำ/หลักทรัพย์ผ่านระบบ\n→ ปล่อยชั่วคราว',AMBER_D,13,11)

line(xr+lane_w/2,lane_y+58,xr+lane_w/2,724,RED_E,2,True)
card(xr,740,lane_w,74,RED,'#DB8080','หากครบ 48 ชม. ยังไม่เสร็จ','ขอฝากขังต่อศาล\nตาม ป.วิ.อาญา ม.87',RED_D,13,11)

# support / merge row inside flow
card(490,842,510,68,'#EAF4FC',BLUE_E,'หากไม่มีหรือหลักประกันไม่เพียงพอ','ระบบเสนอผู้ค้ำ/ตำแหน่งหน้าที่ → ผู้ต้องหาหาหลักประกันเพิ่ม → ประเมินซ้ำ', '#245A8A',14,11)
card(1020,842,370,68,'#EAF4FC',BLUE_E,'ช่องทางช่วยเหลือ','เชื่อมกองทุนยุติธรรม\nรองรับ Offline เมื่อข้อมูลไม่ครบ', '#245A8A',14,11)

# right outcome panel
txt(1470,176,'RESULT  |  ผลลัพธ์',15,NAVY,True,'ma')
card(1455,202,290,105,GREEN,GREEN_E,'ประชาชน','ได้รับการพิจารณาทุกราย\nไม่ขึ้นกับความรู้หรือฐานะ\nมีทางออกเมื่อไม่มีหลักทรัพย์',GREEN_D,15,12,'people')
card(1455,325,290,105,BLUE,BLUE_E,'พนักงานสอบสวน','มีเกณฑ์และหลักฐานรองรับ\nลดความเสี่ยงทางวินัย\nลดข้อครหา 2 มาตรฐาน','#245A8A',15,12,'officer')
card(1455,448,290,105,PURPLE,PURPLE_E,'ระบบยุติธรรม','ลดผู้ต้องขังระหว่างสอบสวน\nลดภาระควบคุมตัว\nเพิ่มความเชื่อมั่น','#4F439A',15,12,'system')
rounded(1455,590,290,142,NAVY,NAVY,18,1)
txt(1600,616,'PRINCIPLE',12,'#A9C9E4',True,'mm')
txt(1600,650,'แยกทางเดินด้วย “ระดับความเสี่ยง”',14,WHITE,True,'mm')
txt(1600,685,'ไม่ใช่ฐานะทางเศรษฐกิจ\nหรือความสามารถในการร้องขอ',13,'#DCEBF7',False,'mm')
pill(1483,770,234,'เป้าหมาย: ปล่อยชั่วคราวภายใน 48 ชม.',GREEN,GREEN_E,GREEN_D)

# footer implementation strip
rounded(55,1015,1690,118,'#EDF3F6','#C8D5DC',20,2)
txt(80,1040,'นำไปสู่การปฏิบัติ',15,NAVY,True)
items=[('ระเบียบ','กำหนดหน้าที่ประเมินทุกกรณี'),('ข้อมูล','กำหนดสิทธิ์เข้าถึง/MOU'),('บุคลากร','อบรมแบบประเมินและระบบ'),('ติดตาม','KPI + ตรวจสอบผลเป็นระยะ')]
for i,(a,b) in enumerate(items):
    x=300+i*350; pill(x,1040,110,a,BLUE,BLUE_E,'#245A8A'); txt(x+125,1055,b,12,INK,False,'lm')
txt(872,1112,'Process & System Innovation  |  เปลี่ยนบทบาทรัฐจาก Passive → Active',12,MUTED,False,'mm')

im.save(PNG,quality=96)
pw,ph=landscape(A3); c=canvas.Canvas(PDF,pagesize=(pw,ph)); c.drawImage(ImageReader(PNG),0,0,width=pw,height=ph,preserveAspectRatio=True,anchor='c'); c.save()
print('created')
