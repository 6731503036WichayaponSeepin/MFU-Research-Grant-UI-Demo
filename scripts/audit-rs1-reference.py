"""Read-only comparison of the supplied DOCX with the exact runtime content catalogue."""
import csv
import hashlib
import json
from pathlib import Path
import re
import sys
import xml.etree.ElementTree as ET
import zipfile

source = Path(sys.argv[1])
output = Path(sys.argv[2] if len(sys.argv) > 2 else 'tmp/rs1-strict')
output.mkdir(parents=True, exist_ok=True)
catalogue = Path('src/data/rs1Document.js').read_text(encoding='utf-8')
nodes = json.loads(catalogue.split('export const rs1Document = ', 1)[1].split('\nexport const rs1DocumentFields', 1)[0])
fields = json.loads(catalogue.split('export const rs1DocumentFields = ', 1)[1].split('\nexport const rs1WebFields',1)[0])
ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}

def normalize(value):
    value = re.sub(r'^\d+(?:\.\d+)*[.]?\s+', '', value)
    return re.sub(r'\s+', ' ', value.replace('✓', '').replace('□', '')).replace(' )', ')').strip()

def english(value):
    result = []
    if isinstance(value, dict):
        for key, item in value.items():
            if key in ['en', 'title', 'caption', 'total'] and isinstance(item, str):
                result.append(item)
            elif key == 'headers':
                result.extend(item)
            elif isinstance(item, (list, dict)):
                result.extend(english(item))
    elif isinstance(value, list):
        for item in value:
            result.extend(english(item))
    return result

implemented = {normalize(text) for text in english(nodes)}
rows = []
with zipfile.ZipFile(source) as package:
    body = ET.fromstring(package.read('word/document.xml')).find('w:body', ns)
    for element in body:
        if element.tag.endswith('}p'):
            texts = [''.join(t.text or '' for t in element.findall('.//w:t', ns)).strip()]
        elif element.tag.endswith('}tbl'):
            texts = [''.join(t.text or '' for t in cell.findall('.//w:t', ns)).strip() for row in element.findall('w:tr', ns) for cell in row.findall('w:tc', ns)]
        else:
            continue
        for text in texts:
            if not text or re.fullmatch(r'[\d\s.…_()\-]+', text) or text.startswith('Date '):
                continue
            status = 'PASS' if normalize(text) in implemented else 'FAIL'
            rows.append({'source_text': text, 'status': status})

with (output / 'SOURCE_LINE_COMPARISON.csv').open('w', encoding='utf-8-sig', newline='') as stream:
    writer = csv.DictWriter(stream, fieldnames=['source_text', 'status'])
    writer.writeheader()
    writer.writerows(rows)
with (output / 'FIELD_COMPARISON.csv').open('w', encoding='utf-8-sig', newline='') as stream:
    writer = csv.DictWriter(stream, fieldnames=['key', 'original_english', 'thai_translation', 'type'])
    writer.writeheader()
    writer.writerows({'key': f['key'], 'original_english': f['en'], 'thai_translation': f['th'], 'type': f['type']} for f in fields)
result = {'source': str(source), 'sha256': hashlib.sha256(source.read_bytes()).hexdigest(), 'source_lines': len(rows), 'fields': len(fields), 'failures': [row for row in rows if row['status'] == 'FAIL']}
(output / 'source-audit.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(result, ensure_ascii=False))
sys.exit(bool(result['failures']))
