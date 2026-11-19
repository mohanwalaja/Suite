"""Bundle the OFL-licensed Devanagari subset, including a shaping-capable font for canvas."""
import io, json, pathlib, tarfile, urllib.request
base = 'https://registry.npmjs.org/@fontsource/noto-sans-devanagari/'
info = json.load(urllib.request.urlopen(base+'latest', timeout=15))
with tarfile.open(fileobj=io.BytesIO(urllib.request.urlopen(info['dist']['tarball'], timeout=25).read()), mode='r:gz') as tar:
    root = pathlib.Path('public/fonts')
    (root/'devanagari.woff2').write_bytes(tar.extractfile('package/files/noto-sans-devanagari-devanagari-400-normal.woff2').read())
    (root/'licenses/noto-sans-devanagari.txt').write_bytes(tar.extractfile('package/LICENSE').read())
