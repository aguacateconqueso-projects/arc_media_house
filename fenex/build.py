#!/usr/bin/env python3
"""Builds the FENEX landing page HTML file."""

parts = []

# Part 1: Head + CSS
parts.append(r'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>FENEX Content Strategy 2025 | ARC Media House</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased}
body{font-family:"Inter",sans-serif;background:#0a0a0f;color:#d0d0d8;font-size:16px;line-height:1.6;overflow-x:hidden}
a{text-decoration:none;color:inherit}button{border:none;background:none;cursor:pointer;font-family:inherit}img{max-width:100%;display:block}
.login-overlay{position:fixed;inset:0;z-index:9999;background:#0a0a0f;display:flex;align-items:center;justify-content:center;transition:opacity .5s,visibility .5s}
.login-overlay.hidden{opacity:0;visibility:hidden;pointer-events:none}
.login-box{text-align:center;max-width:380px;width:100%;padding:0 24px}
.login-box__logo{height:48px;margin:0 auto 48px}
.login-box__title{font-size:14px;font-weight:500;letter-spacing:.2em;text-transform:uppercase;color:#4a9ece;margin-bottom:40px}
.login-box__input{width:100%;padding:16px 20px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:8px;color:#e8e8e8;font-family:inherit;font-size:15px;text-align:center;letter-spacing:.15em;outline:none;transition:border-color .3s;margin-bottom:20px}
.login-box__input:focus{border-color:#4a9ece}.login-box__input::placeholder{color:#444}
.login-box__btn{width:100%;padding:16px;background:#4a9ece;color:#0a0a0f;font-size:13px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;border-radius:8px;transition:background .3s,transform .2s}
.login-box__btn:hover{background:#5fb4e0;transform:translateY(-1px)}
.login-box__error{margin-top:16px;font-size:13px;color:#e05555;opacity:0;transition:opacity .3s}.login-box__error.show{opacity:1}
.fnav{position:fixed;top:0;left:0;right:0;z-index:1000;height:64px;display:flex;align-items:center;justify-content:space-between;padding:0 48px;background:rgba(10,10,15,.85);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid rgba(255,255,255,.04)}
.fnav__logo{height:24px}.fnav__links{display:flex;gap:28px}
.fnav__links a{font-size:13px;color:#666;transition:color .2s}.fnav__links a:hover{color:#d0d0d8}
.fnav__arc{font-size:11px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:#444}.fnav__arc span{color:#4a9ece}
.section{padding:120px 48px;max-width:1100px;margin:0 auto}
.section-label{font-size:11px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:#4a9ece;margin-bottom:20px}
.section-title{font-size:44px;font-weight:200;letter-spacing:-.03em;line-height:1.1;color:#e8e8e8;margin-bottom:24px}.section-title strong{font-weight:700}
.divider{width:100%;height:1px;background:rgba(255,255,255,.06)}
.hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:64px 24px 80px;position:relative;overflow:hidden}
.hero::before{content:"";position:absolute;top:-50%;left:50%;transform:translateX(-50%);width:800px;height:800px;background:radial-gradient(circle,rgba(74,158,206,.08) 0%,transparent 70%);pointer-events:none}
.hero__fenex-logo{height:56px;margin-bottom:48px;opacity:.9}
.hero__badge{display:inline-flex;padding:8px 20px;border:1px solid rgba(74,158,206,.25);border-radius:50px;font-size:12px;font-weight:500;letter-spacing:.15em;text-transform:uppercase;color:#4a9ece;margin-bottom:40px}
.hero__headline{font-size:64px;font-weight:200;letter-spacing:-.04em;line-height:1.05;color:#e8e8e8;margin-bottom:28px;max-width:800px}.hero__headline strong{font-weight:700}
.hero__tagline{font-size:22px;font-weight:300;font-style:italic;color:#4a9ece;margin-bottom:36px}
.hero__desc{font-size:17px;font-weight:300;line-height:1.7;color:#888;max-width:640px;margin:0 auto}
.hero__scroll{position:absolute;bottom:40px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:8px;color:#444;font-size:11px;letter-spacing:.15em;text-transform:uppercase;animation:pulse 2s ease-in-out infinite}
.hero__scroll svg{width:16px;height:16px}@keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}
.overview__text{font-size:18px;font-weight:300;line-height:1.7;color:#888;max-width:700px;margin-bottom:72px}
.vcards{display:flex;flex-direction:column;gap:2px}
.vcard{display:grid;grid-template-columns:auto 1fr auto;gap:40px;align-items:start;padding:48px 40px;background:rgba(255,255,255,.02);border-radius:12px;transition:background .3s}.vcard:hover{background:rgba(255,255,255,.04)}
.vcard__num{font-size:64px;font-weight:800;color:rgba(74,158,206,.12);line-height:1;min-width:80px}
.vcard__body{display:flex;flex-direction:column;gap:12px}
.vcard__tag{font-size:10px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:#4a9ece}
.vcard__title{font-size:24px;font-weight:600;color:#e8e8e8}.vcard__subtitle{font-size:14px;color:#666}
.vcard__desc{font-size:15px;font-weight:300;line-height:1.65;color:#888;max-width:520px}
.vcard__meta{display:flex;flex-direction:column;gap:16px;min-width:200px;text-align:right}
.vcard__meta-item{display:flex;flex-direction:column;gap:2px}
.vcard__meta-label{font-size:10px;font-weight:600;letter-spacing:.15em;text-transform:uppercase;color:#444}
.vcard__meta-value{font-size:13px;color:#999}
.deepdive{background:rgba(255,255,255,.015)}.deepdive__inner{max-width:1100px;margin:0 auto;padding:120px 48px}
.deepdive__intro{font-size:18px;font-weight:300;line-height:1.7;color:#888;max-width:700px;margin-bottom:64px}
.deepdive__award{display:inline-flex;align-items:center;gap:8px;padding:6px 16px;background:rgba(74,158,206,.08);border:1px solid rgba(74,158,206,.15);border-radius:50px;font-size:12px;font-weight:500;color:#4a9ece;margin-bottom:32px}
.video-embed{width:100%;aspect-ratio:16/9;background:#111118;border-radius:12px;border:1px solid rgba(255,255,255,.06);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;margin-bottom:16px}
.video-embed__placeholder{color:#333;font-size:14px}.video-embed__play{width:64px;height:64px;border-radius:50%;background:rgba(74,158,206,.15);border:1px solid rgba(74,158,206,.3);display:flex;align-items:center;justify-content:center;color:#4a9ece}
.video-embed__play svg{width:24px;height:24px;margin-left:3px}
.video-embed__caption{font-size:13px;font-weight:300;color:#555;margin-bottom:64px}
.script-block{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:40px;margin-bottom:64px}
.script-block__title{font-size:13px;font-weight:600;letter-spacing:.15em;text-transform:uppercase;color:#4a9ece;margin-bottom:32px}
.script-line{display:grid;grid-template-columns:120px 1fr;gap:20px;padding:16px 0;border-bottom:1px solid rgba(255,255,255,.03)}.script-line:last-child{border-bottom:none}
.script-line__time{font-size:13px;font-weight:500;color:#4a9ece}.script-line__label{font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#555;margin-bottom:6px}
.script-line__text{font-size:15px;font-weight:300;line-height:1.6;color:#bbb}.script-line__note{font-size:13px;color:#555;font-style:italic;margin-top:6px}
.tech-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:2px;margin-bottom:64px}
.tech-card{background:rgba(255,255,255,.02);border-radius:8px;padding:32px 24px;text-align:center;transition:background .3s}.tech-card:hover{background:rgba(255,255,255,.04)}
.tech-card__label{font-size:10px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:#4a9ece;margin-bottom:16px}
.tech-card__value{font-size:20px;font-weight:600;color:#e8e8e8;margin-bottom:8px}.tech-card__desc{font-size:13px;color:#666;line-height:1.5}
.timeline__phase{display:grid;grid-template-columns:160px 1fr;gap:32px;padding:32px 0;border-bottom:1px solid rgba(255,255,255,.04)}.timeline__phase:last-child{border-bottom:none}
.timeline__week{font-size:12px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#4a9ece}
.timeline__phase-title{font-size:16px;font-weight:500;color:#e8e8e8;margin-bottom:12px}
.timeline__tasks{display:flex;flex-direction:column;gap:6px}
.timeline__task{font-size:14px;font-weight:300;color:#777;padding-left:16px;position:relative}.timeline__task::before{content:"";position:absolute;left:0;top:9px;width:4px;height:4px;border-radius:50%;background:#333}
.timeline__deliverable{margin-top:12px;font-size:13px;font-weight:500;color:#4a9ece}
.v23-grid{display:grid;grid-template-columns:1fr 1fr;gap:2px}.v23-card{background:rgba(255,255,255,.02);border-radius:12px;padding:48px 40px}
.v23-card__num{font-size:11px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:#4a9ece;margin-bottom:20px}
.v23-card__title{font-size:22px;font-weight:600;color:#e8e8e8;margin-bottom:6px}.v23-card__subtitle{font-size:14px;color:#555;margin-bottom:20px}
.v23-card__desc{font-size:15px;font-weight:300;line-height:1.65;color:#888;margin-bottom:28px}
.v23-card__section-label{font-size:10px;font-weight:600;letter-spacing:.15em;text-transform:uppercase;color:#555;margin-bottom:12px;margin-top:24px}
.v23-card__list{display:flex;flex-direction:column;gap:6px}
.v23-card__list-item{font-size:14px;font-weight:300;color:#777;padding-left:16px;position:relative}.v23-card__list-item::before{content:"";position:absolute;left:0;top:9px;width:4px;height:4px;border-radius:50%;background:#4a9ece}
.v23-card__specs{display:flex;flex-direction:column;gap:8px;margin-top:8px}
.v23-card__spec{font-size:14px;color:#999;display:flex;align-items:center;gap:8px}.v23-card__spec::before{content:"\2192";color:#4a9ece}
.addons-grid{display:grid;grid-template-columns:1fr 1fr;gap:2px;margin-top:48px}
.addon-card{background:rgba(255,255,255,.02);border-radius:12px;padding:48px 40px;position:relative}
.addon-card__badge{position:absolute;top:24px;right:24px;font-size:11px;font-weight:600;color:#4a9ece;background:rgba(74,158,206,.08);padding:4px 12px;border-radius:50px}
.addon-card__title{font-size:20px;font-weight:600;color:#e8e8e8;margin-bottom:16px}
.addon-card__desc{font-size:15px;font-weight:300;line-height:1.65;color:#888;margin-bottom:24px}
.addon-card__list{display:flex;flex-direction:column;gap:6px}
.addon-card__list-item{font-size:14px;font-weight:300;color:#777;padding-left:16px;position:relative}.addon-card__list-item::before{content:"";position:absolute;left:0;top:9px;width:4px;height:4px;border-radius:50%;background:#333}
.addons-included{text-align:center;margin-top:32px;padding:24px;border:1px solid rgba(74,158,206,.15);border-radius:12px;background:rgba(74,158,206,.03)}
.addons-included__text{font-size:15px;color:#888}.addons-included__text strong{color:#4a9ece;font-weight:600}
.invest-hero{text-align:center;margin-bottom:64px}
.invest-price{font-size:72px;font-weight:200;color:#e8e8e8;margin-bottom:8px}.invest-price strong{font-weight:700}
.invest-currency{font-size:16px;color:#555}
.invest-includes{display:grid;grid-template-columns:1fr 1fr;gap:8px;max-width:700px;margin:40px auto 0}
.invest-check{font-size:14px;font-weight:300;color:#888;display:flex;align-items:center;gap:10px}.invest-check::before{content:"\2713";color:#4a9ece;font-weight:600}
.value-table{width:100%;border-collapse:collapse;margin:64px 0}
.value-table th{text-align:left;font-size:10px;font-weight:600;letter-spacing:.15em;text-transform:uppercase;color:#444;padding:12px 16px;border-bottom:1px solid rgba(255,255,255,.08)}.value-table th:last-child{text-align:right}
.value-table td{padding:16px;font-size:15px;font-weight:300;color:#999;border-bottom:1px solid rgba(255,255,255,.03)}.value-table td:last-child{text-align:right;color:#777}
.value-table tr.total td{font-weight:600;color:#e8e8e8;border-top:1px solid rgba(255,255,255,.08);border-bottom:none;padding-top:20px}
.value-table tr.package td{color:#4a9ece;font-weight:600;font-size:18px}.value-table tr.savings td{color:#50c878;font-weight:500}
.schedule-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:2px;margin:64px 0}
.schedule-card{background:rgba(255,255,255,.02);border-radius:8px;padding:32px 24px}
.schedule-card__weeks{font-size:11px;font-weight:600;letter-spacing:.15em;text-transform:uppercase;color:#4a9ece;margin-bottom:12px}
.schedule-card__title{font-size:16px;font-weight:500;color:#e8e8e8;margin-bottom:16px}
.schedule-card__task{font-size:13px;font-weight:300;color:#666}
.formats-table{width:100%;border-collapse:collapse;margin:48px 0}
.formats-table th{text-align:left;font-size:10px;font-weight:600;letter-spacing:.15em;text-transform:uppercase;color:#444;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.08)}
.formats-table td{padding:14px 0;font-size:14px;font-weight:300;color:#888;border-bottom:1px solid rgba(255,255,255,.03)}
.payment-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;margin:48px 0}
.payment-card{background:rgba(255,255,255,.02);border-radius:12px;padding:36px 28px;text-align:center}
.payment-card__label{font-size:11px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#555;margin-bottom:12px}
.payment-card__amount{font-size:28px;font-weight:600;color:#e8e8e8;margin-bottom:4px}
.payment-card__pct{font-size:13px;color:#4a9ece;margin-bottom:16px}.payment-card__desc{font-size:13px;font-weight:300;color:#666;line-height:1.5}
.payment-methods{text-align:center;margin-top:32px;font-size:14px;font-weight:300;color:#555}
.nextsteps{text-align:center;padding:120px 48px 80px}
.nextsteps__text{font-size:17px;font-weight:300;line-height:1.7;color:#888;max-width:640px;margin:0 auto 24px}
.nextsteps__highlight{font-size:16px;color:#999;font-style:italic;margin-bottom:56px}
.cta-buttons{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
.cta-btn{display:inline-flex;align-items:center;gap:10px;padding:16px 36px;border-radius:8px;font-size:14px;font-weight:500;transition:all .3s}.cta-btn svg{width:16px;height:16px}
.cta-btn--primary{background:#4a9ece;color:#0a0a0f}.cta-btn--primary:hover{background:#5fb4e0;transform:translateY(-2px)}
.cta-btn--secondary{background:rgba(255,255,255,.04);color:#d0d0d8;border:1px solid rgba(255,255,255,.1)}.cta-btn--secondary:hover{background:rgba(255,255,255,.08);transform:translateY(-2px)}
.closing{text-align:center;padding:80px 48px 40px;border-top:1px solid rgba(255,255,255,.04)}
.closing__tagline{font-size:28px;font-weight:200;color:#4a9ece;font-style:italic;margin-bottom:32px}
.closing__validity{font-size:14px;color:#555;margin-bottom:24px}.closing__contact{font-size:14px;color:#666;line-height:1.8}.closing__contact strong{font-weight:500;color:#999}
.ffooter{padding:48px;border-top:1px solid rgba(255,255,255,.04);margin-top:40px}
.ffooter__inner{max-width:1100px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;gap:24px;flex-wrap:wrap}
.ffooter__brand{display:flex;align-items:center;gap:24px}.ffooter__logo{height:22px;opacity:.6}.ffooter__text{font-size:12px;color:#444}
.ffooter__fenex{display:flex;align-items:center;gap:16px}.ffooter__fenex-logo{height:20px;opacity:.5}.ffooter__fenex-text{font-size:12px;color:#444}
@media(max-width:768px){.fnav{padding:0 24px}.fnav__links{display:none}.section{padding:80px 24px}.section-title{font-size:32px}.hero{min-height:90vh;padding:64px 20px 80px}.hero__headline{font-size:36px}.vcard{grid-template-columns:1fr;gap:16px;padding:32px 24px}.vcard__num{font-size:48px}.vcard__meta{text-align:left;min-width:auto;flex-direction:row;gap:24px}.tech-grid,.v23-grid,.addons-grid{grid-template-columns:1fr}.schedule-grid,.payment-grid{grid-template-columns:1fr 1fr}.invest-includes{grid-template-columns:1fr}.invest-price{font-size:48px}.script-line,.timeline__phase{grid-template-columns:1fr;gap:6px}.deepdive__inner{padding:80px 24px}.cta-buttons{flex-direction:column;align-items:center}.ffooter__inner{flex-direction:column;text-align:center}}
</style>
</head>
<body>
''')

# Part 2: Login + Nav + Hero
parts.append('''
<div class="login-overlay" id="loginOverlay">
<div class="login-box">
<img src="assets/fenex-logo.png" alt="FENEX" class="login-box__logo">
<p class="login-box__title">FENEX Project Access</p>
<input type="password" class="login-box__input" id="loginInput" placeholder="Enter password" autofocus>
<button class="login-box__btn" onclick="tryLogin()">Access Proposal</button>
<p class="login-box__error" id="loginError">Incorrect password. Please try again.</p>
</div></div>
<nav class="fnav">
<img src="../Logos/Logo White Alpha.png" alt="ARC Media House" class="fnav__logo">
<div class="fnav__links"><a href="#overview">Overview</a><a href="#videos">Videos</a><a href="#deepdive">Deep Dive</a><a href="#investment">Investment</a><a href="#next">Next Steps</a></div>
<span class="fnav__arc">Prepared by <span>ARC Media House</span></span>
</nav>
<main id="mainContent" style="display:none">
<section class="hero" id="hero">
<img src="assets/fenex-logo.png" alt="FENEX" class="hero__fenex-logo">
<div class="hero__badge">Content Strategy 2025</div>
<h1 class="hero__headline"><strong>FENEX</strong><br>Content Strategy</h1>
<p class="hero__tagline">Beyond the view, there is the vision of the future.</p>
<p class="hero__desc">Three strategic videos designed to position FENEX as the technical leader in oversized glazing systems and flood mitigation. Each video targets a specific audience and achieves a distinct marketing objective.</p>
<div class="hero__scroll"><span>Scroll</span><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"/></svg></div>
</section>
<div class="divider"></div>
''')

# Part 3: Strategic Overview + Video Cards
parts.append('''
<section class="section" id="overview">
<p class="section-label">Strategic Overview</p>
<h2 class="section-title">Three Videos. <strong>One Vision.</strong></h2>
<p class="overview__text">FENEX doesn&#x27;t just manufacture oversized glazing systems. They engineer solutions that push the boundaries of what&#x27;s possible. These three strategic videos showcase the technical excellence and innovative vision that define the brand.</p>
<div class="vcards" id="videos">
<div class="vcard"><div class="vcard__num">01</div><div class="vcard__body"><p class="vcard__tag">Video 1: The Impossible Window</p><h3 class="vcard__title">Engineering Breakdown</h3><p class="vcard__subtitle">90 seconds</p><p class="vcard__desc">A deep-dive case study showcasing FENEX&#x27;s technical capabilities through the Bottega Veneta Miami Design District project.</p></div><div class="vcard__meta"><div class="vcard__meta-item"><span class="vcard__meta-label">Target Audience</span><span class="vcard__meta-value">Architects, engineers, developers</span></div><div class="vcard__meta-item"><span class="vcard__meta-label">Objective</span><span class="vcard__meta-value">Demonstrate technical leadership and engineering excellence</span></div></div></div>
<div class="vcard"><div class="vcard__num">02</div><div class="vcard__body"><p class="vcard__tag">Video 2: Engineering Extremes</p><h3 class="vcard__title">Specs Showcase</h3><p class="vcard__subtitle">60 seconds</p><p class="vcard__desc">Dynamic visualization of FENEX&#x27;s most impressive technical specifications, from hurricane resistance to flood mitigation.</p></div><div class="vcard__meta"><div class="vcard__meta-item"><span class="vcard__meta-label">Target Audience</span><span class="vcard__meta-value">Decision makers, specifiers, facility managers</span></div><div class="vcard__meta-item"><span class="vcard__meta-label">Objective</span><span class="vcard__meta-value">Competitive differentiation through superior capabilities</span></div></div></div>
<div class="vcard"><div class="vcard__num">03</div><div class="vcard__body"><p class="vcard__tag">Video 3: Portfolio of Precision</p><h3 class="vcard__title">High-End Showcase</h3><p class="vcard__subtitle">45 seconds</p><p class="vcard__desc">A fast-paced portfolio showcase featuring FENEX&#x27;s work with world-class brands and landmark projects.</p></div><div class="vcard__meta"><div class="vcard__meta-item"><span class="vcard__meta-label">Target Audience</span><span class="vcard__meta-value">Premium clients, brand awareness</span></div><div class="vcard__meta-item"><span class="vcard__meta-label">Objective</span><span class="vcard__meta-value">Aspirational positioning and top-of-mind recall</span></div></div></div>
</div></section>
<div class="divider"></div>
''')

# Part 4: Deep Dive
parts.append('''
<div class="deepdive" id="deepdive"><div class="deepdive__inner">
<p class="section-label">Video 1 &#x2014; Deep Dive</p>
<h2 class="section-title"><strong>The Impossible Window</strong></h2>
<p style="font-size:16px;color:#666;margin-bottom:32px">Case Study: Bottega Veneta &#x2014; Miami Design District</p>
<div class="deepdive__award">&#9734; PIA&#x27;20 Award Winner</div>
<p class="deepdive__intro">When luxury retailer Bottega Veneta needed a curved glass entrance for their Miami Design District flagship, they turned to FENEX. The challenge: create an 8-foot wide, 16-foot tall impact-rated window system with a custom S-shaped curve.<br><br>The result won the 2020 Product Innovation Award from Architectural SSL Magazine.</p>
<div class="video-embed"><div class="video-embed__play"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.14v14l11-7-11-7z"/></svg></div><p class="video-embed__placeholder">15-second motion graphics sample</p></div>
<p class="video-embed__caption">This 15-second sample demonstrates the motion graphics approach: technical blueprint overlays, animated callouts, and specification visualization that transforms architectural footage into compelling technical storytelling.</p>
<div class="script-block"><h3 class="script-block__title">Full Script &#x2014; 90 Seconds</h3>
<div class="script-line"><div><span class="script-line__time">[00:00-00:05]</span></div><div><p class="script-line__label">Open</p><p class="script-line__text">&#x201C;Miami Design District. Bottega Veneta. Same block as Gucci and Rick Owens.&#x201D;</p></div></div>
<div class="script-line"><div><span class="script-line__time">[00:05-00:12]</span></div><div><p class="script-line__label">The Challenge</p><p class="script-line__text">&#x201C;The challenge: Create a curved glass entrance system. Eight feet wide. Sixteen feet tall. Impact-rated for Category 5 hurricanes.&#x201D;</p></div></div>
<div class="script-line"><div><span class="script-line__time">[00:12-00:25]</span></div><div><p class="script-line__label">Technical Breakdown</p><p class="script-line__text">&#x201C;This isn&#x27;t a standard window. It&#x27;s a custom aluminum curved system with S-shaped insulated glass.&#x201D;</p><p class="script-line__note">Motion graphics: Technical drawings overlay with animated specs</p></div></div>
<div class="script-line"><div><span class="script-line__time">[00:25-00:35]</span></div><div><p class="script-line__label">The Engineering</p><p class="script-line__text">&#x201C;Flood-resistant. Impact-resistant. Structurally glazed for a seamless appearance.&#x201D;</p><p class="script-line__note">Motion graphics: Hurricane/flood resistance visualizations</p></div></div>
<div class="script-line"><div><span class="script-line__time">[00:35-00:50]</span></div><div><p class="script-line__label">The Result</p><p class="script-line__text">&#x201C;The result: A one-of-a-kind entrance that redefines what&#x27;s possible in oversized glazing.&#x201D;</p></div></div>
<div class="script-line"><div><span class="script-line__time">[00:50-01:05]</span></div><div><p class="script-line__label">The Recognition</p><p class="script-line__text">&#x201C;In 2020, this project won the Product Innovation Award from Architectural SSL Magazine.&#x201D;</p></div></div>
<div class="script-line"><div><span class="script-line__time">[01:05-01:15]</span></div><div><p class="script-line__label">The Specs</p><p class="script-line__text">&#x201C;Custom aluminum framing. Insulated impact glass. Pre-glazed. Pre-drilled. Installed in sections.&#x201D;</p></div></div>
<div class="script-line"><div><span class="script-line__time">[01:15-01:25]</span></div><div><p class="script-line__label">The Statement</p><p class="script-line__text">&#x201C;Because beyond the view, there is the vision of the future.&#x201D;</p></div></div>
<div class="script-line"><div><span class="script-line__time">[01:25-01:30]</span></div><div><p class="script-line__label">End Card</p><p class="script-line__text">FENEX logo + tagline + contact info</p></div></div>
</div>
<p class="section-label">Technical Highlights</p>
<div class="tech-grid">
<div class="tech-card"><p class="tech-card__label">Dimensions</p><p class="tech-card__value">8&#x27;-0&#x22; W &#xD7; 16&#x27;-6&#x22; H</p><p class="tech-card__desc">Curved S-shape glass system</p></div>
<div class="tech-card"><p class="tech-card__label">Certifications</p><p class="tech-card__value">FL#20700.2</p><p class="tech-card__desc">Impact &amp; flood resistant<br>Category 5 hurricane rated</p></div>
<div class="tech-card"><p class="tech-card__label">Recognition</p><p class="tech-card__value">PIA&#x27;20</p><p class="tech-card__desc">Architectural SSL Magazine<br>Product Innovation Award</p></div>
<div class="tech-card"><p class="tech-card__label">Location</p><p class="tech-card__value">Miami Design District</p><p class="tech-card__desc">Bottega Veneta Flagship<br>High-end retail boutique</p></div>
</div>
<p class="section-label">Production Timeline &#x2014; Video 1</p>
<div class="timeline">
<div class="timeline__phase"><span class="timeline__week">Week 1-2</span><div><p class="timeline__phase-title">Phase 1: Creative Development</p><div class="timeline__tasks"><p class="timeline__task">Script finalization &amp; creative direction</p><p class="timeline__task">Asset gathering &amp; coordination</p><p class="timeline__task">Storyboard &amp; shot planning</p><p class="timeline__task">Client review &amp; approval</p></div></div></div>
<div class="timeline__phase"><span class="timeline__week">Week 2-3</span><div><p class="timeline__phase-title">Phase 2: Production &amp; Motion Graphics</p><div class="timeline__tasks"><p class="timeline__task">Motion graphics production</p><p class="timeline__task">Blueprint animations &amp; technical overlays</p><p class="timeline__task">Edit assembly V1</p><p class="timeline__task">Professional voiceover &amp; music integration</p></div></div></div>
<div class="timeline__phase"><span class="timeline__week">Week 3-4</span><div><p class="timeline__phase-title">Phase 3: Refinement &amp; Delivery</p><div class="timeline__tasks"><p class="timeline__task">Client review session</p><p class="timeline__task">Revision round 1</p><p class="timeline__task">Revision round 2 (if needed)</p><p class="timeline__task">Final delivery in all formats</p></div><p class="timeline__deliverable">Deliverables: 16:9 / 1:1 / 9:16</p></div></div>
</div>
</div></div>
<div class="divider"></div>
''')

# Part 5: Videos 2&3 + Addons
parts.append('''
<section class="section">
<p class="section-label">Videos 2 &amp; 3 &#x2014; Overview</p>
<div class="v23-grid">
<div class="v23-card"><p class="v23-card__num">Video 2</p><h3 class="v23-card__title">Engineering Extremes</h3><p class="v23-card__subtitle">Specs Showcase &#x2014; 60 seconds</p><p class="v23-card__desc">Numbers that impress, visualized dynamically. This video showcases FENEX&#x27;s most extreme capabilities through motion graphics simulations and real project footage.</p><p class="v23-card__section-label">Script Outline</p><div class="v23-card__list"><p class="v23-card__list-item">Hook: &#x201C;132 square feet of glass. In a single panel.&#x201D;</p><p class="v23-card__list-item">Hurricane Resistance: 120 PSF load, Category 5 rated</p><p class="v23-card__list-item">Flood Resistance: 10 ft design flood elevation</p><p class="v23-card__list-item">Additional: Fire resistance, bullet resistance (UL Level 8), walkable skylights</p><p class="v23-card__list-item">Closer: &#x201C;FENEX. Engineering what others say is impossible.&#x201D;</p></div><p class="v23-card__section-label">Key Specs</p><div class="v23-card__specs"><p class="v23-card__spec">132 sq ft maximum panel size</p><p class="v23-card__spec">120 PSF hurricane load resistance</p><p class="v23-card__spec">10 ft design flood elevation</p><p class="v23-card__spec">UL Level 8 bullet resistance</p><p class="v23-card__spec">FM Global 2510 flood testing approved</p><p class="v23-card__spec">Building envelope rated walkable skylights</p></div><p class="v23-card__section-label">Visual Approach</p><div class="v23-card__list"><p class="v23-card__list-item">Wind/debris impact animations</p><p class="v23-card__list-item">Flood water level rising visualizations</p><p class="v23-card__list-item">Multi-layer glass cross-section reveals</p><p class="v23-card__list-item">Spec callouts over real project footage</p></div></div>
<div class="v23-card"><p class="v23-card__num">Video 3</p><h3 class="v23-card__title">Portfolio of Precision</h3><p class="v23-card__subtitle">High-End Showcase &#x2014; 45 seconds</p><p class="v23-card__desc">A cinematic showcase of FENEX&#x27;s work with world-class brands and landmark projects. No voiceover &#x2014; just stunning visuals, elegant transitions, and premium positioning.</p><p class="v23-card__section-label">Featured Projects</p><div class="v23-card__list"><p class="v23-card__list-item">Tiffany &amp; Co. &#x2014; Miami Design District</p><p class="v23-card__list-item">Bottega Veneta &#x2014; Miami Design District (PIA&#x27;20)</p><p class="v23-card__list-item">Fendi &#x2014; Miami Design District</p><p class="v23-card__list-item">World Trade Center &#x2014; New York City</p><p class="v23-card__list-item">Private Residence &#x2014; Siesta Keys, Florida</p><p class="v23-card__list-item">Jersey City Medical Center &#x2014; New Jersey</p><p class="v23-card__list-item">Flood Mitigation &#x2014; Venice, FL &amp; Battery Park, NYC</p></div><p class="v23-card__section-label">Visual Approach</p><div class="v23-card__list"><p class="v23-card__list-item">4-5 seconds per project</p><p class="v23-card__list-item">Minimal text overlays (project name + location)</p><p class="v23-card__list-item">Liquid motion or geometric wipe transitions</p><p class="v23-card__list-item">No voiceover &#x2014; music carries the emotion</p><p class="v23-card__list-item">Ends with FENEX logo + tagline</p></div></div>
</div></section>
<div class="divider"></div>
<section class="section">
<p class="section-label">Included in Package</p>
<h2 class="section-title">Production <strong>Add-Ons</strong></h2>
<p class="overview__text">Beyond the three core videos, this package includes premium add-ons designed to maximize the value and versatility of your content investment.</p>
<div class="addons-grid">
<div class="addon-card"><span class="addon-card__badge">Value: $500</span><h3 class="addon-card__title">Presentation-Optimized Version</h3><p class="addon-card__desc">One video of your choice adapted specifically for large-scale presentations, trade shows, and convention displays.</p><p class="v23-card__section-label">Optimized For</p><div class="addon-card__list"><p class="addon-card__list-item">1920&#xD7;1080 standard projection or custom aspect ratios</p><p class="addon-card__list-item">Large LED screen display</p><p class="addon-card__list-item">Loopable versions for pre-show environments</p><p class="addon-card__list-item">No-audio versions for presenter-led contexts</p></div><p class="v23-card__section-label" style="margin-top:24px">Use Cases</p><div class="addon-card__list"><p class="addon-card__list-item">Trade show booth displays</p><p class="addon-card__list-item">Client presentation decks</p><p class="addon-card__list-item">Showroom installations</p><p class="addon-card__list-item">Lobby and reception area screens</p></div></div>
<div class="addon-card"><span class="addon-card__badge">Value: $1,000</span><h3 class="addon-card__title">Brand Animation Suite</h3><p class="addon-card__desc">A complete set of FENEX logo animations for use across all marketing materials and video content.</p><p class="v23-card__section-label">Included Animations</p><div class="addon-card__list"><p class="addon-card__list-item">Logo Intro (5s): Blueprint-style construction animation</p><p class="addon-card__list-item">Logo Outro (3s): Clean sign-off with tagline</p><p class="addon-card__list-item">Logo Loop (10s): Seamless alpha channel loop</p></div><p class="v23-card__section-label" style="margin-top:24px">Technical Specs</p><div class="addon-card__list"><p class="addon-card__list-item">MOV with alpha channel for maximum flexibility</p><p class="addon-card__list-item">MP4 standard versions</p><p class="addon-card__list-item">GIF format for email signatures and web use</p><p class="addon-card__list-item">Multiple size variations</p></div><p class="v23-card__section-label" style="margin-top:24px">Use Cases</p><div class="addon-card__list"><p class="addon-card__list-item">Video opens and closes across all content</p><p class="addon-card__list-item">Presentation introductions</p><p class="addon-card__list-item">Email signatures and digital communications</p><p class="addon-card__list-item">Social media profile videos</p><p class="addon-card__list-item">Website header animations</p></div></div>
</div>
<div class="addons-included"><p class="addons-included__text">Combined value: <strong>$1,500</strong> &#x2014; Included in package at <strong>no additional cost</strong></p></div>
</section>
<div class="divider"></div>
''')

# Part 6: Investment + Payment + Next Steps + Footer + JS
parts.append('''
<section class="section" id="investment">
<p class="section-label">Investment &amp; Timeline</p>
<div class="invest-hero">
<h2 class="section-title" style="margin-bottom:8px">Complete Content <strong>Package</strong></h2>
<p class="invest-price"><strong>$8,500</strong></p>
<p class="invest-currency">USD</p>
<div class="invest-includes">
<span class="invest-check">3 strategic videos (195s of premium content)</span><span class="invest-check">Motion graphics technical visualization</span><span class="invest-check">12 total video versions (3 &#xD7; 4 formats)</span><span class="invest-check">Brand animation suite (intro, outro, loop)</span><span class="invest-check">Script development &amp; creative direction</span><span class="invest-check">Professional voiceover &amp; music licensing</span><span class="invest-check">2 rounds of revisions per video</span><span class="invest-check">Presentation-optimized version</span><span class="invest-check">Project management &amp; coordination</span>
</div></div>
<table class="value-table"><thead><tr><th>Item</th><th>Value</th></tr></thead><tbody>
<tr><td>Video 1: The Impossible Window (90s, heavy motion)</td><td>$3,500</td></tr>
<tr><td>Video 2: Engineering Extremes (60s, heavy motion)</td><td>$2,800</td></tr>
<tr><td>Video 3: Portfolio of Precision (45s)</td><td>$2,200</td></tr>
<tr><td>Brand Animation Suite (intro/outro/loop)</td><td>$1,000</td></tr>
<tr><td>Presentation Optimization</td><td>$500</td></tr>
<tr><td>Multiple Format Versions (12 total exports)</td><td>$1,000</td></tr>
<tr><td>Creative Direction &amp; Scripting</td><td>$1,500</td></tr>
<tr class="total"><td>Total Value</td><td>$12,500</td></tr>
<tr class="package"><td>Package Investment</td><td>$8,500</td></tr>
<tr class="savings"><td>Your Savings</td><td>$4,000</td></tr>
</tbody></table>
<p class="section-label">8-Week Production Schedule</p>
<div class="schedule-grid">
<div class="schedule-card"><p class="schedule-card__weeks">Weeks 1-2</p><h4 class="schedule-card__title">The Impossible Window</h4><p class="schedule-card__task">Creative development, script finalization</p><p class="schedule-card__task">Motion graphics production, edit V1</p><p class="schedule-card__task">Client review &amp; delivery</p></div>
<div class="schedule-card"><p class="schedule-card__weeks">Weeks 3-4</p><h4 class="schedule-card__title">Engineering Extremes</h4><p class="schedule-card__task">Motion graphics, technical simulations</p><p class="schedule-card__task">Client review, revisions</p><p class="schedule-card__task">Final delivery in all formats</p></div>
<div class="schedule-card"><p class="schedule-card__weeks">Weeks 5-6</p><h4 class="schedule-card__title">Portfolio of Precision</h4><p class="schedule-card__task">Edit V1, music selection, color grading</p><p class="schedule-card__task">Client review, revisions</p><p class="schedule-card__task">Final delivery in all formats</p></div>
<div class="schedule-card"><p class="schedule-card__weeks">Weeks 7-8</p><h4 class="schedule-card__title">Brand Suite &amp; Optimization</h4><p class="schedule-card__task">Logo animations (intro/outro/loop)</p><p class="schedule-card__task">Presentation version, final optimizations</p><p class="schedule-card__task">Complete delivery package</p></div>
</div>
<p class="section-label" style="margin-top:64px">Multi-Platform Optimization</p>
<p class="overview__text">Every video is delivered in multiple formats optimized for each platform.</p>
<table class="formats-table"><thead><tr><th>Format</th><th>Specs</th><th>Use Case</th></tr></thead><tbody>
<tr><td>16:9 Landscape</td><td>1920&#xD7;1080, 30fps</td><td>YouTube, website, LinkedIn</td></tr>
<tr><td>1:1 Square</td><td>1080&#xD7;1080, 30fps</td><td>LinkedIn feed, Instagram feed</td></tr>
<tr><td>9:16 Vertical</td><td>1080&#xD7;1920, 30fps</td><td>Instagram Stories, TikTok, Reels</td></tr>
<tr><td>Presentation</td><td>1920&#xD7;1080 or custom</td><td>Trade shows, client presentations</td></tr>
</tbody></table>
<p class="section-label" style="margin-top:64px">Payment Structure</p>
<div class="payment-grid">
<div class="payment-card"><p class="payment-card__label">Deposit</p><p class="payment-card__amount">$4,250</p><p class="payment-card__pct">50%</p><p class="payment-card__desc">Due at project kickoff. Secures production timeline and initiates creative development.</p></div>
<div class="payment-card"><p class="payment-card__label">Milestone</p><p class="payment-card__amount">$2,125</p><p class="payment-card__pct">25%</p><p class="payment-card__desc">Due upon delivery of Video 2. Confirms satisfaction with work to date.</p></div>
<div class="payment-card"><p class="payment-card__label">Final Payment</p><p class="payment-card__amount">$2,125</p><p class="payment-card__pct">25%</p><p class="payment-card__desc">Due upon final delivery. Complete package with all assets organized.</p></div>
</div>
<p class="payment-methods">Accepted: Bank transfer / Wire &#x2022; PayPal &#x2022; Credit card (via invoice) &#x2022; All payments in USD</p>
</section>
<div class="divider"></div>
<section class="nextsteps" id="next">
<p class="section-label">Next Steps</p>
<h2 class="section-title"><strong>Let&#x27;s Build This</strong></h2>
<p class="nextsteps__text">This proposal represents a strategic content investment designed to position FENEX as the undisputed technical leader in oversized glazing systems and flood mitigation.</p>
<p class="nextsteps__highlight">The question isn&#x27;t whether this content will deliver value &#x2014; it&#x27;s how quickly you want to start seeing results.</p>
<div class="cta-buttons">
<a href="#" class="cta-btn cta-btn--primary"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12M12 16.5V3"/></svg> Download Full Proposal (PDF)</a>
<a href="#" class="cta-btn cta-btn--secondary"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/></svg> Schedule Kickoff Call</a>
<a href="mailto:hello@arcmediahouse.com" class="cta-btn cta-btn--secondary"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/></svg> Questions? Contact Us</a>
</div></section>
<div class="closing">
<p class="closing__tagline">Beyond the view, there is the vision of the future.</p>
<p class="closing__validity">This proposal is valid for 14 days from date of receipt.</p>
<p class="closing__contact"><strong>Adrian Mendoza</strong><br>Creative Director &#x2014; ARC Media House<br>hello@arcmediahouse.com</p>
</div>
<footer class="ffooter"><div class="ffooter__inner">
<div class="ffooter__brand"><img src="../Logos/Logo White Alpha.png" alt="ARC Media House" class="ffooter__logo"><span class="ffooter__text">&#xA9; 2025 ARC Media House. All rights reserved.</span></div>
<div class="ffooter__fenex"><img src="assets/fenex-logo.png" alt="FENEX" class="ffooter__fenex-logo"><span class="ffooter__fenex-text">fenex.com &#x2022; info@fenex.com &#x2022; 561.524.2346</span></div>
</div></footer>
</main>
<script>
var PASSWORD="fenex2025";
function tryLogin(){var i=document.getElementById("loginInput"),e=document.getElementById("loginError");if(i.value===PASSWORD){document.getElementById("loginOverlay").classList.add("hidden");document.getElementById("mainContent").style.display="block";sessionStorage.setItem("fenex_auth","true")}else{e.classList.add("show");i.value="";i.focus()}}
document.getElementById("loginInput").addEventListener("keydown",function(e){if(e.key==="Enter")tryLogin()});
if(sessionStorage.getItem("fenex_auth")==="true"){document.getElementById("loginOverlay").classList.add("hidden");document.getElementById("mainContent").style.display="block"}
document.querySelectorAll(".fnav__links a").forEach(function(a){a.addEventListener("click",function(e){e.preventDefault();var t=document.querySelector(this.getAttribute("href"));if(t)t.scrollIntoView({behavior:"smooth",block:"start"})})});
</script>
</body></html>
''')

with open('/home/user/arc_media_house/fenex/index.html', 'w') as f:
    f.write(''.join(parts))

print('DONE - wrote', len(''.join(parts)), 'bytes')
