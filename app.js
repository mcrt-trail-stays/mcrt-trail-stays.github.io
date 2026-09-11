/* ------------------------------------------------------------------
   Mass Central Trail Stays — prototype application
   Vanilla JS, hash-routed. The trip engine (miles/day → overnight
   stops → nearby lodging → multi-stay checkout) lives in planTrip().
------------------------------------------------------------------- */
(function () {
'use strict';

/* ---------- design variants ---------- */
const VARIANT = (typeof window !== 'undefined' && window.VARIANT) || 'a';
const PALETTES = {
  a: { skies: [['#CFE0EA', '#EEF4F0'], ['#D8E8E2', '#F4F7F4'], ['#E6EEF3', '#FFFFFF'], ['#C9DCE8', '#EEF3EF']], hills: ['#B7CFC0', '#86AE95', '#3F7F5A', '#22553A'], sun: '#F2D27A', tree: '#1E4A32',
       map: { bg: '#EEF3EF', land: '#E1E9E3', water: '#B9D3E3', trail: '#14532D', halo: '#FFFFFF', route: '#2F5F8A', connector: '#C08F2E', night: '#0B2E19', nightText: '#F2C766' } },
  b: { skies: [['#E5D9C3', '#F6F1E8'], ['#DED8C4', '#FBF8F1'], ['#EAD9C0', '#F6F1E8'], ['#D9D6C2', '#F1EBDF']], hills: ['#C4C7A6', '#8E9E77', '#5A6F4C', '#35452F'], sun: '#E9C98A', tree: '#2E3F2A',
       map: { bg: '#EFE8DA', land: '#E4DCC9', water: '#B7C9CF', trail: '#24483A', halo: '#FBF7EE', route: '#A6612C', connector: '#8C6A2E', night: '#1B2A24', nightText: '#E9C98A' } },
  c: { skies: [['#CDE4F2', '#F7F8F5'], ['#D6EBE2', '#FFFFFF'], ['#E3EEF5', '#F7F8F5'], ['#C2DCEB', '#EDF1EE']], hills: ['#B5D4C4', '#6FAE8C', '#2E8B63', '#1D5C43'], sun: '#FFD166', tree: '#164A36',
       map: { bg: '#EDF1EE', land: '#DFE7E1', water: '#B3D2E6', trail: '#0F6E56', halo: '#FFFFFF', route: '#F26B1D', connector: '#3D5A80', night: '#1C2430', nightText: '#FFB273' } },
  d: { skies: [['#E9E2D3', '#FBF7F0'], ['#DCE3E6', '#F4EFE5'], ['#EFE4CF', '#FBF7F0'], ['#D5DDE3', '#F1EDE3']], hills: ['#C9CBB2', '#93A483', '#4F6E52', '#2C4736'], sun: '#E8C36A', tree: '#274233',
       map: { bg: '#F1EDE3', land: '#E6E0D2', water: '#B8CBD6', trail: '#1F2F45', halo: '#FBF7F0', route: '#A8412F', connector: '#C9A15A', night: '#1F2F45', nightText: '#E8C36A' } }
};
const PAL = PALETTES[VARIANT] || PALETTES.a; const MC = PAL.map;

/* ---------- utilities ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const money = n => '$' + Math.round(n).toLocaleString('en-US');
const byId = id => LODGING.find(l => l.id === id);
const town = id => TOWNS.find(t => t.id === id);
const r1 = n => Math.round(n * 10) / 10;
const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;

function parseISO(iso) { const p = iso.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); }
function toISO(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function addDays(iso, n) { const d = parseISO(iso); d.setDate(d.getDate() + n); return toISO(d); }
function fmt(iso, style) {
  if (!iso) return '';
  const d = parseISO(iso);
  const o = style === 'long' ? { weekday: 'short', month: 'short', day: 'numeric' }
    : style === 'full' ? { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
    : { month: 'short', day: 'numeric' };
  return d.toLocaleDateString('en-US', o);
}
function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

/* ---------- live availability (simulated ResNexus feed) ---------- */
function avail(id, iso) {
  const p = byId(id); if (!p || !iso) return null;
  const h = hash(id + iso);
  const dow = parseISO(iso).getDay();
  let left = h % (p.rooms + 1);
  if (dow === 5 || dow === 6) left = Math.floor(left * 0.55);
  if (left === 0 && h % 7 !== 0) left = 1 + ((h >>> 8) % 2);
  return Math.min(left, p.rooms);
}
function availHTML(id, iso) {
  const n = avail(id, iso);
  if (n === null) return '<span class="avail muted">Pick a date for live availability</span>';
  if (n === 0) return `<span class="avail none">Sold out · ${fmt(iso)}</span>`;
  if (n <= 2) return `<span class="avail low">Only ${n} ${n > 1 ? 'rooms' : 'room'} left · ${fmt(iso)}</span>`;
  return `<span class="avail ok">${n} rooms available · ${fmt(iso)}</span>`;
}

/* ---------- illustrated photo placeholders ----------
   Real photography replaces these in production; each is a small SVG
   scene so the prototype works offline and inside a sandbox. */
function rng(seed) { let s = seed >>> 0 || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const sceneCache = {};
function scene(seed, kind) {
  const key = seed + '|' + kind; if (sceneCache[key]) return sceneCache[key];
  const R = rng(hash(key));
  const W = 640, H = 400;
  const skies = PAL.skies;
  const sky = skies[Math.floor(R() * skies.length)];
  const layer = (y0, amp, col) => {
    let d = `M0 ${H} L0 ${y0}`;
    const n = 6;
    for (let i = 1; i <= n; i++) { const x = i * W / n; const y = y0 + (R() - 0.5) * amp; d += ` Q ${x - W / n / 2} ${y0 + (R() - 0.5) * amp * 1.8} ${x} ${y}`; }
    d += ` L${W} ${H} Z`;
    return `<path d="${d}" fill="${col}"/>`;
  };
  let g = `<defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#sk)"/>`;
  g += `<circle cx="${80 + R() * 480}" cy="${55 + R() * 60}" r="${24 + R() * 14}" fill="${PAL.sun}" opacity=".9"/>`;
  g += layer(165 + R() * 30, 44, PAL.hills[0]);
  g += layer(210 + R() * 25, 40, PAL.hills[1]);
  g += layer(252 + R() * 20, 32, PAL.hills[2]);
  g += layer(298 + R() * 15, 22, PAL.hills[3]);
  const tx = R() * 200;
  const ribbon = `M${-40 + tx} ${H} C ${200 + tx} 335, ${300 + tx} 335, ${W + 40} 292`;
  g += `<path d="${ribbon}" stroke="#E4DBC3" stroke-width="28" fill="none"/><path d="${ribbon}" stroke="#C9BE9F" stroke-width="2" fill="none" stroke-dasharray="6 10"/>`;
  for (let i = 0; i < 8; i++) { const x = R() * W, y = 285 + R() * 40, s = 14 + R() * 18; g += `<path d="M${x} ${y - s * 2} L${x + s * 0.7} ${y} L${x - s * 0.7} ${y} Z" fill="${PAL.tree}"/>`; }
  if (kind === 'inn' || kind === 'town') {
    const count = kind === 'inn' ? 1 : 3;
    for (let i = 0; i < count; i++) {
      const x = 180 + i * 150 + R() * 60, w = 120 + R() * 40, h = 80 + R() * 30, y = 335 - h;
      g += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${i % 2 ? '#8C3B2E' : '#FFFFFF'}"/><path d="M${x - 8} ${y} L${x + w / 2} ${y - 52} L${x + w + 8} ${y} Z" fill="#3B3A38"/>`;
      for (let wx = x + 14; wx < x + w - 20; wx += 34) g += `<rect x="${wx}" y="${y + 18}" width="16" height="22" fill="#F2C766"/>`;
      g += `<rect x="${x + w / 2 - 10}" y="${y + h - 34}" width="20" height="34" fill="#3B3A38"/>`;
    }
  }
  if (kind === 'bridge') {
    g += `<rect x="0" y="262" width="${W}" height="70" fill="#5E8FB0" opacity=".55"/><path d="M0 254 H${W}" stroke="#4A4A48" stroke-width="10"/>`;
    for (let x = 30; x < W; x += 70) g += `<path d="M${x} 254 L${x + 35} 212 L${x + 70} 254" stroke="#4A4A48" stroke-width="4" fill="none"/>`;
    g += `<path d="M0 212 H${W}" stroke="#4A4A48" stroke-width="4"/>`;
  }
  if (kind === 'rider') {
    const x = 280 + R() * 120;
    g += `<circle cx="${x}" cy="344" r="14" stroke="#1B1E1F" stroke-width="3" fill="none"/><circle cx="${x + 46}" cy="344" r="14" stroke="#1B1E1F" stroke-width="3" fill="none"/><path d="M${x} 344 L${x + 22} 318 L${x + 46} 344 M${x + 22} 318 L${x + 14} 344 M${x + 34} 298 L${x + 22} 318 M${x + 34} 298 L${x + 46} 300" stroke="#2F5F8A" stroke-width="3.5" fill="none"/><circle cx="${x + 40}" cy="286" r="7" fill="#1B1E1F"/>`;
  }
  if (kind === 'walker') {
    const x = 300 + R() * 100;
    g += `<circle cx="${x}" cy="292" r="8" fill="#1B1E1F"/><path d="M${x} 300 L${x} 330 L${x - 10} 356 M${x} 330 L${x + 12} 356 M${x} 308 L${x - 14} 322 M${x} 308 L${x + 12} 318" stroke="#1B1E1F" stroke-width="4" fill="none" stroke-linecap="round"/><rect x="${x + 2}" y="304" width="12" height="18" rx="3" fill="#D9A441"/>`;
  }
  const out = `url('data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">${g}</svg>`).replace(/'/g, '%27')}')`;
  sceneCache[key] = out; return out;
}
const photo = (l, i) => scene(l.id + (i || ''), i === 2 ? 'trail' : i === 3 ? 'town' : i === 4 ? 'bridge' : i === 5 ? 'rider' : 'inn');

/* ---------- state ---------- */
const KEY = 'mcrt-trail-stays-v1';
const state = {
  route: { name: 'home' },
  trip: null, booking: null, offline: null,
  form: { start: 'northampton', end: 'westboylston', date: '2026-09-18', mpd: 15, mode: 'walk', travelers: 2 },
  ui: { drawer: false, mapFilters: new Set(Object.keys(POI_KINDS)), mapSel: null, dirView: 'list', filtersOpen: false, legendOpen: false, tmProgress: -1, joined: false, propDate: '', openAlts: new Set() },
  dir: { cat: 'all', section: 'all', date: '2026-09-18', maxPrice: 350, maxDist: 2, amen: new Set() }
};
function save() { try { localStorage.setItem(KEY, JSON.stringify({ trip: state.trip, booking: state.booking, offline: state.offline })); } catch (e) { /* storage unavailable */ } }
function load() { try { const j = JSON.parse(localStorage.getItem(KEY)); if (j) { state.trip = j.trip || null; state.booking = j.booking || null; state.offline = j.offline || null; } } catch (e) { /* ignore */ } }

/* ---------- trip engine ---------- */
function hasLodging(tw) { return LODGING.some(l => Math.abs(l.mile - tw.mile) <= 3); }
function townAtMile(mile) { return TOWNS.reduce((best, t) => Math.abs(t.mile - mile) < Math.abs(best.mile - mile) ? t : best, TOWNS[0]); }
function sectionAt(mile) { return SECTIONS.find(s => mile >= s.from && mile <= s.to) || SECTIONS[SECTIONS.length - 1]; }

function buildDays(t) {
  const s = town(t.start).mile, e = town(t.end).mile;
  const dir = e >= s ? 1 : -1;
  const mpd = Math.max(5, Number(t.mpd) || 15);
  const stops = TOWNS.filter(tw => hasLodging(tw) && (tw.mile - s) * dir > 0.5 && (e - tw.mile) * dir > 0.5);
  const days = []; let cur = s;
  while (days.length < 14) {
    const remaining = Math.abs(e - cur);
    let stopMile;
    if (remaining <= mpd * 1.3) stopMile = e;
    else {
      const target = cur + dir * mpd;
      const window_ = stops.filter(tw => (tw.mile - cur) * dir >= mpd * 0.5 && (tw.mile - cur) * dir <= mpd * 1.35);
      if (window_.length) { window_.sort((a, b) => Math.abs(a.mile - target) - Math.abs(b.mile - target)); stopMile = window_[0].mile; }
      else {
        const beyond = stops.filter(tw => (tw.mile - cur) * dir > 0.5).sort((a, b) => Math.abs(a.mile - target) - Math.abs(b.mile - target));
        stopMile = beyond.length ? beyond[0].mile : e;
      }
    }
    days.push({ n: days.length + 1, fromMile: cur, toMile: stopMile, date: addDays(t.date, days.length), lodgingId: null });
    cur = stopMile;
    if (Math.abs(e - cur) < 0.01) break;
  }
  return days;
}
function planTrip(params, keep) {
  const prev = state.trip;
  const trip = Object.assign({}, params, { travelers: Number(params.travelers) || 2, mpd: Number(params.mpd) || 15 });
  trip.days = buildDays(trip);
  trip.days.forEach((d, i) => {
    const isLast = i === trip.days.length - 1;
    const prevDay = keep && prev && prev.days.find(pd => pd.lodgingId && Math.abs(pd.toMile - d.toMile) < 0.01 && pd.date === d.date);
    if (prevDay) d.lodgingId = prevDay.lodgingId;
    else if (!isLast) { const c = recommend(d.toMile, d.date, trip, 4).find(l => avail(l.id, d.date) > 0) || recommend(d.toMile, d.date, trip, 7).find(l => avail(l.id, d.date) > 0); d.lodgingId = c ? c.id : null; }
  });
  trip.baggage = keep && prev ? prev.baggage : (params.baggage !== undefined ? params.baggage : true);
  state.trip = trip; save();
  return trip;
}
function roomsFor(t, l) { return l.type === 'rental' ? 1 : Math.max(1, Math.ceil((t.travelers || 2) / 2)); }
function tripNights(t) { return t.days.filter(d => d.lodgingId); }
function tripCost(t) {
  const nights = tripNights(t);
  if (t.tour) {
    const tour = tourById(t.tour); const n = t.travelers || 2;
    const single = n === 1 ? tour.single : 0;
    const pkg = tour.price * n + single;
    const bike = t.bikeRental && tour.bikeRental ? tour.bikeRental * n : 0;
    return { nights: nights.length, lodging: 0, bag: 0, pkg, single, bike, total: pkg + bike, tour };
  }
  const lodging = nights.reduce((s, d) => { const l = byId(d.lodgingId); return s + l.rate * roomsFor(t, l); }, 0);
  const bag = t.baggage ? BAG_RATE * nights.length : 0;
  return { nights: nights.length, lodging, bag, total: lodging + bag };
}

/* ---------- packaged tours ---------- */
const tourById = id => TOURS.find(x => x.id === id);
function tourParams(tour, date, travelers) { return { start: tour.start, end: tour.end, date: date || tour.departures[0], mpd: tour.mpd, mode: tour.mode, travelers: travelers || 2, baggage: true }; }
function tourPlan(tour, date) {
  const p = tourParams(tour, date); const days = buildDays(p);
  days.forEach((d, i) => { if (i < days.length - 1) { const c = recommend(d.toMile, d.date, p, 4)[0] || recommend(d.toMile, d.date, p, 7)[0]; d.lodgingId = c ? c.id : null; } });
  return days;
}
function tourStats(tour) {
  const days = tourPlan(tour); const miles = days.map(d => Math.abs(d.toMile - d.fromMile));
  const core = miles.length > 1 && miles[miles.length - 1] < tour.mpd * 0.6 ? miles.slice(0, -1) : miles;
  return { days: days.length, nights: days.length - 1, min: Math.round(Math.min.apply(null, core)), max: Math.round(Math.max.apply(null, miles)), total: r1(Math.abs(town(tour.end).mile - town(tour.start).mile)), plan: days };
}
function startTour(id, date, travelers, guided) {
  const tour = tourById(id);
  const trip = planTrip(tourParams(tour, date, travelers));
  trip.tour = id; trip.guided = !!guided; trip.bikeRental = false; save();
  return trip;
}
function tourCard(tour) {
  const s = tourStats(tour); const onTrip = state.trip && state.trip.tour === tour.id;
  return `<article class="tour-card">
    <a class="tour-img" href="#tour/${tour.id}" style="background-image:${scene('tour-' + tour.id, tour.scene)}" aria-label="${esc(tour.name)}"><span class="tour-stat">${s.days} Days | ${s.min}–${s.max} Daily Miles</span>${onTrip ? '<span class="tag ochre">Your trip</span>' : ''}</a>
    <div class="tour-body"><span class="eyebrow">${esc(tour.route)} · ${tour.rating} · ${tour.mode === 'bike' ? 'cycling' : 'walking'}</span>
      <h3><a href="#tour/${tour.id}">${esc(tour.name)}</a></h3>
      <p class="small"><b>Tour highlights:</b> ${esc(tour.highlights[0])}, ${esc(tour.highlights[1].charAt(0).toLowerCase() + tour.highlights[1].slice(1))}, and ${esc(tour.highlights[2].charAt(0).toLowerCase() + tour.highlights[2].slice(1))}.</p>
      <div class="deps">${tour.departures.slice(0, 3).map(d => `<button class="chip" data-act="book-dep" data-tour="${tour.id}" data-date="${d}">Book ${fmt(d)}</button>`).join('')}</div>
      <div class="inn-foot"><span class="from">from ${money(tour.price)} per person</span><a class="btn btn-forest btn-sm" href="#tour/${tour.id}">Tour details</a></div>
    </div></article>`;
}
function requestBand(tourId) {
  const done = state.ui.requested;
  return `<div class="request"><div><p class="eyebrow" style="color:var(--gold-light)">Free itinerary</p><h3>Get the day-by-day itinerary by email</h3><p>Mileage, the inns, what's included, and every departure date in one PDF you can share with the people you ride with.</p></div>
    ${done ? `<div class="done">${icon('check')}<div><b>On its way to ${esc(done)}.</b><div class="small" style="color:rgba(255,255,255,.75)">Look for it in the next few minutes. Reply to that email with any questions.</div></div></div>`
    : `<form data-act="request-submit" novalidate><label class="sr" for="rq-tour">Tour</label><select id="rq-tour">${TOURS.map(t => `<option value="${t.id}"${t.id === tourId ? ' selected' : ''}>${esc(t.name)} · ${esc(t.route)}</option>`).join('')}<option value="all">All tours (full catalog)</option></select><label class="sr" for="rq-email">Email</label><input id="rq-email" type="email" placeholder="you@example.com" required><button class="btn btn-primary" type="submit">Request Free Itinerary ${icon('arrow')}</button><span class="small" style="color:rgba(255,255,255,.6)">No spam. One email with the PDF, then occasional trail news you can leave any time.</span></form>`}
  </div>`;
}
function gainBetween(a, b) {
  const lo = Math.min(a, b), hi = Math.max(a, b); let g = 0;
  for (let i = 1; i < TOWNS.length; i++) { const p = TOWNS[i - 1], t = TOWNS[i]; const s0 = Math.max(lo, p.mile), e0 = Math.min(hi, t.mile); if (e0 > s0) g += t.gain * (e0 - s0) / (t.mile - p.mile); }
  return Math.round(g);
}
function tripMiles(t) { return Math.abs(town(t.end).mile - town(t.start).mile); }
function hoursFor(miles, mode) { return Math.round(miles / MPH[mode] * 2) / 2; }
function tripTitle(t) { return `Your ${t.days.length}-Day Mass Central Rail Trail Trip`; }
function nightDateFor(l) {
  if (!state.trip) return state.form.date;
  let best = null;
  state.trip.days.forEach(d => { const diff = Math.abs(d.toMile - l.mile); if (!best || diff < best.diff) best = { d, diff }; });
  return best.d.date;
}
function nightIndexFor(id) { return state.trip ? state.trip.days.findIndex(d => d.lodgingId === id) : -1; }

function addToTrip(id) {
  const l = byId(id);
  if (!state.trip) { toast('Plan a trip first, then add ' + l.name + ' to one of your nights.'); location.hash = '#plan'; return; }
  let best = null;
  state.trip.days.forEach(d => { const diff = Math.abs(d.toMile - l.mile); if (!best || diff < best.diff) best = { d, diff }; });
  if (best.diff > 6) { toast(`${l.name} is ${r1(best.diff)} mi from your nearest overnight stop. Change your daily mileage to route through ${l.town}.`); return; }
  if (avail(id, best.d.date) === 0) { toast(`${l.name} is sold out on ${fmt(best.d.date, 'long')}. Try another date or a nearby stay.`); return; }
  best.d.lodgingId = id; save();
  toast(`Added ${l.name} for Night ${best.d.n}, ${fmt(best.d.date, 'long')}.`);
  if (state.route.name === 'plan' || state.route.name === 'stays') render(false); else refreshShell();
}

/* ---------- shared pieces ---------- */
const AMEN = { breakfast: ['Breakfast', 'coffee'], bike: ['Bike storage', 'bike'], laundry: ['Laundry', 'wash'], pets: ['Pet friendly', 'paw'], luggage: ['Luggage transfer', 'bag'] };
function amenHTML(l, max) {
  return '<div class="amen">' + Object.keys(AMEN).filter(k => l.amen[k]).slice(0, max || 9).map(k => `<span>${icon(AMEN[k][1])}${AMEN[k][0]}</span>`).join('') + '</div>';
}
function stars(r) { return `<span class="stars" aria-label="${r} out of 5">${'★'.repeat(Math.round(r))}</span> <b class="num">${r.toFixed(1)}</b>`; }

/* Traveler-fit ranking: how well a stay suits this stop, this night, this trip.
   Scored on distance, breakfast, bike storage, luggage transfer, host trail
   knowledge, guest rating, character, and availability. */
function fitScore(l, mile, date, t) {
  let s = 0;
  s -= Math.abs(l.mile - mile) * 0.6;
  s -= l.dist * 2;
  if (l.amen.breakfast) s += 1.2;
  if (l.amen.bike) s += t && t.mode === 'bike' ? 1.6 : 0.8;
  if (l.amen.luggage) s += t && t.baggage ? 1.6 : 0.6;
  if (l.hosts) s += 0.8;
  if (l.est) s += 0.5;
  s += (l.rating - 4.3) * 4;
  if (l.type === 'bnb' || l.type === 'inn') s += 2.2; else if (l.local) s += 1.2;
  if (t && t.mode === 'walk' && l.dist <= 0.5) s += 0.8;
  if (date && avail(l.id, date) === 0) s -= 100;
  return s;
}
function recommend(mile, date, t, radius) {
  return LODGING.filter(l => Math.abs(l.mile - mile) <= (radius || 4))
    .sort((a, b) => fitScore(b, mile, date, t) - fitScore(a, mile, date, t));
}
const TYPE_WORD = { bnb: 'B&amp;B', inn: 'Inn', hotel: 'Hotel', rental: 'Rental' };
function badgeList(l) {
  const b = [['map', `${l.dist} mi from Trail`]];
  if (l.amen.breakfast) b.push(['coffee', 'Breakfast Included']);
  if (l.rating >= 4.8 && l.reviews >= 60) b.push(['star', 'Trail Favorite']);
  if (l.hosts) b.push(['flag', 'Hosts Know the Trail']);
  if (l.amen.luggage) b.push(['bag', 'Luggage Transfer']);
  if (l.amen.bike) b.push(['bike', 'Bike Friendly']);
  if (l.dist <= 0.5 && l.amen.breakfast) b.push(['walk', 'Great for Walkers']);
  if (l.est) b.push(['home', `Historic · ${l.est}`]);
  if (l.amen.pets) b.push(['paw', 'Pets Welcome']);
  return b;
}
function badgesHTML(l, max) {
  return `<div class="badges">${badgeList(l).slice(0, max || 4).map(x => `<span class="badge${x[1] === 'Trail Favorite' ? ' fav' : ''}">${icon(x[0])}${x[1]}</span>`).join('')}</div>`;
}

function innCard(l) {
  const night = nightIndexFor(l.id);
  return `<article class="inn-card">
    <a class="inn-img" href="#stay/${l.id}" style="background-image:${photo(l)}" aria-label="${esc(l.name)}"><span class="inn-town">${esc(l.town)}</span>${night >= 0 ? `<span class="tag ochre">Night ${night + 1}</span>` : ''}</a>
    <div class="inn-body">
      <span class="eyebrow">${TYPE_LABEL[l.type]}${l.est ? ` · est. ${l.est}` : ''}</span>
      <h3><a href="#stay/${l.id}">${esc(l.name)}</a></h3>
      <p class="story">${esc(l.tagline)} ${esc(l.highlights[0])}.</p>
      ${badgesHTML(l, 4)}
      <div class="inn-foot"><span class="small">${stars(l.rating)} <span class="muted">(${l.reviews})</span></span><span class="from">from ${money(l.rate)} / night</span></div>
      <div class="card-actions"><a class="btn btn-forest btn-sm" href="#stay/${l.id}">Meet the ${TYPE_WORD[l.type]}</a><button class="btn btn-outline btn-sm" data-act="add-trip" data-id="${l.id}">Add to Trip</button></div>
    </div></article>`;
}

function plannerForm(compact) {
  const f = state.form;
  const opts = sel => TOWNS.map(t => `<option value="${t.id}"${t.id === sel ? ' selected' : ''}>${esc(t.name)} · mi ${t.mile}</option>`).join('');
  const mpdBtn = v => `<button type="button" data-act="mpd" data-val="${v}" class="${String(f.mpd) === String(v) || (v === 'custom' && f.custom) ? 'on' : ''}">${v === 'custom' ? 'Custom' : v === 25 ? '25+' : v}</button>`;
  return `<form class="planner" id="planner" data-act="plan-submit" novalidate>
    ${compact ? '' : '<h2>Plan your trail trip</h2><p class="sub">Tell us where and how far. We\'ll pick your overnight stops and show what\'s available each night.</p>'}
    <div class="form-grid">
      <div class="field"><label for="f-start">Starting point</label><select id="f-start" data-form="start">${opts(f.start)}</select></div>
      <div class="field"><label for="f-end">Ending point</label><select id="f-end" data-form="end">${opts(f.end)}</select></div>
      <div class="field"><label for="f-date">Trip start date</label><input id="f-date" type="date" data-form="date" value="${f.date}" min="2026-09-08"></div>
      <div class="field"><label for="f-trav">Number of travelers</label><select id="f-trav" data-form="travelers">${[1, 2, 3, 4, 5, 6, 8, 10].map(n => `<option value="${n}"${f.travelers == n ? ' selected' : ''}>${n} ${n === 1 ? 'traveler' : 'travelers'}</option>`).join('')}</select></div>
      <div class="field span2"><label>Traveling by</label><div class="seg" role="group"><button type="button" data-act="mode" data-val="walk" class="${f.mode === 'walk' ? 'on' : ''}">${icon('walk')} Walking</button><button type="button" data-act="mode" data-val="bike" class="${f.mode === 'bike' ? 'on' : ''}">${icon('bike')} Cycling</button></div></div>
      <div class="field span2"><label>Miles per day</label><div class="mpd">${[10, 15, 20, 25].map(mpdBtn).join('')}${mpdBtn('custom')}</div>
        <input type="number" id="f-custom" data-form="mpd" min="5" max="60" step="1" value="${f.mpd}" placeholder="Miles per day" ${f.custom ? '' : 'hidden'} style="margin-top:6px" aria-label="Custom miles per day"></div>
    </div>
    <button class="btn btn-primary btn-block" type="submit">Plan My Trail Trip ${icon('arrow')}</button>
  </form>`;
}

function ribbonHTML(t) {
  const a = town(t.start).mile, b = town(t.end).mile, lo = Math.min(a, b), hi = Math.max(a, b), span = hi - lo || 1;
  const pct = m => ((m - lo) / span * 100).toFixed(1);
  let s = `<div class="ribbon" id="ribbon"><div class="ribbon-line"><div class="ribbon-fill" style="width:100%"></div>`;
  s += `<span class="ribbon-mile" style="left:${pct(a)}%">mi ${a}</span><span class="ribbon-stop" style="left:${pct(a)}%"></span><span class="ribbon-label" style="left:${pct(a)}%">${esc(town(t.start).name.split(' (')[0])}</span>`;
  t.days.forEach(d => {
    const tw = townAtMile(d.toMile);
    s += `<span class="ribbon-mile" style="left:${pct(d.toMile)}%">mi ${r1(d.toMile)}</span><span class="ribbon-stop${d.lodgingId ? ' night' : ''}" style="left:${pct(d.toMile)}%" title="Day ${d.n}: ${esc(tw.name)}"></span><span class="ribbon-label" style="left:${pct(d.toMile)}%">${esc(tw.name.split(' (')[0])}</span>`;
  });
  s += `<span class="ribbon-walker" id="walker" style="left:${pct(a)}%">${icon(t.mode)}</span></div></div>`;
  return s;
}
function animateRibbon(t) {
  const w = $('#walker'); if (!w) return;
  const a = town(t.start).mile, b = town(t.end).mile, lo = Math.min(a, b), span = Math.abs(b - a) || 1;
  t.days.forEach((d, i) => setTimeout(() => { if (w.isConnected) w.style.left = ((d.toMile - lo) / span * 100).toFixed(1) + '%'; }, 500 + i * 700));
}

/* ---------- schematic map ---------- */
const MAP = { W: 1100, H: 560, x0: 50, scale: 1000 / TRAIL.length, dy: 150 };
const mx = m => MAP.x0 + m * MAP.scale;
function my(m) {
  for (let i = 0; i < TOWNS.length - 1; i++) {
    const a = TOWNS[i], b = TOWNS[i + 1];
    if (m >= a.mile && m <= b.mile) { const t = (m - a.mile) / (b.mile - a.mile); return a.y + (b.y - a.y) * t + MAP.dy; }
  }
  return (m < 0 ? TOWNS[0].y : TOWNS[TOWNS.length - 1].y) + MAP.dy;
}
function trailPath(from, to) {
  const pts = [[mx(from), my(from)]];
  TOWNS.forEach(t => { if (t.mile > from && t.mile < to) pts.push([mx(t.mile), t.y + MAP.dy]); });
  pts.push([mx(to), my(to)]);
  return pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
}
const PIN_ICON = {
  lodging: '<path d="M-6.5 4h13M-6.5 4v-6h3v3h10v3M-6.5 4v2.5M6.5 4v2.5" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>',
  parking: '<text y="4.5" text-anchor="middle" font-size="13" font-weight="800" fill="#fff" font-family="Public Sans,Arial,sans-serif">P</text>',
  bike: '<circle cx="-4.5" cy="2" r="3.5" stroke="#fff" stroke-width="1.8" fill="none"/><circle cx="4.5" cy="2" r="3.5" stroke="#fff" stroke-width="1.8" fill="none"/><path d="M-4.5 2 L-1 -4 L3 -4 L4.5 2 M-1 -4 L1 2" stroke="#fff" stroke-width="1.8" fill="none"/>',
  food: '<path d="M-3.5 -6v12M-1 -6v12M-6 -6v4a2.5 2.5 0 0 0 5 0v-4M3 -6c2 0 3 2 3 5v7" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/>',
  luggage: '<rect x="-6" y="-3" width="12" height="9" rx="1.5" fill="none" stroke="#fff" stroke-width="1.8"/><path d="M-3 -3v-3h6v3" stroke="#fff" stroke-width="1.8" fill="none"/>',
  trailhead: '<path d="M-4 -6v12M-4 -6h8l-2 3 2 3h-8" stroke="#fff" stroke-width="1.8" fill="none" stroke-linejoin="round"/>',
  poi: '<path d="M0 -6.5 L1.9 -2 L6.5 -1.6 L3 1.6 L4 6.3 L0 3.8 L-4 6.3 L-3 1.6 L-6.5 -1.6 L-1.9 -2 Z" fill="#fff"/>',
  restroom: '<path d="M0 -6.5 C 3 -2.5, 5 0, 5 2.2 A5 5 0 0 1 -5 2.2 C -5 0, -3 -2.5, 0 -6.5 Z" fill="#fff"/>'
};
const PIN_OFF = { lodging: 22, trailhead: 16, parking: 40, bike: 56, food: 40, luggage: 58, poi: 18, restroom: 30 };

function mapSVGInner(opts) {
  const f = opts.filters; const trip = opts.showTrip ? state.trip : null;
  const lodgingList = opts.lodging || LODGING;
  let s = `<rect width="${MAP.W}" height="${MAP.H}" fill="${MC.bg}"/>`;
  s += `<g fill="${MC.land}">` + [[130, 90, 150, 44], [430, 460, 180, 40], [720, 70, 130, 40], [960, 470, 120, 34], [300, 500, 200, 30], [620, 480, 150, 30], [980, 100, 100, 36]].map(a => `<ellipse cx="${a[0]}" cy="${a[1]}" rx="${a[2]}" ry="${a[3]}"/>`).join('') + '</g>';
  s += `<path d="M${mx(2.2) - 8} 0 C ${mx(2.2) + 14} 120, ${mx(2.2) - 18} 300, ${mx(2.2) + 4} ${MAP.H}" stroke="${MC.water}" stroke-width="16" fill="none"/><text x="${mx(2.2) + 14}" y="60" class="mile-label" font-size="11">Connecticut River</text>`;
  s += `<ellipse cx="${mx(27)}" cy="215" rx="100" ry="58" fill="${MC.water}"/><text x="${mx(27)}" y="219" class="mile-label" text-anchor="middle" font-size="12">Quabbin Reservoir</text>`;
  s += `<ellipse cx="${mx(76)}" cy="236" rx="46" ry="26" fill="${MC.water}"/><text x="${mx(76)}" y="240" class="mile-label" text-anchor="middle" font-size="10">Wachusett Reservoir</text>`;
  s += `<path d="M${mx(TRAIL.length - 9)} ${MAP.H} C ${mx(TRAIL.length - 6)} 420, ${mx(TRAIL.length - 3)} 400, ${mx(TRAIL.length) + 40} 395" stroke="${MC.water}" stroke-width="12" fill="none"/><text x="${mx(TRAIL.length - 6)}" y="470" class="mile-label" font-size="11">Charles River</text>`;
  s += `<path d="${trailPath(0, TRAIL.length)}" stroke="${MC.halo}" stroke-width="10" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`;
  s += `<path d="${trailPath(0, TRAIL.length)}" stroke="${MC.trail}" stroke-width="4.5" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`;
  [[33.5, 38.5], [41, 44], [87, 89.5]].forEach(p => { s += `<path d="${trailPath(p[0], p[1])}" stroke="${MC.connector}" stroke-width="4.5" fill="none" stroke-dasharray="7 6" stroke-linecap="round"/>`; });
  if (trip) { const a = town(trip.start).mile, b = town(trip.end).mile; s += `<path d="${trailPath(Math.min(a, b), Math.max(a, b))}" stroke="${MC.route}" stroke-width="9" fill="none" stroke-linejoin="round" stroke-linecap="round" opacity=".8"/>`; }
  for (let m = 0; m <= TRAIL.length; m += 10) { const x = mx(m), y = my(m); s += `<line x1="${x}" y1="${y - 8}" x2="${x}" y2="${y + 8}" stroke="${MC.trail}" stroke-width="2"/><text x="${x}" y="${y + 22}" class="mile-label" text-anchor="middle">mi ${m}</text>`; }
  TOWNS.forEach((t, i) => {
    const x = mx(t.mile), y = t.y + MAP.dy; const up = i % 2 === 0;
    s += `<circle cx="${x}" cy="${y}" r="4.5" fill="#fff" stroke="${MC.trail}" stroke-width="2"/><text x="${x}" y="${up ? y - 15 : y + 34}" class="town-label" text-anchor="middle">${esc(t.name.replace(' (North Point)', ''))}</text>`;
  });
  const pins = [];
  if (f.has('lodging')) lodgingList.forEach(l => pins.push({ kind: 'lodging', id: l.id, name: l.name, mile: l.mile, side: l.side, dist: l.dist }));
  POIS.forEach(p => { if (f.has(p.kind)) pins.push(Object.assign({ dist: 0 }, p)); });
  pins.forEach(p => {
    const off = PIN_OFF[p.kind] + p.dist * 12;
    const x = mx(p.mile) + (p.kind === 'lodging' ? 0 : (hash(p.id) % 7) - 3), y = my(p.mile) + p.side * off;
    const sel = state.ui.mapSel && state.ui.mapSel.id === p.id;
    s += `<g class="pin${sel ? ' sel' : ''}" data-kind="${p.kind}" data-id="${p.id}" data-name="${esc(p.name)}" transform="translate(${x.toFixed(1)},${y.toFixed(1)})" tabindex="0" role="button" aria-label="${esc(p.name)}"><line x1="0" y1="0" x2="0" y2="${-p.side * off}" stroke="${POI_KINDS[p.kind].color}" stroke-width="1.5" opacity=".45"/><circle class="bg" r="${p.kind === 'lodging' ? 12.5 : 10.5}" fill="${POI_KINDS[p.kind].color}"/>${PIN_ICON[p.kind]}</g>`;
  });
  if (trip) trip.days.forEach(d => {
    if (!d.lodgingId) return; const l = byId(d.lodgingId);
    const x = mx(l.mile), y = my(l.mile) + l.side * (PIN_OFF.lodging + l.dist * 12);
    s += `<g transform="translate(${x.toFixed(1)},${(y - l.side * 24 - (l.side > 0 ? 0 : 0)).toFixed(1)})" pointer-events="none"><rect x="-26" y="-10" width="52" height="19" rx="9.5" fill="${MC.night}"/><text y="4" text-anchor="middle" font-size="10" font-weight="800" fill="${MC.nightText}" font-family="Public Sans,Arial,sans-serif">NIGHT ${d.n}</text></g>`;
  });
  return s;
}
function mapCardHTML(sel) {
  if (!sel) return '';
  if (sel.kind === 'lodging') {
    const l = byId(sel.id); const date = nightDateFor(l); const night = nightIndexFor(l.id);
    return `<div class="map-card"><button class="close" data-act="map-card-close" aria-label="Close">×</button>
      <div class="card-img" style="background-image:${photo(l)}"><div class="tags"><span class="tag white">${TYPE_LABEL[l.type]}</span>${night >= 0 ? `<span class="tag ochre">Night ${night + 1}</span>` : ''}</div></div>
      <div class="card-body"><span class="eyebrow" style="color:var(--muted)">${esc(l.town)} · mile ${l.mile}</span><h3>${esc(l.name)}</h3>
      <p class="story" style="font-size:.95rem">${esc(l.tagline)}</p>
      ${badgesHTML(l, 3)}
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">${availHTML(l.id, date)}<span class="from">from ${money(l.rate)}</span></div>
      <div class="card-actions"><button class="btn btn-forest btn-sm" data-act="add-trip" data-id="${l.id}">Add to Trip</button><a class="btn btn-outline btn-sm" href="#stay/${l.id}">View ${TYPE_WORD[l.type]}</a></div><a class="small" href="https://${l.web}" target="_blank" rel="noopener">Visit ${esc(l.web)}</a></div></div>`;
  }
  const p = POIS.find(x => x.id === sel.id); if (!p) return '';
  const k = POI_KINDS[p.kind];
  return `<div class="map-card"><button class="close" data-act="map-card-close" aria-label="Close">×</button><div class="card-body">
    <span class="tag" style="background:${k.color}22;color:${k.color};align-self:flex-start">${k.label}</span><h3>${esc(p.name)}</h3><p class="small">${esc(p.note)}</p>
    <div class="meta"><span>Trail mile <b class="num">${p.mile}</b></span><span>${esc(p.town || townAtMile(p.mile).name)}</span></div>
    <div class="small" style="display:flex;gap:12px;flex-wrap:wrap">${p.url ? `<a href="${esc(p.url)}" target="_blank" rel="noopener">Website</a>` : '<span class="muted">Website link added at onboarding</span>'}<a href="${TRAIL.mapUrl}" target="_blank" rel="noopener">Open in MassTrailTracker</a>${p.src === 'route' ? '<span class="muted">Point from the Ride with GPS route</span>' : ''}</div></div></div>`;
}
function mapHTML(opts) {
  const legend = Object.keys(POI_KINDS).map(k => `<label><input type="checkbox" data-mapf="${k}" ${opts.filters.has(k) ? 'checked' : ''}><span class="dot" style="background:${POI_KINDS[k].color}"></span>${POI_KINDS[k].label}</label>`).join('');
  return `<div class="map-wrap ${opts.cls || 'map-tall'}" data-map data-show-trip="${opts.showTrip ? 1 : 0}" data-lodging="${opts.lodgingIds || ''}">
    <svg viewBox="0 0 ${MAP.W} ${MAP.H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Schematic map of the Mass Central Rail Trail">${mapSVGInner(opts)}</svg>
    <div class="map-ctl"><button data-act="map-zoom" data-val="in" aria-label="Zoom in">+</button><button data-act="map-zoom" data-val="out" aria-label="Zoom out">−</button><button data-act="map-zoom" data-val="reset" aria-label="Reset view" style="font-size:.7rem">Fit</button></div>
    ${opts.noLegend ? '' : `<div class="map-legend${state.ui.legendOpen ? ' open' : ''}"><b class="small" style="margin-bottom:2px">Show on map</b>${legend}<span class="small muted" style="margin-top:4px;display:flex;gap:6px;align-items:center"><i style="display:inline-block;width:18px;border-top:3px dashed ${MC.connector}"></i> On-road connector</span></div><button class="btn btn-light btn-sm legend-btn" data-act="legend-toggle">${icon('layers')} Filters</button>`}
    <div class="map-tip"></div><div class="map-card-slot">${mapCardHTML(state.ui.mapSel)}</div>
  </div>`;
}
function mountMap(wrap) {
  const svg = $('svg', wrap); const tip = $('.map-tip', wrap);
  const rect = wrap.getBoundingClientRect(); const aspect = rect.width / rect.height;
  const vb = { x: 0, y: 0, w: MAP.W, h: MAP.H };
  if (aspect > MAP.W / MAP.H) { vb.h = MAP.W / aspect; vb.y = (MAP.H - vb.h) / 2; }
  else { vb.w = MAP.H * aspect; vb.x = 0; if (state.trip && wrap.dataset.showTrip === '1') vb.x = Math.max(0, mx(Math.min(town(state.trip.start).mile, town(state.trip.end).mile)) - 40); }
  const home = Object.assign({}, vb);
  const apply = () => svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
  apply();
  let drag = null;
  svg.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, vx: vb.x, vy: vb.y }; svg.setPointerCapture(e.pointerId); svg.classList.add('dragging'); });
  svg.addEventListener('pointermove', e => {
    if (!drag) return; const r = svg.getBoundingClientRect(); const k = vb.w / r.width;
    vb.x = Math.min(MAP.W - vb.w * 0.3, Math.max(-vb.w * 0.7, drag.vx - (e.clientX - drag.x) * k));
    vb.y = Math.min(MAP.H - vb.h * 0.3, Math.max(-vb.h * 0.7, drag.vy - (e.clientY - drag.y) * k)); apply();
  });
  const end = () => { drag = null; svg.classList.remove('dragging'); };
  svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end);
  wrap.addEventListener('click', e => {
    const z = e.target.closest('[data-act="map-zoom"]');
    if (z) {
      if (z.dataset.val === 'reset') Object.assign(vb, home);
      else { const k = z.dataset.val === 'in' ? 1 / 1.5 : 1.5; const cx = vb.x + vb.w / 2, cy = vb.y + vb.h / 2; vb.w = Math.min(MAP.W * 1.6, Math.max(160, vb.w * k)); vb.h = vb.w / aspect; vb.x = cx - vb.w / 2; vb.y = cy - vb.h / 2; }
      apply(); e.stopPropagation(); return;
    }
    const pin = e.target.closest('.pin');
    if (pin) { selectPin(wrap, pin); return; }
  });
  svg.addEventListener('keydown', e => { const pin = e.target.closest('.pin'); if (pin && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); selectPin(wrap, pin); } });
  svg.addEventListener('pointerover', e => { const pin = e.target.closest('.pin'); if (!pin) { tip.style.display = 'none'; return; } const b = pin.getBoundingClientRect(), w = wrap.getBoundingClientRect(); tip.textContent = pin.dataset.name; tip.style.left = (b.left + b.width / 2 - w.left) + 'px'; tip.style.top = (b.top - w.top) + 'px'; tip.style.display = 'block'; });
  svg.addEventListener('pointerout', () => { tip.style.display = 'none'; });
  wrap.addEventListener('change', e => {
    const f = e.target.dataset.mapf; if (!f) return;
    if (e.target.checked) state.ui.mapFilters.add(f); else state.ui.mapFilters.delete(f);
    svg.innerHTML = mapSVGInner(mapOptsFor(wrap));
  });
}
function mapOptsFor(wrap) {
  const ids = wrap.dataset.lodging ? wrap.dataset.lodging.split(',').filter(Boolean) : null;
  return { filters: state.ui.mapFilters, showTrip: wrap.dataset.showTrip === '1', lodging: ids ? LODGING.filter(l => ids.includes(l.id)) : null };
}
function selectPin(wrap, pin) {
  state.ui.mapSel = { kind: pin.dataset.kind, id: pin.dataset.id };
  $$('.pin.sel', wrap).forEach(p => p.classList.remove('sel')); pin.classList.add('sel');
  $('.map-card-slot', wrap).innerHTML = mapCardHTML(state.ui.mapSel);
}

/* ---------- views ---------- */
function secHero() {
  const featured = ['trailside', 'maplehill', 'norwottuck', 'paradise'].map(byId);
  const exampleBag = 3 * BAG_RATE;
  return `
  <section class="hero"><div class="hero-art" style="background-image:${scene('hero', 'rider')}"></div>
    <div class="wrap hero-in">
      <div>
        <p class="eyebrow" style="color:var(--gold-light)">Northampton to Boston · ${TRAIL.length} miles · inn to inn</p>
        <h1>Plan your Mass Central Rail Trail trip. <em>Discover memorable places to stay along the way.</em></h1>
        <p class="hero-lede">Choose your pace and we'll map each day's miles, introduce you to the inns and B&amp;Bs near every overnight stop, move your bags, and book the whole trip in one checkout.</p>
        <div class="hero-stats"><div><b class="num">${TRAIL.length}</b><span>route miles</span></div><div><b class="num">${LODGING.length}</b><span>trailside stays</span></div><div><b class="num">${TOURS.length}</b><span>inn-to-inn tours</span></div><div><b>1</b><span>checkout</span></div></div>
        <p style="margin-top:22px;color:rgba(255,255,255,.85)">Prefer a ready-made trip? <a href="#tours" style="color:#fff;font-weight:700">See the inn-to-inn tours</a> with fall departures, or <a href="#tours" style="color:#fff;font-weight:700">request a free itinerary</a>.</p>
      </div>
      ${plannerForm(false)}
    </div>
  </section>`;
}
function secMapPreview() {
  const featured = ['trailside', 'maplehill', 'norwottuck', 'paradise'].map(byId);
  const exampleBag = 3 * BAG_RATE;
  return `<section class="section"><div class="wrap">
    <div class="section-head"><div><p class="eyebrow">Interactive trail map</p><h2>Every mile, every inn, every place to refill a bottle</h2><p>Built on the MassTrailTracker.com trail reference, with mileage from the current best route on Ride with GPS. Parking and restroom pins come from the route itself. Tap a pin for details and a link to its website.</p></div><div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn btn-outline" href="#map">Open the full map</a><a class="btn btn-light" href="${TRAIL.mapUrl}" target="_blank" rel="noopener">${icon('map')} MassTrailTracker</a></div></div>
    ${mapHTML({ filters: state.ui.mapFilters, showTrip: true, cls: 'map-preview' })}
  </div></section>`;
}
function secHow() {
  const featured = ['trailside', 'maplehill', 'norwottuck', 'paradise'].map(byId);
  const exampleBag = 3 * BAG_RATE;
  return `<section class="section" style="background:var(--paper)"><div class="wrap">
    <div class="section-head"><div><p class="eyebrow">How it works</p><h2>Five steps from idea to booked trip</h2></div></div>
    <div class="steps">
      ${[['Choose your route', 'Any two points on the trail, in either direction. A weekend or the whole ${TRAIL.length} miles.'], ['Set your daily mileage', 'Walking 10 to 15, cycling 20 to 30. We place your overnight stops at real towns with real beds.'], ['Meet your inns', 'Each stop introduces the inns and B&amp;Bs nearby, with live availability. Swap any night for another stay.'], ['Add luggage transfer', 'Your bags travel by van from tonight\'s inn to tomorrow\'s while you travel by trail.'], ['Book the whole trip', 'One checkout, one confirmation, several independently owned inns.']].map((s, i) => `<div class="step"><div class="n">${i + 1}</div><div><h3>${s[0]}</h3><p>${s[1]}</p></div></div>`).join('')}
    </div>
  </div></section>`;
}
function secInns() {
  const featured = ['trailside', 'maplehill', 'norwottuck', 'paradise'].map(byId);
  const exampleBag = 3 * BAG_RATE;
  return `<section class="section"><div class="wrap">
    <div class="section-head"><div><p class="eyebrow">Meet the inns along the trail</p><h2>Stay somewhere memorable along the trail</h2><p>Farmhouses, station houses, and village inns run by hosts who know every mile. The overnight is part of the trip, not a break from it.</p></div><a class="btn btn-outline" href="#stays">See every stay on the trail</a></div>
    <div class="grid-4">${featured.map(l => innCard(l)).join('')}</div>
  </div></section>`;
}
function secExplore() {
  const featured = ['trailside', 'maplehill', 'norwottuck', 'paradise'].map(byId);
  const exampleBag = 3 * BAG_RATE;
  return `<section class="section" style="background:var(--paper)"><div class="wrap">
    <div class="section-head"><div><p class="eyebrow">Explore the trail</p><h2>Six sections, six different New Englands</h2><p>Surface and grade change as you head east. Mileage is measured from the Northampton trailhead.</p></div></div>
    <div class="surface-key"><span><i style="background:var(--forest)"></i>Paved</span><span><i style="background:var(--ochre)"></i>Stone dust</span><span><i style="background:var(--clay)"></i>On-road connector</span></div>
    <div class="sections">${SECTIONS.map(s => `<div class="sec-card"><span class="miles num">Mile ${s.from} – ${s.to}</span><h3>${esc(s.name)}</h3><div class="surface"><i class="paved" style="flex:${s.surface.paved}"></i><i class="dust" style="flex:${s.surface.dust}"></i><i class="road" style="flex:${s.surface.road}"></i></div><p class="small muted">${esc(s.towns)}</p><p class="small">${esc(s.blurb)}</p></div>`).join('')}</div>
  </div></section>`;
}
function secTours() {
  const featured = ['trailside', 'maplehill', 'norwottuck', 'paradise'].map(byId);
  const exampleBag = 3 * BAG_RATE;
  return `<section class="section"><div class="wrap">
    <div class="section-head"><div><p class="eyebrow">Fall foliage departures · September &amp; October 2026</p><h2>Inn-to-inn tours, ready to book</h2><p>Guided departures with a ride leader, or the same route self-guided on any date you like. Inns, breakfasts, trail lunches, and luggage transfer are all included.</p></div><a class="btn btn-outline" href="#tours">All tours &amp; what's included</a></div>
    <div class="trips">${TOURS.map(tourCard).join('')}</div>
  </div></section>`;
}
function secBaggage() {
  const featured = ['trailside', 'maplehill', 'norwottuck', 'paradise'].map(byId);
  const exampleBag = 3 * BAG_RATE;
  return `<section class="section"><div class="wrap">
    <div class="baggage">
      <div><p class="eyebrow" style="color:var(--gold-light)">Baggage transfer</p><h2>Hike or ride luggage-free.</h2><p>Add luggage transfer to any trip and carry only what you need for the day.</p><blockquote>"We'll move your bags from tonight's inn to tomorrow night's inn."</blockquote><p class="small" style="margin-top:14px">Bags leave by 9 AM and are waiting at your next inn by 3 PM. One flat rate per transfer, per party, up to two bags per traveler.</p></div>
      <div class="bag-demo"><b>Example: 3-night trip, 2 travelers</b><div class="line"><span>Night 1 → Night 2 transfer</span><span>${money(BAG_RATE)}</span></div><div class="line"><span>Night 2 → Night 3 transfer</span><span>${money(BAG_RATE)}</span></div><div class="line"><span>Trailhead → Night 1 transfer</span><span>${money(BAG_RATE)}</span></div><div class="line total"><span>Baggage transfer</span><span>${money(exampleBag)}</span></div><label class="toggle" style="margin-top:6px"><input type="checkbox" checked disabled><span><b>Add baggage transfer between accommodations</b><span>Toggled per trip in the planner</span></span></label></div>
    </div>
  </div></section>`;
}
function secResources() {
  const featured = ['trailside', 'maplehill', 'norwottuck', 'paradise'].map(byId);
  const exampleBag = 3 * BAG_RATE;
  return `<section class="section" style="background:var(--paper)"><div class="wrap">
    <div class="section-head"><div><p class="eyebrow">Trail resources</p><h2>Before you go</h2></div><a class="btn btn-outline" href="#trail-mode">${icon('download')} Trail Mode (offline)</a></div>
    <div class="resources">${RESOURCES.map(r => `<a class="resource" href="${r.url}" target="_blank" rel="noopener"><b>${esc(r.name)}</b><span>${esc(r.desc)}</span></a>`).join('')}</div>
  </div></section>`;
}
function secJoin() {
  const featured = ['trailside', 'maplehill', 'norwottuck', 'paradise'].map(byId);
  const exampleBag = 3 * BAG_RATE;
  return `<section class="section"><div class="wrap">
    <div class="cta-band"><div><p class="eyebrow">For lodging operators</p><h2>Own an inn along the trail? Join the network.</h2><p>Keep your own booking system. We sync your calendar, send you multi-night trail travelers, and tell your story the way guests remember it.</p></div><a class="btn btn-forest" href="#join">Join the Network ${icon('arrow')}</a></div>
  </div></section>`;
}

function secHeroB() {
  const lead = byId('maplehill');
  return `
  <section class="hero hero-b"><div class="hero-art" style="background-image:${scene('hero-b', 'inn')}"></div>
    <div class="wrap hero-in-b">
      <p class="eyebrow" style="color:var(--gold-light)">Tonight in ${esc(lead.town)} · trail mile ${lead.mile}</p>
      <h1>The trail brings you to the door. <em>The inn does the rest.</em></h1>
      <p class="hero-lede">Walk or ride the Mass Central Rail Trail for a weekend or all ${TRAIL.length} miles. Every night: a porch, a breakfast, and a host who knows the next twenty miles. Tell us your pace and we'll introduce you to the inns.</p>
      <div class="hero-actions"><a class="btn btn-primary" href="#plan">Plan my trail trip ${icon('arrow')}</a><a class="btn btn-light" href="#stays">Meet the inns</a><a class="btn btn-light" href="#tours">Fall departures</a></div>
    </div></section>
  <section class="planner-strip"><div class="wrap">${plannerForm(false)}</div></section>`;
}
function secInnsB() {
  const feats = ['trailside', 'maplehill', 'norwottuck'].map(byId);
  return `<section class="section"><div class="wrap">
    <div class="section-head"><div><p class="eyebrow">Meet the inns along the trail</p><h2>Stay somewhere memorable along the trail</h2><p>Station houses, farmhouses, and village inns run by people who know every mile. The overnight is the point, not the pause.</p></div><a class="btn btn-outline" href="#stays">Every stay on the trail</a></div>
    ${feats.map((l, i) => `<article class="feature${i % 2 ? ' flip' : ''}">
      <a class="feature-img" href="#stay/${l.id}" style="background-image:${photo(l)}" aria-label="${esc(l.name)}"></a>
      <div class="feature-body">
        <span class="eyebrow">${esc(l.town)} · ${TYPE_LABEL[l.type]}${l.est ? ` · est. ${l.est}` : ''} · trail mile ${l.mile}</span>
        <h3><a href="#stay/${l.id}">${esc(l.name)}</a></h3>
        <p class="story">${esc(l.tagline)}</p>
        <ul class="why-mini">${l.highlights.slice(0, 3).map(h => `<li>${icon('check')}${esc(h)}</li>`).join('')}</ul>
        ${l.testimonials[0] ? `<div class="quote"><p>"${esc(l.testimonials[0].q)}"</p><b>${esc(l.testimonials[0].who)}</b></div>` : ''}
        ${badgesHTML(l, 4)}
        <div class="card-actions" style="max-width:380px"><a class="btn btn-forest btn-sm" href="#stay/${l.id}">Meet the ${TYPE_WORD[l.type]}</a><button class="btn btn-outline btn-sm" data-act="add-trip" data-id="${l.id}">Add to Trip</button></div>
      </div></article>`).join('')}
  </div></section>`;
}
function secHeroC() {
  const chips = Object.keys(POI_KINDS).map(k => `<label class="chip${state.ui.mapFilters.has(k) ? ' on' : ''}"><input type="checkbox" class="sr" data-mapf="${k}" ${state.ui.mapFilters.has(k) ? 'checked' : ''}><span class="dot" style="background:${POI_KINDS[k].color}"></span>${POI_KINDS[k].label}</label>`).join('');
  return `<section class="hero-c"><div class="wrap">
    <div class="hero-c-top"><div><p class="eyebrow">Mass Central Rail Trail · Northampton → Boston · ${TRAIL.length} mi</p><h1>Plan your trail trip. Discover memorable places to stay along the way.</h1><p class="hero-lede">Set your pace and we'll map each day's miles, introduce you to the inns near every stop, and move your bags.</p></div>
      <div class="stats-strip"><div><b class="num">${TRAIL.length}</b><span>route miles</span></div><div><b class="num">${LODGING.length}</b><span>stays</span></div><div><b class="num">${TOURS.length}</b><span>tours</span></div><div><b class="num">${SECTIONS.length}</b><span>sections</span></div></div></div>
    <div class="hero-c-map">${mapHTML({ filters: state.ui.mapFilters, showTrip: true, cls: 'map-hero', noLegend: true })}<div class="planner-float">${plannerForm(false)}</div></div>
    <div class="map-toolbar" style="margin-top:12px">${chips}<a href="#map" class="chip" style="margin-left:auto;text-decoration:none">${icon('map')} Full map</a></div>
  </div></section>`;
}
function secToursC() {
  return `<section class="section" style="padding-top:36px"><div class="wrap">
    <div class="section-head"><div><p class="eyebrow">Fall foliage departures · September &amp; October 2026</p><h2>Inn-to-inn tours, ready to book</h2></div><a class="btn btn-outline" href="#tours">All tours &amp; what's included</a></div>
    <div class="scroll-row">${TOURS.map(tourCard).join('')}</div>
  </div></section>`;
}
/* Variant D — "Depot": rail-heritage look, planner as a departures board */
function plannerFormD() {
  const f = state.form;
  const opts = sel => TOWNS.map(t => `<option value="${t.id}"${t.id === sel ? ' selected' : ''}>${esc(t.name)} · mi ${t.mile}</option>`).join('');
  return `<form class="board" id="planner" data-act="plan-submit" novalidate>
    <div class="board-title"><span class="eyebrow">Plan your trail trip</span><b>Departures board</b></div>
    <div class="field"><label for="f-start">From</label><select id="f-start" data-form="start">${opts(f.start)}</select></div>
    <div class="field"><label for="f-end">To</label><select id="f-end" data-form="end">${opts(f.end)}</select></div>
    <div class="field"><label for="f-date">Date</label><input id="f-date" type="date" data-form="date" value="${f.date}" min="2026-09-08"></div>
    <div class="field"><label for="f-mode">By</label><select id="f-mode" data-form="mode"><option value="walk"${f.mode === 'walk' ? ' selected' : ''}>Walking</option><option value="bike"${f.mode === 'bike' ? ' selected' : ''}>Cycling</option></select></div>
    <div class="field"><label for="f-mpd">Miles / day</label><select id="f-mpd" data-form="mpd">${[10, 15, 20, 25, 30].map(n => `<option value="${n}"${Number(f.mpd) === n ? ' selected' : ''}>${n}${n === 30 ? '+' : ''}</option>`).join('')}</select></div>
    <div class="field"><label for="f-trav">Travelers</label><select id="f-trav" data-form="travelers">${[1, 2, 3, 4, 5, 6, 8, 10].map(n => `<option value="${n}"${f.travelers == n ? ' selected' : ''}>${n}</option>`).join('')}</select></div>
    <button class="btn btn-primary" type="submit">Plan My Trail Trip ${icon('arrow')}</button>
  </form>`;
}
function secHeroD() {
  return `
  <section class="hero hero-d"><div class="hero-art" style="background-image:${scene('hero-d', 'rider')}"></div>
    <div class="wrap hero-in-d">
      <p class="eyebrow" style="color:var(--gold-light)">Mass Central Rail Trail · Northampton to Boston · ${TRAIL.length} miles</p>
      <h1>Ride the old line. <em>Sleep at the inns it built.</em></h1>
      <p class="hero-lede">Plan a multi-day walk or ride, meet the B&amp;Bs and inns near every overnight stop, add luggage transfer, and book the whole trip in one checkout.</p>
      <div class="hero-stats"><div><b class="num">${TRAIL.length}</b><span>route miles</span></div><div><b class="num">${TRAIL.gainEast.toLocaleString('en-US')}</b><span>ft of climb</span></div><div><b class="num">${LODGING.length}</b><span>trailside stays</span></div><div><b>1</b><span>checkout</span></div></div>
    </div>
  </section>
  <section class="board-band"><div class="wrap">${plannerFormD()}</div></section>`;
}
function secToursD() {
  const rows = [];
  TOURS.forEach(t => { const s = tourStats(t); t.departures.forEach(d => rows.push({ t, s, d })); });
  rows.sort((a, b) => a.d.localeCompare(b.d));
  return `<section class="section"><div class="wrap">
    <div class="section-head"><div><p class="eyebrow">Fall foliage departures · September &amp; October 2026</p><h2>Departures board</h2><p>Guided inn-to-inn tours with a ride leader, inns, breakfasts, trail lunches, and luggage transfer included. Every route also runs self-guided on your own dates.</p></div><a class="btn btn-outline" href="#tours">All tours &amp; what's included</a></div>
    <div style="overflow-x:auto"><table class="timetable"><thead><tr><th>Departs</th><th>Tour</th><th>Route</th><th>Days</th><th>Daily miles</th><th>Rating</th><th>From</th><th></th></tr></thead><tbody>
      ${rows.slice(0, 10).map(r => `<tr><td class="num"><b>${fmt(r.d, 'long')}</b></td><td><a href="#tour/${r.t.id}">${esc(r.t.name)}</a><span class="small muted" style="display:block">${r.t.mode === 'bike' ? 'Cycling' : 'Walking'}</span></td><td>${esc(r.t.route)}</td><td class="num">${r.s.days}</td><td class="num">${r.s.min}–${r.s.max}</td><td>${r.t.rating}</td><td class="num">${money(r.t.price)} <span class="small muted">pp</span></td><td><button class="btn btn-primary btn-sm" data-act="book-dep" data-tour="${r.t.id}" data-date="${r.d}">Book</button></td></tr>`).join('')}
    </tbody></table></div>
  </div></section>`;
}
function secCircle() {
  return `<section class="section" style="background:var(--paper)"><div class="wrap">
    <div class="circle"><div><p class="eyebrow">The Trail Circle</p><h2>Stay unique. Stay loyal. Stay in the Circle.</h2><p class="muted" style="margin-top:8px;max-width:52ch">Every night at a member inn or B&amp;B counts as a stay. Book here and it's logged for you; walk in off the trail and scan the card at the desk. No password, no app.</p></div>
    <div class="circle-steps">${[['1', 'Stay at a member inn', 'Any night, any trip, booked here or at the door.'], ['2', 'Collect five stays', 'Stays never expire. Check your progress from the email we send after each one.'], ['3', 'Earn a gift certificate', '$75 for five stays, $125 for five different inns. Good at any member property for five years.']].map(x => `<div><b class="n">${x[0]}</b><h3>${x[1]}</h3><p>${x[2]}</p></div>`).join('')}</div></div>
  </div></section>`;
}
const isCircleMember = l => l.type === 'bnb' || l.type === 'inn' || !!l.local;
function viewHome() {
  if (VARIANT === 'd') return secHeroD() + secToursD() + secInns() + secHow() + secMapPreview() + secExplore() + secBaggage() + secCircle() + secResources() + secJoin();
  if (VARIANT === 'b') return secHeroB() + secInnsB() + secHow() + secTours() + secMapPreview() + secExplore() + secBaggage() + secCircle() + secResources() + secJoin();
  if (VARIANT === 'c') return secHeroC() + secToursC() + secInns() + secHow() + secExplore() + secBaggage() + secCircle() + secResources() + secJoin();
  return secHero() + secMapPreview() + secHow() + secInns() + secExplore() + secTours() + secBaggage() + secCircle() + secResources() + secJoin();
}

function viewMap() {
  return `<section class="section" style="padding-top:28px"><div class="wrap">
    <div class="section-head" style="margin-bottom:14px"><div><p class="eyebrow">Interactive trail map</p><h2>Mass Central Rail Trail, Northampton to Boston</h2><p>Drag to move, use + and − to zoom. Tap any pin for details. ${state.trip ? 'Your planned route is highlighted with a marker at each night\'s stay.' : 'Plan a trip and your route and overnight stops appear here.'}</p></div>${state.trip ? '<a class="btn btn-outline" href="#plan">View itinerary</a>' : '<a class="btn btn-primary" href="#plan">Plan a trip</a>'}</div>
    <div class="map-toolbar">${Object.keys(POI_KINDS).map(k => `<label class="chip${state.ui.mapFilters.has(k) ? ' on' : ''}"><input type="checkbox" class="sr" data-mapf="${k}" ${state.ui.mapFilters.has(k) ? 'checked' : ''}><span class="dot" style="background:${POI_KINDS[k].color}"></span>${POI_KINDS[k].label}</label>`).join('')}<a class="chip" href="${TRAIL.mapUrl}" target="_blank" rel="noopener" style="margin-left:auto;text-decoration:none">${icon('map')} Open in MassTrailTracker</a><a class="chip" href="${TRAIL.routeUrl}" target="_blank" rel="noopener" style="text-decoration:none">${icon('bike')} Route on Ride with GPS</a></div>
    ${mapHTML({ filters: state.ui.mapFilters, showTrip: true, cls: 'map-tall', noLegend: true })}
    <p class="small muted" style="margin-top:10px">Schematic map for the prototype. Mileage follows the current best route (${TRAIL.length} mi, +${TRAIL.gainEast.toLocaleString('en-US')} ft eastbound). Parking and restroom pins are real points from the Ride with GPS route; lodging, shops and restaurants are illustrative. Production uses the MassTrailTracker.com basemap with its paved, stone-dust, on-road and under-construction status layers, GPS-accurate geometry, and a website link on every pin.</p>
  </div></section>`;
}

function stayRow(d, l, t, isLast) {
  const selected = d.lodgingId === l.id; const n = avail(l.id, d.date); const rooms = roomsFor(t, l);
  return `<div class="stay-row${selected ? ' selected' : ''}">
    <div class="thumb" style="background-image:${photo(l)}"></div>
    <div><span class="eyebrow" style="color:var(--muted)">${TYPE_LABEL[l.type]} · ${esc(l.town)}</span><h3><a href="#stay/${l.id}" style="text-decoration:none;color:inherit">${esc(l.name)}</a></h3>
      <p class="story">${esc(l.tagline)}</p>
      <div style="margin:6px 0">${badgesHTML(l, 3)}</div>
      <div>${availHTML(l.id, d.date)}</div></div>
    <div class="sel"><span class="from">${money(l.rate * rooms)} / night${rooms > 1 ? ` · ${rooms} rooms` : ''}</span>
      ${n === 0 ? '<button class="btn btn-light btn-sm" disabled>Sold out</button>' : `<button class="btn ${selected ? 'btn-forest' : 'btn-outline'} btn-sm btn-sel" data-act="select-stay" data-day="${d.n}" data-id="${l.id}">${selected ? icon('check') + ' Staying here' : isLast ? 'Add this night' : 'Stay here instead'}</button>`}</div>
  </div>`;
}
function tonightBlock(d, l, t, isLast, open, altCount) {
  const to = townAtMile(d.toMile).name.split(' (')[0]; const rooms = roomsFor(t, l); const selected = d.lodgingId === l.id; const n = avail(l.id, d.date);
  return `<div class="tonight${selected ? ' selected' : ''}">
    <a class="tonight-img" href="#stay/${l.id}" style="background-image:${photo(l)}" aria-label="${esc(l.name)}"></a>
    <div class="tonight-body">
      <span class="eyebrow">${isLast ? `One more night in ${esc(to)}?` : `Tonight in ${esc(to)}`} · ${TYPE_LABEL[l.type]}</span>
      <h3><a href="#stay/${l.id}">${esc(l.name)}</a></h3>
      <p class="story">"${esc(l.tagline)}"</p>
      <ul class="why-mini">${l.highlights.slice(0, 2).map(h => `<li>${icon('check')}${esc(h)}</li>`).join('')}</ul>
      ${badgesHTML(l, 5)}
      <div class="tonight-foot">${availHTML(l.id, d.date)}<span class="from">${money(l.rate * rooms)} / night${rooms > 1 ? ` · ${rooms} rooms` : ''}</span></div>
      <div class="card-actions" style="flex-wrap:wrap">
        ${selected ? `<span class="btn btn-forest btn-sm">${icon('check')} Staying here</span>` : n === 0 ? '<span class="btn btn-light btn-sm">Sold out tonight</span>' : `<button class="btn btn-primary btn-sm" data-act="select-stay" data-day="${d.n}" data-id="${l.id}">${isLast ? 'Add this night' : 'Stay here'}</button>`}
        <a class="btn btn-outline btn-sm" href="#stay/${l.id}">View ${TYPE_WORD[l.type]}</a>
        ${altCount ? `<button class="btn btn-light btn-sm" data-act="alts" data-day="${d.n}">${open ? 'Hide other stays' : `See Other Stays (${altCount})`}</button>` : ''}
      </div>
    </div></div>`;
}
function viewPlan() {
  const t = state.trip;
  if (!t) return `<section class="section"><div class="wrap" style="max-width:720px"><p class="eyebrow">Trip planner</p><h2 style="margin-bottom:8px">Where are you headed?</h2><p class="muted" style="margin-bottom:20px">Choose a start, an end, and a daily distance. The planner places your overnight stops and finds available rooms for each night.</p>${plannerForm(false)}</div></section>`;
  const cost = tripCost(t); const f = state.form; const miles = tripMiles(t);
  const opts = sel => TOWNS.map(tw => `<option value="${tw.id}"${tw.id === sel ? ' selected' : ''}>${esc(tw.name)} · mi ${tw.mile}</option>`).join('');
  const days = t.days.map((d, i) => {
    const isLast = i === t.days.length - 1; const from = townAtMile(d.fromMile), to = townAtMile(d.toMile); const dm = Math.abs(d.toMile - d.fromMile);
    const secs = [...new Set([sectionAt(Math.min(d.fromMile, d.toMile) + 0.1).name, sectionAt(Math.max(d.fromMile, d.toMile) - 0.1).name])].join(' → ');
    const near = recommend(d.toMile, d.date, t, 4); const chosen = d.lodgingId ? byId(d.lodgingId) : null;
    const lead = chosen || near[0]; const alts = near.filter(l => l !== lead); const open = state.ui.openAlts.has(d.n);
    return `<article class="day" id="day-${d.n}" data-act="walker" data-day="${d.n}">
      <div class="day-head"><div class="day-n"><small>Day ${d.n}</small>${fmt(d.date, 'long')}</div>
        <div><div class="day-route">${esc(from.name.split(' (')[0])}<span class="arrow">→</span>${esc(to.name.split(' (')[0])}</div><div class="day-stats"><span><b class="num">${r1(dm)} miles</b></span><span>+<b class="num">${gainBetween(d.fromMile, d.toMile)} ft</b> climb</span><span>~<b class="num">${hoursFor(dm, t.mode)} hrs</b> ${t.mode === 'bike' ? 'riding' : 'walking'}</span><span>${esc(secs)}</span><span>Mile <b class="num">${r1(d.fromMile)}</b> → <b class="num">${r1(d.toMile)}</b></span></div></div>
        <div class="small" style="text-align:right">${chosen ? `<span class="tag ochre">${icon('moon')} Night ${d.n}: ${esc(chosen.name)}</span>` : isLast ? '<span class="tag">Trip ends here</span>' : '<span class="tag clay">Choose a stay</span>'}</div></div>
      <div class="day-body"><h4>${isLast ? `Your trip ends in ${esc(to.name.split(' (')[0])} · mile ${r1(d.toMile)}` : `Where you'll sleep · ${esc(to.name.split(' (')[0])} · mile ${r1(d.toMile)}`}</h4>
        ${lead ? tonightBlock(d, lead, t, isLast, open, alts.length) : `<div class="notice">No participating lodging within 4 miles of this stop yet. Adjust your daily mileage or <a href="#join">tell an innkeeper about the network</a>.</div>`}
        ${open && alts.length ? `<div class="alts"><h5>Other stays near ${esc(to.name.split(' (')[0])}</h5>${alts.map(l => stayRow(d, l, t, isLast)).join('')}</div>` : ''}
        ${chosen ? `<button class="btn btn-light btn-sm" data-act="clear-stay" data-day="${d.n}" style="margin-top:12px">${isLast ? 'Skip the last night' : 'Remove this night'}</button>` : ''}
      </div></article>`;
  }).join('');
  return `<section class="section" style="padding-top:28px"><div class="wrap">
    <p class="eyebrow">Trip planner</p><h2>${tripTitle(t)}</h2>
    <p class="muted" style="margin-top:6px">${esc(town(t.start).name)} to ${esc(town(t.end).name)} · <span class="num">${r1(miles)}</span> miles ${t.mode === 'bike' ? 'by bike' : 'on foot'} · +<span class="num">${gainBetween(town(t.start).mile, town(t.end).mile).toLocaleString('en-US')}</span> ft climb · ${fmt(t.date, 'long')} – ${fmt(t.days[t.days.length - 1].date, 'long')} · ${t.travelers} ${t.travelers === 1 ? 'traveler' : 'travelers'}</p>
    ${cost.tour ? `<div class="pkg-banner">${icon('flag')}<span><b>${esc(cost.tour.name)}</b> · ${t.guided ? 'guided departure' : 'self-guided'} ${fmt(t.date, 'long')} · inns, breakfasts, lunches and luggage transfer included at <b>${money(cost.tour.price)} per person</b>. Swap any stay below; the package price stays the same.</span><a href="#tour/${cost.tour.id}" class="small">Tour details</a></div>` : ''}
    ${ribbonHTML(t)}
    <div class="plan-layout">
      <aside><div class="plan-controls"><h3>Adjust your trip</h3>
        <div class="field"><label for="p-start">Start</label><select id="p-start" data-plan="start">${opts(t.start)}</select></div>
        <div class="field"><label for="p-end">End</label><select id="p-end" data-plan="end">${opts(t.end)}</select></div>
        <div class="field"><label for="p-date">Start date</label><input id="p-date" type="date" data-plan="date" value="${t.date}"></div>
        <div class="field"><label for="p-mpd">Miles per day · <b class="num">${t.mpd}</b></label><input id="p-mpd" class="range" type="range" min="6" max="40" step="1" value="${t.mpd}" data-plan="mpd"><div class="small muted" style="display:flex;justify-content:space-between"><span>6 easy</span><span>40 fast</span></div></div>
        <div class="field"><label>Traveling by</label><div class="seg"><button type="button" data-act="plan-mode" data-val="walk" class="${t.mode === 'walk' ? 'on' : ''}">${icon('walk')} Walking</button><button type="button" data-act="plan-mode" data-val="bike" class="${t.mode === 'bike' ? 'on' : ''}">${icon('bike')} Cycling</button></div></div>
        <div class="field"><label for="p-trav">Travelers</label><select id="p-trav" data-plan="travelers">${[1, 2, 3, 4, 5, 6, 8, 10].map(n => `<option value="${n}"${t.travelers == n ? ' selected' : ''}>${n}</option>`).join('')}</select></div>
        ${cost.tour ? '' : `<label class="toggle"><input type="checkbox" data-plan="baggage" ${t.baggage ? 'checked' : ''}><span><b>Add baggage transfer</b><span>${money(BAG_RATE)} per transfer · ${cost.nights} ${cost.nights === 1 ? 'transfer' : 'transfers'}</span></span></label>`}
        <div class="trip-summary"><h3>${cost.tour ? esc(cost.tour.name) : 'Your trail trip'}</h3>
          ${cost.tour ? `<div class="line"><span>Package × ${t.travelers} ${t.travelers === 1 ? 'traveler' : 'travelers'}</span><span class="num">${money(cost.tour.price * t.travelers)}</span></div>${cost.single ? `<div class="line"><span>Single supplement</span><span class="num">${money(cost.single)}</span></div>` : ''}${cost.bike ? `<div class="line"><span>Bike rental</span><span class="num">${money(cost.bike)}</span></div>` : ''}<div class="line"><span class="small">${cost.nights} nights · breakfasts · lunches · luggage transfer</span><span class="small">included</span></div>`
          : (tripNights(t).map(d => `<div class="line"><span>${fmt(d.date)} · ${esc(byId(d.lodgingId).name)}</span><span class="num">${money(byId(d.lodgingId).rate * roomsFor(t, byId(d.lodgingId)))}</span></div>`).join('') || '<div class="line"><span class="muted">No nights selected yet</span><span></span></div>') + (t.baggage && cost.nights ? `<div class="line"><span>Baggage transfer × ${cost.nights}</span><span class="num">${money(cost.bag)}</span></div>` : '')}
          <div class="total"><span>Trip total</span><span class="num">${money(cost.total)}</span></div>
          <div class="sync"><span class="live"></span>Availability synced with each inn's calendar</div>
          <a class="btn btn-primary btn-block" href="#checkout" ${cost.nights ? '' : 'aria-disabled="true" style="opacity:.5;pointer-events:none"'}>Book Entire Trip ${icon('arrow')}</a>
          <a class="btn btn-block" style="color:#fff;border-color:rgba(255,255,255,.35)" href="#trail-mode">${icon('download')} Download for offline use</a>
        </div>
      </div></aside>
      <div>${days}</div>
    </div>
  </div></section>`;
}

const CATS = [
  { id: 'indie', label: 'B&amp;Bs &amp; Inns', icon: 'home', test: l => l.type === 'bnb' || l.type === 'inn' },
  { id: 'hotel', label: 'Hotels', icon: 'bed', test: l => l.type === 'hotel' },
  { id: 'rental', label: 'Vacation Rentals', icon: 'users', test: l => l.type === 'rental' },
  { id: 'all', label: 'All Stays', icon: 'list', test: () => true }
];
function viewStays() {
  const d = state.dir;
  const base = LODGING.filter(l => {
    if (d.section !== 'all') { const s = SECTIONS.find(x => x.id === d.section); if (l.mile < s.from - 1 || l.mile > s.to + 1) return false; }
    if (l.rate > d.maxPrice) return false;
    if (l.dist > d.maxDist) return false;
    for (const a of d.amen) if (!l.amen[a]) return false;
    if (d.date && avail(l.id, d.date) === 0) return false;
    return true;
  });
  const cat = CATS.find(c => c.id === d.cat) || CATS[3];
  const list = base.filter(cat.test).sort((a, b) => a.mile - b.mile);
  const tabs = `<div class="cat-tabs" role="tablist">${CATS.map((c, i) => `<button role="tab" aria-selected="${c.id === d.cat}" class="${c.id === d.cat ? 'on' : ''}${i === 0 ? ' lead' : ''}" data-act="dir-cat" data-val="${c.id}">${icon(c.icon)}${c.label}<span class="n num">${base.filter(c.test).length}</span></button>`).join('')}</div>`;
  const check = (group, val, label, set) => `<label class="check"><input type="checkbox" data-dir="${group}" value="${val}" ${set.has(val) ? 'checked' : ''}>${label}</label>`;
  const filters = `<aside class="filters${state.ui.filtersOpen ? ' open' : ''}"><h3>Filters <button class="btn btn-light btn-sm" data-act="dir-reset">Reset</button></h3>
    <div class="group"><b>Trail section</b><select data-dir="section" style="min-height:44px;border:2px solid var(--line);border-radius:8px;padding:0 10px;background:#fff"><option value="all">All sections (mile 0–${TRAIL.length})</option>${SECTIONS.map(s => `<option value="${s.id}"${d.section === s.id ? ' selected' : ''}>${esc(s.name)} · mi ${s.from}–${s.to}</option>`).join('')}</select></div>
    <div class="group"><b>Date</b><input type="date" data-dir="date" value="${d.date}" style="min-height:44px;border:2px solid var(--line);border-radius:8px;padding:0 10px;background:#fff"><span class="small muted">Hides stays that are sold out that night</span></div>
    <div class="group"><b>Max nightly rate · <span class="num">${money(d.maxPrice)}</span></b><input class="range" type="range" min="120" max="350" step="10" value="${d.maxPrice}" data-dir="maxPrice"></div>
    <div class="group"><b>Max distance from trail · <span class="num">${d.maxDist} mi</span></b><input class="range" type="range" min="0.2" max="2" step="0.2" value="${d.maxDist}" data-dir="maxDist"></div>
    <div class="group"><b>What matters to you</b>${Object.keys(AMEN).map(k => check('amen', k, AMEN[k][0], d.amen)).join('')}</div>
  </aside>`;
  const results = state.ui.dirView === 'map'
    ? mapHTML({ filters: new Set(['lodging', 'trailhead']), showTrip: true, cls: 'map-tall', lodging: list, lodgingIds: list.map(l => l.id).join(','), noLegend: true })
    : (list.length ? list.map(l => {
      const night = nightIndexFor(l.id);
      return `<article class="list-row"><div class="card-img" style="background-image:${photo(l)}"><div class="tags"><span class="tag white">${TYPE_LABEL[l.type]}</span>${night >= 0 ? `<span class="tag ochre">Night ${night + 1}</span>` : ''}</div></div>
        <div class="card-body"><span class="eyebrow" style="color:var(--muted)">${esc(l.town)} · trail mile ${l.mile}${l.est ? ` · est. ${l.est}` : ''}</span><h3><a href="#stay/${l.id}">${esc(l.name)}</a></h3>
        <p class="story">${esc(l.tagline)}</p>${badgesHTML(l, 5)}
        <div class="meta" style="align-items:center"><span>${stars(l.rating)} <span class="muted">(${l.reviews})</span></span>${availHTML(l.id, d.date)}<span class="from">from ${money(l.rate)} / night</span></div>
        <div class="card-actions" style="max-width:360px"><a class="btn btn-forest btn-sm" href="#stay/${l.id}">Meet the ${TYPE_WORD[l.type]}</a><button class="btn btn-outline btn-sm" data-act="add-trip" data-id="${l.id}">Add to Trip</button></div></div></article>`;
    }).join('') : '<div class="empty"><b>No stays match those filters.</b><span>Try a wider distance or a higher nightly rate.</span><button class="btn btn-outline btn-sm" data-act="dir-reset">Reset filters</button></div>');
  return `<section class="section" style="padding-top:28px"><div class="wrap">
    <p class="eyebrow">Places to stay</p><h2>Every stay along the Mass Central Rail Trail</h2>
    <p class="muted" style="margin:6px 0 18px">${LODGING.length} inns, B&amp;Bs, hotels and rentals along the route, west to east by trail mile. The fastest way to meet them is to <a href="#plan">plan a trip</a> and let each day's stop introduce its neighbors.</p>
    ${tabs}
    <div class="dir-layout">${filters}
      <div><div class="dir-top"><div><b class="num">${list.length}</b> <span class="muted">${list.length === 1 ? 'stay' : 'stays'}</span> <button class="btn btn-light btn-sm filters-toggle" data-act="filters-toggle" style="margin-left:8px">${icon('layers')} Filters</button></div>
        <div class="seg" style="width:220px"><button data-act="dir-view" data-val="map" class="${state.ui.dirView === 'map' ? 'on' : ''}">${icon('map')} Map View</button><button data-act="dir-view" data-val="list" class="${state.ui.dirView === 'list' ? 'on' : ''}">${icon('list')} List View</button></div></div>
        ${results}</div>
    </div></div></section>`;
}

function viewStay(id) {
  const l = byId(id); if (!l) return viewStays();
  const date = state.ui.propDate || nightDateFor(l); const night = nightIndexFor(l.id); const n = avail(l.id, date);
  const sec = sectionAt(l.mile);
  return `<section class="section" style="padding-top:22px"><div class="wrap">
    <p class="crumb"><a href="#stays">All stays</a> › ${esc(sec.name)} › ${esc(l.town)}</p>
    <div class="gallery">${[0, 2, 3, 4, 5].map(i => `<div style="background-image:${photo(l, i)}" role="img" aria-label="${esc(l.name)} photo ${i + 1}"></div>`).join('')}</div>
    <div class="prop-layout">
      <div class="prop-main">
        <span class="eyebrow">${TYPE_LABEL[l.type]} · ${esc(l.town)}, Massachusetts${l.est ? ` · est. ${l.est}` : ''}</span>
        <h1 style="font-size:clamp(1.9rem,4cqw,2.8rem);margin-top:6px">${esc(l.name)}</h1>
        <p class="lede">${esc(l.tagline)}</p>
        <div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin-top:12px"><span>${stars(l.rating)} <span class="muted">(${l.reviews} reviews)</span></span>${isCircleMember(l) ? '<span class="tag ochre">Trail Circle member</span>' : ''}${night >= 0 ? `<span class="tag ochre">${icon('moon')} On your trip · Night ${night + 1}</span>` : ''}</div>
        <div class="quick">
          <div>${icon('map')}<span>${l.dist} mi from the trail</span></div>
          <div class="${l.amen.breakfast ? '' : 'no'}">${icon('coffee')}<span>${l.amen.breakfast ? 'Breakfast included' : 'Breakfast nearby'}</span></div>
          <div class="${l.amen.bike ? '' : 'no'}">${icon('bike')}<span>${l.amen.bike ? 'Secure bike storage' : 'Outdoor bike locking'}</span></div>
          <div class="${l.amen.luggage ? '' : 'no'}">${icon('bag')}<span>${l.amen.luggage ? 'Luggage transfer' : 'Bags to nearest hub'}</span></div>
        </div>
        <div style="margin-top:12px">${badgesHTML(l, 6)}</div>

        <h2>Why trail travelers love it</h2>
        <ul class="why">${l.highlights.map(h => `<li>${icon('check')}<span>${esc(h)}</span></li>`).join('')}</ul>
        ${l.testimonials.map(q => `<div class="quote"><p>"${esc(q.q)}"</p><b>${esc(q.who)}</b></div>`).join('')}

        <h2>Getting here from the trail</h2>
        <div class="getting-here">${icon('map')}<div><p>${esc(l.directions)}</p>
          <div class="meta"><span>Trail mile <b class="num">${l.mile}</b></span><span><b>${l.dist} mi</b> off the trail</span><span>${esc(sec.name)} section</span><span>Check-in <b>${esc(l.checkin)}</b></span></div>
          <p class="small muted" style="margin-top:10px">${icon('download')} These directions are saved in your offline Trail Mode download.</p></div></div>

        <h2>About the property</h2><p>${esc(l.desc)}</p>

        <h2>Rooms</h2><div class="rooms">${l.roomTypes.map(r => `<div class="room"><div><b>${esc(r.name)}</b><span class="muted">Sleeps ${r.sleeps}</span></div><span class="from num">${money(r.rate)} / night</span></div>`).join('')}</div>

        <h2>The details</h2>
        <dl class="dl"><dt>Breakfast</dt><dd>${esc(l.breakfast)}</dd><dt>Bike storage</dt><dd>${l.amen.bike ? 'Secure indoor storage with basic tools' : 'Outdoor locking only'}</dd><dt>Luggage transfer</dt><dd>${l.amen.luggage ? 'Participates in Valley Bag Shuttle. Bags out by 9 AM, delivered by 3 PM.' : 'Not a transfer partner. Bags can be delivered to the nearest hub.'}</dd><dt>Laundry</dt><dd>${l.amen.laundry ? 'Guest laundry on site' : 'Not available'}</dd><dt>Pets</dt><dd>${l.amen.pets ? 'Welcome' : 'Not permitted'}</dd><dt>Check-in / checkout</dt><dd>${esc(l.checkin)} / ${esc(l.checkout)}</dd><dt>Address</dt><dd>${esc(l.address)}</dd><dt>Phone</dt><dd><a href="tel:${l.phone.replace(/\D/g, '')}">${esc(l.phone)}</a></dd><dt>Website</dt><dd><a href="https://${l.web}" target="_blank" rel="noopener">${esc(l.web)}</a></dd></dl>
      </div>
      <aside><div class="book-box">
        <div><span class="eyebrow" style="color:var(--muted)">Stay here</span><div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px"><b style="font-size:1.05rem">${esc(l.name)}</b><span class="from">from ${money(l.rate)} / night</span></div></div>
        <div class="field"><label for="s-date">Night of</label><input id="s-date" type="date" value="${date}" data-propdate></div>
        ${availHTML(l.id, date)}
        <div class="sync"><span class="live"></span>Live from ${esc(l.name)}'s calendar</div>
        <button class="btn btn-primary btn-block" data-act="add-trip" data-id="${l.id}" ${n === 0 ? 'disabled' : ''}>${night >= 0 ? icon('check') + ' On your trip' : 'Add This Stay to My Trip'}</button>
        ${state.trip ? `<p class="small muted">Nearest stop on your trip: ${esc(townAtMile(byId(l.id).mile).name)} on ${fmt(nightDateFor(l), 'long')}.</p>` : '<p class="small muted">No trip yet. Adding this stay will start one.</p>'}
        <a class="btn btn-outline btn-block" href="#stays">See other stays nearby</a>
      </div></aside>
    </div></div></section>`;
}

function viewTours() {
  return `<section class="section" style="padding-top:28px"><div class="wrap">
    <p class="eyebrow">Fall foliage departures · September &amp; October 2026</p><h2>Inn-to-inn tours on the Mass Central Rail Trail</h2>
    <p class="muted" style="margin:6px 0 22px;max-width:64ch">Pick a route and a date. We book every inn, move your bags, pack your lunch, and hand you the maps. Join a guided departure with a ride leader, or take the same route self-guided on any date.</p>
    <div class="trips">${TOURS.map(tourCard).join('')}</div>
    <div class="section-head" style="margin-top:44px"><div><p class="eyebrow">What every tour includes</p><h2>Car-free, bag-free, planned for you</h2></div></div>
    <ul class="incl">${TOUR_INCLUDES.map(i => `<li>${icon('check')}<span>${esc(i)}</span></li>`).join('')}</ul>
    <div class="glance" style="margin-top:18px"><div><b>Group size</b><span>Up to 14 on guided departures</span></div><div><b>Bike rental</b><span>Hybrid or e-bike, delivered to your first inn</span></div><div><b>Single travelers</b><span>Single supplement shown on each tour</span></div><div><b>Getting there</b><span>Commuter rail at both ends; overnight parking at trailheads</span></div><div><b>Booking</b><span>Departures within 14 days: call (855) 555-0199</span></div><div><b>Own dates?</b><span>Every tour runs self-guided any day the inns have rooms</span></div></div>
    <div style="margin-top:36px">${requestBand()}</div>
  </div></section>`;
}
function viewTour(id) {
  const tour = tourById(id); if (!tour) return viewTours();
  const s = tourStats(tour); const days = s.plan; const stays = [...new Set(days.filter(d => d.lodgingId).map(d => d.lodgingId))].map(byId);
  const others = TOURS.filter(x => x.id !== tour.id);
  return `<section class="section" style="padding-top:22px"><div class="wrap">
    <p class="crumb"><a href="#tours">Inn-to-inn tours</a> › ${esc(tour.name)}</p>
    <div class="tour-hero" style="background-image:${scene('tour-' + tour.id, tour.scene)}"><div><span class="tour-stat" style="position:static;display:inline-block;margin-bottom:12px">${s.days} Days | ${s.min}–${s.max} Daily Miles | ${tour.rating}</span><h1>${esc(tour.name)}</h1><p class="lede" style="font-style:normal;font-family:var(--body)">${esc(tour.route)} · ${s.total} miles ${tour.mode === 'bike' ? 'by bike' : 'on foot'} · ${s.nights} nights at ${stays.length} inns</p></div></div>
    <div class="tour-layout">
      <div class="tour-main">
        <h2>The trip</h2><p style="max-width:68ch">${esc(tour.overview)}</p>
        <h2>Tour highlights</h2><ul class="why">${tour.highlights.map(h => `<li>${icon('star')}<span>${esc(h)}</span></li>`).join('')}</ul>
        <h2>Where you'll stay</h2><p class="muted small" style="margin-bottom:12px">Inns are matched to each night's stop. Swap any of them once the tour is in your trip.</p>
        <div class="grid-2">${stays.map(l => innCard(l)).join('')}</div>
        <h2>Day by day</h2>
        ${days.map((d, i) => { const from = townAtMile(d.fromMile).name.split(' (')[0], to = townAtMile(d.toMile).name.split(' (')[0]; const sec = sectionAt(Math.max(d.fromMile, d.toMile) - 0.1); const l = d.lodgingId ? byId(d.lodgingId) : null; const dm = Math.abs(d.toMile - d.fromMile);
          return `<div class="narr"><div class="d">Day ${d.n}<small>${r1(dm)} mi · +${gainBetween(d.fromMile, d.toMile)} ft · ~${hoursFor(dm, tour.mode)} hrs</small></div><div><h3>${esc(from)} → ${esc(to)}</h3><p>${esc(sec.blurb)}</p>${l ? `<div class="tonight-line">${icon('moon')}<b>Tonight in ${esc(l.town)}: <a href="#stay/${l.id}">${esc(l.name)}</a></b><span class="muted">${esc(l.tagline)}</span></div>` : `<div class="tonight-line">${icon('flag')}<b>Trip ends in ${esc(to)}.</b><span class="muted">Add a final night from the itinerary if you'd rather not travel home the same day.</span></div>`}</div></div>`; }).join('')}
        <h2>What's included</h2><ul class="incl">${TOUR_INCLUDES.map(i => `<li>${icon('check')}<span>${esc(i)}</span></li>`).join('')}</ul>
        <h2>At a glance</h2>
        <div class="glance"><div><b>Trip length</b><span>${s.days} days · ${s.nights} nights</span></div><div><b>Daily miles</b><span>${s.min}–${s.max}</span></div><div><b>Rating</b><span>${tour.rating}</span></div><div><b>Trail surface</b><span>${[...new Set(days.map(d => sectionAt(Math.max(d.fromMile, d.toMile) - 0.1).name))].join(', ')}</span></div><div><b>Meals</b><span>${esc(tour.meals)}</span></div><div><b>Group size</b><span>Max ${tour.groupMax} on guided departures</span></div><div><b>Support</b><span>Luggage van, 24-hr traveler line, mechanic on guided dates</span></div><div><b>Minimum age</b><span>12 with an adult</span></div><div><b>Offline</b><span>Trail Mode download included</span></div></div>
        <div class="quote"><p>"${esc(tour.testimonial.q)}"</p><b>${esc(tour.testimonial.who)}</b></div>
        <h2>More inn-to-inn tours</h2><div class="grid-3">${others.map(tourCard).join('')}</div>
      </div>
      <aside><div class="price-box">
        <span class="big">${money(tour.price)}<small> per person, double occupancy</small></span>
        <div class="line"><span>Single supplement</span><span class="num">${money(tour.single)}</span></div>
        ${tour.bikeRental ? `<div class="line"><span>Hybrid bike rental</span><span class="num">${money(tour.bikeRental)}</span></div><div class="line"><span>E-bike rental</span><span class="num">${money(Math.round(tour.bikeRental * 1.6))}</span></div>` : ''}
        <b style="margin-top:6px">Guided departures</b>
        <div class="dep-list">${tour.departures.map(d => `<div class="dep-row"><div><b>${fmt(d, 'long')}, 2026</b><span>Ride leader · max ${tour.groupMax} · ${avail(stays[0] ? stays[0].id : 'trailside', d) > 2 ? 'spaces available' : 'a few spaces left'}</span></div><button class="btn btn-primary btn-sm" data-act="book-dep" data-tour="${tour.id}" data-date="${d}">Book</button></div>`).join('')}</div>
        <b style="margin-top:6px">Or go self-guided, your dates</b>
        <form data-act="tour-self" data-tour="${tour.id}" style="display:grid;grid-template-columns:1fr auto;gap:8px" novalidate><label class="sr" for="ts-date">Start date</label><input id="ts-date" type="date" value="${tour.departures[0]}" min="2026-09-08" style="min-height:44px;border:2px solid var(--line);border-radius:8px;padding:0 10px"><button class="btn btn-forest btn-sm" type="submit">Plan it</button></form>
        <a class="btn btn-outline btn-block" href="#tours">Request free itinerary</a>
        <p class="small muted">Departures within 14 days: call (855) 555-0199. Free cancellation up to 7 days before departure.</p>
      </div></aside>
    </div></div></section>`;
}

function viewCheckout() {
  const t = state.trip;
  if (!t || !tripNights(t).length) return `<section class="section"><div class="wrap"><div class="empty"><b>Nothing to book yet.</b><span>Plan a trip and choose a stay for each night first.</span><a class="btn btn-primary" href="#plan">Plan a trip</a></div></div></section>`;
  const cost = tripCost(t); const nights = tripNights(t); const tour = cost.tour;
  return `<section class="section" style="padding-top:28px"><div class="wrap">
    <p class="eyebrow">Checkout</p><h2>${tour ? `Book ${esc(tour.name)}` : 'Book your entire trail trip'}</h2><p class="muted" style="margin:6px 0 20px">${nights.length} ${nights.length === 1 ? 'night' : 'nights'} at ${new Set(nights.map(d => d.lodgingId)).size} independently owned ${nights.length === 1 ? 'property' : 'properties'}. One payment, one confirmation.</p>
    <div class="co-layout">
      <div>
        <div class="co-section"><h2>${tour ? 'Your tour' : 'Your trail trip'}</h2>
          ${tour ? `<div class="co-stay"><div class="thumb" style="background-image:${scene('tour-' + tour.id, tour.scene)}"></div><div><span class="date">Departs ${fmt(t.date, 'long')} · ${t.guided ? 'Guided departure' : 'Self-guided'}</span><b style="display:block">${esc(tour.name)}</b><span class="small muted">${esc(tour.route)} · ${t.days.length} days · ${t.travelers} ${t.travelers === 1 ? 'traveler' : 'travelers'} · inns, breakfasts, lunches and luggage transfer included</span></div><div class="price"><span class="num">${money(cost.pkg)}</span><small>${money(tour.price)} per person${cost.single ? ` + ${money(cost.single)} single` : ''}</small></div></div>
            ${tour.bikeRental ? `<label class="toggle" style="margin:12px 0"><input type="checkbox" data-plan="bikeRental" ${t.bikeRental ? 'checked' : ''}><span><b>Add hybrid bike rental</b><span>${money(tour.bikeRental)} per person, delivered to your first inn. E-bikes available on request.</span></span></label>` : ''}
            <h4 style="font-family:var(--body);font-size:.78rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin:16px 0 4px">Included stays</h4>` : ''}
          ${nights.map(d => { const l = byId(d.lodgingId); const rooms = roomsFor(t, l); return `<div class="co-stay"><div class="thumb" style="background-image:${photo(l)}"></div><div><span class="date">${fmt(d.date, 'long')} · Night ${d.n}</span><b style="display:block">${esc(l.name)}</b><span class="small muted">${esc(l.roomTypes[0].name)}${rooms > 1 ? ` × ${rooms}` : ''} · ${esc(l.town)} · ${availHTML(l.id, d.date)}</span></div><div class="price">${tour ? '<span class="tag">Included</span>' : `<span class="num">${money(l.rate * rooms)}</span><small>1 night${rooms > 1 ? ` · ${rooms} rooms` : ''}</small>`}</div></div>`; }).join('')}
          ${!tour && t.baggage ? `<div class="co-stay"><div class="thumb" style="background:var(--sage-pale);display:grid;place-items:center;color:var(--forest)">${icon('bag')}</div><div><span class="date">Add-on</span><b style="display:block">Baggage transfer</b><span class="small muted">${cost.nights} transfers · up to 2 bags per traveler</span></div><div class="price"><span class="num">${money(cost.bag)}</span><small>${money(BAG_RATE)} each</small></div></div>` : ''}
          <p class="small" style="margin-top:12px"><a href="#plan">${tour ? 'Swap a stay or change travelers' : 'Change stays or dates'}</a></p>
        </div>
        <div class="co-section"><h2>Lead traveler</h2><form class="form" id="guest-form" novalidate>
          <div class="field"><label for="g-name">Full name</label><input id="g-name" required placeholder="Jordan Ellis"></div>
          <div class="field"><label for="g-email">Email</label><input id="g-email" type="email" required placeholder="you@example.com"></div>
          <div class="field"><label for="g-phone">Mobile phone</label><input id="g-phone" type="tel" placeholder="(555) 555-0100"><span class="small muted">For arrival texts from each inn</span></div>
          <div class="field"><label for="g-party">Travelers</label><input id="g-party" value="${t.travelers}" readonly></div>
          <div class="field span2"><label for="g-notes">Notes for the inns</label><textarea id="g-notes" placeholder="Dietary needs, late arrival, bike sizes for storage..."></textarea></div>
        </form></div>
        <div class="co-section"><h2>Payment</h2><div class="pay">${icon('shield')} <b>Secure payment through the ResNexus booking engine.</b> Card details are entered on the payment step and are never stored by Trail Stays. Each inn receives its own reservation; you receive one receipt.</div>
          <p class="small muted" style="margin-top:12px">Cancellation: free up to 7 days before the first night. Each inn's policy applies after that and is shown on your confirmation.</p></div>
      </div>
      <aside><div class="co-box"><h3>Trip total</h3>
        ${tour ? `<div class="line"><span>${esc(tour.name)} × ${t.travelers}</span><span class="num">${money(tour.price * t.travelers)}</span></div>${cost.single ? `<div class="line"><span>Single supplement</span><span class="num">${money(cost.single)}</span></div>` : ''}${cost.bike ? `<div class="line"><span>Bike rental × ${t.travelers}</span><span class="num">${money(cost.bike)}</span></div>` : ''}`
        : nights.map(d => { const l = byId(d.lodgingId); return `<div class="line"><span>${fmt(d.date)} – ${esc(l.name)}</span><span class="num">${money(l.rate * roomsFor(t, l))}</span></div>`; }).join('') + (t.baggage ? `<div class="line"><span>Baggage transfer</span><span class="num">${money(cost.bag)}</span></div>` : '')}
        <div class="line"><span>Taxes &amp; fees</span><span class="num">${money(cost.total * 0.1175)}</span></div>
        <div class="total"><span>Trip total</span><span class="num">${money(cost.total * 1.1175)}</span></div>
        <div class="sync"><span class="live"></span>Rooms held for 12 minutes while you check out</div>
        <button class="btn btn-primary btn-block" data-act="book" style="min-height:56px;font-size:1.1rem">Book Entire Trip</button>
        <p class="small muted">By booking you agree to the terms of each participating inn and to Trail Stays' traveler terms.</p>
      </div></aside>
    </div></div></section>`;
}

function viewConfirm() {
  const b = state.booking; if (!b) return viewCheckout();
  return `<section class="section"><div class="wrap" style="max-width:760px">
    <p class="eyebrow">Booking confirmed</p><h2>Your trail trip is booked, ${esc(b.name.split(' ')[0])}.</h2>
    <p class="muted" style="margin:8px 0 20px">Confirmation <code>${b.id}</code> · ${b.tour ? `${esc(b.tour)} · ` : ''}${fmt(b.nights[0].date, 'long')} – ${fmt(b.nights[b.nights.length - 1].date, 'long')} · ${money(b.total)} paid. Each inn has your reservation on its own calendar.</p>
    ${(() => { const n = b.nights.filter(x => isCircleMember(byId(x.lodgingId))).length; return n ? `<div class="notice" style="margin-bottom:16px"><b>Trail Circle:</b> this trip logs ${n} ${n === 1 ? 'stay' : 'stays'} at member inns. ${n >= 5 ? 'That completes a circle. Your gift certificate arrives with your final confirmation.' : `${5 - n} more and you've earned a gift certificate good at any member inn.`}</div>` : ''; })()}
    ${b.nights.map(n => { const l = byId(n.lodgingId); return `<div class="confirm-card"><div><span class="small" style="color:var(--clay-deep);font-weight:700;text-transform:uppercase;letter-spacing:.06em">${fmt(n.date, 'long')} · Night ${n.n}</span><b style="display:block">${esc(l.name)}</b><span class="small muted">${esc(l.address)} · <a href="tel:${l.phone.replace(/\D/g, '')}">${esc(l.phone)}</a></span></div><div class="small" style="text-align:right">Inn confirmation<br><code>${n.conf}</code></div></div>`; }).join('')}
    ${b.bag ? `<div class="confirm-card"><div><b>Baggage transfer</b><span class="small muted" style="display:block">Valley Bag Shuttle · bags out by 9 AM, delivered by 3 PM · dispatch (413) 555-0100</span></div><code>VBS-${b.id.slice(-4)}</code></div>` : ''}
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:20px"><a class="btn btn-forest" href="#trail-mode">${icon('download')} Download Trip for Offline Use</a><a class="btn btn-outline" href="#map">See it on the map</a><button class="btn btn-light" data-act="new-trip">Plan another trip</button></div>
  </div></section>`;
}

function viewTrailMode() {
  const t = state.trip; const p = state.ui.tmProgress; const saved = state.offline;
  const items = ['Your full itinerary with daily mileage', 'Trail map with mile markers', 'Inn addresses and phone numbers', 'Directions from the trail to each inn', 'Baggage transfer pickup times', 'Emergency contacts'];
  return `<section class="section" style="padding-top:28px"><div class="wrap">
    <div class="tm-hero"><div><p class="eyebrow" style="color:var(--gold-light)">Trail Mode</p><h2>Everything you need, even with no signal</h2><p style="margin-top:8px">Long stretches of the Ware River Valley and Wachusett sections have no cell coverage. Trail Mode saves your trip to this phone so it opens instantly, offline.</p>
      <ul>${items.map(i => `<li>${icon('check')}${i}</li>`).join('')}</ul></div>
      <div class="tm-panel">${saved ? `<b>${icon('check')} Saved on this device</b><span class="small" style="color:rgba(255,255,255,.75)">${esc(saved.title)} · ${saved.size} · updated ${esc(saved.when)}</span>` : `<b>${icon('wifi')} Not saved yet</b><span class="small" style="color:rgba(255,255,255,.75)">${t ? 'About 240 KB. Takes a few seconds on any connection.' : 'Plan a trip first, then download it here.'}</span>`}
        ${p >= 0 && p < 100 ? `<div class="progress"><i style="width:${p}%"></i></div><span class="small">Saving map tiles and directions… ${p}%</span>` : ''}
        <button class="btn btn-primary btn-block" data-act="tm-download" ${t ? '' : 'disabled'}>${icon('download')} ${saved ? 'Update offline copy' : 'Download Trip for Offline Use'}</button>
        ${saved ? `<button class="btn btn-block" style="color:#fff;border-color:rgba(255,255,255,.35)" data-act="print">${icon('print')} Print a paper backup</button>` : ''}
        <span class="small" style="color:rgba(255,255,255,.6)">Installs as an app on iPhone and Android: Share › Add to Home Screen.</span></div></div>
    ${t ? `<div class="offline" style="margin-top:24px"><div class="oh"><b>${esc(tripTitle(t))}</b><span class="small">${fmt(t.date, 'long')} – ${fmt(t.days[t.days.length - 1].date, 'long')} · ${r1(tripMiles(t))} mi</span></div>
      ${t.days.map(d => { const l = d.lodgingId ? byId(d.lodgingId) : null; const from = townAtMile(d.fromMile), to = townAtMile(d.toMile); return `<div class="on"><div class="d">Day ${d.n}</div><div><b>${esc(from.name.split(' (')[0])} → ${esc(to.name.split(' (')[0])}</b> · <span class="num">${r1(Math.abs(d.toMile - d.fromMile))} mi</span> · ${fmt(d.date, 'long')}
        ${l ? `<div style="margin-top:8px"><b>${icon('moon')} ${esc(l.name)}</b><br>${esc(l.address)}<br><a href="tel:${l.phone.replace(/\D/g, '')}">${esc(l.phone)}</a> · Check-in ${esc(l.checkin)}<div class="dir">${icon('map')} ${esc(l.directions)}</div>${t.baggage && l.amen.luggage ? '<div class="small muted" style="margin-top:6px">Bags: leave at front desk by 9 AM.</div>' : ''}</div>` : '<div class="small muted" style="margin-top:6px">No overnight stay booked.</div>'}</div></div>`; }).join('')}
      <div class="em"><b>Emergency &amp; trail contacts</b>${EMERGENCY.map(e => `<div><span>${esc(e.label)}</span><a href="tel:${e.value.replace(/\D/g, '')}"><b>${esc(e.value)}</b></a></div>`).join('')}<p class="small" style="margin-top:8px">If you are hurt on the trail, give 911 the nearest mile marker. Markers are posted every half mile.</p></div></div>` : `<div class="empty" style="margin-top:24px"><b>No trip to save yet.</b><span>Plan a trip and it will appear here, ready for offline use.</span><a class="btn btn-primary" href="#plan">Plan a trip</a></div>`}
    <p class="small muted" style="margin-top:14px">Production build: a Progressive Web App with a service worker caching the itinerary, vector map tiles for the trail corridor, and property details. Updates sync automatically when a connection returns.</p>
  </div></section>`;
}

function viewJoin() {
  const benefits = [['users', 'Multi-night travelers', 'Trail trips average 3.4 nights. Guests arrive with the next inn already booked, so there is no bargaining over one-night minimums.'], ['sync', 'Keep your own system', 'Connect ResNexus, or share an iCal feed from any booking engine. Your calendar stays the source of truth.'], ['shield', 'No double bookings', 'Availability is read live at search and held for 12 minutes at checkout. Confirmed stays post back to your calendar instantly.'], ['print', 'Your story, told well', 'Your page leads with what makes your place memorable: the porch, the breakfast, the trail knowledge. Not a spec sheet.'], ['bag', 'Baggage network', 'Opt in to luggage transfer and the shuttle handles bags. You just receive and release them.'], ['map', 'On the map', 'A pin at your trail mile, your distance from the trail, and directions from the nearest trailhead.']];
  return `<section class="section" style="padding-top:28px"><div class="wrap">
    <div class="join-hero"><div><p class="eyebrow">For lodging operators</p><h2>Own an inn along the trail? Join the network.</h2><p class="muted" style="margin-top:10px;max-width:52ch">Trail Stays fills midweek rooms with walkers and cyclists who need a bed exactly where you are. You keep your booking system, your rates, and your guests.</p>
      <div class="hero-stats" style="margin-top:20px"><div><b class="num" style="color:var(--forest)">${LODGING.length}</b><span style="color:var(--muted)">founding properties</span></div><div><b class="num" style="color:var(--forest)">${TRAIL.length}</b><span style="color:var(--muted)">route miles</span></div><div><b class="num" style="color:var(--forest)">${SECTIONS.length}</b><span style="color:var(--muted)">trail sections</span></div></div></div>
      <div class="card"><div class="card-img" style="background-image:${scene('join', 'inn')};aspect-ratio:16/11"></div></div></div>
    <div class="grid-3" style="margin-top:36px">${benefits.map(b => `<div class="benefit">${icon(b[0])}<h3>${b[1]}</h3><p>${b[2]}</p></div>`).join('')}</div>
    <div class="section-head" style="margin-top:44px"><div><p class="eyebrow">How the calendar sync works</p><h2>Your calendar, read live and written back</h2></div></div>
    <div class="sync-diagram"><div class="node">Your booking system<span>ResNexus API or iCal feed</span></div><div class="arr">⇄</div><div class="node">Trail Stays availability<span>read at search, held 12 min at checkout</span></div><div class="arr">⇄</div><div class="node">Traveler's one checkout<span>your reservation posted back instantly</span></div></div>
    <div class="section-head" style="margin-top:44px"><div><p class="eyebrow">Apply</p><h2>Tell us about your property</h2><p>We reply within two business days and set up the calendar connection with you on a short call.</p></div></div>
    ${state.ui.joined ? `<div class="notice" style="background:var(--sage-pale);border-color:var(--sage);color:var(--forest-ink);padding:20px"><b>${icon('check')} Thanks, we have your application.</b> Expect an email from the network team within two business days.</div>` : `<form class="form" id="join-form" data-act="join-submit" novalidate style="background:#fff;border:1px solid var(--line);border-radius:var(--radius-lg);padding:22px">
      <div class="field"><label for="j-name">Property name</label><input id="j-name" required placeholder="Maple Hill Inn"></div>
      <div class="field"><label for="j-town">Town</label><select id="j-town">${TOWNS.map(t => `<option>${esc(t.name)}</option>`).join('')}</select></div>
      <div class="field"><label for="j-type">Property type</label><select id="j-type">${Object.values(TYPE_LABEL).map(v => `<option>${v}</option>`).join('')}</select></div>
      <div class="field"><label for="j-rooms">Number of rooms</label><input id="j-rooms" type="number" min="1" placeholder="8"></div>
      <div class="field"><label for="j-dist">Distance from trail (miles)</label><input id="j-dist" type="number" step="0.1" min="0" placeholder="0.5"></div>
      <div class="field"><label for="j-sys">Booking system</label><select id="j-sys"><option>ResNexus</option><option>Cloudbeds</option><option>Little Hotelier</option><option>ThinkReservations</option><option>Airbnb / VRBO calendar</option><option>Other / paper calendar</option></select></div>
      <div class="field"><label for="j-contact">Contact name</label><input id="j-contact" required></div>
      <div class="field"><label for="j-email">Email</label><input id="j-email" type="email" required></div>
      <div class="field span2"><label>Services you can offer</label><div style="display:flex;gap:16px;flex-wrap:wrap">${['Breakfast', 'Secure bike storage', 'Laundry', 'Pet friendly', 'Luggage transfer'].map(a => `<label class="check"><input type="checkbox">${a}</label>`).join('')}</div></div>
      <div class="span2"><button class="btn btn-primary" type="submit">Submit application ${icon('arrow')}</button></div>
    </form>`}
  </div></section>`;
}

/* ---------- shell ---------- */
const NAV = [['plan', 'Plan a Trip'], ['tours', 'Inn-to-Inn Tours'], ['map', 'Trail Map'], ['stays', 'Stays'], ['trail-mode', 'Trail Mode'], ['join', 'For Innkeepers']];
function navHTML() {
  const r = state.route.name; const t = state.trip; const cost = t ? tripCost(t) : null;
  const links = NAV.map(n => `<a href="#${n[0]}" class="${r === n[0] || (n[0] === 'stays' && r === 'stay') || (n[0] === 'tours' && r === 'tour') ? 'active' : ''}">${n[1]}</a>`).join('');
  return `<header class="nav"><div class="wrap nav-in">
    <a class="brand" href="#home"><span class="brand-mark">${icon('flag')}</span>Mass Central Trail Stays</a>
    <nav class="nav-links" aria-label="Main">${links}</nav>
    <div class="nav-right">${t ? `<a class="trip-pill" href="#plan">${icon('moon')} My Trip <span class="count">${cost.nights} ${cost.nights === 1 ? 'night' : 'nights'}</span></a>` : '<a class="trip-pill" href="#plan">Plan a Trip</a>'}<button class="nav-toggle" data-act="drawer" aria-label="Menu" aria-expanded="${state.ui.drawer}">${icon(state.ui.drawer ? 'close' : 'menu')}</button></div>
    <nav class="nav-drawer${state.ui.drawer ? ' open' : ''}" aria-label="Mobile">${links}<a href="#plan">${t ? `My Trip · ${cost.nights} nights · ${money(cost.total)}` : 'Plan a Trip'}</a></nav>
  </div></header>${r === 'map' || r === 'plan' ? `<div class="view-switch"><div class="seg"><a href="#map" class="${r === 'map' ? 'on' : ''}">${icon('map')} Map</a><a href="#plan" class="${r === 'plan' ? 'on' : ''}">${icon('list')} Itinerary</a></div></div>` : ''}`;
}
function mobileBarHTML() {
  const r = state.route.name; const t = state.trip;
  if (r === 'checkout' || r === 'confirmation') return '';
  if (!t) return `<div class="mobile-bar"><div class="mobile-bar-in"><div class="info"><b>Plan a multi-day trip</b><span>Stops, stays and bags, one checkout</span></div><a class="btn btn-primary" href="#plan">Start</a></div></div>`;
  const c = tripCost(t);
  const onPlan = r === 'plan';
  return `<div class="mobile-bar"><div class="mobile-bar-in"><div class="info"><b>${t.days.length}-day trip · ${c.nights} ${c.nights === 1 ? 'night' : 'nights'}</b><span>${esc(town(t.start).name.split(' (')[0])} → ${esc(town(t.end).name.split(' (')[0])} · ${money(c.total)}</span></div>${onPlan ? `<a class="btn btn-primary" href="#checkout" ${c.nights ? '' : 'style="opacity:.5;pointer-events:none"'}>Book Trip</a>` : `<a class="btn btn-primary" href="#plan">View My Trip</a>`}</div></div>`;
}
function footerHTML() {
  return `<footer><div class="wrap"><div class="cols">
    <div><div class="brand" style="color:#fff"><span class="brand-mark" style="background:var(--ochre);color:var(--forest-ink)">${icon('flag')}</span>Mass Central Trail Stays</div><p class="small" style="margin-top:12px;max-width:40ch">Lodging and trip planning for the Mass Central Rail Trail, from the Connecticut River to Boston Harbor. A network of independently owned inns, B&Bs, hotels and rentals.</p></div>
    <div><h4>Plan</h4><a href="#plan">Trip planner</a><a href="#map">Trail map</a><a href="#stays">All stays</a><a href="#trail-mode">Trail Mode (offline)</a></div>
    <div><h4>Trail</h4>${RESOURCES.slice(0, 4).map(r => `<a href="${r.url}" target="_blank" rel="noopener">${esc(r.name)}</a>`).join('')}</div>
    <div><h4>Network</h4><a href="#join">Join as an innkeeper</a><a href="#join">Baggage transfer partners</a><a href="#home">Contact</a></div>
  </div><div class="fine">Prototype for RFP review. Route alignment and mileage follow the MCRT full route on Ride with GPS (${TRAIL.length} mi). Trail surface and status reference: MassTrailTracker.com, an independent statewide trail map built by Danny in Boston. Parking and restroom points are real; lodging properties, shops and restaurants are illustrative examples, not real businesses. Booking engine integration: ResNexus.</div></div></footer>`;
}
function shell(view) {
  return navHTML() + `<main id="view">${view}</main>` + footerHTML() + '<div class="toast-host"></div>' + mobileBarHTML();
}

/* ---------- render + router ---------- */
function render(scrollTop) {
  const app = $('#app'); const r = state.route; let view;
  switch (r.name) {
    case 'map': view = viewMap(); break;
    case 'plan': view = viewPlan(); break;
    case 'stays': view = viewStays(); break;
    case 'tours': view = viewTours(); break;
    case 'tour': view = viewTour(r.arg); break;
    case 'stay': view = viewStay(r.arg); break;
    case 'checkout': view = viewCheckout(); break;
    case 'confirmation': view = viewConfirm(); break;
    case 'trail-mode': view = viewTrailMode(); break;
    case 'join': view = viewJoin(); break;
    default: view = viewHome();
  }
  app.innerHTML = shell(view);
  $$('[data-map]', app).forEach(mountMap);
  if (r.name === 'plan' && state.trip) animateRibbon(state.trip);
  if (scrollTop) app.scrollTop = 0;
}
function refreshShell() {
  const app = $('#app');
  const nav = $('.nav', app); if (nav) nav.outerHTML = navHTML().replace(/<div class="view-switch">[\s\S]*$/, '');
  const bar = $('.mobile-bar', app); const fresh = mobileBarHTML(); if (bar) bar.outerHTML = fresh; else if (fresh) app.insertAdjacentHTML('beforeend', fresh);
}
function route() {
  const h = location.hash.replace(/^#\/?/, '') || 'home';
  const parts = h.split('/');
  state.route = { name: parts[0], arg: parts[1] };
  state.ui.drawer = false; state.ui.mapSel = null; state.ui.propDate = '';
  if (state.route.name === 'join') state.ui.joined = false;
  render(true);
}
let toastTimer;
function toast(msg) {
  const host = $('.toast-host'); if (!host) return;
  host.innerHTML = `<div class="toast" role="status">${esc(msg)}</div>`;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { host.innerHTML = ''; }, 3600);
}
function readForm() {
  const f = state.form;
  $$('[data-form]').forEach(el => { if (el.hidden) return; f[el.dataset.form] = el.type === 'number' || el.dataset.form === 'travelers' ? Number(el.value) : el.value; });
  return f;
}

/* ---------- events ---------- */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const act = el.dataset.act;
  if (act === 'walker') { const w = $('#walker'); const t = state.trip; if (w && t && !e.target.closest('button,a,input')) { const d = t.days[Number(el.dataset.day) - 1]; const a = town(t.start).mile, b = town(t.end).mile; w.style.left = ((d.toMile - Math.min(a, b)) / (Math.abs(b - a) || 1) * 100).toFixed(1) + '%'; } return; }
  if (el.tagName === 'FORM') return;
  switch (act) {
    case 'drawer': state.ui.drawer = !state.ui.drawer; refreshShell(); break;
    case 'mode': state.form.mode = el.dataset.val; if (!state.form.custom) state.form.mpd = el.dataset.val === 'bike' ? 25 : 15; $$('[data-act="mode"]').forEach(b => b.classList.toggle('on', b === el)); $$('[data-act="mpd"]').forEach(b => b.classList.toggle('on', b.dataset.val === String(state.form.mpd))); break;
    case 'mpd': { const v = el.dataset.val; const custom = $('#f-custom'); if (v === 'custom') { state.form.custom = true; if (custom) { custom.hidden = false; custom.focus(); } } else { state.form.custom = false; state.form.mpd = Number(v); if (custom) { custom.hidden = true; custom.value = v; } } $$('[data-act="mpd"]').forEach(b => b.classList.toggle('on', b === el)); break; }
    case 'book-dep': { const tour = tourById(el.dataset.tour); startTour(tour.id, el.dataset.date, (state.trip && state.trip.travelers) || 2, true); toast(`${tour.name}, departing ${fmt(el.dataset.date, 'long')}. Review your inns, then book.`); location.hash = '#plan'; if (state.route.name === 'plan') render(true); break; }
    case 'select-stay': { const d = state.trip.days[Number(el.dataset.day) - 1]; d.lodgingId = el.dataset.id; save(); render(false); toast(`Night ${d.n}: ${byId(d.lodgingId).name}`); break; }
    case 'clear-stay': { const d = state.trip.days[Number(el.dataset.day) - 1]; d.lodgingId = null; save(); render(false); break; }
    case 'plan-mode': state.trip.mode = el.dataset.val; planTrip(state.trip, true); render(false); break;
    case 'add-trip': addToTrip(el.dataset.id); break;
    case 'dir-view': state.ui.dirView = el.dataset.val; render(false); break;
    case 'dir-cat': state.dir.cat = el.dataset.val; render(false); break;
    case 'alts': { const n = Number(el.dataset.day); if (state.ui.openAlts.has(n)) state.ui.openAlts.delete(n); else state.ui.openAlts.add(n); render(false); const day = $('#day-' + n); if (day) day.scrollIntoView({ block: 'nearest' }); break; }
    case 'filters-toggle': state.ui.filtersOpen = !state.ui.filtersOpen; render(false); break;
    case 'legend-toggle': state.ui.legendOpen = !state.ui.legendOpen; $$('.map-legend').forEach(l => l.classList.toggle('open', state.ui.legendOpen)); break;
    case 'dir-reset': state.dir = { cat: state.dir.cat, section: 'all', date: state.dir.date, maxPrice: 350, maxDist: 2, amen: new Set() }; render(false); break;
    case 'map-card-close': state.ui.mapSel = null; $$('.map-card-slot').forEach(s => { s.innerHTML = ''; }); $$('.pin.sel').forEach(p => p.classList.remove('sel')); break;
    case 'book': {
      const name = ($('#g-name') || {}).value || ''; const email = ($('#g-email') || {}).value || '';
      if (!name.trim() || !/.+@.+\..+/.test(email)) { toast('Add the lead traveler\'s name and a valid email to book.'); ($('#g-name') || {}).focus && $('#g-name').focus(); return; }
      const t = state.trip; const cost = tripCost(t); const id = 'MCT-' + String(hash(name + email + t.date) % 100000).padStart(5, '0');
      state.booking = { id, name, email, total: Math.round(cost.total * 1.1175), bag: t.baggage, tour: cost.tour ? cost.tour.name : null, nights: tripNights(t).map(d => ({ n: d.n, date: d.date, lodgingId: d.lodgingId, conf: byId(d.lodgingId).name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 3) + '-' + String(hash(id + d.lodgingId) % 10000).padStart(4, '0') })) };
      save(); location.hash = '#confirmation'; break;
    }
    case 'new-trip': state.trip = null; state.booking = null; state.offline = null; save(); location.hash = '#home'; toast('Trip cleared. Start a new one any time.'); break;
    case 'tm-download': {
      if (!state.trip) return; state.ui.tmProgress = 0; render(false);
      const tick = () => { state.ui.tmProgress += 20; if (state.ui.tmProgress >= 100) { state.ui.tmProgress = -1; state.offline = { title: tripTitle(state.trip), size: '238 KB', when: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) }; save(); render(false); toast('Saved. Your trip now opens without a connection.'); } else { render(false); setTimeout(tick, 350); } };
      setTimeout(tick, 350); break;
    }
    case 'print': window.print(); break;
    case 'phone': document.body.classList.toggle('phone'); el.innerHTML = document.body.classList.contains('phone') ? icon('monitor') + ' Desktop view' : icon('phone') + ' Phone view'; $$('[data-map]').forEach(mountMap); break;
  }
});
document.addEventListener('submit', e => {
  const form = e.target; e.preventDefault();
  if (form.dataset.act === 'plan-submit') {
    const f = readForm();
    if (f.start === f.end) { toast('Pick two different points on the trail.'); return; }
    if (!f.date) { toast('Choose a trip start date.'); return; }
    planTrip(Object.assign({}, f)); location.hash = '#plan'; if (state.route.name === 'plan') render(true);
  }
  if (form.dataset.act === 'tour-self') {
    const date = $('#ts-date').value; if (!date) { toast('Choose a start date.'); return; }
    const tour = tourById(form.dataset.tour); startTour(tour.id, date, (state.trip && state.trip.travelers) || 2, false);
    toast(`${tour.name}, self-guided from ${fmt(date, 'long')}. Review your inns, then book.`); location.hash = '#plan'; return;
  }
  if (form.dataset.act === 'request-submit') {
    const email = $('#rq-email').value; if (!/.+@.+\..+/.test(email)) { toast('Add a valid email and we\'ll send the itinerary.'); $('#rq-email').focus(); return; }
    state.ui.requested = email; render(false); return;
  }
  if (form.dataset.act === 'join-submit') {
    if (!$('#j-name').value.trim() || !/.+@.+\..+/.test($('#j-email').value)) { toast('Add your property name and an email address.'); return; }
    state.ui.joined = true; render(false); $('#app').scrollTop = $('#app').scrollHeight - 1200;
  }
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.dataset.plan && state.trip) {
    const k = el.dataset.plan; const t = state.trip;
    if (k === 'baggage') { t.baggage = el.checked; save(); render(false); return; }
    if (k === 'bikeRental') { t.bikeRental = el.checked; save(); render(false); return; }
    const next = Object.assign({}, t, { [k]: k === 'mpd' || k === 'travelers' ? Number(el.value) : el.value });
    if (next.start === next.end) { toast('Start and end must be different.'); el.value = t[k]; return; }
    if (t.tour && ['start', 'end', 'mpd', 'mode'].includes(k)) { delete next.tour; delete next.guided; toast('Route changed, so this is now a custom trip priced per night.'); }
    planTrip(next, true); render(false); return;
  }
  if (el.dataset.dir) {
    const k = el.dataset.dir;
    if (k === 'amen') { if (el.checked) state.dir[k].add(el.value); else state.dir[k].delete(el.value); }
    else state.dir[k] = el.type === 'range' ? Number(el.value) : el.value;
    render(false); return;
  }
  if (el.hasAttribute('data-propdate')) { state.ui.propDate = el.value; render(false); return; }
  if (el.dataset.mapf && el.closest('.map-toolbar')) {
    if (el.checked) state.ui.mapFilters.add(el.dataset.mapf); else state.ui.mapFilters.delete(el.dataset.mapf);
    el.closest('.chip').classList.toggle('on', el.checked);
    $$('[data-map] svg').forEach(svg => { svg.innerHTML = mapSVGInner(mapOptsFor(svg.parentElement)); });
  }
  if (el.dataset.form === 'mpd') state.form.mpd = Number(el.value) || 15;
});
window.addEventListener('hashchange', route);
window.addEventListener('resize', () => { /* keep maps fitted when the frame changes */ $$('[data-map]').forEach(w => { const svg = $('svg', w); if (svg) svg.setAttribute('viewBox', `0 0 ${MAP.W} ${MAP.H}`); mountMap(w); }); });

load();
if (state.trip) state.form = Object.assign({}, state.form, { start: state.trip.start, end: state.trip.end, date: state.trip.date, mpd: state.trip.mpd, mode: state.trip.mode, travelers: state.trip.travelers });
route();
})();
