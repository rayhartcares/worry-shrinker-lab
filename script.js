/* ============================================================
   Worry Shrinker Lab — script.js v2
   Brave Feelings Lab
   ============================================================ */

'use strict';

/* ── State ───────────────────────────────────────────────── */
const STATE_KEY = 'wsl_v3_session';

const state = {
  name:             '',
  feeling:          '',
  worryBefore:      5,
  bodyLocation:     '',
  worryText:        '',
  scenarioAnswers:  {},
  selectedTool:     '',
  toolsUsed:        [],
  toolCycleCount:   0,
  resolutionAnswer: '',
  confidenceLevel:  5,
  worryAfter:       5,
  reflection:       '',
  sessionDate:      '',
  courageStatement: '',
};

/* ── Screen Registry ─────────────────────────────────────── */
const SCREENS = [
  'screen-access',
  'screen-welcome',
  'screen-story',
  'screen-check-in',
  'screen-body-awareness',
  'screen-write',
  'screen-scenarios',
  'screen-tools',
  'screen-resolution',
  'screen-confidence',
  'screen-reflection',
  'screen-complete',
  'screen-parent',
];

/* ── Utility ─────────────────────────────────────────────── */
function $(id)    { return document.getElementById(id); }
function $q(sel)  { return document.querySelector(sel); }
function $all(sel){ return document.querySelectorAll(sel); }

function showScreen(id) {
  SCREENS.forEach(s => {
    const el = $(s);
    if (el) el.classList.remove('active');
  });
  const target = $(id);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function saveState() {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch (_) { /* storage unavailable — silent fail */ }
}

function loadState() {
  try {
    const saved = localStorage.getItem(STATE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.assign(state, parsed);
    }
  } catch (_) { /* ignore */ }
}

function clearState() {
  try { localStorage.removeItem(STATE_KEY); } catch (_) {}
  Object.assign(state, {
    name: '', feeling: '', worryBefore: 5, bodyLocation: '',
    worryText: '', scenarioAnswers: {}, selectedTool: '',
    toolsUsed: [], toolCycleCount: 0, resolutionAnswer: '',
    confidenceLevel: 5, worryAfter: 5, reflection: '',
    sessionDate: '', courageStatement: '',
  });
}

/* ── Navigation ──────────────────────────────────────────── */
function initNavButtons() {
  $all('[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.nav;
      showScreen(target);
      saveState();
    });
  });
}

/* ── Screen 1: Welcome ───────────────────────────────────── */
function initWelcome() {
  const nameInput = $('child-name');
  const btnStart  = $('btn-start');

  // Restore name if saved
  if (state.name) {
    nameInput.value = state.name;
    btnStart.disabled = false;
  }

  nameInput.addEventListener('input', () => {
    const val = nameInput.value.trim();
    state.name = val;
    btnStart.disabled = val.length < 1;
    saveState();
  });

  btnStart.addEventListener('click', () => {
    state.name = nameInput.value.trim();
    state.sessionDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    saveState();
    showScreen('screen-story');
  });
}

/* ── Screen 3: Check-in ──────────────────────────────────── */
function initCheckIn() {
  const meterWrap   = $('worry-meter-wrap');
  const meter       = $('worry-meter');
  const meterDisplay = $('meter-display');
  const btnNext     = $('btn-checkin-next');

  // Restore
  if (state.feeling) {
    const savedBtn = $q(`[data-feeling="${state.feeling}"]`);
    if (savedBtn) savedBtn.classList.add('selected');
    meterWrap.style.display = 'block';
    btnNext.disabled = false;
  }
  if (state.worryBefore) {
    meter.value = state.worryBefore;
    meterDisplay.textContent = state.worryBefore;
  }

  $all('.feeling-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $all('.feeling-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      state.feeling = btn.dataset.feeling;
      meterWrap.style.display = 'block';
      btnNext.disabled = false;
      saveState();
    });
  });

  meter.addEventListener('input', () => {
    const val = parseInt(meter.value);
    state.worryBefore = val;
    meterDisplay.textContent = val;
    saveState();
  });
}

/* ── Screen 3b: Body Awareness ───────────────────────────── */
function initBodyAwareness() {
  const btnNext = $('btn-body-next');

  if (state.bodyLocation) {
    const savedBtn = $q(`[data-location="${state.bodyLocation}"]`);
    if (savedBtn) savedBtn.classList.add('selected');
    btnNext.disabled = false;
  }

  $all('[data-location]').forEach(btn => {
    btn.addEventListener('click', () => {
      $all('[data-location]').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      state.bodyLocation = btn.dataset.location;
      btnNext.disabled = false;
      saveState();
    });
  });
}

/* ── Screen 4: Write ─────────────────────────────────────── */
function initWrite() {
  const textarea   = $('worry-text');
  const charCount  = $('char-count');
  const btnNext    = $('btn-write-next');
  const title      = $('write-title');

  // Personalize title
  if (state.name) {
    title.textContent = `Let's name your worry, ${state.name}.`;
  }

  // Restore
  if (state.worryText) {
    textarea.value = state.worryText;
    charCount.textContent = `${state.worryText.length} / 500`;
    btnNext.disabled = false;
  }

  textarea.addEventListener('input', () => {
    const len = textarea.value.length;
    charCount.textContent = `${len} / 500`;
    state.worryText = textarea.value;
    btnNext.disabled = len < 5;
    saveState();
  });
}

/* ── Screen 5: Scenarios ─────────────────────────────────── */
const SCENARIO_INSIGHTS = {
  // q1
  q1_yes:    "You've faced this before — that means you've already survived it at least once.",
  q1_no:     "This is new territory. New things can feel scarier. That's normal.",
  q1_unsure: "That's okay. Sometimes we can't be sure. Let's keep looking.",
  // q2
  q2_yes:    "You got through it before. You have more strength than you think.",
  q2_no:     "Some worries feel impossible — but you're here, and that counts.",
  q2_na:     "It hasn't happened yet. Sometimes our brain imagines worst-cases that never come true.",
  // q3
  q3_yes:    "There's something you can do — that gives you power over this worry.",
  q3_no:     "Some things are outside our control. That's hard. But we can control how we respond.",
  q3_maybe:  "Getting help is a strength, not a weakness. Good for you for knowing that.",
  // q4
  q4_yes:    "Other people would understand. You're not alone in this feeling.",
  q4_no:     "Your brain might be making this bigger than it really is. That happens to everyone.",
  q4_unsure: "It's okay not to know. Sitting with uncertainty is brave.",
};

const SCENARIO_QUESTIONS = ['q1', 'q2', 'q3', 'q4'];

function initScenarios() {
  const insight  = $('scenario-insight');
  const btnNext  = $('btn-scenarios-next');

  // Restore saved answers
  SCENARIO_QUESTIONS.forEach((q, i) => {
    if (state.scenarioAnswers[q]) {
      const savedBtn = $q(`.scenario-btn[data-q="${q}"][data-val="${state.scenarioAnswers[q]}"]`);
      if (savedBtn) savedBtn.classList.add('selected');
      if (i < SCENARIO_QUESTIONS.length - 1) {
        $(`scenario-q${i + 2}`)?.classList.remove('hidden');
      }
    }
  });

  if (Object.keys(state.scenarioAnswers).length === 4) {
    btnNext.disabled = false;
    buildScenarioInsight(insight);
  }

  $all('.scenario-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const q   = btn.dataset.q;
      const val = btn.dataset.val;

      // Deselect siblings
      $all(`.scenario-btn[data-q="${q}"]`).forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      state.scenarioAnswers[q] = val;
      saveState();

      // Reveal next question
      const qIndex = SCENARIO_QUESTIONS.indexOf(q);
      const nextCard = $(`scenario-q${qIndex + 2}`);
      if (nextCard) nextCard.classList.remove('hidden');

      // Check completion
      const answered = Object.keys(state.scenarioAnswers).length;
      if (answered === SCENARIO_QUESTIONS.length) {
        btnNext.disabled = false;
        buildScenarioInsight(insight);
      }
    });
  });
}

function buildScenarioInsight(container) {
  const sa = state.scenarioAnswers;
  const lines = [];

  if (sa.q1) lines.push(SCENARIO_INSIGHTS[`q1_${sa.q1}`]);
  if (sa.q2) lines.push(SCENARIO_INSIGHTS[`q2_${sa.q2}`]);
  if (sa.q3) lines.push(SCENARIO_INSIGHTS[`q3_${sa.q3}`]);
  if (sa.q4) lines.push(SCENARIO_INSIGHTS[`q4_${sa.q4}`]);

  container.innerHTML = `<p><strong>What your answers show:</strong></p>` +
    lines.map(l => `<p>${l}</p>`).join('');
  container.classList.remove('hidden');
}

/* ── Screen 6: Tools ─────────────────────────────────────── */
const TOOL_CONTENT = {
  breathing: {
    title: 'Calm Breathing',
    html: `
      <p>When we feel worried, our breathing gets fast and shallow. Slow breathing tells your body: <em>it's safe to relax.</em></p>
      <div class="hero-icon" aria-hidden="true">
        <img src="assets/images/breathing-tool.svg" alt="Breathing illustration" class="screen-illustration" />
      </div>
      <div class="breath-visual">
        <div class="breath-circle" id="breath-circle">Ready</div>
      </div>
      <ol>
        <li>Breathe <strong>in</strong> slowly through your nose — count to 4.</li>
        <li><strong>Hold</strong> your breath for 2 counts.</li>
        <li>Breathe <strong>out</strong> slowly through your mouth — count to 6.</li>
        <li>Do this 3 to 5 times. Notice how your body feels.</li>
      </ol>
      <p>Try it now — press Start when you're ready.</p>
      <button class="btn btn--primary" id="btn-breath-start" style="margin-top:12px">Start Breathing</button>
    `,
    init: initBreathingExercise,
  },
  reframe: {
    title: 'Thought Reframe',
    html: `
      <p>Our brain sometimes jumps to the worst possible outcome. Reframing means <em>asking better questions</em> to see a more balanced picture.</p>
      <p>Ask yourself:</p>
      <ul>
        <li>What's the <strong>most likely</strong> thing that will happen?</li>
        <li>If the bad thing <em>did</em> happen — could I handle it? What would I do?</li>
        <li>Has something like this worked out okay before?</li>
        <li>What would I tell a friend who had this exact worry?</li>
      </ul>
      <p>You don't have to believe every thought your brain gives you.</p>
    `,
    init: null,
  },
  'body-scan': {
    title: 'Body Check',
    html: `
      <p>Worry shows up in our <em>bodies</em> — not just our minds. Common places: tight chest, stomach flutters, tense shoulders, clenched jaw.</p>
      <p>Try this:</p>
      <ol>
        <li>Close your eyes (or look down softly).</li>
        <li>Start at the top of your head and slowly scan down — notice any tightness or discomfort.</li>
        <li>When you find tension, <strong>breathe into that spot</strong> and let it soften.</li>
        <li>Continue to your toes.</li>
      </ol>
      <p>You don't need to fix it — just notice it. Noticing is enough to start releasing it.</p>
    `,
    init: null,
  },
  grounding: {
    title: '5-4-3-2-1 Grounding',
    html: `
      <p>This technique pulls your attention back to the <em>present moment</em> — away from the worry.</p>
      <p>Look around the room and name:</p>
      <ul>
        <li><strong>5 things</strong> you can <em>see</em></li>
        <li><strong>4 things</strong> you can <em>touch</em> (and feel their texture)</li>
        <li><strong>3 things</strong> you can <em>hear</em></li>
        <li><strong>2 things</strong> you can <em>smell</em></li>
        <li><strong>1 thing</strong> you can <em>taste</em></li>
      </ul>
      <p>Your worry is about the future. The present moment is safe right now.</p>
    `,
    init: null,
  },
  courage: {
    title: 'Courage Statement',
    html: `
      <p>A courage statement is a short, true sentence you can say to yourself when worry gets loud.</p>
      <p>Examples:</p>
      <ul>
        <li><em>"I have handled hard things before, and I can handle this."</em></li>
        <li><em>"Feeling nervous doesn't mean something bad will happen."</em></li>
        <li><em>"I am braver than my worry."</em></li>
        <li><em>"I can ask for help if I need it."</em></li>
      </ul>
      <p>Write your own courage statement below:</p>
      <textarea id="courage-input" class="text-area text-area--sm" placeholder="I am..." maxlength="200" rows="2"></textarea>
    `,
    init: initCourageInput,
  },
  talk: {
    title: 'Tell Someone',
    html: `
      <p>Sharing a worry is one of the most powerful things you can do. It doesn't mean you're weak — it means you're <strong>smart</strong> about how to deal with hard feelings.</p>
      <p>Think of one safe person you could talk to:</p>
      <ul>
        <li>A parent or guardian</li>
        <li>A teacher or school counselor</li>
        <li>A trusted friend</li>
        <li>A coach or mentor</li>
      </ul>
      <p>You don't have to have all the words ready. You can start with: <em>"I've been feeling worried about something and I could use some help."</em></p>
      <p>That's enough. The rest will come.</p>
    `,
    init: null,
  },
  prayer: {
    title: 'Quiet Prayer or Reflection',
    html: `
      <p>Some people feel comfort when they pause and talk to God or reflect quietly.</p>
      <p>Choose what feels right for you:</p>
      <div class="prayer-options">
        <div class="prayer-option" id="prayer-option-a">
          <button class="btn btn--ghost prayer-toggle" data-prayer="prayer">Quiet Prayer</button>
          <div class="prayer-detail hidden" id="prayer-detail-prayer">
            <p>You may want to tell God what you are worried about and ask for strength and calm.</p>
            <p><em>Take a few quiet moments. You don't need special words — just honest ones.</em></p>
          </div>
        </div>
        <div class="prayer-option" id="prayer-option-b">
          <button class="btn btn--ghost prayer-toggle" data-prayer="reflection">Quiet Reflection</button>
          <div class="prayer-detail hidden" id="prayer-detail-reflection">
            <p>Close your eyes and breathe slowly while thinking about what might help you feel supported.</p>
            <p><em>Breathe in for 4 counts. Hold for 2. Breathe out for 6. Repeat 3 times.</em></p>
          </div>
        </div>
      </div>
    `,
    init: initPrayerTool,
  },
};

function initTools() {
  const btnNext = $('btn-tools-next');

  // Restore selection
  if (state.selectedTool) {
    const savedCard = $q(`.tool-card[data-tool="${state.selectedTool}"]`);
    if (savedCard) savedCard.classList.add('selected');
    renderToolExercise(state.selectedTool);
    btnNext.disabled = false;
  }

  $all('.tool-card').forEach(card => {
    card.addEventListener('click', () => {
      $all('.tool-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state.selectedTool = card.dataset.tool;
      // Track tools used (avoid duplicates)
      if (!state.toolsUsed) state.toolsUsed = [];
      if (!state.toolsUsed.includes(state.selectedTool)) {
        state.toolsUsed.push(state.selectedTool);
      }
      saveState();
      renderToolExercise(state.selectedTool);
      btnNext.disabled = false;
    });
  });
}

function renderToolExercise(tool) {
  const panel = $('tool-exercise');
  const data  = TOOL_CONTENT[tool];
  if (!data) return;

  panel.innerHTML = `<h3>${data.title}</h3>${data.html}`;
  panel.classList.remove('hidden');

  if (data.init) data.init();
}

function initBreathingExercise() {
  const btn    = $('btn-breath-start');
  const circle = $('breath-circle');
  if (!btn || !circle) return;

  let running = false;
  let timer   = null;

  btn.addEventListener('click', () => {
    if (running) return;
    running = true;
    btn.disabled = true;
    btn.textContent = 'Breathing...';

    const cycle = [
      { text: 'Breathe In',  cls: 'inhale', ms: 4000 },
      { text: 'Hold',        cls: '',       ms: 2000 },
      { text: 'Breathe Out', cls: 'exhale', ms: 6000 },
    ];

    let round = 0;
    const MAX_ROUNDS = 3;
    let step = 0;

    function nextStep() {
      if (round >= MAX_ROUNDS) {
        circle.className = 'breath-circle';
        circle.textContent = 'Done';
        btn.textContent = 'Try Again';
        btn.disabled = false;
        running = false;
        return;
      }
      const c = cycle[step];
      circle.className = 'breath-circle ' + c.cls;
      circle.textContent = c.text;
      step++;
      if (step >= cycle.length) { step = 0; round++; }
      timer = setTimeout(nextStep, c.ms);
    }
    nextStep();
  });
}

function initCourageInput() {
  const input = $('courage-input');
  if (!input) return;
  input.addEventListener('input', () => {
    state.courageStatement = input.value;
    saveState();
  });
  if (state.courageStatement) input.value = state.courageStatement;
}

function initPrayerTool() {
  $all('.prayer-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.prayer;
      const detail = $(`prayer-detail-${key}`);
      const isOpen = !detail.classList.contains('hidden');
      // Close all
      $all('.prayer-detail').forEach(d => d.classList.add('hidden'));
      $all('.prayer-toggle').forEach(b => b.classList.remove('active'));
      if (!isOpen) {
        detail.classList.remove('hidden');
        btn.classList.add('active');
      }
    });
  });
}

/* ── Screen 6b: Resolution Check ────────────────────────── */
function initResolution() {
  const btnNext    = $('btn-resolution-next');
  const msgBox     = $('resolution-message');
  const MAX_CYCLES = 3;

  // Restore
  if (state.resolutionAnswer) {
    const savedBtn = $q(`[data-resolution="${state.resolutionAnswer}"]`);
    if (savedBtn) savedBtn.classList.add('selected');
    btnNext.disabled = false;
  }

  $all('[data-resolution]').forEach(btn => {
    btn.addEventListener('click', () => {
      $all('[data-resolution]').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      state.resolutionAnswer = btn.dataset.resolution;
      saveState();
      btnNext.disabled = false;

      const answer = btn.dataset.resolution;
      let msg = '';
      if (answer === 'much-smaller') {
        msg = 'That\'s wonderful. You did that — your worry got smaller because of the work you just did.';
      } else if (answer === 'a-little-smaller') {
        msg = 'That\'s real progress. Every step counts. You can try one more tool if you\'d like.';
      } else {
        msg = 'That\'s okay. Some worries take more time. You can try a different tool.';
      }
      msgBox.innerHTML = `<p>${msg}</p>`;
      msgBox.classList.remove('hidden');
    });
  });

  btnNext.addEventListener('click', () => {
    const answer = state.resolutionAnswer;
    if (!answer) return;

    if (answer === 'much-smaller') {
      showScreen('screen-confidence');
    } else if (answer === 'a-little-smaller' || answer === 'not-yet') {
      state.toolCycleCount = (state.toolCycleCount || 0) + 1;
      saveState();
      if (state.toolCycleCount >= MAX_CYCLES) {
        showScreen('screen-confidence');
      } else {
        // Reset tool selection and go back to tools
        $all('.tool-card').forEach(c => c.classList.remove('selected'));
        $all('[data-resolution]').forEach(b => b.classList.remove('selected'));
        state.resolutionAnswer = '';
        msgBox.innerHTML = '';
        msgBox.classList.add('hidden');
        btnNext.disabled = true;
        const toolExercise = $('tool-exercise');
        if (toolExercise) {
          toolExercise.innerHTML = '';
          toolExercise.classList.add('hidden');
        }
        const toolsBtnNext = $('btn-tools-next');
        if (toolsBtnNext) toolsBtnNext.disabled = true;
        state.selectedTool = '';
        saveState();
        showScreen('screen-tools');
      }
    }
  });
}

/* ── Screen 6c: Confidence ───────────────────────────────── */
function initConfidence() {
  const meter   = $('confidence-meter');
  const display = $('confidence-display');
  const btnNext = $('btn-confidence-next');

  if (state.confidenceLevel) {
    meter.value = state.confidenceLevel;
    display.textContent = state.confidenceLevel;
  }

  meter.addEventListener('input', () => {
    const val = parseInt(meter.value);
    state.confidenceLevel = val;
    display.textContent = val;
    saveState();
  });

  btnNext.addEventListener('click', () => {
    saveState();
    showScreen('screen-reflection');
  });
}

/* ── Screen 7: Reflection ────────────────────────────────── */
function initReflection() {
  const meterAfter   = $('worry-meter-after');
  const meterDisplay = $('meter-display-after');
  const compCallout  = $('comparison-callout');
  const refTitle     = $('reflection-title');
  const reflectText  = $('reflection-text');

  // Personalize
  if (state.name) refTitle.textContent = `How do you feel now, ${state.name}?`;

  // Restore
  if (state.worryAfter) {
    meterAfter.value = state.worryAfter;
    meterDisplay.textContent = state.worryAfter;
  }
  if (state.reflection) reflectText.value = state.reflection;

  meterAfter.addEventListener('input', () => {
    const val = parseInt(meterAfter.value);
    state.worryAfter = val;
    meterDisplay.textContent = val;
    saveState();
    renderComparisonCallout(compCallout, state.worryBefore, val);
  });

  reflectText.addEventListener('input', () => {
    state.reflection = reflectText.value;
    saveState();
  });
}

function renderComparisonCallout(el, before, after) {
  const diff = before - after;
  let msg = '';

  if (diff >= 4) {
    msg = `Your worry went from <strong>${before}</strong> to <strong>${after}</strong>. That's a real change — you did that.`;
  } else if (diff >= 2) {
    msg = `Your worry moved from <strong>${before}</strong> to <strong>${after}</strong>. Progress. Every step counts.`;
  } else if (diff >= 0) {
    msg = `Your worry stayed around <strong>${after}</strong>. That's okay. Sometimes worries take time. You still did the work.`;
  } else {
    msg = `Your worry felt bigger at the end — that happens sometimes. It doesn't mean you failed. You were honest, and that's brave.`;
  }

  el.innerHTML = `<p>${msg}</p>`;
  el.classList.remove('hidden');
}

/* ── Screen 8: Complete ──────────────────────────────────── */
function initComplete() {
  const completeName = $('complete-name');
  const completeMsg  = $('complete-message');
  const summaryBox   = $('summary-box');
  const btnPrint     = $('btn-print');
  const btnParent    = $('btn-parent-view');
  const btnRestart   = $('btn-restart');

  if (state.name) completeName.textContent = state.name;

  // Completion message based on worry change
  const diff = state.worryBefore - state.worryAfter;
  if (diff >= 3) {
    completeMsg.textContent = 'You worked through your worry — and you came out stronger on the other side.';
  } else if (diff >= 1) {
    completeMsg.textContent = 'You made progress today. Facing a worry is brave, no matter how big or small the shift feels.';
  } else {
    completeMsg.textContent = 'You showed up and did the work. That takes real courage — even when the worry still feels hard.';
  }

  // Build summary
  const tool = TOOL_CONTENT[state.selectedTool];
  const toolsUsedList = (state.toolsUsed && state.toolsUsed.length > 0)
    ? state.toolsUsed.map(t => TOOL_CONTENT[t] ? TOOL_CONTENT[t].title : t).join(', ')
    : (tool ? tool.title : '—');
  const bodyLoc = state.bodyLocation
    ? capitalize(state.bodyLocation.replace('-', ' '))
    : '—';
  const rows = [
    { label: 'Date',                   value: state.sessionDate || 'Today' },
    { label: 'Feeling',                value: capitalize(state.feeling) || '—' },
    { label: 'Worry felt in',          value: bodyLoc },
    { label: 'Worry level (before)',   value: `${state.worryBefore} / 10` },
    { label: 'Worry level (after)',    value: `${state.worryAfter} / 10` },
    { label: 'Tools used',             value: toolsUsedList },
    { label: 'Confidence level',       value: `${state.confidenceLevel} / 10` },
    { label: 'My worry',               value: truncate(state.worryText, 80) || '—' },
    { label: 'My reflection',          value: truncate(state.reflection, 80) || '—' },
  ];

  summaryBox.innerHTML = rows.map(r => `
    <div class="summary-row">
      <span class="summary-label">${r.label}</span>
      <span class="summary-value">${r.value}</span>
    </div>
  `).join('');

  btnPrint.addEventListener('click', printReport);
  btnParent.addEventListener('click', () => {
    buildParentSummary();
    showScreen('screen-parent');
  });
  btnRestart.addEventListener('click', () => {
    if (confirm('Start a new session? Your current session will be cleared.')) {
      clearState();
      location.reload();
    }
  });
}

/* ── Screen 9: Parent ────────────────────────────────────── */
function buildParentSummary() {
  const container = $('parent-session-summary');
  const tool = TOOL_CONTENT[state.selectedTool];
  const toolsUsedList = (state.toolsUsed && state.toolsUsed.length > 0)
    ? state.toolsUsed.map(t => TOOL_CONTENT[t] ? TOOL_CONTENT[t].title : t).join(', ')
    : (tool ? tool.title : '—');
  const bodyLoc = state.bodyLocation
    ? capitalize(state.bodyLocation.replace('-', ' '))
    : '—';

  container.innerHTML = `
    <p style="font-weight:700;margin-bottom:10px;color:var(--color-text)">Session summary for ${state.name || 'your child'}</p>
    <div class="summary-row"><span class="summary-label">Date</span><span class="summary-value">${state.sessionDate || 'Today'}</span></div>
    <div class="summary-row"><span class="summary-label">Feeling checked in with</span><span class="summary-value">${capitalize(state.feeling) || '—'}</span></div>
    <div class="summary-row"><span class="summary-label">Body location of worry</span><span class="summary-value">${bodyLoc}</span></div>
    <div class="summary-row"><span class="summary-label">Worry intensity (start → end)</span><span class="summary-value">${state.worryBefore} → ${state.worryAfter} / 10</span></div>
    <div class="summary-row"><span class="summary-label">Tools used</span><span class="summary-value">${toolsUsedList}</span></div>
    <div class="summary-row"><span class="summary-label">Confidence level after session</span><span class="summary-value">${state.confidenceLevel} / 10</span></div>
    <div class="summary-row"><span class="summary-label">Their worry (in their words)</span><span class="summary-value" style="font-style:italic">"${truncate(state.worryText, 120) || '—'}"</span></div>
    <div class="summary-row" style="border-bottom:none"><span class="summary-label">Their reflection</span><span class="summary-value" style="font-style:italic">"${truncate(state.reflection, 120) || '—'}"</span></div>
  `;
}

/* ── Print Report ────────────────────────────────────────── */
function printReport() {
  const tool = TOOL_CONTENT[state.selectedTool];
  const toolsUsedList = (state.toolsUsed && state.toolsUsed.length > 0)
    ? state.toolsUsed.map(t => TOOL_CONTENT[t] ? TOOL_CONTENT[t].title : t).join(', ')
    : (tool ? tool.title : '—');
  const bodyLoc = state.bodyLocation
    ? capitalize(state.bodyLocation.replace('-', ' '))
    : '—';

  $('print-date').textContent = state.sessionDate || new Date().toLocaleDateString();

  $('print-content').innerHTML = `
    <h2>Session Summary — ${state.name || 'Student'}</h2>
    <table style="width:100%;border-collapse:collapse;margin-top:16px;font-size:0.9rem">
      ${[
        ['Feeling',                  capitalize(state.feeling)],
        ['Worry felt in body',       bodyLoc],
        ['Worry level (before)',     `${state.worryBefore} / 10`],
        ['Worry level (after)',      `${state.worryAfter} / 10`],
        ['Tools used',               toolsUsedList],
        ['Confidence level',         `${state.confidenceLevel} / 10`],
      ].map(([l,v]) => `
        <tr style="border-bottom:1px solid #DDE6F5">
          <td style="padding:8px 0;font-weight:700;color:#4A5568;width:50%">${l}</td>
          <td style="padding:8px 0;color:#1A2340">${v || '—'}</td>
        </tr>
      `).join('')}
    </table>
    <h3 style="margin-top:24px;margin-bottom:8px">Their worry:</h3>
    <p style="font-style:italic;color:#4A5568">"${state.worryText || '—'}"</p>
    ${state.courageStatement ? `<h3 style="margin-top:20px;margin-bottom:8px">Their courage statement:</h3><p style="font-style:italic;color:#4A5568">"${state.courageStatement}"</p>` : ''}
    <h3 style="margin-top:20px;margin-bottom:8px">Their reflection:</h3>
    <p style="font-style:italic;color:#4A5568">"${state.reflection || '—'}"</p>
  `;

  window.print();
}

/* ── Helpers ─────────────────────────────────────────────── */
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function truncate(str, len) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '…' : str;
}

/* ── Access Gate ─────────────────────────────────────────── */
const ACCESS_KEY  = 'wsl_access_granted';

const VALID_CODES = [
  'WSL-9F4K-72LM',
  'WSL-3X8P-91QT',
  'WSL-6J2D-44NS',
];

/**
 * Check whether the user has already been granted access.
 * Returns true if the stored value matches the sentinel.
 */
function hasAccess() {
  try {
    return localStorage.getItem(ACCESS_KEY) === '1';
  } catch (_) {
    return false;
  }
}

/**
 * Persist access grant to localStorage so returning users
 * skip the code screen automatically.
 */
function grantAccess() {
  try {
    localStorage.setItem(ACCESS_KEY, '1');
  } catch (_) { /* storage unavailable — silent fail */ }
}

/**
 * Utility: remove the stored access grant so the gate can
 * be tested again.  Call clearAccess() from the browser console.
 */
function clearAccess() {
  try {
    localStorage.removeItem(ACCESS_KEY);
    console.info('Access cleared. Reload the page to see the code gate.');
  } catch (_) {}
}

function initAccessGate() {
  // Access already granted — skip the gate entirely.
  if (hasAccess()) {
    $('screen-access').classList.remove('active');
    $('screen-welcome').classList.add('active');
    return;
  }

  // Show the gate (already active via HTML), hide welcome.
  $('screen-welcome').classList.remove('active');
  $('screen-access').classList.add('active');

  const input   = $('access-code-input');
  const errorEl = $('access-error');
  const btnOpen = $('btn-open-app');

  function attempt() {
    const entered = (input.value || '').trim().toUpperCase();
    if (VALID_CODES.includes(entered)) {
      grantAccess();
      errorEl.textContent = '';
      $('screen-access').classList.remove('active');
      $('screen-welcome').classList.add('active');
    } else {
      errorEl.textContent =
        'Invalid access code. Please check your purchase email.';
      input.focus();
    }
  }

  btnOpen.addEventListener('click', attempt);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') attempt();
  });
}

/* ── Boot ────────────────────────────────────────────────── */
function boot() {
  initAccessGate();
  initNavButtons();
  initWelcome();
  initCheckIn();
  initBodyAwareness();
  initWrite();
  initScenarios();
  initTools();
  initResolution();
  initConfidence();
  initReflection();
  initComplete();

  // If there's a saved session in progress, prompt to resume
  if (state.name && state.worryText) {
    const resume = confirm(
      `Welcome back, ${state.name}! Resume your last session?`
    );
    if (!resume) {
      clearState();
      location.reload();
    }
    else {
      let lastScreen = 'screen-story';
      if (state.reflection)          lastScreen = 'screen-complete';
      else if (state.worryAfter !== 5) lastScreen = 'screen-reflection';
      else if (state.confidenceLevel && state.resolutionAnswer === 'much-smaller') lastScreen = 'screen-confidence';
      else if (state.resolutionAnswer)  lastScreen = 'screen-resolution';
      else if (state.selectedTool)   lastScreen = 'screen-tools';
      else if (Object.keys(state.scenarioAnswers).length > 0) lastScreen = 'screen-scenarios';
      else if (state.worryText)      lastScreen = 'screen-write';
      else if (state.bodyLocation)   lastScreen = 'screen-body-awareness';
      else if (state.feeling)        lastScreen = 'screen-body-awareness';
      showScreen(lastScreen);
    }
  }
}

document.addEventListener('DOMContentLoaded', boot);
