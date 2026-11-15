// Hero loops: data-loop on a <video> plays a short, muted loop only while it is on screen and the tab is
// visible. Under reduced motion or Save-Data it holds on its poster until the person presses play. A
// button with data-loop-toggle next to the video pauses and resumes it (WCAG 2.2.2), and a pause by the
// person sticks. Markup and how to make the clip for free: references/hero-video.md.

const saveData = () => navigator.connection?.saveData === true;

export function loop(el, ctx) {
  if (el.tagName !== 'VIDEO') throw new Error('data-loop belongs on a <video> element');
  Object.assign(el, { muted: true, defaultMuted: true, loop: true, playsInline: true });
  el.setAttribute('playsinline', '');
  const toggle = el.parentElement?.querySelector('[data-loop-toggle]') ?? null;
  let held = ctx.reduced || saveData();
  let visible = false;

  const sync = () => {
    const run = visible && !held && !document.hidden;
    if (run) el.play()?.catch(() => el.setAttribute('data-loop-blocked', ''));
    else el.pause();
    el.toggleAttribute('data-loop-on', run);
    toggle?.setAttribute('aria-pressed', String(held));
  };
  const onToggle = () => { held = !held; sync(); };
  const onPlaying = () => el.setAttribute('data-loop-played', '');

  if (held) el.pause();
  toggle?.addEventListener('click', onToggle);
  el.addEventListener('playing', onPlaying);
  document.addEventListener('visibilitychange', sync);
  const unwatch = ctx.watch(el, (isVisible) => { visible = isVisible; sync(); }, { margin: '0px' });
  sync();

  return () => {
    unwatch();
    el.pause();
    toggle?.removeEventListener('click', onToggle);
    el.removeEventListener('playing', onPlaying);
    document.removeEventListener('visibilitychange', sync);
    el.removeAttribute('data-loop-on');
  };
}
