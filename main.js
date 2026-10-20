(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile menu
  var btn = $('.menu-btn'), nav = $('#nav');
  btn.addEventListener('click', function () {
    var open = nav.classList.toggle('open'); btn.setAttribute('aria-expanded', open);
  });
  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') { nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
  });

  // Project filter
  $$('.chip-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.dataset.filter;
      $$('.chip-btn').forEach(function (x) { var on = x === b; x.classList.toggle('active', on); x.setAttribute('aria-pressed', on); });
      $$('.project').forEach(function (p) { p.hidden = !(f === 'all' || p.dataset.cat.split(' ').indexOf(f) > -1); });
    });
  });

  // Screenshot lightbox
  var box = $('#lightbox'), boxImg = $('img', box);
  $$('button.shot').forEach(function (s) {
    s.addEventListener('click', function () {
      boxImg.src = s.dataset.src; boxImg.alt = s.dataset.alt;
      if (box.showModal) box.showModal(); else box.setAttribute('open', '');
    });
  });
  $('.close', box).addEventListener('click', function () { box.close ? box.close() : box.removeAttribute('open'); });
  box.addEventListener('click', function (e) { if (e.target === box) box.close(); });

  // Scroll reveal + active nav link
  var items = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.1 });
    items.forEach(function (i) { io.observe(i); });
    var links = $$('nav a[href^="#"]');
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    $$('main section[id]').forEach(function (s) { spy.observe(s); });
  } else { items.forEach(function (i) { i.classList.add('in'); }); }

  // Rotating hero words
  var rot = $('#rotator');
  if (rot && !reduce) {
    var words = ['responsive websites', 'full-stack web apps', 'accessible interfaces'], n = 0;
    setInterval(function () { n = (n + 1) % words.length; rot.textContent = words[n]; }, 2800);
  }

  // Contact form
  var form = $('#form'), status = $('#status');
  function check(el, msg) {
    var span = $('.err[data-for="' + el.id + '"]', form);
    var bad = !el.value.trim() || (el.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(el.value));
    el.setAttribute('aria-invalid', bad); span.textContent = bad ? msg : ''; return !bad;
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = [check(form.name, 'Please enter your name.'), check(form.email, 'Please enter a valid email.'), check(form.msg, 'Please write a message.')].every(Boolean);
    if (!ok) { status.textContent = 'Please fix the errors above.'; return; }
    status.textContent = 'Sending...';
    fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      .then(function (r) { if (!r.ok) throw 0; form.reset(); status.textContent = 'Thanks! Your message was sent.'; })
      .catch(function () { status.textContent = 'Could not send. Please email me directly instead.'; });
  });
})();
