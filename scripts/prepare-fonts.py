"""Bundle the Latin display faces and their licenses from Fontsource's npm packages."""
import concurrent.futures, io, json, pathlib, tarfile, urllib.request
faces = ['Cormorant Garamond','Cinzel','Playfair Display','Lora','Marcellus','Fraunces','Prata','Bodoni Moda','Libre Baskerville','Alegreya','Cormorant','Forum','Spectral','DM Serif Display','Gilda Display','Bellefair','Vollkorn','Cardo','EB Garamond','Crimson Text','Italiana','Philosopher','Yeseva One','Alice','Noto Serif','Kaisei Decol','Vidaloka','Old Standard TT','Fanwood Text','Gentium Plus','Newsreader','Gelasio','Sorts Mill Goudy','Neuton','Amiri','Oranienbaum','Playfair','Lustria','Quattrocento','Halant','Outfit','Manrope','Sora','Montserrat','Josefin Sans','Raleway','Space Grotesk','Urbanist','Jost','Mulish']
out = pathlib.Path('public/fonts'); out.mkdir(exist_ok=True); (out/'licenses').mkdir(exist_ok=True)
def get_face(name):
    slug=name.lower().replace(' ','-'); base='https://registry.npmjs.org/@fontsource/'+slug
    info=json.load(urllib.request.urlopen(base+'/latest',timeout=20)); data=urllib.request.urlopen(info['dist']['tarball'],timeout=40).read()
    with tarfile.open(fileobj=io.BytesIO(data),mode='r:gz') as t:
        f=t.extractfile('package/files/'+slug+'-latin-400-normal.woff2'); (out/(slug+'.woff2')).write_bytes(f.read())
        license=next((n for n in t.getnames() if n.lower() in ['package/license','package/ofl.txt','package/license.txt']),None)
        if license: (out/'licenses'/(slug+'.txt')).write_bytes(t.extractfile(license).read())
    return "@font-face{font-family:'%s';font-style:normal;font-weight:400;src:url('/fonts/%s.woff2') format('woff2');font-display:swap;}"%(name,slug)
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as e: css=list(e.map(get_face,faces))
(out/'fonts.css').write_text('\n'.join(css)+'\n'); pathlib.Path('src/fonts.json').write_text(json.dumps(faces,indent=2)+'\n'); print('Bundled',len(faces),'licensed fonts')
