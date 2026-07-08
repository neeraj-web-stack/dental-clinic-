// ===== Siddhi Dental Clinic — site interactions =====
document.addEventListener('DOMContentLoaded', () => {

  const CLINIC_WHATSAPP_NUMBER = '919887593272'; // country code + number, no + or spaces

  /* ---------- Scroll progress bar + header shadow ---------- */
  const progressBar = document.getElementById('progressBar');
  const header = document.getElementById('siteHeader');
  const backToTop = document.getElementById('backToTop');

  function onScroll(){
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = pct + '%';
    if (header){
      if (scrollTop > 12) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    }
    if (backToTop){
      if (scrollTop > 500) backToTop.classList.add('visible');
      else backToTop.classList.remove('visible');
    }
  }
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  backToTop && backToTop.addEventListener('click', () => {
    window.scrollTo({ top:0, behavior:'smooth' });
  });

  /* ---------- Mobile nav toggle ---------- */
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');

  function closeMenu(){
    menuToggle.classList.remove('open');
    navLinks.classList.remove('open');
    menuToggle.setAttribute('aria-expanded','false');
  }

  if (menuToggle && navLinks){
    menuToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      menuToggle.classList.toggle('open', isOpen);
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }

  /* ---------- Scroll reveal animations ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in-view'));
  }

  /* ---------- Animated stat counters ---------- */
  const counters = document.querySelectorAll('[data-count]');
  function animateCounter(el){
    const target = parseFloat(el.getAttribute('data-count'));
    const isDecimal = el.getAttribute('data-decimal') === 'true';
    const duration = 1400;
    const startTime = performance.now();

    function tick(now){
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = isDecimal ? value.toFixed(1) : Math.round(value);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = isDecimal ? target.toFixed(1) : target;
    }
    requestAnimationFrame(tick);
  }
  if (counters.length && 'IntersectionObserver' in window){
    const counterIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          animateCounter(entry.target);
          counterIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(el => counterIO.observe(el));
  }

  /* ---------- Reviews carousel ---------- */
  const track = document.getElementById('carouselTrack');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const dotsWrap = document.getElementById('carouselDots');

  if (track){
    const slides = Array.from(track.children);
    let index = 0;
    let autoTimer;

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Go to review ' + (i + 1));
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });
    const dots = Array.from(dotsWrap.children);

    function update(){
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === index));
    }
    function goTo(i){
      index = (i + slides.length) % slides.length;
      update();
      restartAuto();
    }
    function next(){ goTo(index + 1); }
    function prev(){ goTo(index - 1); }

    track.style.transition = 'transform .5s ease';
    prevBtn.addEventListener('click', prev);
    nextBtn.addEventListener('click', next);

    function restartAuto(){
      clearInterval(autoTimer);
      autoTimer = setInterval(next, 6000);
    }
    restartAuto();

    // swipe support
    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive:true });
    track.addEventListener('touchend', e => {
      const diff = e.changedTouches[0].clientX - touchStartX;
      if (diff > 40) prev();
      else if (diff < -40) next();
    }, { passive:true });

    update();
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(other => {
        if (other !== item){
          other.classList.remove('open');
          other.querySelector('.faq-a').style.maxHeight = null;
        }
      });
      if (isOpen){
        item.classList.remove('open');
        a.style.maxHeight = null;
      } else {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  /* ---------- Booking form -> WhatsApp ---------- */
  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm){
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('fname').value.trim();
      const phone = document.getElementById('fphone').value.trim();
      const service = document.getElementById('fservice').value;
      const date = document.getElementById('fdate').value;
      const note = document.getElementById('fnote').value.trim();

      if (!name || !phone){
        bookingForm.reportValidity();
        return;
      }

      let message = `Hello Siddhi Dental Clinic, I'd like to book an appointment.\n\n`;
      message += `Name: ${name}\n`;
      message += `Phone: ${phone}\n`;
      message += `Treatment: ${service}\n`;
      if (date) message += `Preferred date: ${date}\n`;
      if (note) message += `Note: ${note}\n`;

      const url = `https://wa.me/${CLINIC_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    });
  }

  /* ---------- Active nav link highlight on scroll ---------- */
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-link');
  if (sections.length && 'IntersectionObserver' in window){
    const navIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.getAttribute('id');
        const link = document.querySelector(`.nav-link[href="#${id}"]`);
        if (!link) return;
        if (entry.isIntersecting){
          navAnchors.forEach(a => a.style.color = '');
          link.style.color = 'var(--coral-dark)';
        }
      });
    }, { threshold:0, rootMargin:'-45% 0px -50% 0px' });
    sections.forEach(s => navIO.observe(s));
  }

});
