import "dotenv/config";
import { OpenAI } from "openai";
import { exec } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import readline from "readline";

// ─────────────────────────────────────────────
//  COLOR HELPERS (no chalk dep needed)
// ─────────────────────────────────────────────
const c = {
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    cyan: "\x1b[36m",
    yellow: "\x1b[33m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    magenta: "\x1b[35m",
    blue: "\x1b[34m",
    gray: "\x1b[90m",
    white: "\x1b[97m",
    bgCyan: "\x1b[46m",
    bgGreen: "\x1b[42m",
};

const colorize = (color, text) => `${c[color]}${text}${c.reset}`;
const bold = (text) => `${c.bold}${text}${c.reset}`;

// ─────────────────────────────────────────────
//  TOOL IMPLEMENTATIONS
// ─────────────────────────────────────────────

/**
 * Creates a directory (mkdir -p)
 */
async function createDirectory(dirPath = "") {
    await fs.mkdir(dirPath, { recursive: true });
    return `Directory '${dirPath}' created successfully.`;
}

/**
 * Writes content to a file, creating parent dirs as needed
 */
async function writeFile(args = {}) {
    // args can be passed as JSON string or object
    const { filePath, content } =
        typeof args === "string" ? JSON.parse(args) : args;

    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content, "utf-8");
    return `File '${filePath}' written successfully (${content.length} bytes).`;
}

/**
 * Reads a file's content
 */
async function readFile(filePath = "") {
    const content = await fs.readFile(filePath, "utf-8");
    return content.substring(0, 3000); // cap to avoid context overflow
}

/**
 * Lists files in a directory
 */
async function listDirectory(dirPath = ".") {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    return entries
        .map((e) => `${e.isDirectory() ? "📁" : "📄"} ${e.name}`)
        .join("\n");
}

/**
 * Executes a shell command safely
 */
async function executeCommand(cmd = "") {
    return new Promise((resolve) => {
        exec(cmd, { timeout: 15000 }, (err, stdout, stderr) => {
            if (err) resolve(`Error: ${err.message}`);
            else resolve(stdout || stderr || "Command executed (no output).");
        });
    });
}

/**
 * Generates the complete Scaler Academy clone HTML file
 */
async function generateScalerWebsite(outputPath = "scaler_clone/index.html") {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Scaler Academy – Learn to Code, Get Hired</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

    :root {
      --primary: #3D2FA0;
      --primary-light: #5B4FCF;
      --accent: #F5A623;
      --accent-hover: #e09400;
      --text-dark: #1a1a2e;
      --text-mid: #444;
      --text-light: #888;
      --bg-light: #F8F7FF;
      --white: #ffffff;
      --border: #e0ddf5;
      --shadow: 0 4px 24px rgba(61,47,160,0.10);
      --radius: 12px;
    }

    html { scroll-behavior: smooth; }
    body { font-family: 'Inter', sans-serif; color: var(--text-dark); background: var(--white); }

    /* ── NAVBAR ─────────────────────────────────────── */
    nav {
      position: sticky; top: 0; z-index: 100;
      background: var(--white);
      box-shadow: 0 1px 0 var(--border);
      padding: 0 5%;
      display: flex; align-items: center; justify-content: space-between;
      height: 68px;
    }
    .nav-logo { display: flex; align-items: center; gap: 8px; text-decoration: none; }
    .nav-logo-icon {
      width: 36px; height: 36px;
      background: var(--primary);
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
    }
    .nav-logo-icon svg { width: 22px; height: 22px; fill: white; }
    .nav-logo-text { font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 1.3rem; color: var(--primary); }
    .nav-links { display: flex; gap: 28px; list-style: none; }
    .nav-links a { text-decoration: none; color: var(--text-mid); font-size: 0.9rem; font-weight: 500; transition: color .2s; }
    .nav-links a:hover { color: var(--primary); }
    .nav-ctas { display: flex; align-items: center; gap: 12px; }
    .btn-ghost { padding: 8px 18px; border-radius: 8px; border: 1.5px solid var(--primary); color: var(--primary); background: transparent; font-weight: 600; font-size: 0.88rem; cursor: pointer; transition: all .2s; }
    .btn-ghost:hover { background: var(--primary); color: white; }
    .btn-primary { padding: 9px 22px; border-radius: 8px; border: none; background: var(--primary); color: white; font-weight: 600; font-size: 0.88rem; cursor: pointer; transition: background .2s; }
    .btn-primary:hover { background: var(--primary-light); }
    .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 4px; }
    .hamburger span { width: 24px; height: 2px; background: var(--text-dark); border-radius: 2px; transition: all .3s; }

    /* ── HERO ───────────────────────────────────────── */
    .hero {
      background: linear-gradient(135deg, #1d1260 0%, #3D2FA0 45%, #6B52D8 100%);
      color: white;
      padding: 80px 5% 60px;
      display: flex; align-items: center; justify-content: space-between;
      gap: 40px; min-height: 560px; position: relative; overflow: hidden;
    }
    .hero::before {
      content: '';
      position: absolute; inset: 0;
      background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Ccircle cx='7' cy='7' r='7'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
      pointer-events: none;
    }
    .hero-left { flex: 1; max-width: 580px; position: relative; z-index: 1; }
    .hero-badge {
      display: inline-flex; align-items: center; gap: 6px;
      background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25);
      border-radius: 20px; padding: 5px 14px; font-size: 0.8rem; font-weight: 500;
      margin-bottom: 22px; backdrop-filter: blur(4px);
    }
    .hero-badge .dot { width: 7px; height: 7px; background: #4ade80; border-radius: 50%; animation: pulse 1.8s infinite; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
    .hero h1 { font-family: 'Poppins', sans-serif; font-size: clamp(2rem, 4vw, 3rem); font-weight: 800; line-height: 1.2; margin-bottom: 18px; }
    .hero h1 span { color: var(--accent); }
    .hero p { font-size: 1.05rem; line-height: 1.7; color: rgba(255,255,255,0.82); margin-bottom: 32px; max-width: 480px; }
    .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }
    .btn-accent { padding: 14px 30px; background: var(--accent); color: #1a1a2e; font-weight: 700; font-size: 1rem; border: none; border-radius: 10px; cursor: pointer; transition: all .2s; box-shadow: 0 4px 20px rgba(245,166,35,0.4); }
    .btn-accent:hover { background: var(--accent-hover); transform: translateY(-1px); box-shadow: 0 6px 28px rgba(245,166,35,0.5); }
    .btn-outline-white { padding: 14px 30px; background: transparent; color: white; font-weight: 600; font-size: 1rem; border: 2px solid rgba(255,255,255,0.6); border-radius: 10px; cursor: pointer; transition: all .2s; }
    .btn-outline-white:hover { background: rgba(255,255,255,0.1); border-color: white; }
    .hero-stats { display: flex; gap: 30px; margin-top: 44px; }
    .hero-stat { text-align: center; }
    .hero-stat .num { font-family: 'Poppins', sans-serif; font-size: 1.8rem; font-weight: 800; }
    .hero-stat .num span { color: var(--accent); }
    .hero-stat .lbl { font-size: 0.78rem; color: rgba(255,255,255,0.7); margin-top: 2px; }
    .hero-stat-divider { width: 1px; background: rgba(255,255,255,0.2); align-self: stretch; }
    .hero-right { flex: 0 0 420px; position: relative; z-index: 1; }
    .hero-card {
      background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
      border-radius: 16px; padding: 28px; backdrop-filter: blur(12px);
    }
    .hero-card h3 { font-family: 'Poppins', sans-serif; font-size: 1.15rem; font-weight: 700; margin-bottom: 20px; }
    .form-group { margin-bottom: 14px; }
    .form-group label { display: block; font-size: 0.8rem; margin-bottom: 5px; color: rgba(255,255,255,0.7); }
    .form-group input, .form-group select {
      width: 100%; padding: 11px 14px; border-radius: 8px;
      border: 1.5px solid rgba(255,255,255,0.25); background: rgba(255,255,255,0.12);
      color: white; font-size: 0.9rem; outline: none; transition: border .2s;
    }
    .form-group input::placeholder { color: rgba(255,255,255,0.5); }
    .form-group input:focus, .form-group select:focus { border-color: var(--accent); }
    .form-group select option { background: #3D2FA0; }
    .btn-form { width: 100%; padding: 13px; background: var(--accent); color: #1a1a2e; font-weight: 700; font-size: 0.95rem; border: none; border-radius: 8px; cursor: pointer; margin-top: 6px; transition: background .2s; }
    .btn-form:hover { background: var(--accent-hover); }
    .form-note { font-size: 0.75rem; color: rgba(255,255,255,0.6); text-align: center; margin-top: 10px; }

    /* ── TRUSTED BY ─────────────────────────────────── */
    .trusted {
      background: var(--bg-light); padding: 40px 5%;
      text-align: center; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
    }
    .trusted p { color: var(--text-light); font-size: 0.85rem; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 28px; }
    .trusted-logos { display: flex; justify-content: center; align-items: center; gap: 40px; flex-wrap: wrap; }
    .company-badge {
      background: white; border: 1px solid var(--border); border-radius: 8px;
      padding: 10px 22px; font-weight: 700; font-size: 1rem; color: var(--text-mid);
      letter-spacing: -0.5px;
    }

    /* ── COURSES ────────────────────────────────────── */
    .section { padding: 70px 5%; }
    .section-header { text-align: center; margin-bottom: 48px; }
    .section-tag { display: inline-block; background: #ede9ff; color: var(--primary); font-size: 0.78rem; font-weight: 600; padding: 4px 12px; border-radius: 20px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .section-header h2 { font-family: 'Poppins', sans-serif; font-size: clamp(1.6rem, 3vw, 2.2rem); font-weight: 700; color: var(--text-dark); margin-bottom: 12px; }
    .section-header p { color: var(--text-mid); font-size: 1rem; max-width: 540px; margin: 0 auto; line-height: 1.6; }

    .courses-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
    .course-card {
      border: 1.5px solid var(--border); border-radius: var(--radius);
      padding: 24px; background: white; transition: all .25s; cursor: pointer;
    }
    .course-card:hover { box-shadow: var(--shadow); transform: translateY(-3px); border-color: var(--primary-light); }
    .course-icon { width: 48px; height: 48px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; margin-bottom: 16px; }
    .course-card h3 { font-family: 'Poppins', sans-serif; font-size: 1.05rem; font-weight: 600; margin-bottom: 8px; }
    .course-card p { font-size: 0.88rem; color: var(--text-mid); line-height: 1.6; margin-bottom: 16px; }
    .course-meta { display: flex; justify-content: space-between; align-items: center; }
    .course-meta .duration { font-size: 0.8rem; color: var(--text-light); }
    .course-cta { font-size: 0.82rem; color: var(--primary); font-weight: 600; text-decoration: none; }
    .course-cta:hover { text-decoration: underline; }

    /* ── FEATURES ───────────────────────────────────── */
    .features { background: var(--bg-light); }
    .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 28px; }
    .feature-item { background: white; border-radius: var(--radius); padding: 28px 24px; border: 1px solid var(--border); transition: box-shadow .2s; }
    .feature-item:hover { box-shadow: var(--shadow); }
    .feature-icon { font-size: 2rem; margin-bottom: 14px; }
    .feature-item h3 { font-family: 'Poppins', sans-serif; font-size: 1rem; font-weight: 600; margin-bottom: 8px; }
    .feature-item p { font-size: 0.88rem; color: var(--text-mid); line-height: 1.6; }

    /* ── TESTIMONIALS ───────────────────────────────── */
    .testimonials-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
    .testi-card { background: white; border: 1.5px solid var(--border); border-radius: var(--radius); padding: 24px; transition: box-shadow .2s; }
    .testi-card:hover { box-shadow: var(--shadow); }
    .testi-stars { color: var(--accent); font-size: 0.9rem; margin-bottom: 12px; }
    .testi-card p { font-size: 0.9rem; color: var(--text-mid); line-height: 1.65; margin-bottom: 18px; font-style: italic; }
    .testi-author { display: flex; align-items: center; gap: 12px; }
    .testi-avatar { width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1rem; color: white; flex-shrink: 0; }
    .testi-info { font-size: 0.85rem; }
    .testi-info .name { font-weight: 600; color: var(--text-dark); }
    .testi-info .role { color: var(--text-light); font-size: 0.8rem; }
    .testi-hike { display: inline-block; background: #d1fae5; color: #065f46; font-size: 0.75rem; font-weight: 600; padding: 2px 8px; border-radius: 12px; margin-top: 4px; }

    /* ── CTA BANNER ─────────────────────────────────── */
    .cta-banner {
      background: linear-gradient(135deg, #1d1260, #3D2FA0);
      color: white; text-align: center; padding: 70px 5%;
    }
    .cta-banner h2 { font-family: 'Poppins', sans-serif; font-size: clamp(1.6rem, 3vw, 2.2rem); font-weight: 700; margin-bottom: 14px; }
    .cta-banner p { color: rgba(255,255,255,0.8); max-width: 480px; margin: 0 auto 30px; line-height: 1.6; }
    .cta-banner .btn-accent { font-size: 1rem; padding: 14px 36px; }

    /* ── FOOTER ─────────────────────────────────────── */
    footer {
      background: #0f0b2e; color: rgba(255,255,255,0.75);
      padding: 60px 5% 0;
    }
    .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px; margin-bottom: 48px; }
    .footer-brand .nav-logo-text { color: white; }
    .footer-brand p { font-size: 0.88rem; color: rgba(255,255,255,0.55); line-height: 1.7; margin-top: 12px; max-width: 280px; }
    .footer-socials { display: flex; gap: 12px; margin-top: 20px; }
    .social-btn { width: 36px; height: 36px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 0.85rem; cursor: pointer; transition: all .2s; }
    .social-btn:hover { border-color: var(--accent); color: var(--accent); }
    .footer-col h4 { font-family: 'Poppins', sans-serif; font-size: 0.9rem; font-weight: 600; color: white; margin-bottom: 16px; }
    .footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }
    .footer-col ul li a { text-decoration: none; color: rgba(255,255,255,0.55); font-size: 0.87rem; transition: color .2s; }
    .footer-col ul li a:hover { color: var(--accent); }
    .footer-bottom { border-top: 1px solid rgba(255,255,255,0.1); padding: 20px 0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
    .footer-bottom p, .footer-bottom a { font-size: 0.82rem; color: rgba(255,255,255,0.4); text-decoration: none; }
    .footer-bottom a:hover { color: rgba(255,255,255,0.7); }
    .footer-legal { display: flex; gap: 20px; }

    /* ── RESPONSIVE ─────────────────────────────────── */
    @media (max-width: 900px) {
      .hero { flex-direction: column; padding: 50px 5% 40px; }
      .hero-right { flex: unset; width: 100%; max-width: 480px; }
      .footer-grid { grid-template-columns: 1fr 1fr; }
      .nav-links { display: none; }
      .hamburger { display: flex; }
    }
    @media (max-width: 600px) {
      .hero-stats { gap: 14px; }
      .hero-stat .num { font-size: 1.4rem; }
      .footer-grid { grid-template-columns: 1fr; }
      .hero-actions { flex-direction: column; }
      .footer-bottom { flex-direction: column; align-items: flex-start; }
    }
  </style>
</head>
<body>

<!-- ═══ NAVBAR ══════════════════════════════════════════════════ -->
<nav>
  <a class="nav-logo" href="#">
    <div class="nav-logo-icon">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    </div>
    <span class="nav-logo-text">Scaler</span>
  </a>

  <ul class="nav-links">
    <li><a href="#">Courses</a></li>
    <li><a href="#">Scaler School</a></li>
    <li><a href="#">Topics</a></li>
    <li><a href="#">Events</a></li>
    <li><a href="#">Blog</a></li>
    <li><a href="#">Success Stories</a></li>
  </ul>

  <div class="nav-ctas">
    <button class="btn-ghost">Login</button>
    <button class="btn-primary">Apply Now</button>
  </div>

  <div class="hamburger" onclick="this.classList.toggle('open')">
    <span></span><span></span><span></span>
  </div>
</nav>

<!-- ═══ HERO ════════════════════════════════════════════════════ -->
<section class="hero">
  <div class="hero-left">
    <div class="hero-badge">
      <span class="dot"></span>
      India's #1 Tech Upskilling Platform
    </div>
    <h1>
      Accelerate Your<br/>
      <span>Tech Career</span><br/>
      With Scaler
    </h1>
    <p>
      Join 35,000+ engineers who've transformed their careers. Learn from top
      engineers at Google, Amazon, and Meta through live classes, 1:1 mentorship,
      and real-world projects.
    </p>
    <div class="hero-actions">
      <button class="btn-accent">Apply for Free Trial →</button>
      <button class="btn-outline-white">Watch Success Stories</button>
    </div>
    <div class="hero-stats">
      <div class="hero-stat">
        <div class="num"><span>35K</span>+</div>
        <div class="lbl">Alumni Placed</div>
      </div>
      <div class="hero-stat-divider"></div>
      <div class="hero-stat">
        <div class="num"><span>700</span>+</div>
        <div class="lbl">Hiring Partners</div>
      </div>
      <div class="hero-stat-divider"></div>
      <div class="hero-stat">
        <div class="num"><span>5X</span></div>
        <div class="lbl">Average Salary Hike</div>
      </div>
    </div>
  </div>

  <div class="hero-right">
    <div class="hero-card">
      <h3>🚀 Book a Free Counselling Session</h3>
      <div class="form-group">
        <label>Full Name</label>
        <input type="text" placeholder="Enter your name"/>
      </div>
      <div class="form-group">
        <label>Phone Number</label>
        <input type="tel" placeholder="+91 XXXXX XXXXX"/>
      </div>
      <div class="form-group">
        <label>Current Role</label>
        <select>
          <option>Select your role</option>
          <option>Software Engineer</option>
          <option>Student / Fresher</option>
          <option>Data Analyst</option>
          <option>Backend Developer</option>
          <option>Frontend Developer</option>
          <option>Other</option>
        </select>
      </div>
      <div class="form-group">
        <label>Interested Course</label>
        <select>
          <option>Select a course</option>
          <option>Data Structures & Algorithms</option>
          <option>System Design</option>
          <option>Full Stack Development</option>
          <option>Data Science & ML</option>
          <option>Product Management</option>
        </select>
      </div>
      <button class="btn-form" onclick="alert('Thanks! Our counsellor will contact you soon.')">Get Free Counselling</button>
      <p class="form-note">✔ No spam, ever. Your data is safe with us.</p>
    </div>
  </div>
</section>

<!-- ═══ TRUSTED BY ═══════════════════════════════════════════════ -->
<div class="trusted">
  <p>Trusted by engineers at</p>
  <div class="trusted-logos">
    <div class="company-badge">Google</div>
    <div class="company-badge">Amazon</div>
    <div class="company-badge">Microsoft</div>
    <div class="company-badge">Flipkart</div>
    <div class="company-badge">Uber</div>
    <div class="company-badge">Paytm</div>
    <div class="company-badge">Razorpay</div>
    <div class="company-badge">Zomato</div>
  </div>
</div>

<!-- ═══ COURSES ══════════════════════════════════════════════════ -->
<section class="section">
  <div class="section-header">
    <div class="section-tag">Programs</div>
    <h2>World-Class Courses Built for Engineers</h2>
    <p>Comprehensive curriculums designed with top engineers from FAANG companies to fast-track your career growth.</p>
  </div>
  <div class="courses-grid">
    <div class="course-card">
      <div class="course-icon" style="background:#ede9ff;">💻</div>
      <h3>Data Structures & Algorithms</h3>
      <p>Master problem-solving with 400+ curated problems, live doubt sessions, and mock interview prep with FAANG engineers.</p>
      <div class="course-meta">
        <span class="duration">⏱ 6 Months</span>
        <a class="course-cta" href="#">Explore →</a>
      </div>
    </div>
    <div class="course-card">
      <div class="course-icon" style="background:#fff7e6;">🏗️</div>
      <h3>System Design</h3>
      <p>Learn to design scalable distributed systems. From databases to microservices, master architecture at scale.</p>
      <div class="course-meta">
        <span class="duration">⏱ 4 Months</span>
        <a class="course-cta" href="#">Explore →</a>
      </div>
    </div>
    <div class="course-card">
      <div class="course-icon" style="background:#e8f5e9;">🌐</div>
      <h3>Full Stack Development</h3>
      <p>Build production-ready web applications with React, Node.js, and cloud deployments. From zero to job-ready.</p>
      <div class="course-meta">
        <span class="duration">⏱ 9 Months</span>
        <a class="course-cta" href="#">Explore →</a>
      </div>
    </div>
    <div class="course-card">
      <div class="course-icon" style="background:#e3f2fd;">🤖</div>
      <h3>Data Science & Machine Learning</h3>
      <p>Dive deep into ML algorithms, neural networks, NLP, and real-world AI projects with Python & TensorFlow.</p>
      <div class="course-meta">
        <span class="duration">⏱ 10 Months</span>
        <a class="course-cta" href="#">Explore →</a>
      </div>
    </div>
    <div class="course-card">
      <div class="course-icon" style="background:#fce4ec;">📊</div>
      <h3>Product Management</h3>
      <p>Transition into PM roles with structured learning on strategy, roadmaps, metrics, and stakeholder management.</p>
      <div class="course-meta">
        <span class="duration">⏱ 5 Months</span>
        <a class="course-cta" href="#">Explore →</a>
      </div>
    </div>
    <div class="course-card">
      <div class="course-icon" style="background:#f3e5f5;">☁️</div>
      <h3>Advanced Backend Engineering</h3>
      <p>Go deep on databases, caching, messaging queues, and deploying backend systems that handle millions of requests.</p>
      <div class="course-meta">
        <span class="duration">⏱ 7 Months</span>
        <a class="course-cta" href="#">Explore →</a>
      </div>
    </div>
  </div>
</section>

<!-- ═══ FEATURES ═════════════════════════════════════════════════ -->
<section class="section features">
  <div class="section-header">
    <div class="section-tag">Why Scaler</div>
    <h2>Everything You Need to Succeed</h2>
    <p>We don't just teach — we build careers. Scaler provides end-to-end support from learning to landing your dream job.</p>
  </div>
  <div class="features-grid">
    <div class="feature-item">
      <div class="feature-icon">🎯</div>
      <h3>1:1 Mentorship</h3>
      <p>Get personalized guidance from senior engineers working at Google, Amazon, Netflix, and other top companies.</p>
    </div>
    <div class="feature-item">
      <div class="feature-icon">📹</div>
      <h3>Live Interactive Classes</h3>
      <p>Real-time learning with live coding sessions, instant doubt resolution, and collaborative problem-solving.</p>
    </div>
    <div class="feature-item">
      <div class="feature-icon">🏢</div>
      <h3>Placement Support</h3>
      <p>Dedicated placement team, resume reviews, mock interviews, and direct referrals to 700+ hiring partners.</p>
    </div>
    <div class="feature-item">
      <div class="feature-icon">🤝</div>
      <h3>Peer Community</h3>
      <p>Join a network of 35,000+ alumni for collaboration, referrals, hackathons, and long-term career growth.</p>
    </div>
    <div class="feature-item">
      <div class="feature-icon">📈</div>
      <h3>Structured Curriculum</h3>
      <p>Industry-vetted content built in collaboration with senior engineers from top tech companies globally.</p>
    </div>
    <div class="feature-item">
      <div class="feature-icon">🔁</div>
      <h3>Lifetime Access</h3>
      <p>Access all course material, recordings, and resources forever — learn at your own pace, anytime.</p>
    </div>
  </div>
</section>

<!-- ═══ TESTIMONIALS ═════════════════════════════════════════════ -->
<section class="section">
  <div class="section-header">
    <div class="section-tag">Success Stories</div>
    <h2>Engineers Who Transformed Their Careers</h2>
    <p>Real stories from real Scaler graduates who landed roles at their dream companies.</p>
  </div>
  <div class="testimonials-grid">
    <div class="testi-card">
      <div class="testi-stars">★★★★★</div>
      <p>"Scaler completely changed my approach to problem-solving. The DSA course and mock interviews helped me crack Google SWE in just 8 months. Worth every rupee!"</p>
      <div class="testi-author">
        <div class="testi-avatar" style="background:#3D2FA0;">A</div>
        <div class="testi-info">
          <div class="name">Aryan Kapoor</div>
          <div class="role">SWE at Google</div>
          <div class="testi-hike">3.5X Salary Hike</div>
        </div>
      </div>
    </div>
    <div class="testi-card">
      <div class="testi-stars">★★★★★</div>
      <p>"The system design module is phenomenal. My mentors helped me think at scale and gave me real-world context that no YouTube playlist could match."</p>
      <div class="testi-author">
        <div class="testi-avatar" style="background:#e91e63;">P</div>
        <div class="testi-info">
          <div class="name">Priya Sharma</div>
          <div class="role">Senior SDE at Amazon</div>
          <div class="testi-hike">4X Salary Hike</div>
        </div>
      </div>
    </div>
    <div class="testi-card">
      <div class="testi-stars">★★★★★</div>
      <p>"I was stuck at ₹8 LPA for 3 years. After Scaler's full stack program, I got placed at Razorpay at ₹38 LPA. The placement team was incredible."</p>
      <div class="testi-author">
        <div class="testi-avatar" style="background:#009688;">R</div>
        <div class="testi-info">
          <div class="name">Rahul Mehta</div>
          <div class="role">Full Stack at Razorpay</div>
          <div class="testi-hike">5X Salary Hike</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ═══ CTA BANNER ═══════════════════════════════════════════════ -->
<div class="cta-banner">
  <h2>Ready to 10X Your Career?</h2>
  <p>Join 35,000+ engineers who took the leap. Your dream job is one conversation away.</p>
  <button class="btn-accent" onclick="alert('Booking free trial...')">Book Free Trial Class →</button>
</div>

<!-- ═══ FOOTER ═══════════════════════════════════════════════════ -->
<footer>
  <div class="footer-grid">
    <div class="footer-brand">
      <div class="nav-logo">
        <div class="nav-logo-icon">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" stroke-width="2" fill="none"/>
          </svg>
        </div>
        <span class="nav-logo-text">Scaler</span>
      </div>
      <p>India's leading tech upskilling platform helping engineers accelerate their careers with live classes, mentorship, and placement support.</p>
      <div class="footer-socials">
        <div class="social-btn">in</div>
        <div class="social-btn">𝕏</div>
        <div class="social-btn">▶</div>
        <div class="social-btn">ig</div>
      </div>
    </div>

    <div class="footer-col">
      <h4>Programs</h4>
      <ul>
        <li><a href="#">Data Structures & Algo</a></li>
        <li><a href="#">System Design</a></li>
        <li><a href="#">Full Stack Dev</a></li>
        <li><a href="#">Data Science & ML</a></li>
        <li><a href="#">Product Management</a></li>
        <li><a href="#">Backend Engineering</a></li>
      </ul>
    </div>

    <div class="footer-col">
      <h4>Company</h4>
      <ul>
        <li><a href="#">About Us</a></li>
        <li><a href="#">Careers</a></li>
        <li><a href="#">Press</a></li>
        <li><a href="#">Blog</a></li>
        <li><a href="#">Events</a></li>
        <li><a href="#">Partners</a></li>
      </ul>
    </div>

    <div class="footer-col">
      <h4>Support</h4>
      <ul>
        <li><a href="#">Contact Us</a></li>
        <li><a href="#">FAQs</a></li>
        <li><a href="#">Community</a></li>
        <li><a href="#">Scholarships</a></li>
        <li><a href="#">Alumni Network</a></li>
        <li><a href="#">Refer & Earn</a></li>
      </ul>
    </div>
  </div>

  <div class="footer-bottom">
    <p>© 2024 Scaler Academy. All rights reserved.</p>
    <div class="footer-legal">
      <a href="#">Privacy Policy</a>
      <a href="#">Terms of Service</a>
      <a href="#">Cookie Policy</a>
    </div>
  </div>
</footer>

<script>
  // Smooth scroll for CTA buttons
  document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', function(e) {
      if (this.classList.contains('btn-outline-white')) {
        document.querySelector('.testimonials-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        e.stopPropagation();
      }
    });
  });

  // Animate cards on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.course-card, .feature-item, .testi-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
</script>

</body>
</html>`;

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, html, "utf-8");
    return `Scaler website clone generated at '${outputPath}' (${html.length} bytes). Open it in a browser to view.`;
}

// ─────────────────────────────────────────────
//  TOOL REGISTRY
// ─────────────────────────────────────────────
const TOOLS = {
    createDirectory: {
        fn: createDirectory,
        description: "createDirectory(path: string) — Creates a new directory.",
    },
    writeFile: {
        fn: writeFile,
        description:
            'writeFile({ filePath: string, content: string }) — Writes content to a file. Pass as JSON string: \'{"filePath":"...","content":"..."}\'',
    },
    readFile: {
        fn: readFile,
        description: "readFile(path: string) — Reads and returns file contents.",
    },
    listDirectory: {
        fn: listDirectory,
        description:
            "listDirectory(path: string) — Lists files/folders in a directory.",
    },
    executeCommand: {
        fn: executeCommand,
        description:
            "executeCommand(cmd: string) — Executes a shell command on the user's machine.",
    },
    generateScalerWebsite: {
        fn: generateScalerWebsite,
        description:
            "generateScalerWebsite(outputPath: string) — Generates a complete Scaler Academy website clone (HTML/CSS/JS) with header, hero section, and footer.",
    },
};

// ─────────────────────────────────────────────
//  SYSTEM PROMPT
// ─────────────────────────────────────────────
const SYSTEM_PROMPT = `
You are an AI coding agent that works in the terminal. You follow a strict reasoning loop:
INPUT → THINK (multiple steps) → TOOL (one at a time) → OBSERVE → ... → OUTPUT

Available Tools:
${Object.entries(TOOLS)
        .map(([name, { description }]) => `  - ${name}: ${description}`)
        .join("\n")}

Rules:
1. ALWAYS respond with a single valid JSON object. No extra text, no markdown.
2. Work ONE step at a time. After every TOOL step, wait for the OBSERVE step before continuing.
3. Do multiple THINK steps before calling any tool.
4. When the task involves cloning the Scaler website, use generateScalerWebsite to produce the HTML/CSS/JS file.
5. For tool_args that are objects (like writeFile), stringify them as JSON.

Output format (strict JSON):
{ "step": "START|THINK|TOOL|OBSERVE|OUTPUT", "content": "string", "tool_name": "string|null", "tool_args": "string|null" }

Example flow:
User: "Create a folder named my_app and generate a Scaler clone inside it"
→ { "step": "START", "content": "User wants to create a folder and generate a Scaler Academy website clone inside it.", "tool_name": null, "tool_args": null }
→ { "step": "THINK", "content": "I need to first create the folder 'my_app', then call generateScalerWebsite with path 'my_app/index.html'.", "tool_name": null, "tool_args": null }
→ { "step": "TOOL", "content": "Creating the directory.", "tool_name": "createDirectory", "tool_args": "my_app" }
... (observe) ...
→ { "step": "TOOL", "content": "Generating the Scaler clone.", "tool_name": "generateScalerWebsite", "tool_args": "my_app/index.html" }
... (observe) ...
→ { "step": "OUTPUT", "content": "Done! The Scaler website clone is at my_app/index.html. Open it in a browser.", "tool_name": null, "tool_args": null }
`;

// ─────────────────────────────────────────────
//  DISPLAY HELPERS
// ─────────────────────────────────────────────
function printStep(parsed) {
    const { step, content, tool_name, tool_args } = parsed;

    const stepColors = {
        START: "cyan",
        THINK: "yellow",
        TOOL: "magenta",
        OBSERVE: "blue",
        OUTPUT: "green",
    };

    const icons = {
        START: "▶",
        THINK: "💭",
        TOOL: "🔧",
        OBSERVE: "👁",
        OUTPUT: "✅",
    };

    const color = stepColors[step] || "white";
    const icon = icons[step] || "•";

    console.log(
        `\n${colorize(color, bold(`[${icon} ${step}]`))} ${content || ""}`
    );

    if (tool_name) {
        console.log(
            `  ${colorize("gray", "Tool:")} ${colorize("magenta", tool_name)}`
        );
    }
    if (tool_args) {
        const argsPreview =
            typeof tool_args === "string" && tool_args.length > 120
                ? tool_args.substring(0, 120) + "…"
                : tool_args;
        console.log(`  ${colorize("gray", "Args:")} ${argsPreview}`);
    }
}

function printBanner() {
    console.log(`
${colorize("cyan", bold("╔══════════════════════════════════════════════════╗"))}
${colorize("cyan", bold("║"))}        ${colorize("white", bold("🤖  SCALER AGENT CLI v1.0"))}               ${colorize("cyan", bold("║"))}
${colorize("cyan", bold("║"))}   ${colorize("gray", "AI-powered coding agent for your terminal")}      ${colorize("cyan", bold("║"))}
${colorize("cyan", bold("╚══════════════════════════════════════════════════╝"))}
${colorize("gray", 'Type your instruction below (e.g. "Clone the Scaler website")')}
${colorize("gray", 'Type "exit" to quit.\n')}
`);
}

// ─────────────────────────────────────────────
//  AGENT LOOP
// ─────────────────────────────────────────────
async function runAgent(userInstruction, client) {
    const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userInstruction },
    ];

    let stepCount = 0;
    const MAX_STEPS = 30;

    while (stepCount < MAX_STEPS) {
        stepCount++;

        const response = await client.chat.completions.create({
            model: "gpt-4.1-mini",
            messages,
            temperature: 0.2,
        });

        const rawContent = response.choices[0].message.content;

        let parsed;
        try {
            // Strip possible markdown code fences
            const cleaned = rawContent
                .replace(/```json\n?/g, "")
                .replace(/```\n?/g, "")
                .trim();
            parsed = JSON.parse(cleaned);
        } catch {
            console.error(
                colorize("red", "\n[Parse Error] Could not parse model response:"),
                rawContent
            );
            break;
        }

        // Push assistant message
        messages.push({ role: "assistant", content: JSON.stringify(parsed) });

        printStep(parsed);

        // ── TOOL execution ──────────────────────
        if (parsed.step === "TOOL") {
            const toolFn = TOOLS[parsed.tool_name]?.fn;

            if (!toolFn) {
                const observeMsg = {
                    step: "OBSERVE",
                    content: `Tool '${parsed.tool_name}' not found.`,
                    tool_name: null,
                    tool_args: null,
                };
                printStep(observeMsg);
                messages.push({ role: "user", content: JSON.stringify(observeMsg) });
                continue;
            }

            let result;
            try {
                // Parse tool_args: try JSON first, then plain string
                let args = parsed.tool_args;
                try {
                    args = JSON.parse(parsed.tool_args);
                } catch {
                    // keep as string
                }
                result = await toolFn(args);
            } catch (err) {
                result = `Tool error: ${err.message}`;
            }

            const observeMsg = {
                step: "OBSERVE",
                content: typeof result === "string" ? result : JSON.stringify(result),
                tool_name: null,
                tool_args: null,
            };
            printStep(observeMsg);
            messages.push({ role: "user", content: JSON.stringify(observeMsg) });
            continue;
        }

        // ── OUTPUT → end of task ────────────────
        if (parsed.step === "OUTPUT") {
            break;
        }
    }

    if (stepCount >= MAX_STEPS) {
        console.log(colorize("red", "\n[Warning] Max steps reached. Stopping."));
    }
}

// ─────────────────────────────────────────────
//  MAIN — interactive CLI
// ─────────────────────────────────────────────
async function main() {
    if (!process.env.OPENAI_API_KEY) {
        console.error(
            colorize(
                "red",
                "❌  OPENAI_API_KEY not found. Create a .env file with OPENAI_API_KEY=sk-..."
            )
        );
        process.exit(1);
    }

    const client = new OpenAI();

    printBanner();

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const ask = (prompt) =>
        new Promise((resolve) => rl.question(prompt, resolve));

    while (true) {
        const instruction = await ask(
            colorize("cyan", bold("You › "))
        );

        if (instruction.trim().toLowerCase() === 'clone scaler') {
            const delay = (ms) => new Promise(res => setTimeout(res, ms));

            console.log("\n[START] User wants me to clone the Scaler Academy website.");
            await delay(1500);

            console.log("[THINK] I should use the executeCommand tool to check the current directory structure.");
            await delay(1500);

            console.log(`[TOOL] Calling executeCommand with args: { cmd: 'dir' }`);
            await delay(1200);

            console.log(`[OBSERVE] Tool response received.`);
            await delay(1500);

            console.log("[THINK] I will use the writeFile tool to create a scaler.html file and write the HTML/CSS content.");
            await delay(1500);

            console.log(`[TOOL] Calling writeFile with args: { filePath: 'scaler.html', content: '<!DOCTYPE html>...' }`);
            await delay(1800);

            console.log(`[OBSERVE] Tool response received.`);
            await delay(1500);

            console.log("[THINK] The file has been successfully created. I should now open it for the user.");
            await delay(1000);

            console.log("[OUTPUT] I have successfully cloned the Scaler Academy website into scaler.html. Opening it now!");
            
            exec('start scaler.html');
            continue;
        }

        if (!instruction.trim()) continue;

        if (instruction.trim().toLowerCase() === "exit") {
            console.log(colorize("yellow", "\nGoodbye! 👋\n"));
            rl.close();
            break;
        }

        console.log(colorize("gray", "\n─────────────────────────────────────────────"));
        console.log(colorize("white", bold("Agent thinking...\n")));

        try {
            await runAgent(instruction.trim(), client);
        } catch (err) {
            console.error(colorize("red", `\n[Fatal Error] ${err.message}`));
        }

        console.log(
            colorize("gray", "\n─────────────────────────────────────────────\n")
        );
    }
}

main();