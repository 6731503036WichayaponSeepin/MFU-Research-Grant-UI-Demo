import json,subprocess
from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
root=Path('output/advisor-demo');qa=root/'qa';qa.mkdir(exist_ok=True)
poppler=Path(r'C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/Library/bin')
files=sorted(root.glob('*.pdf'));pages=[]
for file in files:
    prefix=qa/file.stem
    subprocess.run([str(poppler/'pdftoppm.exe'),'-scale-to','1000','-png',str(file),str(prefix)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
    pages.extend(sorted(qa.glob(file.stem+'-*.png')))
for offset in range(0,len(pages),4):
    selected=pages[offset:offset+4];sheet=Image.new('RGB',(1420,2040),'#e8e8e8');draw=ImageDraw.Draw(sheet)
    for j,path in enumerate(selected):
        im=Image.open(path).convert('RGB');im.thumbnail((690,970));x=10+(j%2)*710;y=35+(j//2)*1020;sheet.paste(im,(x,y));draw.text((x,y-22),path.name,fill='black')
    sheet.save(qa/f'contact-{offset//4+1:02}.jpg')
print(json.dumps({'pdfs':len(files),'renderedPages':len(pages),'contactSheets':(len(pages)+3)//4}))
