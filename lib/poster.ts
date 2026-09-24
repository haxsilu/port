// Deterministic grayscale placeholder "poster" gradients, keyed by film id.
// Swap Filmography/FeaturedWork's placeholder <div> for a real <Image> when artwork exists.
function hash(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h << 5) - h + id.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function posterGradient(id: string) {
  const h = hash(id);
  const angle = h % 360;
  const stop1 = 6 + (h % 10);
  const stop2 = 18 + ((h >> 3) % 22);
  const stop3 = 4 + ((h >> 6) % 8);
  return `linear-gradient(${angle}deg, rgba(${stop1},${stop1},${stop1},1) 0%, rgba(${stop2},${stop2},${stop2},1) 45%, rgba(${stop3},${stop3},${stop3},1) 100%)`;
}
