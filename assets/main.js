// Main JS - extracted from index.html and componentized

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }

  // Mobile menu
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
    mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => mobileMenu.classList.add('hidden')));
  }

  
  const revealElements = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  revealElements.forEach(el => observer.observe(el));

  
  const toTopButton = document.getElementById('to-top-button');
  if (toTopButton) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) toTopButton.classList.remove('hidden');
      else toTopButton.classList.add('hidden');
    });
    toTopButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  
  const certificates = [
    {
      title: 'Scrum Foundation (SFPC)',
      org: 'Certiprof',
      icon: '/assets/scrum.png',
      iconClass: 'bg-white p-1',
      link: 'https://www.credly.com/badges/f70ef636-40b5-4ffa-bbdf-fdeacaef71af/public_url',
      skills: 'Gestão de Projetos Ágeis • Scrum • Planejamento e Execução de Sprint • Melhoria Contínua • Kanban.'
    },
    {
      title: 'AWS Cloud Technical Essentials',
      org: 'AWS',
      icon: 'assets/aws.png',
      link: 'https://www.coursera.org/account/accomplishments/records/AN3V521WFPVQ',
      skills: 'Cloud Computing • AWS • Serviços de Nuvem • Arquitetura de Nuvem.'
    },
    {
      title: 'Foundations: Data, Data, Everywhere',
      org: 'Google',
      icon: '/assets/google.png',
      link: 'https://www.coursera.org/account/accomplishments/verify/KKJ5WK4ZJJLR',
      skills: 'Análise de Dados • Planilhas • SQL • Visualização de Dados • Tomada de Decisão Baseada em Dados.'
    },
    {
      title: 'What is Data Science?',
      org: 'IBM',
      icon: '/assets/IBM.png',
      link: 'https://www.coursera.org/account/accomplishments/verify/5NJW304Y2ZMR',
      skills: 'Data Science • Metodologia de Ciência de Dados • Análise Exploratória de Dados.'
    },
    {
      title: 'Excel Basics for Data Analysis',
      org: 'IBM',
      icon: '/assets/IBM.png',
      link: 'https://www.coursera.org/account/accomplishments/verify/3SVL6W3X7ITL',
      skills: 'Microsoft Excel • Análise de Dados • Gráficos e Dashboards • Limpeza de Dados.'
    },
    {
      title: 'Programming for Everybody with Python',
      org: 'University of Michigan',
      icon: '/assets/Michigan.png',
      link: 'https://www.coursera.org/account/accomplishments/verify/XICGBTFZPEBL',
      skills: 'Python • Estruturas de Dados • Lógica de Programação.'
    },
    {
      title: 'Introduction to AI',
      org: 'Google',
      icon: '/assets/google.png',
      link: 'https://www.coursera.org/account/accomplishments/verify/OHVEXV6PF8GV',
      skills: 'Inteligência Artificial • Machine Learning • Deep Learning • IBM Watson.'
    },
    {
      title: 'Tableau',
      org: 'Udemy',
      icon: '/assets/udemy.png',
      link: 'https://ude.my/UC-05fe9960-73cf-4bd6-ac6e-51add286c2ea',
      skills: 'Análise de dados estatísticos • Entrada de dados • BI • Dashboards • Modelagem de Dados • ETL.',
      hidden: true
    },
    {
      title: 'Introdução à Ciência da Computação com Python',
      org: 'USP - Universidade de São Paulo',
      icon: '/assets/usp.svg',
      iconClass: 'bg-white p-1 rounded',
      link: 'https://www.coursera.org/account/accomplishments/records/YRIG51A5R83U',
      skills: 'Python • Algoritmos • Lógica de Programação • Conceitos de Ciência da Computação.',
      hidden: true
    }
  ];

  const grid = document.getElementById('certificates-grid');
  const showMoreBtn = document.getElementById('show-more-certs-button');
  if (grid) {
    const makeCard = (c) => {
      const div = document.createElement('div');
      div.className = 'bg-gray-800/50 p-6 rounded-lg flex flex-col hover:bg-gray-700/70 transition-colors shadow-lg certificate-item';
      const initiallyHidden = c.hidden || grid.children.length >= 6;
      if (initiallyHidden) div.classList.add('hidden');
      div.innerHTML = `
        <div class="flex items-center mb-4">
          <img src="${c.icon}" alt="Logo ${c.org}" class="cert-icon mr-4 ${c.iconClass || ''}">
          <div>
            <h3 class="font-bold text-lg text-white">${c.title}</h3>
            <p class="text-gray-400 text-sm">${c.org}</p>
          </div>
        </div>
        <p class="text-gray-300 text-sm mb-4 flex-grow">
          <span class="font-semibold text-gray-200">Competências:</span> ${c.skills}
        </p>
        <a href="${c.link}" target="_blank" rel="noopener noreferrer" class="flex items-center text-cyan-400 hover:text-cyan-300 transition-colors mt-auto font-semibold self-start">
          Ver Credencial <i data-lucide="external-link" class="w-4 h-4 ml-2"></i>
        </a>`;
      return div;
    };
    certificates.forEach(c => grid.appendChild(makeCard(c)));
    if (window.lucide) window.lucide.createIcons();
  }

 
  if (showMoreBtn && grid) {
    showMoreBtn.addEventListener('click', () => {
      const isShowingMore = showMoreBtn.dataset.state === 'less';
      if (isShowingMore) {
        grid.querySelectorAll('.certificate-item:nth-child(n+7)').forEach(el => el.classList.add('hidden'));
        showMoreBtn.textContent = 'Ver mais';
        showMoreBtn.dataset.state = 'more';
      } else {
        grid.querySelectorAll('.certificate-item.hidden').forEach(el => el.classList.remove('hidden'));
        showMoreBtn.textContent = 'Ver menos';
        showMoreBtn.dataset.state = 'less';
      }
    });
  }

  const subtitleEl = document.getElementById('hero-subtitle');
  if (subtitleEl) {
    subtitleEl.textContent = 'Desenvolvedor de Software';
  }

  
  const overlay = document.getElementById('secret-overlay');
  const input = document.getElementById('terminal-input');
  const feedback = document.getElementById('terminal-feedback');
  const openSecret = () => { if (!overlay) return; overlay.classList.add('active'); setTimeout(() => input && input.focus(), 50); };
  const closeSecret = () => { if (!overlay) return; overlay.classList.remove('active'); };
  document.querySelectorAll('.glitchy').forEach(el => el.addEventListener('click', openSecret));

  let buffer = '';
  const KONAMI = [38,38,40,40,37,37,39,39,66,65];
  let kPos = 0;
  document.addEventListener('keydown', (e) => {
    if (e.keyCode === KONAMI[kPos]) { kPos++; if (kPos === KONAMI.length) { openSecret(); kPos = 0; } }
    else { kPos = 0; }
    if (e.key && e.key.length === 1) { buffer = (buffer + e.key.toLowerCase()).slice(-4); if (buffer === 'hack') openSecret(); }
    if (e.key === 'Escape') closeSecret();
  });

  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const v = (input.value || '').trim().toLowerCase();
        if (v === 'sorriso') {
          feedback.textContent = 'Acesso concedido. Desbloqueando...';
          feedback.style.color = '#34d399';
          triggerConfetti();
          setTimeout(() => {
            closeSecret();
            const egg = document.getElementById('easter-egg');
            if (egg) { egg.classList.remove('hidden'); egg.scrollIntoView({ behavior: 'smooth' }); }
          }, 800);
        } else {
          feedback.textContent = 'Palavra inválida. Dica: Base64 de c29ycmlzbw==';
          feedback.style.color = '#fca5a5';
        }
        input.value = '';
      }
    });
  }

  function triggerConfetti() {
    const colors = ['#22d3ee','#f472b6','#f59e0b','#84cc16','#a78bfa'];
    for (let i = 0; i < 40; i++) {
      const el = document.createElement('div');
      el.className = 'confetti';
      el.style.background = colors[Math.floor(Math.random() * colors.length)];
      el.style.left = Math.random() * 100 + 'vw';
      el.style.animation = `fall ${3 + Math.random() * 2}s linear`;
      el.style.transform = `rotate(${Math.random() * 360}deg)`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 6000);
    }
  }

  
  const mantraEl = document.getElementById('mantra');
  const btnGerar = document.getElementById('btn-gerar');
  const btnCopiar = document.getElementById('btn-copiar');
  const MANTRAS = [
    'Código é promessa de cuidado.',
    'Simplicidade é um ato de coragem.',
    'Performance com propósito, não por vaidade.',
    'Dados contam histórias — eu as escuto.',
    'Acessibilidade é respeito em forma de interface.',
    'Primeiro as pessoas, depois as ferramentas.',
    'Pequenos detalhes, grandes experiências.',
    'Automatizar é libertar tempo para criar.',
    'Refatorar é escrever o futuro do código.',
    'Tests são cartas de amor ao eu de amanhã.'
  ];
  function gerar() { if (!mantraEl) return; mantraEl.textContent = MANTRAS[Math.floor(Math.random() * MANTRAS.length)]; }
  btnGerar && btnGerar.addEventListener('click', gerar);
  btnCopiar && btnCopiar.addEventListener('click', async () => {
    if (!mantraEl || !mantraEl.textContent) return;
    try { await navigator.clipboard.writeText(mantraEl.textContent); const old = btnCopiar.textContent; btnCopiar.textContent = 'Copiado!'; setTimeout(() => btnCopiar.textContent = old, 1200); } catch {}
  });
  if (mantraEl) gerar();
});

