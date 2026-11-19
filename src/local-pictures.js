// Original uploads never leave this device. Keep only small keys/labels in draft JSON;
// store resized, metadata-free pixels separately from a poster's immutable brand assets.
import { uid } from './storage.js';
let dbPromise;
function database() {
  if (!dbPromise)
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open('astrosivam-deity-pictures', 1);
      req.onupgradeneeded = () => req.result.createObjectStore('pictures');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(Error('Picture storage is unavailable on this device.'));
    }).catch((e) => {
      dbPromise = undefined;
      throw e;
    });
  return dbPromise;
}
async function decode(blob) {
  const url = URL.createObjectURL(blob);
  try {
    const im = new Image();
    im.src = url;
    await im.decode();
    return im;
  } finally {
    URL.revokeObjectURL(url);
  }
}
export async function importPictures(files) {
  const list = Array.from(files || []);
  if (!list.length || list.length > 12) throw Error('Choose 1 to 12 pictures for this collection.');
  const result = [];
  for (const file of list) {
    if (
      !['image/png', 'image/jpeg', 'image/webp'].includes(file.type) ||
      file.size > 16 * 1024 * 1024
    )
      throw Error('Choose JPG, PNG or WebP pictures under 16 MB each.');
    let im;
    try {
      im = await decode(file);
    } catch {
      throw Error('This picture could not be read. Try a JPG, PNG or WebP file.');
    }
    const k = Math.min(1, 1600 / Math.max(im.naturalWidth, im.naturalHeight)),
      c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(im.naturalWidth * k));
    c.height = Math.max(1, Math.round(im.naturalHeight * k));
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fffbf2';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(im, 0, 0, c.width, c.height);
    const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.9));
    if (!blob) throw Error('Could not prepare this picture.');
    result.push({
      id: uid(),
      label: file.name.replace(/\.[^.]*$/, '').slice(0, 55) || 'My picture',
      blob,
    });
  }
  const db = await database();
  await new Promise((resolve, reject) => {
    const tx = db.transaction('pictures', 'readwrite');
    tx.oncomplete = resolve;
    tx.onabort = tx.onerror = () =>
      reject(Error('There is not enough device storage to save these pictures.'));
    for (const { id, blob } of result) tx.objectStore('pictures').add(blob, id);
  });
  return result.map(({ id, label }) => ({ id, label }));
}
export async function localBlob(id) {
  const db = await database();
  const blob = await new Promise((resolve, reject) => {
    const r = db.transaction('pictures').objectStore('pictures').get(id);
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(Error('Could not read this device picture.'));
  });
  if (!(blob instanceof Blob))
    throw Error('This device picture is missing. Choose another picture before exporting.');
  return blob;
}
export async function localImage(id) {
  return decode(await localBlob(id));
}
export async function discardPictures(pics) {
  const db = await database();
  const tx = db.transaction('pictures', 'readwrite');
  for (const p of pics) tx.objectStore('pictures').delete(p.id);
  return new Promise((resolve, reject) => {
    tx.oncomplete = resolve;
    tx.onabort = tx.onerror = reject;
  });
}
