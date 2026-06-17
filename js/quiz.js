(function () {
  var lang = location.pathname.startsWith('/es/') ? 'es' : 'en';

  /* ── Strings ─────────────────────────────────────────────────────────── */
  var STR = {
    en: {
      qOf:         function (n, t) { return 'Question ' + n + ' of ' + t; },
      nextBtn:     'Next →',
      resultLabel: 'You are',
      coursesLabel:'Your courses in Spain',
      shareBtn:    'Share result',
      copied:      'Copied!',
      howSummary:  'How does this work?',
      howText:     'Your answers are scored across five dimensions — creativity, strategy, prestige, value, and relaxation. The archetype with the highest score wins. No data is stored; it all runs in your browser.',
      retry:       'Take it again',
      browseCta:   'Browse your courses →',
      shareTitle:  'My Spain Golfer Type',
      shareUrl:    'https://golfspain.guide/en/quiz/',
      shareText:   function (r) { return 'I got "' + r.name + '" ' + r.emoji + ' on the golfspain.guide quiz — ' + r.tagline; }
    },
    es: {
      qOf:         function (n, t) { return 'Pregunta ' + n + ' de ' + t; },
      nextBtn:     'Siguiente →',
      resultLabel: 'Eres',
      coursesLabel:'Tus campos en España',
      shareBtn:    'Compartir resultado',
      copied:      '¡Copiado!',
      howSummary:  '¿Cómo funciona esto?',
      howText:     'Tus respuestas se puntúan en cinco dimensiones: creatividad, estrategia, prestigio, valor y relajación. El arquetipo con mayor puntuación gana. No se almacenan datos; todo funciona en tu navegador.',
      retry:       'Volver a hacerlo',
      browseCta:   'Ver tus campos →',
      shareTitle:  'Mi tipo de golfista en España',
      shareUrl:    'https://golfspain.guide/es/quiz/',
      shareText:   function (r) { return 'Soy "' + r.name + '" ' + r.emoji + ' según golfspain.guide — ' + r.tagline; }
    }
  };

  /* ── Questions ───────────────────────────────────────────────────────── */
  var QUESTIONS = {
    en: [
      {
        q: 'How do you pick a course?',
        opts: [
          { t: 'Cheapest green fee I can find',               s: { V: 2 } },
          { t: 'Best layout and course conditions',           s: { S: 1, O: 1 } },
          { t: 'Bucket-list name — worth the splurge',        s: { G: 2 } },
          { t: 'Closest to where I\'m staying',              s: { C: 2 } }
        ]
      },
      {
        q: 'What\'s your budget per round?',
        opts: [
          { t: 'Under €40',                s: { V: 2 } },
          { t: '€40–€70',                  s: { C: 1, O: 1 } },
          { t: '€70–€120',                 s: { S: 1, O: 1 } },
          { t: 'Whatever the course asks', s: { G: 2 } }
        ]
      },
      {
        q: 'What\'s your style on the course?',
        opts: [
          { t: 'Creative — I love an impossible recovery shot',     s: { S: 2 } },
          { t: 'Methodical — course management wins',              s: { O: 2 } },
          { t: 'Hit it long, figure it out later',                 s: { G: 2 } },
          { t: 'Relaxed — sunshine, views, beer at the 9th',       s: { C: 2 } }
        ]
      },
      {
        q: 'Your ideal course setting?',
        opts: [
          { t: 'Mountain drama, big elevation changes',    s: { S: 2 } },
          { t: 'Classic parkland, tree-lined fairways',   s: { O: 2 } },
          { t: 'Championship layout — what the pros play', s: { G: 2 } },
          { t: 'Sea views, easy walk, great terrace',     s: { C: 1, V: 1 } }
        ]
      },
      {
        q: 'What\'s your handicap?',
        opts: [
          { t: 'Under 10',                       s: { S: 1, G: 1 } },
          { t: '11 to 20',                       s: { O: 2 } },
          { t: '21 to 36',                       s: { C: 1, V: 1 } },
          { t: 'I play by feel — no handicap',   s: { V: 2 } }
        ]
      },
      {
        q: 'After the round, you…',
        opts: [
          { t: 'Head to the range to work on that slice',                    s: { O: 2 } },
          { t: 'Sit on the terrace and relive the chip-in on 15',           s: { S: 2 } },
          { t: 'Check how your score compares to the course record',        s: { G: 2 } },
          { t: 'Find the best restaurant within 5 minutes',                 s: { C: 2, V: 1 } }
        ]
      }
    ],
    es: [
      {
        q: '¿Cómo eliges un campo?',
        opts: [
          { t: 'El green fee más barato que encuentro',        s: { V: 2 } },
          { t: 'El mejor diseño y estado del campo',           s: { S: 1, O: 1 } },
          { t: 'Un campo mítico — vale el gasto',              s: { G: 2 } },
          { t: 'El más cercano a donde me alojo',              s: { C: 2 } }
        ]
      },
      {
        q: '¿Cuál es tu presupuesto por vuelta?',
        opts: [
          { t: 'Menos de 40 €',          s: { V: 2 } },
          { t: '40 €–70 €',              s: { C: 1, O: 1 } },
          { t: '70 €–120 €',             s: { S: 1, O: 1 } },
          { t: 'Lo que pida el campo',   s: { G: 2 } }
        ]
      },
      {
        q: '¿Cuál es tu estilo en el campo?',
        opts: [
          { t: 'Creativo — me encantan los golpes de recuperación imposibles', s: { S: 2 } },
          { t: 'Metódico — la gestión del campo gana',                         s: { O: 2 } },
          { t: 'Golpe largo, ya lo resuelvo después',                          s: { G: 2 } },
          { t: 'Relajado — sol, vistas y cerveza en el hoyo 9',               s: { C: 2 } }
        ]
      },
      {
        q: '¿Tu entorno de campo ideal?',
        opts: [
          { t: 'Drama de montaña, grandes desniveles',               s: { S: 2 } },
          { t: 'Parkland clásico, calles bordeadas de árboles',      s: { O: 2 } },
          { t: 'Diseño de campeonato — como el de los pros',         s: { G: 2 } },
          { t: 'Vistas al mar, paseo fácil, terraza estupenda',      s: { C: 1, V: 1 } }
        ]
      },
      {
        q: '¿Cuál es tu hándicap?',
        opts: [
          { t: 'Menos de 10',                   s: { S: 1, G: 1 } },
          { t: '11 a 20',                        s: { O: 2 } },
          { t: '21 a 36',                        s: { C: 1, V: 1 } },
          { t: 'Juego a ojo — sin hándicap',    s: { V: 2 } }
        ]
      },
      {
        q: 'Después de la vuelta…',
        opts: [
          { t: 'Voy al campo de prácticas a trabajar ese slice',                  s: { O: 2 } },
          { t: 'Me siento en la terraza y revivo el chip en el hoyo 15',          s: { S: 2 } },
          { t: 'Comparo mi puntuación con el récord del campo',                    s: { G: 2 } },
          { t: 'Busco el mejor restaurante a 5 minutos',                          s: { C: 2, V: 1 } }
        ]
      }
    ]
  };

  /* ── Archetypes ──────────────────────────────────────────────────────── */
  var ARCHETYPES = {
    en: {
      S: {
        key: 'seve',
        name: 'The Seve',
        emoji: '🐂',
        tagline: 'Creative · Fearless · Born for the tricky ones',
        desc: 'You don\'t play the course — you play your own game. Recovery shots are your signature move, and some of your best rounds look impossible on paper. Bernhard Darwin once wrote that Seve played shots that "came, so to speak, out of another world." So do yours.',
        courses: [
          { name: 'El Saler Golf',          url: '/en/valencia/el-saler-golf/' },
          { name: 'La Galiana Golf Resort', url: '/en/valencia/la-galiana-golf/' },
          { name: 'El Bosque Golf',         url: '/en/valencia/el-bosque-golf/' }
        ],
        browseUrl: '/en/courses/'
      },
      O: {
        key: 'olazabal',
        name: 'The Olazábal',
        emoji: '🏆',
        tagline: 'Disciplined · Strategic · Plays for the scorecard',
        desc: 'Every club choice is deliberate. You play to the fat of the green, manage bogeys like a pro, and know your yardage book better than your own phone number. Olazábal won two Masters with grit and precision — and so do you.',
        courses: [
          { name: 'Campoamor Golf',   url: '/en/alicante/campoamor-golf/' },
          { name: 'La Marquesa Golf', url: '/en/alicante/la-marquesa-golf-rojales/' },
          { name: 'Foressos Golf',    url: '/en/valencia/foressos-golf/' }
        ],
        browseUrl: '/en/courses/'
      },
      G: {
        key: 'sergio',
        name: 'The Sergio',
        emoji: '💥',
        tagline: 'Powerful · Ambitious · Wants prestige',
        desc: 'You want the best course, the best conditions, and you\'re not apologising for it. Power off the tee, a bit of flair on the approach — you\'re always going for the pin. Sergio García has 11 European Tour wins and plays like he\'s got something to prove. Same energy.',
        courses: [
          { name: 'Las Colinas Golf',    url: '/en/alicante/las-colinas-golf/' },
          { name: 'El Bosque Golf',      url: '/en/valencia/el-bosque-golf/' },
          { name: 'La Sella Golf Resort',url: '/en/alicante/la-sella-golf/' }
        ],
        browseUrl: '/en/courses/'
      },
      V: {
        key: 'value',
        name: 'The Value Hunter',
        emoji: '💰',
        tagline: 'Smart · Efficient · Maximises rounds per euro',
        desc: 'You\'ve done the maths. You know which clubs offer twilight rates, which ones have bono deals, and you\'ve never paid full price in your life. More rounds, same budget — that\'s the whole philosophy.',
        courses: [
          { name: 'Golf Ifach (from €33.50)',         url: '/en/alicante/golf-ifach/' },
          { name: 'Foressos Golf (from €55)',          url: '/en/valencia/foressos-golf/' },
          { name: 'Golf Costa de Azahar (from €24)',   url: '/en/castellon/golf-costa-azahar-castellon/' }
        ],
        browseUrl: '/en/courses/'
      },
      C: {
        key: 'costa',
        name: 'The Costa Player',
        emoji: '☀️',
        tagline: 'Relaxed · Social · Here for the sunshine',
        desc: 'Golf in Spain is a lifestyle, not a competition. You\'re here for the warm mornings, the sea views from the 7th, and a cold Estrella Damm after the round. Course rating doesn\'t matter as much as the terrace rating.',
        courses: [
          { name: 'Altea Club de Golf', url: '/en/alicante/altea-golf/' },
          { name: 'Puig Campana Golf',  url: '/en/alicante/puig-campana-golf/' },
          { name: 'Lo Romero Golf',     url: '/en/alicante/lo-romero-golf/' }
        ],
        browseUrl: '/en/courses/'
      }
    },
    es: {
      S: {
        key: 'seve',
        name: 'El Seve',
        emoji: '🐂',
        tagline: 'Creativo · Valiente · Nacido para las difíciles',
        desc: 'No juegas el campo — juegas tu propio juego. Los golpes de recuperación son tu marca personal, y algunas de tus mejores vueltas parecen imposibles sobre papel. Bernhard Darwin escribió que Seve golpeaba la bola como si viniera "de otro mundo". Los tuyos también.',
        courses: [
          { name: 'El Saler Golf',          url: '/es/valencia/el-saler-golf/' },
          { name: 'La Galiana Golf Resort', url: '/es/valencia/la-galiana-golf/' },
          { name: 'El Bosque Golf',         url: '/es/valencia/el-bosque-golf/' }
        ],
        browseUrl: '/es/courses/'
      },
      O: {
        key: 'olazabal',
        name: 'El Olazábal',
        emoji: '🏆',
        tagline: 'Disciplinado · Estratégico · Juega para el marcador',
        desc: 'Cada elección de palo es deliberada. Juegas a la parte ancha del green, gestionas los bogeys como un profesional y conoces tus yardas mejor que tu propio número de teléfono. Olazábal ganó dos Masters con determinación y precisión — tú también.',
        courses: [
          { name: 'Campoamor Golf',   url: '/es/alicante/campoamor-golf/' },
          { name: 'La Marquesa Golf', url: '/es/alicante/la-marquesa-golf-rojales/' },
          { name: 'Foressos Golf',    url: '/es/valencia/foressos-golf/' }
        ],
        browseUrl: '/es/courses/'
      },
      G: {
        key: 'sergio',
        name: 'El Sergio',
        emoji: '💥',
        tagline: 'Potente · Ambicioso · Busca el prestigio',
        desc: 'Quieres el mejor campo, las mejores condiciones, y no te disculpas por ello. Potencia en el tee y algo de estilo en la aproximación — siempre vas a por el pin. Sergio García tiene 11 victorias en el Tour Europeo y juega como si tuviera algo que demostrar. La misma energía.',
        courses: [
          { name: 'Las Colinas Golf',    url: '/es/alicante/las-colinas-golf/' },
          { name: 'El Bosque Golf',      url: '/es/valencia/el-bosque-golf/' },
          { name: 'La Sella Golf Resort',url: '/es/alicante/la-sella-golf/' }
        ],
        browseUrl: '/es/courses/'
      },
      V: {
        key: 'value',
        name: 'El Cazador de Ofertas',
        emoji: '💰',
        tagline: 'Inteligente · Eficiente · Maximiza vueltas por euro',
        desc: 'Has hecho los cálculos. Sabes qué clubs ofrecen tarifas de tarde, cuáles tienen bonos y nunca has pagado el precio completo en tu vida. Más vueltas, mismo presupuesto — esa es la filosofía entera.',
        courses: [
          { name: 'Golf Ifach (desde 33,50 €)',        url: '/es/alicante/golf-ifach/' },
          { name: 'Foressos Golf (desde 55 €)',         url: '/es/valencia/foressos-golf/' },
          { name: 'Golf Costa de Azahar (desde 24 €)', url: '/es/castellon/golf-costa-azahar-castellon/' }
        ],
        browseUrl: '/es/courses/'
      },
      C: {
        key: 'costa',
        name: 'El Jugador de Costa',
        emoji: '☀️',
        tagline: 'Relajado · Social · Aquí por el sol',
        desc: 'El golf en España es un estilo de vida, no una competición. Estás aquí por las mañanas cálidas, las vistas al mar desde el hoyo 7 y una Estrella Damm fría después de la vuelta. La nota del campo importa menos que la nota de la terraza.',
        courses: [
          { name: 'Altea Club de Golf', url: '/es/alicante/altea-golf/' },
          { name: 'Puig Campana Golf',  url: '/es/alicante/puig-campana-golf/' },
          { name: 'Lo Romero Golf',     url: '/es/alicante/lo-romero-golf/' }
        ],
        browseUrl: '/es/courses/'
      }
    }
  };

  /* ── State ───────────────────────────────────────────────────────────── */
  var questions   = QUESTIONS[lang];
  var archetypes  = ARCHETYPES[lang];
  var s           = STR[lang];
  var currentQ    = 0;
  var scores      = { S: 0, O: 0, G: 0, V: 0, C: 0 };
  var selectedOpt = null;
  var LETTERS     = ['A', 'B', 'C', 'D'];

  /* ── Render question ─────────────────────────────────────────────────── */
  function renderQuestion() {
    var q   = questions[currentQ];
    var pct = ((currentQ + 1) / questions.length) * 100;

    document.getElementById('quiz-progress-fill').style.width = pct + '%';
    document.getElementById('quiz-q-number').textContent = s.qOf(currentQ + 1, questions.length);
    document.getElementById('quiz-q-text').textContent   = q.q;
    document.getElementById('quiz-options').innerHTML    = q.opts.map(function (o, i) {
      return '<button class="quiz-opt" data-idx="' + i + '" aria-label="' + LETTERS[i] + ': ' + o.t + '">'
           + '<span class="quiz-opt-letter">' + LETTERS[i] + '</span>'
           + '<span class="quiz-opt-text">' + o.t + '</span>'
           + '</button>';
    }).join('');

    selectedOpt = null;
    document.getElementById('quiz-next-btn').disabled = true;

    document.querySelectorAll('.quiz-opt').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.quiz-opt').forEach(function (b) { b.classList.remove('selected'); });
        btn.classList.add('selected');
        selectedOpt = parseInt(btn.dataset.idx, 10);
        document.getElementById('quiz-next-btn').disabled = false;
      });
    });
  }

  /* ── Advance ─────────────────────────────────────────────────────────── */
  function nextQuestion() {
    if (selectedOpt === null) return;
    var pts = questions[currentQ].opts[selectedOpt].s;
    Object.keys(pts).forEach(function (k) { scores[k] = (scores[k] || 0) + pts[k]; });

    if (currentQ < questions.length - 1) {
      currentQ++;
      renderQuestion();
    } else {
      showResult();
    }
  }

  /* ── Show result ─────────────────────────────────────────────────────── */
  function showResult() {
    var winner = Object.keys(scores).reduce(function (a, b) { return scores[a] >= scores[b] ? a : b; });
    var r = archetypes[winner];

    document.getElementById('quiz-container').hidden = true;
    var resultEl = document.getElementById('quiz-result');
    resultEl.hidden = false;

    document.getElementById('quiz-result-emoji').textContent   = r.emoji;
    document.getElementById('quiz-result-label').textContent   = s.resultLabel;
    document.getElementById('quiz-result-name').textContent    = r.name;
    document.getElementById('quiz-result-tagline').textContent = r.tagline;
    document.getElementById('quiz-result-desc').textContent    = r.desc;
    document.getElementById('quiz-courses-label').textContent  = s.coursesLabel;
    document.getElementById('quiz-cta-link').href              = r.browseUrl;
    document.getElementById('quiz-cta-link').textContent       = s.browseCta;
    document.getElementById('quiz-share-btn').textContent      = s.shareBtn;
    document.getElementById('quiz-how-summary').textContent    = s.howSummary;
    document.getElementById('quiz-how-text').textContent       = s.howText;
    document.getElementById('quiz-retry').textContent          = s.retry;

    document.getElementById('quiz-courses').innerHTML = r.courses.map(function (c) {
      return '<a class="quiz-course-pill" href="' + c.url + '">' + c.name + '</a>';
    }).join('');

    var shareBtn = document.getElementById('quiz-share-btn');
    shareBtn.addEventListener('click', function () {
      var text = s.shareText(r);
      var url  = s.shareUrl;
      if (navigator.share) {
        navigator.share({ title: s.shareTitle, text: text, url: url });
      } else {
        navigator.clipboard.writeText(text + '\n' + url).then(function () {
          shareBtn.textContent = s.copied;
        });
      }
    });

    history.replaceState(null, '', '#result-' + r.key);
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ── Reset ───────────────────────────────────────────────────────────── */
  function resetQuiz() {
    currentQ    = 0;
    scores      = { S: 0, O: 0, G: 0, V: 0, C: 0 };
    selectedOpt = null;
    document.getElementById('quiz-result').hidden    = true;
    document.getElementById('quiz-container').hidden = false;
    history.replaceState(null, '', window.location.pathname);
    renderQuestion();
    document.getElementById('quiz-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ── Init ────────────────────────────────────────────────────────────── */
  function init() {
    document.getElementById('quiz-next-btn').textContent = s.nextBtn;
    renderQuestion();
    document.getElementById('quiz-next-btn').addEventListener('click', nextQuestion);
    document.getElementById('quiz-retry').addEventListener('click', resetQuiz);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
