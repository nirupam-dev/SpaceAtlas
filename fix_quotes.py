import re

with open('src/lib/data.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'description:' in line or 'biography:' in line:
        key_match = re.search(r'^\s*(description|biography):\s*', line)
        if key_match:
            key = key_match.group(0)
            val = line[len(key):].strip()
            
            if val.endswith(','):
                val = val[:-1].strip()
            if val.startswith('"'):
                val = val[1:]
            if val.endswith('"'):
                val = val[:-1]
                
            # Strip all interior quotes and backslashes to ensure valid syntax
            val = val.replace('"', '').replace('\\', '')
            
            lines[i] = key + '"' + val + '",\n'

with open('src/lib/data.ts', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Fixed quotes in data.ts!")
