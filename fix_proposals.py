with open(r'frontend/src/app/dashboard/proposals/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find line 646 (0-indexed: 645) - the && ( line with comment inside
# Fix: move comment from line 647 to before line 646
out = []
i = 0
while i < len(lines):
    line = lines[i]
    # Detect the bad pattern: && ( followed by {/* comment */} then <button
    stripped = line.strip()
    if "hasPermission('batal verifikasi')" in line and "proposal.status === 'VERIFIED'" in line:
        # Check next line is the misplaced comment
        next_line = lines[i+1] if i+1 < len(lines) else ''
        if '{/*' in next_line and 'WARNA TOMBOL' in next_line:
            # Insert comment before this line, then skip comment line
            indent = '                                     '
            out.append(next_line.rstrip('\r\n') + '\n')  # comment first
            out.append(line)   # then the && ( line
            i += 2  # skip comment line
            continue
    out.append(line)
    i += 1

with open(r'frontend/src/app/dashboard/proposals/page.tsx', 'w', encoding='utf-8', newline='') as f:
    f.writelines(out)

print('Done')
