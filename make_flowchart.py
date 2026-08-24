from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.pagesizes import A3, landscape
from PIL import Image, ImageDraw, ImageFont
import os, math

OUT = r'C:\Users\tongd\ยธต 1 - กาสะลอง'
PDF = os.path.join(OUT, 'Flow_Chart_นวัตกรรม_แยกเขียว_เหลือง_แดง.pdf')
PNG = os.path.join(OUT, 'Flow_Chart_นวัตกรรม_แยกเขียว_เหลือง_แดง.png')
TAHOMA = r'C:\Windows\Fonts\tahoma.ttf'; TAHOMA_B = r'C:\Windows\Fonts\tahomabd.ttf'
W,H = landscape(A3)

navy='#18324A'; ink='#243746'; muted='#667785'; line='#91A0AA'; bg='#F7F9FB'
green='#DDF4E9'; green_e='#2C9A6B'; green_d='#146B4A'
yellow='#FFF0C9'; yellow_e='#D99A16'; yellow_d='#8A5A00'
red='#FCE0E0'; red_e='#C94B4B'; red_d='#8E2727'
blue='#E6F0FA'; blue_e='#4B83B5'; purple='#EEEAFE'; purple_e='#7566C5'
def hx(x): return HexColor(x)
pdfmetrics.registerFont(TTFont('Tahoma', TAHOMA)); pdfmetrics.registerFont(TTFont('Tahoma-Bold', TAHOMA_B))

def draw_pdf():
 c=canvas.Canvas(PDF,pagesize=(W,H)); c.setFillColor(hx(bg)); c.rect(0,0,W,H,fill=1,stroke=0)
 def text(x,y,s,size=14,col=ink,b=False): c.setFillColor(hx(col)); c.setFont('Tahoma-Bold' if b else 'Tahoma',size); c.drawCentredString(x,y,s)
 def box(x,y,w,h,fill,edge,t,sub=None,col=ink):
  c.setFillColor(hx(fill)); c.setStrokeColor(hx(edge)); c.setLineWidth(1.5); c.roundRect(x,y,w,h,14,fill=1,stroke=1); text(x+w/2,y+h/2+6,t,13,col,True)
  if sub: text(x+w/2,y+h/2-14,sub,10,col)
 def arrow(x1,y1,x2,y2,col=line):
  c.setStrokeColor(hx(col)); c.setFillColor(hx(col)); c.setLineWidth(2); c.line(x1,y1,x2,y2); a=math.atan2(y2-y1,x2-x1); q=8; p=c.beginPath(); p.moveTo(x2,y2); p.lineTo(x2-q*math.cos(a-math.pi/6),y2-q*math.sin(a-math.pi/6)); p.lineTo(x2-q*math.cos(a+math.pi/6),y2-q*math.sin(a+math.pi/6)); p.close(); c.drawPath(p,fill=1,stroke=0)
 margin=42; c.setFillColor(hx(navy)); c.setFont('Tahoma-Bold',23); c.drawString(margin,H-50,'FLOW CHART  |  กระบวนการทำงานของนวัตกรรม'); c.setFillColor(hx(muted)); c.setFont('Tahoma',13); c.drawString(margin,H-76,'การเพิ่มประสิทธิภาพกระบวนการปล่อยตัวชั่วคราวในชั้นสอบสวน')
 c.setFillColor(hx('#EAF1F5')); c.setStrokeColor(hx('#B8C8D2')); c.roundRect(W-255,H-74,205,30,15,fill=1,stroke=1); text(W-152,H-63,'เป้าหมาย: ภายใน 48 ชั่วโมง',10,navy,True)
 cw=450; ch=54; cx=(W-cw)/2; ys=[H-145,H-225,H-305]
 box(cx,ys[0],cw,ch,'#F0EEE8','#C9C3B5','1  รับตัวผู้ต้องหา','แจ้งสิทธิตามขั้นตอนปกติ')
 box(cx,ys[1],cw,ch,blue,blue_e,'2  ดึงข้อมูลจากระบบภาครัฐ','ทรัพย์สิน  •  ประวัติ  •  สถานะคดี','#245A8A')
 box(cx,ys[2],cw,ch,purple,purple_e,'3  ประเมินความเสี่ยงมาตรฐาน','ดำเนินการทุกกรณี ไม่ต้องรอคำร้อง','#4F439A')
 arrow(cx+cw/2,ys[0]-3,cx+cw/2,ys[1]+ch+3); arrow(cx+cw/2,ys[1]-3,cx+cw/2,ys[2]+ch+3)
 lw=285; xg=55; xy=xg+lw+45; xr=xy+lw+45; lh=52; ly=ys[2]-120; branch=ys[2]-40
 c.setStrokeColor(hx(line)); c.line(cx+cw/2,ys[2]-3,cx+cw/2,branch); c.line(xg+lw/2,branch,xr+lw/2,branch)
 for x in (xg+lw/2,xy+lw/2,xr+lw/2): arrow(x,branch,x,ly+lh+4)
 box(xg,ly,lw,lh,green,green_e,'สีเขียว  |  ความเสี่ยงต่ำ','ทางเดินเร่งรัด',green_d); box(xy,ly,lw,lh,yellow,yellow_e,'สีเหลือง  |  ความเสี่ยงปานกลาง','ทางเดินมีหลักประกัน',yellow_d); box(xr,ly,lw,lh,red,red_e,'สีแดง  |  ความเสี่ยงสูง','ทางเดินกำกับเข้ม',red_d)
 sh=52; by=ly-78; by2=by-66; by3=by2-66
 for x,fill,edge,dark,t,sub,y in [(xg,green,green_e,green_d,'4  ปล่อยตัวทันที','ไม่ต้องเรียกหลักประกัน',by),(xy,yellow,yellow_e,yellow_d,'4  คำนวณหลักประกัน','ต้องใช้เท่าใด  •  ขาดเท่าใด',by),(xy,yellow,yellow_e,yellow_d,'5  แจ้งผลเป็นหนังสือ','ให้ลงชื่อรับทราบ',by2),(xy,'#FFF6DF',yellow_e,yellow_d,'6  หากหลักประกันไม่พอ','เชื่อมกลไกช่วยเหลือ',by3),(xr,red,red_e,red_d,'4  คำนวณ + ตรวจเหตุจำเป็น','หลักประกันและความเสี่ยง',by),(xr,red,red_e,red_d,'5  แจ้งผลเป็นหนังสือ','ให้ลงชื่อรับทราบ',by2),(xr,red,red_e,red_d,'6  เชื่อมกลไกช่วยเหลือ','กองทุนยุติธรรม / บุคคล / ตำแหน่ง',by3)]: box(x,y,lw,sh,fill,edge,t,sub,dark)
 for x,n,col in [(xg,by,green_e),(xy,by,yellow_e),(xy,by2,yellow_e),(xy,by3,yellow_e),(xr,by,red_e),(xr,by2,red_e),(xr,by3,red_e)]: arrow(x+lw/2,ly-3 if n==by else n+sh+3,x+lw/2,n+sh+3 if n==by else n+sh+3,col) if n==by and x==xg else None
 # Explicit vertical arrows
 arrow(xg+lw/2,ly-3,xg+lw/2,by+sh+4,green_e); arrow(xy+lw/2,ly-3,xy+lw/2,by+sh+4,yellow_e); arrow(xy+lw/2,by2+sh+4,xy+lw/2,by2+sh+4,yellow_e)
 arrow(xy+lw/2,by+sh+3,xy+lw/2,by2+sh+4,yellow_e); arrow(xy+lw/2,by2+sh+3,xy+lw/2,by3+sh+4,yellow_e); arrow(xr+lw/2,ly-3,xr+lw/2,by+sh+4,red_e); arrow(xr+lw/2,by+sh+3,xr+lw/2,by2+sh+4,red_e); arrow(xr+lw/2,by2+sh+3,xr+lw/2,by3+sh+4,red_e)
 out_y=30; out_h=50; out_w=470; out_x=(W-out_w)/2; merge=out_y+out_h+30
 for x,y,col in [(xg+lw/2,by,green_e),(xy+lw/2,by3,yellow_e),(xr+lw/2,by3,red_e)]: c.setStrokeColor(hx(col)); c.setLineWidth(2); c.line(x,y-3,x,merge); c.line(x,merge,out_x+out_w/2,merge)
 arrow(out_x+out_w/2,merge,out_x+out_w/2,out_y+out_h+3,navy); box(out_x,out_y,out_w,out_h,'#E6F5F0',green_e,'ปล่อยตัวชั่วคราว','ภายในกรอบเวลา 48 ชั่วโมง',green_d)
 c.setFillColor(hx(muted)); c.setFont('Tahoma',9); c.drawString(margin,12,'เกณฑ์แยกทางเดิน: ระดับความเสี่ยงที่ประเมินได้ตามเหตุที่กฎหมายกำหนด ไม่ใช่ฐานะทางเศรษฐกิจ'); c.save()

def draw_png():
 scale=2; im=Image.new('RGB',(int(W*scale),int(H*scale)),(247,249,251)); d=ImageDraw.Draw(im)
 def C(v): return tuple(int(v[i:i+2],16) for i in (1,3,5))
 def F(sz,b=False): return ImageFont.truetype(TAHOMA_B if b else TAHOMA,int(sz*scale))
 def text(x,y,s,sz=14,col=ink,b=False,anc='mm'): d.text((int(x*scale),int((H-y)*scale)),s,font=F(sz,b),fill=C(col),anchor=anc)
 def box(x,y,w,h,fill,edge,t,sub=None,col=ink): d.rounded_rectangle((int(x*scale),int((H-y-h)*scale),int((x+w)*scale),int((H-y)*scale)),radius=28,fill=C(fill),outline=C(edge),width=3); text(x+w/2,y+h/2+6,t,13,col,True); sub and text(x+w/2,y+h/2-14,sub,10,col)
 def arrow(x1,y1,x2,y2,col=line):
  d.line((x1*scale,(H-y1)*scale,x2*scale,(H-y2)*scale),fill=C(col),width=4); a=math.atan2(y2-y1,x2-x1); q=8; d.polygon([(x2*scale,(H-y2)*scale),((x2-q*math.cos(a-math.pi/6))*scale,(H-(y2-q*math.sin(a-math.pi/6)))*scale),((x2-q*math.cos(a+math.pi/6))*scale,(H-(y2-q*math.sin(a+math.pi/6)))*scale)],fill=C(col))
 margin=42; text(margin,H-50,'FLOW CHART  |  กระบวนการทำงานของนวัตกรรม',23,navy,True,'la'); text(margin,H-76,'การเพิ่มประสิทธิภาพกระบวนการปล่อยตัวชั่วคราวในชั้นสอบสวน',13,muted,False,'la'); box(W-255,H-74,205,30,'#EAF1F5','#B8C8D2','เป้าหมาย: ภายใน 48 ชั่วโมง',None,navy)
 cw=450; ch=54; cx=(W-cw)/2; ys=[H-145,H-225,H-305]; box(cx,ys[0],cw,ch,'#F0EEE8','#C9C3B5','1  รับตัวผู้ต้องหา','แจ้งสิทธิตามขั้นตอนปกติ'); box(cx,ys[1],cw,ch,blue,blue_e,'2  ดึงข้อมูลจากระบบภาครัฐ','ทรัพย์สิน  •  ประวัติ  •  สถานะคดี','#245A8A'); box(cx,ys[2],cw,ch,purple,purple_e,'3  ประเมินความเสี่ยงมาตรฐาน','ดำเนินการทุกกรณี ไม่ต้องรอคำร้อง','#4F439A'); arrow(cx+cw/2,ys[0]-3,cx+cw/2,ys[1]+ch+3); arrow(cx+cw/2,ys[1]-3,cx+cw/2,ys[2]+ch+3)
 lw=285; xg=55; xy=xg+lw+45; xr=xy+lw+45; lh=52; ly=ys[2]-120; branch=ys[2]-40; d.line((cx*scale,(H-ys[2]+3)*scale,cx*scale,(H-branch)*scale),fill=C(line),width=4); d.line((xg*scale+lw*scale/2,(H-branch)*scale,(xr+lw/2)*scale,(H-branch)*scale),fill=C(line),width=4)
 for x in (xg+lw/2,xy+lw/2,xr+lw/2): arrow(x,branch,x,ly+lh+4)
 box(xg,ly,lw,lh,green,green_e,'สีเขียว  |  ความเสี่ยงต่ำ','ทางเดินเร่งรัด',green_d); box(xy,ly,lw,lh,yellow,yellow_e,'สีเหลือง  |  ความเสี่ยงปานกลาง','ทางเดินมีหลักประกัน',yellow_d); box(xr,ly,lw,lh,red,red_e,'สีแดง  |  ความเสี่ยงสูง','ทางเดินกำกับเข้ม',red_d)
 sh=52; by=ly-78; by2=by-66; by3=by2-66
 entries=[(xg,by,green,green_e,green_d,'4  ปล่อยตัวทันที','ไม่ต้องเรียกหลักประกัน'),(xy,by,yellow,yellow_e,yellow_d,'4  คำนวณหลักประกัน','ต้องใช้เท่าใด  •  ขาดเท่าใด'),(xy,by2,yellow,yellow_e,yellow_d,'5  แจ้งผลเป็นหนังสือ','ให้ลงชื่อรับทราบ'),(xy,by3,'#FFF6DF',yellow_e,yellow_d,'6  หากหลักประกันไม่พอ','เชื่อมกลไกช่วยเหลือ'),(xr,by,red,red_e,red_d,'4  คำนวณ + ตรวจเหตุจำเป็น','หลักประกันและความเสี่ยง'),(xr,by2,red,red_e,red_d,'5  แจ้งผลเป็นหนังสือ','ให้ลงชื่อรับทราบ'),(xr,by3,red,red_e,red_d,'6  เชื่อมกลไกช่วยเหลือ','กองทุนยุติธรรม / บุคคล / ตำแหน่ง')]
 for e in entries: box(e[0],e[1],lw,sh,e[2],e[3],e[5],e[6],e[4]);
 arrow(xg+lw/2,ly-3,xg+lw/2,by+sh+4,green_e); arrow(xy+lw/2,ly-3,xy+lw/2,by+sh+4,yellow_e); arrow(xy+lw/2,by+sh+3,xy+lw/2,by2+sh+4,yellow_e); arrow(xy+lw/2,by2+sh+3,xy+lw/2,by3+sh+4,yellow_e); arrow(xr+lw/2,ly-3,xr+lw/2,by+sh+4,red_e); arrow(xr+lw/2,by+sh+3,xr+lw/2,by2+sh+4,red_e); arrow(xr+lw/2,by2+sh+3,xr+lw/2,by3+sh+4,red_e)
 out_y=30; out_h=50; out_w=470; out_x=(W-out_w)/2; merge=out_y+out_h+30
 for x,y,col in [(xg+lw/2,by,green_e),(xy+lw/2,by3,yellow_e),(xr+lw/2,by3,red_e)]: d.line((x*scale,(H-(y-3))*scale,x*scale,(H-merge)*scale),fill=C(col),width=4); d.line((x*scale,(H-merge)*scale,(out_x+out_w/2)*scale,(H-merge)*scale),fill=C(col),width=4)
 arrow(out_x+out_w/2,merge,out_x+out_w/2,out_y+out_h+3,navy); box(out_x,out_y,out_w,out_h,'#E6F5F0',green_e,'ปล่อยตัวชั่วคราว','ภายในกรอบเวลา 48 ชั่วโมง',green_d); text(margin,12,'เกณฑ์แยกทางเดิน: ระดับความเสี่ยงที่ประเมินได้ตามเหตุที่กฎหมายกำหนด ไม่ใช่ฐานะทางเศรษฐกิจ',9,muted,False,'la'); im.save(PNG,optimize=True)

draw_pdf(); draw_png(); print(PDF); print(PNG)
