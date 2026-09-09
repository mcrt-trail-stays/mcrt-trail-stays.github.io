"""Build single-file HTML prototypes (dist/) for publishing as Artifacts.
Run:  py build.py          -> all three design variants
      py build.py b        -> one variant (a = Meadow, b = Journal, c = Trailhead)"""
import re, sys, pathlib
root = pathlib.Path(__file__).parent
VARIANTS = {
  'a': ('mass-central-trail-stays.html', 'Mass Central Trail Stays',
        'family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Public+Sans:wght@400;500;600;700;800'),
  'b': ('trail-stays-journal.html', 'Trail Stays Journal',
        'family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;0,9..144,800;1,9..144,500;1,9..144,700&family=Source+Sans+3:wght@400;500;600;700'),
  'c': ('trail-stays-trailhead.html', 'Trail Stays Trailhead',
        'family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=IBM+Plex+Sans:wght@400;500;600;700'),
  'd': ('trail-stays-depot.html', 'Trail Stays Depot',
        'family=Barlow+Condensed:wght@600;700;800&family=Barlow:wght@400;500;600;700'),
}
html = (root / 'index.html').read_text(encoding='utf-8')
css = (root / 'styles.css').read_text(encoding='utf-8')
data = (root / 'data.js').read_text(encoding='utf-8')
app = (root / 'app.js').read_text(encoding='utf-8')
body = re.search(r'<body>(.*)</body>', html, re.S).group(1)
body = re.sub(r'<script src="data\.js[^"]*"></script>\s*<script src="app\.js[^"]*"></script>', '', body)
(root / 'dist').mkdir(exist_ok=True)
for v in (sys.argv[1:] or list(VARIANTS)):
    name, title, fonts = VARIANTS[v]
    theme = (root / f'theme-{v}.css').read_text(encoding='utf-8') if v != 'a' else ''
    out = (f'<title>{title}</title>\n<link rel="preconnect" href="https://fonts.googleapis.com">\n'
           f'<link rel="stylesheet" href="https://fonts.googleapis.com/css2?{fonts}&display=swap">\n'
           '<style>\n' + css + '\n' + theme + '\n</style>\n' + body.strip() +
           f'\n<script>window.VARIANT = "{v}";</script>\n<script>\n' + data + '\n' + app + '\n</script>\n')
    (root / 'dist' / name).write_text(out, encoding='utf-8')
    # clean GitHub Pages URL per concept, e.g. /trailhead/
    slug = {'a': 'meadow', 'b': 'journal', 'c': 'trailhead', 'd': 'depot'}[v]
    (root / slug).mkdir(exist_ok=True)
    cut = out.index('</style>') + len('</style>')
    page = ('<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">\n'
            + out[:cut] + '\n</head>\n<body>\n' + out[cut:].strip() + '\n</body></html>\n')
    (root / slug / 'index.html').write_text(page, encoding='utf-8')
    print('wrote dist/' + name, len(out), 'bytes', '->', slug + '/index.html')
