/* ═══════════════════════════════════════════════════════════
   priya.agent — client-side "agent" runtime
   No backend needed: intent routing + scripted synthesis,
   rendered with LangGraph-style tool-call traces.
   ═══════════════════════════════════════════════════════════ */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ───────────────────────── BOOT SEQUENCE ───────────────────────── */
const BOOT_LINES = [
  ["accent", "$ ./priya.agent --interactive"],
  ["", "[boot] loading kernel modules ............ <span class='ok'>OK</span>"],
  ["", "[boot] mounting /career/shiprocket ....... <span class='ok'>OK</span>"],
  ["", "[boot] indexing projects (6 found) ....... <span class='ok'>OK</span>"],
  ["", "[boot] warming pgvector intent cache ..... <span class='ok'>OK</span>"],
  ["", "[boot] connecting to langgraph mesh ...... <span class='ok'>OK</span>"],
  ["ok", "system online. hello, visitor."],
];

async function boot() {
  const overlay = document.getElementById("boot");
  const target = document.getElementById("boot-lines");
  const finish = () => overlay.classList.add("done");
  overlay.addEventListener("click", finish, { once: true });

  if (reducedMotion || sessionStorage.getItem("booted")) {
    finish();
    return;
  }
  sessionStorage.setItem("booted", "1");
  for (const [cls, text] of BOOT_LINES) {
    const div = document.createElement("div");
    div.className = "bl " + cls;
    div.innerHTML = text;
    target.appendChild(div);
    await sleep(170);
  }
  await sleep(420);
  finish();
}

/* ───────────────────────── OUTER SPACE CANVAS ─────────────────────────
   twinkling starfield + shooting meteors + spaceships (🚀 / 🛸)
   + constellation lines near the cursor                                  */
function initSpace() {
  const canvas = document.getElementById("net");
  const ctx = canvas.getContext("2d");
  let W, H;
  let stars = [];
  const meteors = [];
  const ships = [];
  const mouse = { x: -9999, y: -9999 };
  let meteorTimer = 90;   // frames until next meteor
  let shipTimer = 160;    // frames until next ship

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    const count = Math.min(220, Math.floor((W * H) / 9000));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.3 + 0.3,
      a: Math.random() * 0.5 + 0.25,          // base brightness
      tw: Math.random() * 0.03 + 0.008,       // twinkle speed
      ph: Math.random() * Math.PI * 2,        // twinkle phase
      vx: -(Math.random() * 0.05 + 0.01),     // slow parallax drift
      vy: Math.random() * 0.025 + 0.005,
    }));
  }

  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  resize();

  function drawStars(animate) {
    for (const s of stars) {
      if (animate) {
        s.ph += s.tw;
        s.x += s.vx; s.y += s.vy;
        if (s.x < -2) s.x = W + 2;
        if (s.y > H + 2) s.y = -2;
      }
      const alpha = s.a * (0.55 + 0.45 * Math.sin(s.ph));
      ctx.fillStyle = `rgba(219, 228, 243, ${alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();

      // constellation lines near cursor
      const dx = s.x - mouse.x, dy = s.y - mouse.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < 140 * 140) {
        const la = (1 - Math.sqrt(d2) / 140) * 0.22;
        ctx.strokeStyle = `rgba(34, 211, 238, ${la})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(mouse.x, mouse.y);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
      }
    }
  }

  function spawnMeteor() {
    const goingRight = Math.random() < 0.5;
    const speed = 7 + Math.random() * 8;
    const ang = goingRight
      ? Math.PI * 0.25 + (Math.random() - 0.5) * 0.15   // down-right
      : Math.PI * 0.75 + (Math.random() - 0.5) * 0.15;  // down-left
    meteors.push({
      x: Math.random() * W,
      y: -30 - Math.random() * H * 0.2,
      vx: Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed,
      len: 90 + Math.random() * 110,
      life: 0,
      maxLife: 55 + Math.random() * 35,
    });
  }

  function drawMeteors() {
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.x += m.vx; m.y += m.vy; m.life++;
      const fade = 1 - m.life / m.maxLife;
      if (fade <= 0 || m.y > H + 60 || m.x < -160 || m.x > W + 160) {
        meteors.splice(i, 1);
        continue;
      }
      const sp = Math.hypot(m.vx, m.vy);
      const tx = m.x - (m.vx / sp) * m.len;
      const ty = m.y - (m.vy / sp) * m.len;
      const grad = ctx.createLinearGradient(m.x, m.y, tx, ty);
      grad.addColorStop(0, `rgba(255, 255, 255, ${0.85 * fade})`);
      grad.addColorStop(0.3, `rgba(34, 211, 238, ${0.45 * fade})`);
      grad.addColorStop(1, "rgba(34, 211, 238, 0)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      // bright head
      ctx.save();
      ctx.shadowBlur = 12;
      ctx.shadowColor = "rgba(255,255,255,0.9)";
      ctx.fillStyle = `rgba(255, 255, 255, ${fade})`;
      ctx.beginPath();
      ctx.arc(m.x, m.y, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function spawnShip() {
    const type = Math.random() < 0.55 ? "rocket" : "ufo";
    const dir = Math.random() < 0.5 ? 1 : -1;
    const y = H * 0.12 + Math.random() * H * 0.65;
    if (type === "rocket") {
      ships.push({
        type, dir,
        x: dir === 1 ? -50 : W + 50,
        y,
        vx: dir * (1.4 + Math.random() * 1.4),
        vy: (Math.random() - 0.5) * 0.5,
        size: 20 + Math.random() * 8,
        ph: Math.random() * Math.PI * 2,
      });
    } else {
      ships.push({
        type, dir,
        x: dir === 1 ? -50 : W + 50,
        y,
        vx: dir * (0.6 + Math.random() * 0.7),
        vy: 0,
        size: 22 + Math.random() * 8,
        ph: Math.random() * Math.PI * 2,
      });
    }
  }

  function drawShips() {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let i = ships.length - 1; i >= 0; i--) {
      const s = ships[i];
      s.x += s.vx;
      s.ph += 0.04;
      if (s.x < -80 || s.x > W + 80) { ships.splice(i, 1); continue; }

      ctx.save();
      ctx.font = `${s.size}px serif`;
      if (s.type === "rocket") {
        s.y += s.vy;
        // engine glow behind the rocket
        const gx = s.x - s.vx * 9, gy = s.y - s.vy * 9;
        const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, 16);
        glow.addColorStop(0, "rgba(251, 191, 36, 0.35)");
        glow.addColorStop(1, "rgba(251, 191, 36, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(gx, gy, 16, 0, Math.PI * 2);
        ctx.fill();
        // 🚀 glyph points NE by default → rotate to match velocity
        ctx.translate(s.x, s.y);
        ctx.rotate(Math.atan2(s.vy, s.vx) + Math.PI / 4);
        ctx.fillText("🚀", 0, 0);
      } else {
        // UFO bobs on a sine wave, with a faint beam underneath
        const by = s.y + Math.sin(s.ph) * 7;
        const beam = ctx.createLinearGradient(s.x, by + 8, s.x, by + 46);
        beam.addColorStop(0, "rgba(52, 211, 153, 0.18)");
        beam.addColorStop(1, "rgba(52, 211, 153, 0)");
        ctx.fillStyle = beam;
        ctx.beginPath();
        ctx.moveTo(s.x - 5, by + 8);
        ctx.lineTo(s.x + 5, by + 8);
        ctx.lineTo(s.x + 15, by + 46);
        ctx.lineTo(s.x - 15, by + 46);
        ctx.closePath();
        ctx.fill();
        ctx.fillText("🛸", s.x, by);
      }
      ctx.restore();
    }
  }

  if (reducedMotion) {
    drawStars(false);
    return;
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);

    if (--meteorTimer <= 0) {
      spawnMeteor();
      meteorTimer = 70 + Math.random() * 190;   // every ~1-4s
    }
    if (--shipTimer <= 0 && ships.length < 2) {
      spawnShip();
      shipTimer = 420 + Math.random() * 540;    // every ~7-16s
    }

    drawStars(true);
    drawMeteors();
    drawShips();
    requestAnimationFrame(tick);
  }
  tick();
}

/* ───────────────────────── TYPED ROLE ───────────────────────── */
const ROLES = [
  "AI Backend Engineer",
  "multi-agent systems",
  "RAG & retrieval infrastructure",
  "LangGraph · FastAPI · Golang",
  "IIT Kanpur '25",
];

async function typedRole() {
  const el = document.getElementById("typed-role");
  if (reducedMotion) { el.textContent = ROLES[0]; return; }
  let i = 0;
  while (true) {
    const word = ROLES[i % ROLES.length];
    for (let c = 1; c <= word.length; c++) {
      el.textContent = word.slice(0, c);
      await sleep(45);
    }
    await sleep(1900);
    for (let c = word.length; c >= 0; c--) {
      el.textContent = word.slice(0, c);
      await sleep(18);
    }
    await sleep(300);
    i++;
  }
}

/* ───────────────────────── AGENT: INTENTS ───────────────────────── */
const INTENTS = [
  {
    id: "about",
    commands: ["/about", "/me", "/whoami"],
    keywords: ["about", "who are you", "who is priya", "yourself", "intro", "background", "tell me about"],
    trace: [
      ["router.classify", "intent=ABOUT", "conf=0.98"],
      ["retriever.fetch", 'index="identity"', "1 doc"],
      ["synthesizer.stream", 'persona="first_person"', ""],
    ],
    answer: `
      <p>Hey, I'm <b>Priya</b> 👋 — a software engineer at <b>Shiprocket</b> (Gurugram) building AI infrastructure for one of India's largest e-commerce logistics platforms.</p>
      <p>My day job: designing <b>multi-agent systems</b> that let anyone query commerce data in plain English — agent orchestration with LangGraph, retrieval engines over Trino + pgvector, and Go pipelines pushing data through Kafka.</p>
      <p>Before that: <b>IIT Kanpur '25</b>, B.Tech Mechanical Engineering with a minor in Machine Learning — plus research on Bayesian neural networks and snake robots (yes, really — try <code>/research</code>).</p>
      <div class="mini-tags"><span>agentic systems</span><span>retrieval</span><span>backend</span><span>ML research</span></div>`,
  },
  {
    id: "experience",
    commands: ["/experience", "/work", "/xp"],
    keywords: ["experience", "work", "job", "shiprocket", "maruti", "career", "company", "employer", "intern", "what do you do", "what do you build", "role"],
    trace: [
      ["router.classify", "intent=EXPERIENCE", "conf=0.97"],
      ["retriever.search", 'index="career", k=2', "2 hits"],
      ["ranker.sort", 'by="recency"', ""],
      ["synthesizer.stream", "citations=true", ""],
    ],
    answer: `
      <h5>Shiprocket · Software Engineer <span style="color:var(--dim)">· Aug 2025 → now</span></h5>
      <ul>
        <li><b>Multi-agent analytics platform</b> (FastAPI + LangGraph) — natural-language queries, synthesis, viz &amp; forecasting for teams and sellers.</li>
        <li><b>2-layer retrieval engine</b> — Platinum KPI layer + Trino fallback, pgvector intent caching to crush latency.</li>
        <li><b>Autonomous health monitor</b> — APM error logs → LLM troubleshooting loop → root cause + fix proposals.</li>
        <li><b>Merkle-indexed code search</b> — Tree-sitter chunking, incremental embeds into Milvus.</li>
        <li><b>Go pipelines</b> — Kafka streaming webhooks, ERP transaction sync.</li>
      </ul>
      <h5>Maruti Suzuki · Data Science Intern <span style="color:var(--dim)">· Summer 2024</span></h5>
      <ul>
        <li>NLP + RAG pipeline over structured &amp; unstructured data (LangChain, HuggingFace, FAISS).</li>
        <li>LLM risk research: mitigation &amp; evaluation strategies.</li>
      </ul>
      <p>Full detail in the <a href="#experience">experience section</a> below ↓</p>`,
  },
  {
    id: "projects",
    commands: ["/projects", "/work-samples", "/portfolio"],
    keywords: ["project", "built", "build", "portfolio", "hangman", "code search", "indexing", "health monitor", "show me"],
    trace: [
      ["router.classify", "intent=PROJECTS", "conf=0.96"],
      ["retriever.search", 'index="projects", k=6', "6 hits"],
      ["synthesizer.stream", 'format="cards"', ""],
    ],
    answer: `
      <p>Six favorites — production systems and research:</p>
      <ul>
        <li>🕸️ <b>Multi-Agent Analytics Platform</b> — LangGraph agent mesh over commerce data (production).</li>
        <li>🩺 <b>Autonomous Health Monitor</b> — infra that debugs itself with an LLM loop (production).</li>
        <li>🌳 <b>Merkle-Indexed Code Search</b> — Tree-sitter + Merkle hashing for cheap incremental embeddings in Milvus.</li>
        <li>🧠 <b>RHO-LOSS Bayesian NNs</b> — 18× faster DNN training, +3.56% CIFAR-10 accuracy (IIT Kanpur).</li>
        <li>🐍 <b>Snake Robot Motion Planning</b> — Lagrangian mechanics, torque-optimal locomotion.</li>
        <li>🎯 <b>Hangman API</b> — N-gram solver, 62.5% win rate (<a href="https://github.com/pr1ya09/Hangman-problem" target="_blank" rel="noopener">code</a>).</li>
      </ul>
      <p>Cards with full detail in the <a href="#projects">projects section</a> ↓</p>`,
  },
  {
    id: "skills",
    commands: ["/skills", "/stack", "/tech"],
    keywords: ["skill", "stack", "tech", "language", "framework", "tool", "python", "golang", "know", "technologies"],
    trace: [
      ["router.classify", "intent=SKILLS", "conf=0.99"],
      ["retriever.fetch", 'index="stack"', "4 groups"],
      ["synthesizer.stream", 'format="grouped"', ""],
    ],
    answer: `
      <h5>Languages</h5>
      <div class="mini-tags"><span>Python</span><span>Golang</span><span>C / C++</span><span>SQL</span></div>
      <h5>AI / ML</h5>
      <div class="mini-tags"><span>LangGraph</span><span>LangChain</span><span>PyTorch</span><span>TensorFlow</span><span>RAG</span><span>Scikit-learn</span><span>OpenCV</span></div>
      <h5>Backend &amp; Data</h5>
      <div class="mini-tags"><span>FastAPI</span><span>Kafka</span><span>Trino</span><span>Flink</span><span>Milvus</span><span>pgvector</span><span>FAISS</span></div>
      <h5>Platform</h5>
      <div class="mini-tags"><span>Docker</span><span>Linux</span><span>Git</span><span>n8n</span></div>
      <p style="margin-top:10px">Sweet spot: <b>where ML meets backend</b> — agents that ship to production, not notebooks.</p>`,
  },
  {
    id: "research",
    commands: ["/research", "/papers"],
    keywords: ["research", "paper", "bnn", "bayesian", "rho", "rho-loss", "snake", "robot", "cifar", "iit", "kanpur", "academic", "professor"],
    trace: [
      ["router.classify", "intent=RESEARCH", "conf=0.95"],
      ["retriever.search", 'index="research", k=2', "2 hits"],
      ["synthesizer.stream", "citations=true", ""],
    ],
    answer: `
      <h5>RHO-LOSS Bayesian Neural Networks <span style="color:var(--dim)">· Prof. Piyush Rai</span></h5>
      <ul>
        <li>Prioritised data selection → <b>18× faster</b> DNN training, +3.56% on CIFAR-10, +1.78% on CIFAR-100.</li>
        <li>ResNet-18 → Bayesian NN via Bayesian normalization layers: NLL improved <b>4.07 → 1.93</b>.</li>
        <li>End-to-end pipeline: RHO-LOSS + ABNN + OOD detection. <a href="https://drive.google.com/file/d/1DonF_WDDjqIg9ojgORv1x0xuAvqgx_lk/view" target="_blank" rel="noopener">report →</a></li>
      </ul>
      <h5>Snake Robot Motion Planning <span style="color:var(--dim)">· Prof. Keval S. Ramani</span></h5>
      <ul>
        <li>Mathematical model for N-DOF locomotion using B-spline curves.</li>
        <li>Lagrangian mechanics + DH transforms → equations of motion; NURBS + optimization for torque-minimal gaits. <a href="https://drive.google.com/file/d/1OSFdjYWXErfq70_5ZyQBqpxMOuplAjZP/view" target="_blank" rel="noopener">report →</a></li>
      </ul>`,
  },
  {
    id: "education",
    commands: ["/education", "/school"],
    keywords: ["education", "degree", "college", "university", "study", "btech", "b.tech", "mechanical", "minor", "course"],
    trace: [
      ["router.classify", "intent=EDUCATION", "conf=0.97"],
      ["retriever.fetch", 'index="education"', "1 doc"],
      ["synthesizer.stream", "", ""],
    ],
    answer: `
      <h5>IIT Kanpur <span style="color:var(--dim)">· 2021 — 2025</span></h5>
      <p><b>B.Tech Mechanical Engineering</b> · Minor in <b>Machine Learning &amp; Applications</b></p>
      <ul>
        <li>Coursework: DSA, Probabilistic ML, Optimization Theory, Stochastic Processes, Image Processing, Game Theory, Robotics.</li>
        <li>Academic mentor for ESC101 (C programming) — taught 500+ students.</li>
        <li>Placement Office coordinator — ran drives for 1400+ students with 80+ companies.</li>
      </ul>`,
  },
  {
    id: "honors",
    commands: ["/honors", "/awards", "/achievements"],
    keywords: ["honor", "award", "achievement", "quant", "worldquant", "piwot", "rank", "won", "competition"],
    trace: [
      ["router.classify", "intent=HONORS", "conf=0.94"],
      ["retriever.fetch", 'index="awards"', "2 docs"],
      ["synthesizer.stream", "", ""],
    ],
    answer: `
      <ul>
        <li>🏆 <b>Top 2% worldwide</b> — International Quant Championship 2023 (WorldQuant Brain).</li>
        <li>🚀 <b>PIWOT 2025 finalist</b> — one of 72 teams selected from 15,000+ applicants.</li>
      </ul>`,
  },
  {
    id: "fun",
    commands: ["/fun", "/hobbies"],
    keywords: ["fun", "hobby", "hobbies", "sketch", "basketball", "photo", "photography", "free time", "outside work", "interests"],
    trace: [
      ["router.classify", "intent=FUN", "conf=0.91"],
      ["retriever.fetch", 'index="humans_are_multidimensional"', "3 docs"],
      ["synthesizer.stream", 'temperature=1.0', ""],
    ],
    answer: `
      <p>Off the clock:</p>
      <ul>
        <li>✏️ <b>Sketching</b> — pencil &gt; pixels sometimes.</li>
        <li>🏀 <b>Basketball</b> — decent jump shot, questionable defense.</li>
        <li>📸 <b>Photography</b> — mostly chasing golden hour.</li>
      </ul>
      <p>Also: mechanical engineer by degree — I can reason about gearboxes <i>and</i> gradient descent. Rare combo, very useful for robot snakes.</p>`,
  },
  {
    id: "contact",
    commands: ["/contact", "/hire", "/email"],
    keywords: ["contact", "hire", "email", "reach", "connect", "linkedin", "github", "phone", "talk", "available", "opportunity", "recruit"],
    trace: [
      ["router.classify", "intent=CONTACT", "conf=0.99"],
      ["retriever.fetch", 'index="channels"', "3 docs"],
      ["synthesizer.stream", 'priority="high"', ""],
    ],
    answer: `
      <p>Best ways to reach me:</p>
      <ul>
        <li>📧 <a href="mailto:priya.deshwal0909@gmail.com">priya.deshwal0909@gmail.com</a></li>
        <li>🐙 <a href="https://github.com/pr1ya09" target="_blank" rel="noopener">github.com/pr1ya09</a></li>
        <li>💼 <a href="https://www.linkedin.com/in/priya-deshwal-6aa525230/" target="_blank" rel="noopener">linkedin.com/in/priya-deshwal</a></li>
      </ul>
      <p>Open to conversations about AI infra, agentic systems, and hard backend problems. 📍 Gurugram, India.</p>`,
  },
  {
    id: "resume",
    commands: ["/resume", "/cv"],
    keywords: ["resume", "cv", "download", "pdf"],
    trace: [
      ["router.classify", "intent=RESUME", "conf=0.99"],
      ["fs.read", 'path="Resume_Priya.pdf"', "208 KB"],
      ["synthesizer.stream", "", ""],
    ],
    answer: `<p>📄 Here you go: <a href="Resume_Priya.pdf" target="_blank" rel="noopener"><b>Resume_Priya.pdf</b></a> — one page, zero fluff.</p>`,
  },
  {
    id: "how",
    commands: ["/how", "/meta", "/source"],
    keywords: ["how do you work", "how were you built", "are you real", "real ai", "chatgpt", "llm", "are you an ai", "how does this work", "this website", "this site"],
    trace: [
      ["introspect.load", 'target="self"', ""],
      ["honesty.check", "", "PASS"],
      ["synthesizer.stream", 'mode="meta"', ""],
    ],
    answer: `
      <p>Honest answer: I'm a <b>simulated agent</b> — intent router + scripted synthesis, running entirely in your browser. No API keys, no backend, no tokens burned. GitHub Pages is static, and Priya likes systems that don't have unnecessary dependencies.</p>
      <p>The <i>real</i> agents she builds at Shiprocket do this with LangGraph, actual LLMs, and a two-layer retrieval engine. This page is a homage with O(1) latency. 😄</p>`,
  },
  {
    id: "greeting",
    commands: ["/hi", "/hello"],
    keywords: ["hi", "hello", "hey", "yo", "sup", "namaste", "good morning", "good evening"],
    trace: [
      ["router.classify", "intent=GREETING", "conf=0.99"],
      ["synthesizer.stream", 'tone="warm"', ""],
    ],
    answer: `
      <p>Hey! 👋 You're talking to <b>priya.agent</b> — the interactive front-end for Priya Deshwal, AI backend engineer.</p>
      <p>Ask me things like <i>"what do you build?"</i>, <i>"what's your stack?"</i>, or hit a command chip below.</p>`,
  },
];

const FALLBACK = {
  trace: [
    ["router.classify", "intent=UNKNOWN", "conf=0.31"],
    ["retriever.search", "k=5", "0 hits"],
    ["fallback.engage", "", ""],
  ],
  answer: `
    <p>Hmm — that's outside my index. 🤔 I'm a scoped agent (Priya keeps me focused).</p>
    <p>Things I <i>can</i> answer: <code>/about</code> · <code>/experience</code> · <code>/projects</code> · <code>/skills</code> · <code>/research</code> · <code>/fun</code> · <code>/contact</code></p>`,
};

/* ───────────────────────── AGENT: RUNTIME ───────────────────────── */
const chatBody = document.getElementById("chat-body");

function escapeHTML(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function scrollChat() {
  chatBody.scrollTop = chatBody.scrollHeight;
}

function addUserMsg(text) {
  const div = document.createElement("div");
  div.className = "msg user";
  div.textContent = text;
  chatBody.appendChild(div);
  scrollChat();
}

function addAgentMsg(html) {
  const wrap = document.createElement("div");
  wrap.className = "msg agent";
  wrap.innerHTML = `<div class="agent-tag">priya.agent</div><div class="msg-bubble">${html}</div>`;
  chatBody.appendChild(wrap);
  scrollChat();
  return wrap;
}

function addTyping() {
  const div = document.createElement("div");
  div.className = "msg agent";
  div.innerHTML = `<div class="msg-bubble typing"><i></i><i></i><i></i></div>`;
  chatBody.appendChild(div);
  scrollChat();
  return div;
}

async function runTrace(lines) {
  const block = document.createElement("div");
  block.className = "trace";
  chatBody.appendChild(block);
  for (const [fn, argstr, result] of lines) {
    const line = document.createElement("div");
    line.className = "trace-line";
    line.innerHTML =
      `▸ <span class="t-fn">${fn}</span>(<span class="t-val">${escapeHTML(argstr)}</span>)` +
      (result ? ` → <span class="t-ok">${escapeHTML(result)}</span>` : "");
    block.appendChild(line);
    scrollChat();
    await sleep(reducedMotion ? 0 : 260);
  }
  await sleep(reducedMotion ? 0 : 150);
}

function matchIntent(raw) {
  const q = raw.trim().toLowerCase();
  // exact slash command
  for (const it of INTENTS) {
    if (it.commands.some((c) => q === c || q === c.slice(1))) return it;
  }
  // keyword scoring
  let best = null, bestScore = 0;
  for (const it of INTENTS) {
    let score = 0;
    for (const kw of it.keywords) {
      if (q.includes(kw)) score += kw.length; // longer keyword = stronger signal
    }
    if (score > bestScore) { bestScore = score; best = it; }
  }
  return bestScore > 0 ? best : null;
}

let busy = false;
async function handleQuery(text) {
  if (busy || !text.trim()) return;
  busy = true;
  addUserMsg(text);

  const intent = matchIntent(text) || FALLBACK;
  const typing = addTyping();
  await sleep(reducedMotion ? 0 : 420);
  typing.remove();

  await runTrace(intent.trace);
  addAgentMsg(intent.answer);
  busy = false;
}

function initChat() {
  const form = document.getElementById("chat-form");
  const input = document.getElementById("chat-input");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = input.value;
    input.value = "";
    handleQuery(v);
  });

  document.getElementById("chat-chips").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-q]");
    if (btn) handleQuery(btn.dataset.q);
  });

  // greeting
  setTimeout(() => {
    addAgentMsg(`
      <p>Hey, I'm <b>priya.agent</b> 👋 — ask me anything about Priya's work.</p>
      <p>Try <i>"what do you build?"</i> or tap a command below. Every answer routes through my (very tiny) agent graph — watch the trace.</p>`);
  }, reducedMotion ? 0 : 1900);
}

/* ───────────────────────── SCROLL REVEAL ───────────────────────── */
function initReveal() {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      }
    },
    { threshold: 0.08 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
}

/* ───────────────────────── INIT ───────────────────────── */
document.getElementById("year").textContent = new Date().getFullYear();
boot();
initSpace();
typedRole();
initChat();
initReveal();

/* console easter egg */
console.log(
  "%c⬢ priya.agent %c\n\nCurious enough to open devtools? We'd probably get along.\n→ priya.deshwal0909@gmail.com\n→ github.com/pr1ya09",
  "color:#22d3ee;font-size:20px;font-weight:bold",
  "color:#7d8db0;font-size:12px"
);
