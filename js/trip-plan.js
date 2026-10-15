// ── Golf trip plan (Valencia) ────────────────────────────────────────────────
// Renders a lead form into <div class="trip-card" data-course="<id>"></div> on the EN Valencia
// course pages, builds a day-by-day plan on screen, and posts the lead to /api/trip-lead.
// Fees mirror the course pages (October 2026); keep them in sync when prices change.
(function () {
  var root = document.querySelector('.trip-card[data-course]');
  if (!root) return;

  // fee: [min, max] per round, per player. weekend: null = same as weekday.
  var COURSES = [
    { id: 'foressos',        name: 'Foressos Golf',          area: 'Picassent',     url: '/en/valencia/foressos/',        weekday: [70, 70],   weekend: [80, 80],   hcp: 'no',   book: 'https://www.ontee.com/en/booking/Foressos%20Golf%20club/TEE%201/' },
    { id: 'el-saler',        name: 'El Saler (Parador)',     area: 'El Saler',      url: '/en/valencia/el-saler/',        weekday: [115, 150], weekend: null,       hcp: 'yes',  book: 'https://open.teeone.golf/es/parador-saler/disponibilidad', note: '€115 booking ahead online, €150 rack rate.' },
    { id: 'el-bosque',       name: 'El Bosque Golf',         area: 'Chiva',         url: '/en/valencia/el-bosque/',       weekday: [105, 105], weekend: [125, 125], hcp: 'check', book: 'https://elbosque.golfmanager.com/consumer/ebookings' },
    { id: 'la-galiana',      name: 'La Galiana Golf Resort', area: 'Carcaixent',    url: '/en/valencia/la-galiana/',      weekday: [80, 105],  weekend: null,       hcp: 'check', book: 'https://www.ontee.com/en/booking/La%20Galiana%20Golf/18-hole%20course/', note: 'Seasonal pricing.' },
    { id: 'manises',         name: 'Real Club de Golf Manises', area: 'Manises',    url: '/en/valencia/manises/',         weekday: [57, 57],   weekend: [68, 68],   hcp: 'yes',  book: 'https://realclubdegolfmanises.golfmanager.com/consumer/ebookings', note: 'Max handicap 36.0.' },
    { id: 'oliva-nova',      name: 'Oliva Nova Golf',        area: 'Oliva',         url: '/en/valencia/oliva-nova/',      weekday: [120, 120], weekend: null,       hcp: 'yes',  book: 'https://open.imaster.golf/es/olivanova', note: 'Official rate €120. A 10-round pack (€650) brings it to €65 a round. Mar, Apr, Oct, Nov: visitor tee times from 13:00.' },
    { id: 'escorpion',       name: 'Club de Golf Escorpión', area: 'Bétera',        url: '/en/valencia/escorpion/',       weekday: [160, 160], weekend: null,       hcp: 'yes',  book: null, note: 'Private club: guests only, through a member or an authorised agency.' },
    { id: 'ifach',           name: 'Ifach Golf (9 holes)',   area: 'Benissa',       url: '/en/valencia/ifach/',           weekday: [49.5, 49.5], weekend: null,     hcp: 'check', book: 'https://open.teeone.golf/en/ifach/disponibilidad', note: '18 holes = two laps of the 9-hole course.' },
    { id: 'requena',         name: 'Requena Golf Club (9 holes)', area: 'Requena',  url: '/en/valencia/requena/',         weekday: [10, 10],   weekend: null,       hcp: 'check', book: 'tel:+34667101240', note: '€10 is the partner rate; public green fee not yet verified, call to confirm.' },
    { id: 'masia-estrellas', name: 'Masía de las Estrellas (pitch & putt)', area: 'Catarroja', url: '/en/valencia/masia-estrellas/', weekday: [24, 24], weekend: null, hcp: 'no',   book: 'https://open.teeone.golf/es/masiadelasestrellas' },
    { id: 'cofrentes',       name: 'Cofrentes Golf (pitch & putt)', area: 'Cofrentes', url: '/en/valencia/cofrentes/',   weekday: [15, 15],   weekend: [18, 18],   hcp: 'no',   book: 'mailto:reservascofrentesgolf@balneario.com', note: 'Prices still being verified.' }
  ];
  var byId = {};
  COURSES.forEach(function (c) { byId[c.id] = c; });

  // Clubs: bring vs rent (per player, estimates; sources on the plan)
  var CLUBS = {
    flyRoundTrip: [70, 130],   // low-cost airlines: ~€35–65 each way per golf bag
    rentPerRound: [30, 40],    // club hire at the course (El Saler: €35)
    rentWeek: 100              // weekly hire from a rental company
  };

  var HCP = {
    yes: 'Handicap certificate required',
    no: 'No handicap certificate needed',
    check: 'Bring your handicap certificate; confirm requirements when booking'
  };

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function euro(r) { return r[0] === r[1] ? '€' + fmt(r[0]) : '€' + fmt(r[0]) + '–' + fmt(r[1]); }
  function fmt(n) { return (Math.round(n * 100) / 100).toLocaleString('en-GB', { maximumFractionDigits: 2 }); }
  function iso(d) { return d.toISOString().slice(0, 10); }
  function parseDate(v) { var p = (v || '').split('-'); return p.length === 3 ? new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])) : null; }
  var DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function label(d) { return DAY[d.getUTCDay()] + ' ' + d.getUTCDate() + ' ' + MON[d.getUTCMonth()]; }

  // ── Form ──
  var current = root.getAttribute('data-course');
  var today = iso(new Date());
  root.innerHTML =
    '<h3>⛳ Planning a golf trip to Valencia? Get a free golf trip plan</h3>' +
    '<p class="trip-lead">Tell us your dates and the courses you like. You get a day-by-day plan with green fees, your group budget and whether to bring or rent your clubs, instantly on this page.</p>' +
    '<form class="trip-form" novalidate>' +
      '<div class="trip-grid">' +
        '<label>Name<input name="name" autocomplete="name" required maxlength="80"></label>' +
        '<label>Email<input name="email" type="email" autocomplete="email" required maxlength="120"></label>' +
        '<label>Arrival<input name="arrival" type="date" min="' + today + '" required></label>' +
        '<label>Departure<input name="departure" type="date" min="' + today + '" required></label>' +
        '<label>Players<select name="players">' + [1, 2, 3, 4, 5, 6, 7, 8].map(function (n) { return '<option' + (n === 2 ? ' selected' : '') + '>' + n + '</option>'; }).join('') + '</select></label>' +
        '<label>Your clubs<select name="clubs"><option value="bring">I\'ll bring my clubs</option><option value="rent">I\'ll rent clubs</option><option value="unsure" selected>Not sure yet</option></select></label>' +
      '</div>' +
      '<fieldset class="trip-courses"><legend>Courses you\'re interested in</legend>' +
        COURSES.map(function (c) {
          return '<label class="trip-check"><input type="checkbox" name="course" value="' + c.id + '"' + (c.id === current ? ' checked' : '') + '> ' + esc(c.name) + '</label>';
        }).join('') +
      '</fieldset>' +
      '<label class="trip-hp" aria-hidden="true">Leave empty<input name="website" tabindex="-1" autocomplete="off"></label>' +
      '<label class="trip-consent"><input type="checkbox" name="consent" required> I agree that golfspain.guide stores these details to prepare my trip plan and may contact me about this trip. <a href="/en/privacy/" target="_blank">Privacy Policy</a></label>' +
      '<label class="trip-consent"><input type="checkbox" name="newsletter"> Also send me the monthly Valencia green fee updates (optional).</label>' +
      '<div class="trip-msg" role="alert"></div>' +
      '<button type="submit" class="btn btn--primary trip-submit">Get my free plan →</button>' +
      '<p class="trip-small">Free, no booking made. We don\'t book tee times for you: the plan links to each course\'s own booking page.</p>' +
    '</form>' +
    '<div class="trip-plan" hidden></div>';

  var form = root.querySelector('.trip-form');
  var msg = root.querySelector('.trip-msg');
  var out = root.querySelector('.trip-plan');

  function fail(t) { msg.textContent = t; msg.style.display = 'block'; }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    msg.style.display = 'none';
    var f = form.elements;
    var name = f.name.value.trim(), email = f.email.value.trim();
    var a = parseDate(f.arrival.value), d = parseDate(f.departure.value);
    var players = parseInt(f.players.value, 10) || 1;
    var picked = [].slice.call(form.querySelectorAll('input[name="course"]:checked')).map(function (i) { return i.value; });
    if (!name) return fail('Please add your name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('Please add a valid email.');
    if (!a || !d) return fail('Please choose your arrival and departure dates.');
    var nights = Math.round((d - a) / 86400000);
    if (nights < 1) return fail('Departure must be after arrival.');
    if (nights > 21) return fail('Plans cover trips of up to 21 nights.');
    if (!picked.length) return fail('Pick at least one course.');
    if (!f.consent.checked) return fail('Please tick the box to agree to the Privacy Policy.');

    var lead = {
      name: name, email: email, arrival: f.arrival.value, departure: f.departure.value,
      players: players, clubs: f.clubs.value, courses: picked, page: location.pathname,
      lang: 'en', newsletter: f.newsletter.checked, website: f.website.value
    };
    renderPlan(lead, a, nights);
    submitLead(lead);
  });

  function renderPlan(lead, arrival, nights) {
    var days = [];
    for (var i = 0; i < nights; i++) days.push(new Date(arrival.getTime() + i * 86400000));
    var queue = lead.courses.slice();
    var total = [0, 0], rounds = 0, rows = '';
    days.forEach(function (day, i) {
      var c = byId[queue[i]];
      if (!c) {
        rows += '<li class="trip-day trip-day--free"><strong>Day ' + (i + 1) + ' · ' + label(day) + '</strong><span>Free day: rest, explore Valencia, or replay a favourite course.</span></li>';
        return;
      }
      var wkend = day.getUTCDay() === 0 || day.getUTCDay() === 6;
      var fee = (wkend && c.weekend) ? c.weekend : c.weekday;
      var group = [fee[0] * lead.players, fee[1] * lead.players];
      total[0] += group[0]; total[1] += group[1]; rounds++;
      var book = c.book ? '<a href="' + esc(c.book) + '" target="_blank" rel="noopener">Book</a> · ' : '';
      rows += '<li class="trip-day"><strong>Day ' + (i + 1) + ' · ' + label(day) + ': <a href="' + c.url + '">' + esc(c.name) + '</a></strong>' +
        '<span>' + (c.weekend ? (wkend ? 'Weekend green fee ' : 'Weekday green fee ') : 'Green fee ') + euro(fee) + ' per player · ' + euro(group) + ' for ' + lead.players + '</span>' +
        '<span>' + HCP[c.hcp] + (c.note ? ' · ' + esc(c.note) : '') + '</span>' +
        '<span>' + book + '<a href="' + c.url + '">Course guide</a> · ' + esc(c.area) + '</span></li>';
    });
    var left = lead.courses.slice(nights).map(function (id) { return byId[id].name; });

    // Clubs comparison, per player
    var fly = CLUBS.flyRoundTrip, perRound = [CLUBS.rentPerRound[0] * rounds, CLUBS.rentPerRound[1] * rounds];
    var weeks = Math.max(1, Math.ceil(nights / 7)), week = CLUBS.rentWeek * weeks;
    // Compare mid-points of each option; call it a tie when they are within €15
    var mid = function (r) { return (r[0] + r[1]) / 2; };
    var opts = [
      { k: 'bring', v: mid(fly) },
      { k: 'course', v: mid(perRound) },
      { k: 'week', v: week }
    ].sort(function (x, y) { return x.v - y.v; });
    var rTxt = rounds + ' round' + (rounds === 1 ? '' : 's');
    var verdict = opts[1].v - opts[0].v <= 15
      ? 'With ' + rTxt + ', the options cost about the same: bring your clubs if you prefer your own set, rent to travel light.'
      : opts[0].k === 'bring' ? 'With ' + rTxt + ', bringing your own clubs is the cheaper option, and you play with clubs you know.'
      : opts[0].k === 'week' ? 'With ' + rTxt + ', a weekly rental is the cheapest option, and you travel without a golf bag.'
      : 'With ' + rTxt + ', renting at the course is the cheapest option, and you travel without a golf bag.';

    out.innerHTML =
      '<h4>Your Valencia golf plan · ' + label(arrival) + ', ' + nights + ' night' + (nights > 1 ? 's' : '') + ', ' + lead.players + ' player' + (lead.players > 1 ? 's' : '') + '</h4>' +
      '<ol class="trip-days">' + rows + '</ol>' +
      (left.length ? '<p class="trip-note">Not enough days for: ' + left.map(esc).join(', ') + '. Add nights or swap a course.</p>' : '') +
      '<div class="trip-total"><span>Estimated green fees for the group</span><strong>' + euro(total) + '</strong><small>' + rounds + ' round' + (rounds === 1 ? '' : 's') + ' · buggies and club hire not included</small></div>' +
      '<h4>Bring or rent your clubs? (per player)</h4>' +
      '<table class="trip-clubs"><tbody>' +
        '<tr><td>Bring your own: airline golf bag fee, return flight</td><td>' + euro(fly) + '</td></tr>' +
        '<tr><td>Rent at the course: ' + rounds + ' × ' + euro(CLUBS.rentPerRound) + '</td><td>' + euro(perRound) + '</td></tr>' +
        '<tr><td>Weekly rental from a club-hire company' + (weeks > 1 ? ' (' + weeks + ' weeks)' : '') + '</td><td>~€' + week + '</td></tr>' +
      '</tbody></table>' +
      '<p class="trip-verdict">' + verdict + '</p>' +
      '<p class="trip-small">Estimates: low-cost airlines charge about €35–65 each way for a golf bag (Ryanair, Vueling, Iberia, easyJet; check your fare). Club hire at El Saler is €35 a round; other courses don\'t publish it, so confirm when booking. Weekly hire based on Costa Blanca rental companies.</p>' +
      '<h4>Before you go</h4>' +
      '<ul class="trip-tips">' +
        '<li>Book tee times 1–2 weeks ahead, earlier for weekends and El Saler.</li>' +
        '<li>Carry your handicap certificate or federation app; several courses ask for it.</li>' +
        '<li>Buggies cost extra at most courses (about €25–45 a round).</li>' +
        '<li>Not sure of your level? <a href="/en/handicap-calculator/">Check your handicap and the strokes you get at each course</a>.</li>' +
      '</ul>' +
      '<p class="trip-small">Prices are indicative and change by season. Always confirm on the course\'s booking page.</p>';
    out.hidden = false;
    form.hidden = true;
    out.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function submitLead(lead) {
    if (typeof gtag === 'function') {
      gtag('event', 'trip_plan_request', {
        players: lead.players, courses_count: lead.courses.length, clubs: lead.clubs,
        course_page: current, locale: 'en'
      });
    }
    try {
      fetch('/api/trip-lead', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead), keepalive: true
      }).catch(function () {});
      if (lead.newsletter) {
        fetch('/api/subscribe', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: lead.email, locale: 'en', utm_source: 'trip_plan' }), keepalive: true
        }).catch(function () {});
      }
    } catch (e) {}
  }
})();
