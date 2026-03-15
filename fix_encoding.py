import os, glob

dirs = ['d:/projects/SJG-/frontend/client/pages', 'd:/projects/SJG-/frontend/admin/pages']
for d in dirs:
    for f in glob.glob(os.path.join(d, '*.js')):
        with open(f, 'rb') as fh:
            raw = fh.read()
        
        text = raw.decode('utf-8', errors='replace')
        
        patterns_to_fix = [
            ('\u00c3\u00a2\u00e2\u20ac\u0161\u00c2\u00b9', '\u20b9'),
            ('\u00e2\u201a\u00b9', '\u20b9'),
            ('\u00c3\u00a2\u00e2\u201a\u00ac\u0161\u00c2\u00b9', '\u20b9'),
        ]
        
        changed = False
        for pat, rep in patterns_to_fix:
            if pat in text:
                text = text.replace(pat, rep)
                changed = True
        
        if changed:
            with open(f, 'w', encoding='utf-8', newline='\n') as fh:
                fh.write(text)
            print(f'Fixed: {os.path.basename(f)}')
        else:
            print(f'OK: {os.path.basename(f)}')

print('Done!')
