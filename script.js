/* ============================================================
   WORRY-SHRINKER LAB — script.js
   Brand: Brave Feelings Lab
   All state is tracked in the `state` object.
   ============================================================ */

// ── APP STATE ─────────────────────────────────────────────────
const state = {
  currentScreen: 0,
  totalSteps: 11,   // screens 1–11 (0 is welcome, no progress)
  signs: [],
  worries: [],
  customWorry: '',
  worrySize: '',
  detectiveAnswers: {},
  braveStep: '',
  plan: {},
};

// ── SCREEN DATA ───────────────────────────────────────────────
const TOTAL_SCREENS = 10; // 0..10

// ── NAVIGATE ──────────────────────────────────────────────────
function goTo(index) {
  const screens = document.querySelectorAll('.screen');
  screens.forEach(s => s.classList.remove('active'));
  screens[index].classList.add('active');
  state.currentScreen = index;
  updateProgress(index);
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Lazy render for dynamic screens
  if (index === 7) renderPracticeScenes();
  if (index === 8) renderStories();
  if (index === 9) prefillPlan();
  if (index === 10) renderCelebration();
}

// ── PROGRESS ──────────────────────────────────────────────────
function updateProgress(index) {
  const wrapper = document.getElementById('progress-bar-wrapper');
  const fill = document.getElementById('progress-fill');
  const label = document.getElementById('progress-label');

  if (index === 0) {
    wrapper.classList.add('hidden');
    document.body.classList.remove('has-progress');
    return;
  }

  wrapper.classList.remove('hidden');
  document.body.classList.add('has-progress');
  const pct = Math.round(((index) / TOTAL_SCREENS) * 100);
  fill.style.width = pct + '%';
  label.textContent = `Step ${index} of ${TOTAL_SCREENS}`;
}

// ── SCREEN 2: SIGNS ───────────────────────────────────────────
function saveSignsAndContinue() {
  const checked = document.querySelectorAll('#signs-grid input[type="checkbox"]:checked');
  state.signs = Array.from(checked).map(c => c.value);
  goTo(3);
}

// Listen for sign taps to update note
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('signs-grid');
  if (grid) {
    grid.addEventListener('change', () => {
      const count = document.querySelectorAll('#signs-grid input:checked').length;
      const note = document.getElementById('signs-selected-note');
      if (count === 0) note.textContent = '';
      else if (count === 1) note.textContent = 'You noticed 1 sign. Great awareness!';
      else note.textContent = `You noticed ${count} signs. That takes real courage to see.`;
    });
  }

  // Init first screen
  goTo(0);
  renderPracticeScenes();
  renderStories();
});

// ── SCREEN 3: NAME THE WORRY ──────────────────────────────────
function toggleChip(el) {
  el.classList.toggle('selected');
}

function saveWorryAndContinue() {
  const selected = document.querySelectorAll('#worry-chips .chip.selected');
  state.worries = Array.from(selected).map(c => c.textContent.trim());
  state.customWorry = document.getElementById('worry-custom').value.trim();
  goTo(4);
}

// ── SCREEN 4: SIZE THE WORRY ──────────────────────────────────
function selectSize(el, size) {
  document.querySelectorAll('.size-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  state.worrySize = size;
  document.getElementById('size-next-btn').disabled = false;

  const notes = {
    tiny: 'Even tiny worries deserve attention. You\'re doing great by noticing it.',
    medium: 'A medium worry can feel heavy. Using your tools will help.',
    huge: 'Huge worries can feel overwhelming, but you don\'t have to face them alone.',
  };
  document.getElementById('size-note').textContent = notes[size];
}

// ── SCREEN 5: DETECTIVE ───────────────────────────────────────
const detectiveFeedback = {
  now: {
    yes: 'Since it\'s happening right now, let\'s look at what you can do.',
    no: 'Good detective work — if it\'s not happening now, your tools can help calm the "what ifs."',
    maybe: 'Uncertainty is tricky! Your tools help even when things feel unsure.',
  },
  control: {
    yes: 'Great — knowing you can do something is powerful!',
    no: 'When we can\'t control something, it helps to control how we respond.',
    maybe: 'Even a small action can help you feel more steady.',
  },
  help: {
    yes: 'Reaching out to a grown-up is one of the bravest steps you can take.',
    no: 'That\'s okay — you can always come back to that idea when you\'re ready.',
    already: 'Wonderful! You\'re already showing real bravery.',
  },
};

function answerDetective(btn, key, answer) {
  // Deselect siblings
  const siblings = btn.closest('.detective-q').querySelectorAll('.q-btn');
  siblings.forEach(b => b.classList.remove('chosen'));
  btn.classList.add('chosen');
  state.detectiveAnswers[key] = answer;

  const feedbackEl = document.getElementById(`detective-${key}-feedback`);
  feedbackEl.textContent = detectiveFeedback[key][answer];
  feedbackEl.classList.remove('hidden');
}

// ── SCREEN 6: TOOLS ───────────────────────────────────────────

// Breathing
let breathInterval = null;

function startBreathing() {
  document.getElementById('tool-breathing').querySelector('.btn-tool').classList.add('hidden');
  document.getElementById('breathing-activity').classList.remove('hidden');
  runBreathCycle();
}

function runBreathCycle() {
  const circle = document.getElementById('breath-circle');
  const label = document.getElementById('breath-label');
  let phase = 0;
  const phases = [
    { label: 'Breathe in… 2… 3… 4…', cls: 'breathing-in',  dur: 4000 },
    { label: 'Hold… 2…',             cls: '',               dur: 2000 },
    { label: 'Breathe out… 2… 3… 4… 5… 6…', cls: 'breathing-out', dur: 6000 },
    { label: 'Good. Again…',         cls: '',               dur: 1500 },
  ];

  function next() {
    circle.className = 'breath-circle';
    const p = phases[phase % phases.length];
    label.textContent = p.label;
    if (p.cls) circle.classList.add(p.cls);
    phase++;
    breathInterval = setTimeout(next, p.dur);
  }
  next();
}

function stopBreathing() {
  clearTimeout(breathInterval);
  breathInterval = null;
  document.getElementById('tool-breathing').querySelector('.btn-tool').classList.remove('hidden');
  document.getElementById('breathing-activity').classList.add('hidden');
  document.getElementById('breath-circle').className = 'breath-circle';
  document.getElementById('breath-label').textContent = 'Get ready…';
}

// Squeeze
let squeezeTimer = null;

function startSqueeze() {
  document.getElementById('tool-squeeze').querySelector('.btn-tool').classList.add('hidden');
  document.getElementById('squeeze-activity').classList.remove('hidden');
  const prompt = document.getElementById('squeeze-prompt');
  const steps = [
    'Make tight fists! Squeeze… squeeze…',
    'Keep squeezing — as tight as you can!',
    'Now let go completely. Feel the difference.',
    'Shake your hands out gently.',
    'Great job! Try again whenever you need.',
  ];
  let i = 0;
  prompt.textContent = steps[i];
  squeezeTimer = setInterval(() => {
    i++;
    if (i < steps.length) {
      prompt.textContent = steps[i];
    } else {
      clearInterval(squeezeTimer);
    }
  }, 2500);
}

function stopSqueeze() {
  clearInterval(squeezeTimer);
  document.getElementById('tool-squeeze').querySelector('.btn-tool').classList.remove('hidden');
  document.getElementById('squeeze-activity').classList.add('hidden');
}

// Grown-Up Tip
function showGrownUpTip() {
  document.getElementById('tool-grownup').querySelector('.btn-tool').classList.add('hidden');
  document.getElementById('grownup-activity').classList.remove('hidden');
}

function hideGrownUpTip() {
  document.getElementById('tool-grownup').querySelector('.btn-tool').classList.remove('hidden');
  document.getElementById('grownup-activity').classList.add('hidden');
}

// Thought Swap
function showThoughtSwap() {
  document.getElementById('tool-thought').querySelector('.btn-tool').classList.add('hidden');
  document.getElementById('thought-activity').classList.remove('hidden');
}

function hideThoughtSwap() {
  document.getElementById('tool-thought').querySelector('.btn-tool').classList.remove('hidden');
  document.getElementById('thought-activity').classList.add('hidden');
}

// Brave Step
function showBraveStep() {
  document.getElementById('tool-brave').querySelector('.btn-tool').classList.add('hidden');
  document.getElementById('brave-activity').classList.remove('hidden');
}

function hideBraveStep() {
  state.braveStep = document.getElementById('brave-step-input').value.trim();
  document.getElementById('tool-brave').querySelector('.btn-tool').classList.remove('hidden');
  document.getElementById('brave-activity').classList.add('hidden');
}

// ── SCREEN 7: PRACTICE SCENES ─────────────────────────────────
const practiceScenes = [
  {
    title: '🎒 Jasper before a test',
    text: 'Jasper has a spelling test tomorrow and can\'t stop worrying about it. His hands feel shaky and his tummy hurts. What could help him most right now?',
    options: ['Slow Breathing', 'Talk to a Grown-Up', 'Helpful Thought', 'One Brave Step'],
    best: 2,
    feedbacks: [
      'Breathing would calm his body — that\'s a great start!',
      'Talking to someone would help a lot — a parent could reassure him.',
      'Yes! Reminding himself "I studied, and I\'ll do my best" could really calm the worry.',
      'A brave step like reviewing his spelling list is a great practical move!',
    ],
  },
  {
    title: '🌙 Maya at bedtime',
    text: 'Maya keeps thinking about something scary she heard at school. At bedtime, her heart beats fast and she can\'t fall asleep. What tool might help?',
    options: ['Slow Breathing', 'Squeeze & Release', 'Talk to a Grown-Up', 'Helpful Thought'],
    best: 0,
    feedbacks: [
      'Exactly! Slow breathing at bedtime is one of the best ways to calm a racing heart.',
      'Squeeze and release can help release tension from the body — good thinking!',
      'Telling a parent would help her feel safer — that\'s a strong choice.',
      'Reminding herself "I am safe right now" can quiet the scary thoughts.',
    ],
  },
  {
    title: '👥 Priya at lunch',
    text: 'Priya wants to sit with a new group of kids at lunch but she\'s terrified they won\'t like her. She keeps standing by the door, frozen. What could help?',
    options: ['One Brave Step', 'Helpful Thought', 'Squeeze & Release', 'Slow Breathing'],
    best: 0,
    feedbacks: [
      'Yes! One small brave step — like just walking over and saying "hi" — is exactly the right move.',
      '"They might be friendly — I won\'t know unless I try" is a great helpful thought!',
      'Squeeze and release can help her release that frozen feeling before she walks over.',
      'A few calm breaths before she goes over could steady her nerves.',
    ],
  },
];

function renderPracticeScenes() {
  const container = document.getElementById('practice-container');
  if (!container || container.dataset.rendered) return;
  container.dataset.rendered = 'true';

  practiceScenes.forEach((scene, si) => {
    const div = document.createElement('div');
    div.className = 'practice-scene';
    div.innerHTML = `
      <div class="scene-title">${scene.title}</div>
      <p class="scene-text">${scene.text}</p>
      <div class="scene-options" id="scene-opts-${si}">
        ${scene.options.map((opt, oi) =>
          `<button class="scene-option" onclick="chooseSceneOption(${si},${oi},this)">${opt}</button>`
        ).join('')}
      </div>
      <div class="scene-feedback" id="scene-fb-${si}"></div>
    `;
    container.appendChild(div);
  });
}

function chooseSceneOption(sceneIdx, optIdx, btn) {
  const scene = practiceScenes[sceneIdx];
  const opts = document.querySelectorAll(`#scene-opts-${sceneIdx} .scene-option`);
  opts.forEach(b => b.classList.remove('chosen'));
  btn.classList.add('chosen');

  const fb = document.getElementById(`scene-fb-${sceneIdx}`);
  fb.textContent = scene.feedbacks[optIdx];
  fb.style.display = 'block';
}

// ── SCREEN 8: STORIES ─────────────────────────────────────────
const stories = [
  {
    character: '👦',
    name: 'Sam\'s School Worry',
    text: 'Sam was starting a new school and could not stop worrying about whether anyone would talk to him. Every morning, his tummy felt tight and he wanted to stay home.\n\nSam\'s dad helped him name his worry: "I\'m afraid I won\'t make any friends." They talked about it together, and Sam felt a little lighter.\n\nThen Sam picked one brave step: he decided to say "hi" to one kid in his class. Just one. On Monday, he did it — and that kid invited him to sit together at lunch.\n\nSam still felt nervous, but he had taken his brave step — and that made him a Worry-Shrinker.',
    lesson: '💡 Lesson: Naming your worry and taking one small step can change everything.',
  },
  {
    character: '👧',
    name: 'Leah\'s Big Test',
    text: 'Leah had a big science test coming up and couldn\'t sleep. She kept thinking, "What if I fail? What if I forget everything?"\n\nShe used the Helpful Thought tool. She told herself: "I studied. I know this material. And even if it\'s hard, I can do my best."\n\nThen she did slow breathing — in for four counts, out for six. Her heart slowed down. Her tummy unclenched.\n\nThe next morning, Leah went to school. The test was hard, but she stayed calm. She remembered the tools.',
    lesson: '💡 Lesson: When worries get loud at night, a helpful thought and calm breathing can quiet them.',
  },
  {
    character: '🧒',
    name: 'Eli\'s Thunderstorm',
    text: 'Eli was scared of thunderstorms. Whenever dark clouds came, he\'d feel frozen and start to cry.\n\nOne afternoon, a big storm was coming. Eli did the squeeze-and-release exercise — squeezing his fists tight, then letting go. He did it three times.\n\nThen he told his mom he was scared. She sat with him, and they watched the rain together. She told him he was safe.\n\nThe storm passed. Eli realized that the scary feeling passed too — just like the clouds.',
    lesson: '💡 Lesson: Big feelings, like storms, always pass. Using your tools helps you wait them out.',
  },
];

let currentStory = 0;

function renderStories() {
  const container = document.getElementById('story-container');
  if (!container) return;
  showStory(0, document.querySelector('.tab-btn'));
}

function showStory(idx, btn) {
  currentStory = idx;
  const container = document.getElementById('story-container');
  const story = stories[idx];

  // Format text with paragraph breaks
  const paragraphs = story.text.split('\n\n').map(p => `<p class="story-text">${p}</p>`).join('');

  container.innerHTML = `
    <div class="story-card">
      <div class="story-character">${story.character}</div>
      <div class="story-name">${story.name}</div>
      ${paragraphs}
      <div class="story-lesson">${story.lesson}</div>
    </div>
  `;

  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach((b, i) => {
    b.classList.toggle('active', i === idx);
  });
}

// ── SCREEN 9: PLAN ────────────────────────────────────────────
function prefillPlan() {
  // Pre-fill worry from earlier steps if available
  const allWorries = [...state.worries];
  if (state.customWorry) allWorries.push(state.customWorry);
  const worryInput = document.getElementById('plan-worry');
  if (worryInput && allWorries.length > 0 && !worryInput.value) {
    worryInput.value = allWorries.join(', ');
  }

  // Pre-fill brave step if set in tools
  const braveInput = document.getElementById('plan-brave');
  if (braveInput && state.braveStep && !braveInput.value) {
    braveInput.value = state.braveStep;
  }
}

function toggleMiniChip(el) {
  el.classList.toggle('selected');
}

function savePlanAndContinue() {
  state.plan = {
    worry:  document.getElementById('plan-worry').value.trim(),
    body:   Array.from(document.querySelectorAll('.mini-chip.selected')).map(c => c.textContent).join(', '),
    tool:   document.getElementById('plan-tool').value,
    person: document.getElementById('plan-person').value.trim(),
    brave:  document.getElementById('plan-brave').value.trim(),
  };
  goTo(10);
}

// ── SCREEN 10: CELEBRATION ────────────────────────────────────
function renderCelebration() {
  const summary = document.getElementById('celebrate-summary');
  const { plan } = state;
  const lines = [];

  if (plan.worry)  lines.push(`<strong>My worry:</strong> ${plan.worry}`);
  if (plan.body)   lines.push(`<strong>My body felt:</strong> ${plan.body}`);
  if (plan.tool)   lines.push(`<strong>My tool:</strong> ${plan.tool}`);
  if (plan.person) lines.push(`<strong>I can ask:</strong> ${plan.person}`);
  if (plan.brave)  lines.push(`<strong>My brave step:</strong> ${plan.brave}`);

  if (lines.length > 0) {
    summary.innerHTML = '<strong>Your Worry Plan:</strong><br/><br/>' + lines.join('<br/>');
    summary.style.display = 'block';
  } else {
    summary.style.display = 'none';
  }
}

// ── RESTART ───────────────────────────────────────────────────
function restartProgram() {
  // Reset state
  state.signs = [];
  state.worries = [];
  state.customWorry = '';
  state.worrySize = '';
  state.detectiveAnswers = {};
  state.braveStep = '';
  state.plan = {};

  // Reset UI
  document.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = false);
  document.querySelectorAll('.chip.selected, .mini-chip.selected').forEach(c => c.classList.remove('selected'));
  document.querySelectorAll('.size-card.selected').forEach(c => c.classList.remove('selected'));
  document.querySelectorAll('.q-btn.chosen').forEach(b => b.classList.remove('chosen'));
  document.querySelectorAll('.q-feedback').forEach(f => f.classList.add('hidden'));
  document.querySelectorAll('input[type="text"], select').forEach(i => i.value = '');
  document.getElementById('size-next-btn').disabled = true;
  document.getElementById('signs-selected-note').textContent = '';
  document.getElementById('size-note').textContent = '';

  // Re-render dynamic screens
  const practiceContainer = document.getElementById('practice-container');
  if (practiceContainer) {
    practiceContainer.innerHTML = '';
    delete practiceContainer.dataset.rendered;
  }

  // Stop any running tools
  stopBreathing();

  goTo(0);
}
