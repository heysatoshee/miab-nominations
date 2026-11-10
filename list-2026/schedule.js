// The run: one name each weekday from #21 to #4, then #3, #2 and #1 together at the conference.
(() => {
  const FIRST = new Date(Date.UTC(2026, 10, 10));
  const fmt = (d) => new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }).format(d);
  const when = {}; const days = [];
  let d = new Date(FIRST);
  for (let rank = 21; rank >= 4; rank--) {
    while ([0, 6].includes(d.getUTCDay())) d = new Date(+d + 864e5);
    when[rank] = fmt(d); days.push({ rank, date: new Date(d), label: fmt(d) });
    d = new Date(+d + 864e5);
  }
  const AT_CONF = 'At the conference';
  [3, 2, 1].forEach((r) => (when[r] = AT_CONF));
  const q = new URLSearchParams(location.search).get('day');
  const LAST = days.length; // index of conference day
  const day = Math.max(0, Math.min(LAST, q === null ? 3 : +q));
  Object.assign(window, {
    DAYS: days, LAST_DAY: LAST, DAY: day, AT_CONF,
    isConference: day === LAST,
    isOut: (p) => day === LAST || p.rank >= 21 - day,
    isNew: (p) => (day === LAST ? p.rank <= 3 : p.rank === 21 - day),
    whenOut: (rank) => when[rank],
    nextUp: day >= LAST - 1 ? (day === LAST ? 'All 21 revealed' : 'Top 3: live at the conference') : `Next name: ${days[day + 1].label}`,
    OUT_COUNT: day === LAST ? 21 : day + 1,
  });
})();
