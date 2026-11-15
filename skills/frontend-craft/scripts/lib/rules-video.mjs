// Videos that move on their own: hero loops and autoplaying clips. Pure, so every rule is unit-testable.

const f = (level, id, msg, fix) => ({ level, id, msg, fix });
const names = (list) => list.slice(0, 3).map((v) => v.src || 'video').join(', ');

/** @param {{ richness?: { loops?: object[] }, reducedVideos?: string[] }} facts */
export function videoRules({ richness, reducedVideos = [] }) {
  const out = [];
  const loops = richness?.loops ?? [];
  if (reducedVideos.length) out.push(f('FAIL', 'video-reduced', `with reduced motion this video still plays: ${reducedVideos.slice(0, 3).join(', ')}`, 'put data-loop on the video and load craft-motion.js (it holds on the poster under reduced motion), or pause it under prefers-reduced-motion; drop the autoplay attribute'));
  const loud = loops.filter((v) => !v.muted);
  if (loud.length) out.push(f('FAIL', 'video-muted', `${loud.length} autoplaying video(s) with sound: ${names(loud)}`, 'browsers block autoplay with sound; add muted and playsinline, or use data-loop'));
  const stuck = loops.filter((v) => !v.toggle);
  if (stuck.length) out.push(f('WARN', 'video-pause', `${stuck.length} looping video(s) with no way to pause: ${names(stuck)}`, 'add <button type="button" data-loop-toggle aria-pressed="false">Pause</button> next to it (WCAG 2.2.2: motion over five seconds can be paused)'));
  const blank = loops.filter((v) => !v.poster);
  if (blank.length) out.push(f('WARN', 'video-poster', `${blank.length} looping video(s) without a poster: ${names(blank)}`, 'set poster= to its first frame (scripts/video.mjs writes one); it shows before the clip loads, under reduced motion and on Save-Data'));
  return out;
}
