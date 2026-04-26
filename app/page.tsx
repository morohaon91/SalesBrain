'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const CHAT_MESSAGES = [
  { role: 'lead', text: "Hi, I saw your agency online. What does it cost to work with you?", delay: 0 },
  { role: 'ai', text: "Great question — before I give you a number, can I ask what you're trying to solve? I want to make sure we're actually a fit.", delay: 1400 },
  { role: 'lead', text: "We need more qualified leads. Our current campaigns aren't converting.", delay: 2800 },
  { role: 'ai', text: "That's exactly our specialty. Most clients see 3-4x improvement in lead quality in 60 days. What's your current monthly lead volume so I can give you a realistic picture?", delay: 4400 },
];

const css = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg: #07080f;
  --bg2: #0d0f1a;
  --card: #10121e;
  --gold: #c8881a;
  --gold2: #f0b445;
  --text: #ede9e0;
  --muted: #6b6f82;
  --border: rgba(255,255,255,0.07);
  --border2: rgba(255,255,255,0.04);
}

.lp { font-family: 'Plus Jakarta Sans', sans-serif; background: var(--bg); color: var(--text); overflow-x: hidden; }
.serif { font-family: 'Cormorant', serif; }

/* ── GLOW BLOBS ── */
.blob { position: absolute; border-radius: 50%; pointer-events: none; filter: blur(80px); }
.blob-1 { width: 700px; height: 700px; background: radial-gradient(circle, rgba(200,136,26,0.13) 0%, transparent 65%); top: -200px; left: -150px; animation: breathe 10s ease-in-out infinite; }
.blob-2 { width: 500px; height: 500px; background: radial-gradient(circle, rgba(80,100,255,0.07) 0%, transparent 65%); top: 30%; right: -100px; animation: breathe 14s ease-in-out infinite reverse; }

@keyframes breathe { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15) translate(15px, -20px); } }
@keyframes fadeUp { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
@keyframes msgIn { from { opacity: 0; transform: translateY(8px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes dotBounce { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-5px); } }
@keyframes pulseRing { 0%,100% { box-shadow: 0 0 0 0 rgba(200,136,26,0.5); } 50% { box-shadow: 0 0 0 8px rgba(200,136,26,0); } }
@keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }

/* ── NAV ── */
.nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; height: 64px; display: flex; align-items: center; justify-content: space-between; padding: 0 32px; backdrop-filter: blur(20px); background: rgba(7,8,15,0.85); border-bottom: 1px solid var(--border); animation: fadeIn 0.5s ease both; }
.nav-logo { display: flex; align-items: center; gap: 10px; font-family: 'Cormorant', serif; font-size: 22px; font-weight: 600; color: var(--text); text-decoration: none; letter-spacing: 0.02em; }
.nav-gem { width: 30px; height: 30px; background: linear-gradient(135deg, var(--gold2), var(--gold)); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; color: #0a0600; }
.nav-mid { display: flex; gap: 28px; }
.nav-link { color: var(--muted); text-decoration: none; font-size: 14px; font-weight: 400; transition: color 0.2s; }
.nav-link:hover { color: var(--text); }
.nav-right { display: flex; align-items: center; gap: 10px; }
.btn-ghost { color: var(--muted); text-decoration: none; font-size: 14px; font-weight: 500; padding: 8px 16px; border-radius: 8px; border: 1px solid transparent; transition: all 0.2s; }
.btn-ghost:hover { color: var(--text); border-color: var(--border); background: rgba(255,255,255,0.04); }
.btn-gold { background: linear-gradient(135deg, var(--gold2) 0%, var(--gold) 100%); color: #060300; font-size: 14px; font-weight: 700; padding: 9px 20px; border-radius: 8px; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s; border: none; cursor: pointer; }
.btn-gold:hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(200,136,26,0.38); }

/* ── HERO ── */
.hero { min-height: 100vh; display: flex; align-items: center; padding: 100px 32px 80px; position: relative; overflow: hidden; }
.hero-inner { max-width: 1180px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: center; width: 100%; position: relative; z-index: 1; }
.hero-pill { display: inline-flex; align-items: center; gap: 7px; background: rgba(200,136,26,0.09); border: 1px solid rgba(200,136,26,0.22); padding: 5px 13px 5px 8px; border-radius: 100px; font-size: 12px; font-weight: 500; color: var(--gold2); margin-bottom: 22px; animation: fadeUp 0.5s ease 0.1s both; }
.hero-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--gold2); animation: pulseRing 2s ease infinite; }
.hero-h1 { font-family: 'Cormorant', serif; font-size: clamp(54px, 5.5vw, 78px); font-weight: 600; line-height: 1.04; letter-spacing: -0.025em; color: var(--text); margin-bottom: 20px; animation: fadeUp 0.5s ease 0.2s both; }
.hero-h1 em { font-style: italic; background: linear-gradient(100deg, var(--gold2) 0%, var(--gold) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.hero-sub { font-size: 16.5px; line-height: 1.7; color: var(--muted); max-width: 450px; margin-bottom: 36px; animation: fadeUp 0.5s ease 0.3s both; }
.hero-cta { display: flex; align-items: center; gap: 16px; margin-bottom: 48px; animation: fadeUp 0.5s ease 0.4s both; }
.btn-primary { background: linear-gradient(135deg, var(--gold2) 0%, var(--gold) 100%); color: #060300; font-size: 15px; font-weight: 700; padding: 13px 28px; border-radius: 10px; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; transition: all 0.25s; letter-spacing: 0.01em; }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(200,136,26,0.42); }
.btn-secondary { color: var(--muted); font-size: 15px; font-weight: 500; text-decoration: none; display: inline-flex; align-items: center; gap: 10px; transition: all 0.2s; }
.btn-secondary:hover { color: var(--text); }
.btn-secondary-circle { width: 34px; height: 34px; border: 1px solid var(--border); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; transition: all 0.2s; }
.btn-secondary:hover .btn-secondary-circle { border-color: var(--gold); color: var(--gold); transform: translateX(3px); }
.hero-proof { display: flex; align-items: center; gap: 14px; animation: fadeUp 0.5s ease 0.5s both; }
.avatars { display: flex; }
.av { width: 30px; height: 30px; border-radius: 50%; border: 2px solid var(--bg); background: linear-gradient(135deg, #1c2040, #141830); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: var(--text); margin-left: -8px; }
.avatars .av:first-child { margin-left: 0; }
.proof-text { font-size: 13px; color: var(--muted); }
.proof-text strong { color: var(--text); font-weight: 600; }

/* ── CHAT DEMO ── */
.demo-wrap { position: relative; animation: fadeUp 0.7s ease 0.45s both; }
.demo-chip { position: absolute; background: var(--card); border: 1px solid var(--border); border-radius: 100px; padding: 7px 15px; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 7px; box-shadow: 0 8px 24px rgba(0,0,0,0.45); z-index: 10; }
.chip-hot { top: -18px; right: 16px; color: #fb923c; animation: float 5s ease-in-out infinite 1s; }
.chip-learn { bottom: 70px; left: -24px; color: var(--gold2); animation: float 5s ease-in-out infinite 2.5s; }
.demo-card { background: var(--card); border: 1px solid var(--border); border-radius: 20px; padding: 20px; box-shadow: 0 40px 80px rgba(0,0,0,0.55); animation: float 7s ease-in-out infinite; overflow: hidden; }
.demo-head { display: flex; align-items: center; gap: 11px; padding-bottom: 15px; border-bottom: 1px solid var(--border); margin-bottom: 14px; }
.demo-icon { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, var(--gold2), var(--gold)); display: flex; align-items: center; justify-content: center; font-size: 16px; color: #060300; flex-shrink: 0; }
.demo-head-title { font-size: 14px; font-weight: 600; color: var(--text); }
.demo-head-sub { font-size: 11px; color: var(--muted); margin-top: 2px; }
.demo-live { margin-left: auto; display: flex; align-items: center; gap: 5px; font-size: 11px; color: #4ade80; background: rgba(74,222,128,0.08); padding: 4px 10px; border-radius: 100px; border: 1px solid rgba(74,222,128,0.18); }
.live-dot { width: 5px; height: 5px; border-radius: 50%; background: #4ade80; animation: pulseRing 1.5s ease infinite; }
.messages { display: flex; flex-direction: column; gap: 9px; min-height: 210px; }
.msg { display: flex; gap: 7px; animation: msgIn 0.35s ease both; }
.msg-lead { flex-direction: row; }
.msg-ai { flex-direction: row-reverse; }
.msg-av { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; flex-shrink: 0; margin-top: 2px; }
.av-lead { background: rgba(100,120,230,0.18); color: #8899ff; border: 1px solid rgba(100,120,230,0.25); }
.av-ai { background: linear-gradient(135deg, var(--gold2), var(--gold)); color: #060300; }
.bubble { padding: 9px 13px; border-radius: 13px; font-size: 12.5px; line-height: 1.55; max-width: 230px; }
.bubble-lead { background: rgba(255,255,255,0.05); border: 1px solid var(--border); color: var(--text); border-bottom-left-radius: 3px; }
.bubble-ai { background: rgba(200,136,26,0.1); border: 1px solid rgba(200,136,26,0.18); color: var(--text); border-bottom-right-radius: 3px; }
.typing { display: flex; gap: 4px; align-items: center; padding: 11px 14px; }
.tdot { width: 6px; height: 6px; border-radius: 50%; background: var(--gold); animation: dotBounce 1.4s ease infinite; }
.tdot:nth-child(2) { animation-delay: 0.18s; }
.tdot:nth-child(3) { animation-delay: 0.36s; }
.learn-bar { margin-top: 10px; padding: 10px 13px; background: rgba(200,136,26,0.06); border: 1px solid rgba(200,136,26,0.14); border-radius: 10px; display: flex; align-items: center; gap: 9px; font-size: 12px; color: var(--muted); }
.learn-bar strong { color: var(--gold2); font-weight: 600; }

/* ── STATS BAR ── */
.stats-bar { border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); background: var(--bg2); padding: 0 32px; }
.stats-inner { max-width: 1180px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); }
.stat { padding: 44px 32px; text-align: center; border-right: 1px solid var(--border); }
.stat:last-child { border-right: none; }
.stat-n { font-family: 'Cormorant', serif; font-size: 54px; font-weight: 600; line-height: 1; background: linear-gradient(120deg, var(--gold2), var(--gold)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 8px; }
.stat-l { font-size: 13.5px; color: var(--muted); }

/* ── SECTION BASE ── */
.section { padding: 100px 32px; position: relative; }
.wrap { max-width: 1180px; margin: 0 auto; }
.s-tag { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--gold); margin-bottom: 14px; }
.s-h2 { font-family: 'Cormorant', serif; font-size: clamp(38px, 4vw, 58px); font-weight: 600; line-height: 1.08; letter-spacing: -0.022em; color: var(--text); margin-bottom: 14px; }
.s-h2 em { font-style: italic; background: linear-gradient(100deg, var(--gold2), var(--gold)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.s-sub { font-size: 16.5px; line-height: 1.7; color: var(--muted); max-width: 520px; }

/* ── SCROLL REVEAL ── */
.reveal { opacity: 0; transform: translateY(18px); transition: opacity 0.65s ease, transform 0.65s ease; }
.reveal.in { opacity: 1; transform: translateY(0); }
.reveal-d1 { transition-delay: 0.1s; }
.reveal-d2 { transition-delay: 0.2s; }
.reveal-d3 { transition-delay: 0.3s; }

/* ── STEPS ── */
.steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px; margin-top: 60px; }
.step-card { padding: 40px 32px; background: var(--card); border: 1px solid var(--border); border-radius: 16px; transition: all 0.3s; position: relative; overflow: hidden; }
.step-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, var(--gold), transparent); opacity: 0; transition: opacity 0.3s; }
.step-card:hover { border-color: rgba(200,136,26,0.28); transform: translateY(-5px); box-shadow: 0 20px 48px rgba(0,0,0,0.4); }
.step-card:hover::before { opacity: 1; }
.step-num { width: 52px; height: 52px; border-radius: 50%; background: linear-gradient(135deg, var(--gold2), var(--gold)); color: #060300; font-family: 'Cormorant', serif; font-size: 22px; font-weight: 700; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; position: relative; }
.step-num::after { content: ''; position: absolute; inset: -5px; border-radius: 50%; border: 1px solid rgba(200,136,26,0.25); }
.step-title { font-family: 'Cormorant', serif; font-size: 26px; font-weight: 600; color: var(--text); margin-bottom: 12px; }
.step-desc { font-size: 14px; color: var(--muted); line-height: 1.7; }
.step-bullets { margin-top: 18px; display: flex; flex-direction: column; gap: 7px; }
.step-bullet { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: var(--muted); }
.bullet-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--gold); flex-shrink: 0; }

/* ── FEATURES ── */
.feat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: 60px; }
.feat-card { padding: 30px; background: var(--card); border: 1px solid var(--border); border-radius: 14px; transition: all 0.3s; position: relative; overflow: hidden; }
.feat-card::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, var(--gold), transparent); opacity: 0; transition: opacity 0.3s; }
.feat-card:hover { border-color: rgba(200,136,26,0.22); transform: translateY(-3px); box-shadow: 0 14px 36px rgba(0,0,0,0.32); }
.feat-card:hover::after { opacity: 1; }
.feat-icon { width: 46px; height: 46px; border-radius: 11px; background: rgba(200,136,26,0.09); border: 1px solid rgba(200,136,26,0.18); display: flex; align-items: center; justify-content: center; font-size: 20px; margin-bottom: 18px; }
.feat-title { font-size: 16px; font-weight: 600; color: var(--text); margin-bottom: 9px; }
.feat-desc { font-size: 13.5px; color: var(--muted); line-height: 1.65; }

/* ── CLOSER ── */
.closer-section { background: var(--bg2); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
.closer-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: start; }
.closer-list { display: flex; flex-direction: column; gap: 2px; margin-top: 36px; }
.cl-item { display: flex; gap: 18px; padding: 18px 16px; border-radius: 11px; border: 1px solid transparent; transition: all 0.2s; cursor: default; }
.cl-item:hover { background: rgba(200,136,26,0.055); border-color: rgba(200,136,26,0.14); }
.cl-letter { font-family: 'Cormorant', serif; font-size: 34px; font-weight: 700; color: var(--gold); line-height: 1; width: 32px; flex-shrink: 0; opacity: 0.45; transition: opacity 0.2s; }
.cl-item:hover .cl-letter { opacity: 1; }
.cl-title { font-size: 15px; font-weight: 600; color: var(--text); margin-bottom: 3px; }
.cl-desc { font-size: 13px; color: var(--muted); line-height: 1.6; }

/* Score card */
.score-card { background: var(--bg); border: 1px solid var(--border); border-radius: 18px; padding: 30px; }
.score-title { font-family: 'Cormorant', serif; font-size: 20px; font-weight: 600; color: var(--text); margin-bottom: 22px; }
.score-row { margin-bottom: 14px; }
.score-row-top { display: flex; justify-content: space-between; font-size: 12.5px; margin-bottom: 5px; }
.score-row-label { color: var(--muted); }
.score-bar-track { height: 5px; background: rgba(255,255,255,0.06); border-radius: 100px; overflow: hidden; }
.score-bar-fill { height: 100%; border-radius: 100px; transition: width 1.2s ease; }
.score-total { margin-top: 20px; padding: 14px 18px; background: rgba(74,222,128,0.06); border: 1px solid rgba(74,222,128,0.15); border-radius: 11px; display: flex; justify-content: space-between; align-items: center; }
.score-total-label { font-size: 12px; color: var(--muted); margin-bottom: 4px; }
.score-total-num { font-family: 'Cormorant', serif; font-size: 30px; font-weight: 700; color: #4ade80; line-height: 1; }
.score-badge { padding: 7px 14px; background: rgba(74,222,128,0.09); border: 1px solid rgba(74,222,128,0.22); border-radius: 100px; color: #4ade80; font-size: 12.5px; font-weight: 600; }

/* ── INDUSTRIES ── */
.ind-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-top: 44px; }
.ind-chip { padding: 18px 12px; background: var(--card); border: 1px solid var(--border); border-radius: 12px; text-align: center; transition: all 0.22s; cursor: default; }
.ind-chip:hover { border-color: rgba(200,136,26,0.32); background: rgba(200,136,26,0.05); transform: translateY(-2px); }
.ind-icon { font-size: 22px; margin-bottom: 7px; }
.ind-name { font-size: 11.5px; font-weight: 500; color: var(--muted); }

/* ── TESTIMONIALS ── */
.test-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: 60px; }
.test-card { padding: 30px; background: var(--card); border: 1px solid var(--border); border-radius: 14px; }
.test-stars { color: var(--gold2); font-size: 14px; margin-bottom: 14px; letter-spacing: 1px; }
.test-text { font-size: 14px; line-height: 1.75; color: var(--text); margin-bottom: 22px; opacity: 0.88; }
.test-author { display: flex; align-items: center; gap: 12px; }
.test-av { width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 700; background: rgba(200,136,26,0.12); border: 1px solid rgba(200,136,26,0.2); color: var(--gold2); flex-shrink: 0; }
.test-name { font-size: 14px; font-weight: 600; color: var(--text); }
.test-role { font-size: 12px; color: var(--muted); margin-top: 2px; }

/* ── CTA ── */
.cta-sec { padding: 120px 32px; position: relative; overflow: hidden; text-align: center; }
.cta-blob { position: absolute; width: 900px; height: 500px; top: 50%; left: 50%; transform: translate(-50%,-50%); background: radial-gradient(ellipse, rgba(200,136,26,0.14) 0%, transparent 65%); pointer-events: none; border-radius: 50%; }
.cta-inner { max-width: 660px; margin: 0 auto; position: relative; z-index: 1; }
.cta-h2 { font-family: 'Cormorant', serif; font-size: clamp(46px, 5vw, 70px); font-weight: 600; line-height: 1.05; letter-spacing: -0.022em; color: var(--text); margin-bottom: 18px; }
.cta-sub { font-size: 16.5px; color: var(--muted); line-height: 1.7; margin-bottom: 44px; }
.cta-form { display: flex; gap: 11px; max-width: 420px; margin: 0 auto 16px; }
.cta-input { flex: 1; padding: 13px 17px; background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 10px; color: var(--text); font-size: 15px; font-family: 'Plus Jakarta Sans', sans-serif; outline: none; transition: border-color 0.2s; }
.cta-input::placeholder { color: var(--muted); }
.cta-input:focus { border-color: rgba(200,136,26,0.4); }
.cta-note { font-size: 12.5px; color: var(--muted); }

/* ── FOOTER ── */
.footer { border-top: 1px solid var(--border); padding: 44px 32px 28px; }
.footer-inner { max-width: 1180px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
.footer-logo { font-family: 'Cormorant', serif; font-size: 20px; font-weight: 600; color: var(--text); }
.footer-links { display: flex; gap: 28px; }
.footer-link { font-size: 13px; color: var(--muted); text-decoration: none; transition: color 0.2s; }
.footer-link:hover { color: var(--text); }
.footer-copy { font-size: 12.5px; color: var(--muted); }

/* ── RESPONSIVE ── */
@media (max-width: 1024px) {
  .hero-inner { grid-template-columns: 1fr; gap: 48px; }
  .hero-h1 { font-size: clamp(48px, 7vw, 66px); }
  .steps-grid { grid-template-columns: 1fr; }
  .feat-grid { grid-template-columns: repeat(2, 1fr); }
  .closer-grid { grid-template-columns: 1fr; gap: 40px; }
  .ind-grid { grid-template-columns: repeat(3, 1fr); }
  .test-grid { grid-template-columns: 1fr 1fr; }
  .stats-inner { grid-template-columns: repeat(2, 1fr); }
  .stat { border-right: none; border-bottom: 1px solid var(--border); }
}
@media (max-width: 640px) {
  .nav { padding: 0 16px; }
  .nav-mid { display: none; }
  .hero { padding: 88px 16px 60px; }
  .section { padding: 64px 16px; }
  .stats-bar { padding: 0 16px; }
  .feat-grid { grid-template-columns: 1fr; }
  .test-grid { grid-template-columns: 1fr; }
  .ind-grid { grid-template-columns: repeat(2, 1fr); }
  .footer-inner { flex-direction: column; gap: 20px; text-align: center; }
  .footer-links { flex-wrap: wrap; justify-content: center; gap: 14px; }
  .cta-form { flex-direction: column; }
  .hero-cta { flex-direction: column; align-items: flex-start; }
}
`;

export default function Home() {
  const [visibleMsgs, setVisibleMsgs] = useState(0);
  const [typing, setTyping] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    CHAT_MESSAGES.forEach((msg, i) => {
      if (msg.role === 'ai') {
        timers.push(setTimeout(() => setTyping(true), msg.delay - 900));
      }
      timers.push(setTimeout(() => {
        setTyping(false);
        setVisibleMsgs(i + 1);
      }, msg.delay + 350));
    });

    const lastDelay = CHAT_MESSAGES[CHAT_MESSAGES.length - 1].delay + 350;
    timers.push(setTimeout(() => {
      setVisibleMsgs(0);
      setTyping(false);
      timers.push(setTimeout(() => setAnimKey(k => k + 1), 600));
    }, lastDelay + 2400));

    return () => timers.forEach(clearTimeout);
  }, [animKey]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const handleCTA = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = `/register${email ? `?email=${encodeURIComponent(email)}` : ''}`;
  };

  const scoreRows = [
    { label: 'Clarification', score: 92, color: '#4ade80' },
    { label: 'Problem Labeling', score: 87, color: '#4ade80' },
    { label: 'Pain Overview', score: 78, color: '#f0b445' },
    { label: 'Solution Pitch', score: 95, color: '#4ade80' },
    { label: 'Outcome Focus', score: 83, color: '#4ade80' },
    { label: 'Closing Recap', score: 71, color: '#f0b445' },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="lp">

        {/* NAV */}
        <nav className="nav">
          <a href="/" className="nav-logo">
            <div className="nav-gem">✦</div>
            Concierge
          </a>
          <div className="nav-mid">
            <a href="#how-it-works" className="nav-link">How It Works</a>
            <a href="#features" className="nav-link">Features</a>
            <a href="#industries" className="nav-link">Industries</a>
            <a href="#testimonials" className="nav-link">Testimonials</a>
          </div>
          <div className="nav-right">
            <Link href="/login" className="btn-ghost">Sign In</Link>
            <Link href="/register" className="btn-gold">Start Free →</Link>
          </div>
        </nav>

        {/* HERO */}
        <section className="hero">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="hero-inner">
            <div>
              <div className="hero-pill">
                <span className="hero-dot" />
                AI Sales Intelligence Platform
              </div>
              <h1 className="hero-h1">
                Your Sales Rep.<br />
                <em>Always On.</em><br />
                Always You.
              </h1>
              <p className="hero-sub">
                Concierge learns your exact sales style through guided simulations, then engages every lead 24/7 with your authentic voice — qualifying, warming, and capturing while you focus on closing.
              </p>
              <div className="hero-cta">
                <Link href="/register" className="btn-primary">
                  Start Free Trial <span>→</span>
                </Link>
                <a href="#how-it-works" className="btn-secondary">
                  <span className="btn-secondary-circle">▶</span>
                  How It Works
                </a>
              </div>
              <div className="hero-proof">
                <div className="avatars">
                  {['A', 'M', 'J', 'S', 'R'].map((l, i) => (
                    <div key={i} className="av">{l}</div>
                  ))}
                </div>
                <div className="proof-text">
                  Trusted by <strong>500+</strong> freelancers & agencies
                </div>
              </div>
            </div>

            {/* CHAT DEMO */}
            <div className="demo-wrap">
              <div className="demo-chip chip-hot">🔥 Hot Lead Detected</div>
              <div className="demo-chip chip-learn">✦ AI Learning Active</div>
              <div className="demo-card">
                <div className="demo-head">
                  <div className="demo-icon">✦</div>
                  <div>
                    <div className="demo-head-title">Concierge AI</div>
                    <div className="demo-head-sub">Marketing Agency · Live</div>
                  </div>
                  <div className="demo-live">
                    <div className="live-dot" />
                    Live
                  </div>
                </div>
                <div className="messages" key={animKey}>
                  {CHAT_MESSAGES.slice(0, visibleMsgs).map((msg, i) => (
                    <div key={i} className={`msg msg-${msg.role}`}>
                      <div className={`msg-av av-${msg.role}`}>
                        {msg.role === 'lead' ? 'JD' : '✦'}
                      </div>
                      <div className={`bubble bubble-${msg.role}`}>{msg.text}</div>
                    </div>
                  ))}
                  {typing && (
                    <div className="msg msg-ai">
                      <div className="msg-av av-ai">✦</div>
                      <div className="bubble bubble-ai">
                        <div className="typing">
                          <div className="tdot" /><div className="tdot" /><div className="tdot" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="learn-bar">
                  <span>🧠</span>
                  <span><strong>Learning:</strong> Objection handling + pricing tone captured</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <div className="stats-bar">
          <div className="stats-inner">
            {[
              { n: '500+', l: 'Agencies & Freelancers' },
              { n: '24/7', l: 'Lead Engagement' },
              { n: '3 min', l: 'Average Setup Time' },
              { n: '87%', l: 'Lead Capture Rate' },
            ].map((s, i) => (
              <div key={i} className="stat">
                <div className="stat-n">{s.n}</div>
                <div className="stat-l">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* HOW IT WORKS */}
        <section className="section" id="how-it-works">
          <div className="wrap">
            <div className="reveal" style={{ textAlign: 'center' }}>
              <div className="s-tag">↓ The Process</div>
              <h2 className="s-h2">From Training to <em>Live</em> in Days</h2>
              <p className="s-sub" style={{ margin: '0 auto' }}>Three steps. Zero sales headcount. Your authentic voice, always available.</p>
            </div>
            <div className="steps-grid">
              {[
                {
                  n: '1', title: 'Train Your AI',
                  desc: 'Complete 8 guided simulation scenarios. Concierge watches exactly how you handle real-world sales conversations — objections, pricing, qualification, the works.',
                  bullets: ['8 scenario types across 10+ industries', 'CLOSER framework integration', 'Real-time scoring & feedback', 'Adapts to your specific vertical'],
                },
                {
                  n: '2', title: 'Approve Your Profile',
                  desc: "Review everything Concierge learned about your style. Approve extracted patterns and voice examples, or refine until they're perfect.",
                  bullets: ['Communication style extraction', 'Pricing logic & thresholds', 'Objection handling patterns', 'Your exact phrases & language'],
                },
                {
                  n: '3', title: 'Deploy & Capture',
                  desc: 'One line of code on your website. Concierge is live — responding in your voice, qualifying leads, building your pipeline around the clock.',
                  bullets: ['One-line widget embed', 'Instant lead qualification', 'Hot / Warm / Cold scoring', 'Owner takeover anytime'],
                },
              ].map((s, i) => (
                <div key={i} className={`step-card reveal reveal-d${i + 1}`}>
                  <div className="step-num">{s.n}</div>
                  <div className="step-title">{s.title}</div>
                  <div className="step-desc">{s.desc}</div>
                  <div className="step-bullets">
                    {s.bullets.map((b, j) => (
                      <div key={j} className="step-bullet">
                        <div className="bullet-dot" />{b}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CLOSER FRAMEWORK */}
        <section className="section closer-section">
          <div className="wrap">
            <div className="closer-grid">
              <div className="reveal">
                <div className="s-tag">↓ The Methodology</div>
                <h2 className="s-h2">Built on the<br /><em>CLOSER</em> Framework</h2>
                <p className="s-sub">
                  Every simulation and live conversation follows the proven CLOSER sales methodology — the same framework used by top-performing agencies worldwide.
                </p>
                <div className="closer-list">
                  {[
                    { l: 'C', t: 'Clarify', d: "Identify why the lead reached out and what they're truly looking for." },
                    { l: 'L', t: 'Label', d: 'Clearly name and confirm the problem they\'re experiencing.' },
                    { l: 'O', t: 'Overview', d: 'Surface the emotional and business pain behind their challenge.' },
                    { l: 'S', t: 'Sell', d: 'Present your solution in terms of their specific pain and desired outcome.' },
                    { l: 'E', t: 'Explain', d: 'Outline the transformation and results they can realistically expect.' },
                    { l: 'R', t: 'Recap', d: 'Confirm investment, next steps, and commitment to move forward.' },
                  ].map((item, i) => (
                    <div key={i} className="cl-item">
                      <div className="cl-letter">{item.l}</div>
                      <div>
                        <div className="cl-title">{item.t}</div>
                        <div className="cl-desc">{item.d}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="reveal reveal-d2">
                <div className="score-card">
                  <div className="score-title">Live Conversation Score</div>
                  {scoreRows.map((row, i) => (
                    <div key={i} className="score-row">
                      <div className="score-row-top">
                        <span className="score-row-label">{row.label}</span>
                        <span style={{ color: row.color, fontWeight: 600, fontSize: '12.5px' }}>{row.score}%</span>
                      </div>
                      <div className="score-bar-track">
                        <div className="score-bar-fill" style={{ width: `${row.score}%`, background: row.color, opacity: 0.75 }} />
                      </div>
                    </div>
                  ))}
                  <div className="score-total">
                    <div>
                      <div className="score-total-label">Overall Lead Score</div>
                      <div className="score-total-num">84 / 100</div>
                    </div>
                    <div className="score-badge">🔥 Hot Lead</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="section" id="features">
          <div className="wrap">
            <div className="reveal" style={{ textAlign: 'center' }}>
              <div className="s-tag">↓ What's Included</div>
              <h2 className="s-h2">Everything You Need to<br /><em>Never Miss a Lead</em></h2>
            </div>
            <div className="feat-grid">
              {[
                { icon: '🎭', t: 'AI Simulation Training', d: '8 mandatory scenario types with realistic AI-generated personas. Your AI learns your exact voice, objection style, and pricing logic.' },
                { icon: '📊', t: 'Real-time Lead Scoring', d: 'Every conversation scored Hot, Warm, or Cold using the CLOSER framework. Know your best leads the moment they engage.' },
                { icon: '🌐', t: '24/7 Live Chat Widget', d: 'One line of code. Your concierge is instantly live — responding in your authentic voice, around the clock.' },
                { icon: '🎙️', t: 'Voice & Identity Extraction', d: 'Automatically extracts your communication style, tone, pricing logic, and linguistic fingerprint from your simulations.' },
                { icon: '⚡', t: 'Owner Takeover Mode', d: 'Pause the AI and jump into any live conversation at any time. Pick up exactly where Concierge left off.' },
                { icon: '📈', t: 'Analytics Dashboard', d: 'Track lead volume, qualification rates, conversion trends, and response times across 7, 30, and 90-day windows.' },
              ].map((f, i) => (
                <div key={i} className={`feat-card reveal reveal-d${(i % 3) + 1}`}>
                  <div className="feat-icon">{f.icon}</div>
                  <div className="feat-title">{f.t}</div>
                  <div className="feat-desc">{f.d}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* INDUSTRIES */}
        <section className="section" id="industries" style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          <div className="wrap">
            <div className="reveal">
              <div className="s-tag">↓ Your Industry</div>
              <h2 className="s-h2">Built for <em>Your Vertical</em></h2>
              <p className="s-sub">Industry-specific simulations, personas, and qualification criteria — no generic chatbot nonsense.</p>
            </div>
            <div className="ind-grid reveal">
              {[
                { icon: '⚖️', n: 'Legal Services' },
                { icon: '🏠', n: 'Real Estate' },
                { icon: '💻', n: 'IT Services' },
                { icon: '📊', n: 'Consulting' },
                { icon: '🎨', n: 'Marketing & Creative' },
                { icon: '💰', n: 'Financial Advisory' },
                { icon: '🏗️', n: 'Construction' },
                { icon: '❤️', n: 'Health & Wellness' },
                { icon: '🔧', n: 'Home Services' },
                { icon: '🤝', n: 'Business Consulting' },
              ].map((ind, i) => (
                <div key={i} className="ind-chip">
                  <div className="ind-icon">{ind.icon}</div>
                  <div className="ind-name">{ind.n}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="section" id="testimonials">
          <div className="wrap">
            <div className="reveal" style={{ textAlign: 'center' }}>
              <div className="s-tag">↓ From the Field</div>
              <h2 className="s-h2">What Clients Say</h2>
            </div>
            <div className="test-grid">
              {[
                { t: "I was skeptical an AI could learn my sales style. Concierge nailed it. My clients have no idea they're talking to AI — it handles objections the way I do, even uses my specific phrases.", n: 'Marcus Chen', r: 'Marketing Agency Owner', l: 'M' },
                { t: "Set it up Thursday. By Monday I had 7 qualified leads waiting. That's 7 conversations I'd have missed. The ROI in week one was insane.", n: 'Sarah Williams', r: 'IT Consulting Firm', l: 'S' },
                { t: "The simulation training made me a better salesperson, not just a better AI trainer. The CLOSER framework feedback helped me close two more deals last month.", n: 'James Rodriguez', r: 'Real Estate Broker', l: 'J' },
              ].map((t, i) => (
                <div key={i} className={`test-card reveal reveal-d${i + 1}`}>
                  <div className="test-stars">★★★★★</div>
                  <div className="test-text">"{t.t}"</div>
                  <div className="test-author">
                    <div className="test-av">{t.l}</div>
                    <div>
                      <div className="test-name">{t.n}</div>
                      <div className="test-role">{t.r}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-sec">
          <div className="cta-blob" />
          <div className="cta-inner reveal">
            <div className="s-tag" style={{ justifyContent: 'center' }}>✦ Get Started</div>
            <h2 className="cta-h2">
              Your Leads Are<br />
              <em style={{ fontStyle: 'italic', background: 'linear-gradient(100deg, var(--gold2), var(--gold))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Waiting.</em>
            </h2>
            <p className="cta-sub">
              Set up in 3 minutes. Train in an afternoon. Live on your site by tomorrow.<br />
              No credit card required.
            </p>
            <form className="cta-form" onSubmit={handleCTA}>
              <input
                type="email"
                className="cta-input"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
                Start Free →
              </button>
            </form>
            <div className="cta-note">Free trial · No credit card · Live in days</div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="footer">
          <div className="footer-inner">
            <div className="footer-logo">✦ Concierge</div>
            <div className="footer-links">
              <a href="#how-it-works" className="footer-link">How It Works</a>
              <a href="#features" className="footer-link">Features</a>
              <Link href="/login" className="footer-link">Sign In</Link>
              <Link href="/register" className="footer-link">Get Started</Link>
              <a href="/privacy" className="footer-link">Privacy</a>
              <a href="/terms" className="footer-link">Terms</a>
            </div>
            <div className="footer-copy">© 2025 Concierge</div>
          </div>
        </footer>

      </div>
    </>
  );
}
