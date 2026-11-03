with open(r'frontend/src/app/dashboard/layout.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the bad comment that is inside JSX attributes
bad = '                                    {/* \u26a1 [LIVE CODING] PLACEHOLDER SEARCH BAR GLOBAL - ganti teks abu-abu di sini */}\n                                    placeholder='
good = '                                    placeholder='

if bad in content:
    content = content.replace(bad, good, 1)
    # Now add comment before the <input line
    content = content.replace(
        '                                <input ',
        '                                {/* \u26a1 [LIVE CODING] PLACEHOLDER SEARCH BAR GLOBAL - ganti teks abu-abu di sini */}\n                                <input ',
        1
    )
    with open(r'frontend/src/app/dashboard/layout.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print('OK: layout.tsx fixed')
else:
    print('Pattern not found')
