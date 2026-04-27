/* =====================================================
   SAVIDE PERU - INTERACCIONES GENERALES
   Compatible con todas las paginas del sitio
   ===================================================== */

(function () {
    'use strict';

    function setupMenu() {
        const hamburger = document.getElementById('hamburger');
        const navbar = document.getElementById('navbar');
        const navLinks = document.querySelectorAll('.nav-link');

        if (!hamburger || !navbar) return;

        const closeMenu = function () {
            hamburger.classList.remove('active');
            navbar.classList.remove('active');
        };

        hamburger.addEventListener('click', function (e) {
            e.stopPropagation();
            hamburger.classList.toggle('active');
            navbar.classList.toggle('active');
        });

        navLinks.forEach(function (link) {
            link.addEventListener('click', closeMenu);
        });

        document.addEventListener('click', function (e) {
            if (!hamburger.contains(e.target) && !navbar.contains(e.target)) {
                closeMenu();
            }
        });
    }

    function setupScrollUI() {
        const scrollToTopBtn = document.getElementById('scroll-to-top');
        const header = document.querySelector('.header');

        window.addEventListener('scroll', function () {
            const y = window.pageYOffset;

            if (header) {
                header.classList.toggle('scrolled', y > 80);
            }

            if (scrollToTopBtn) {
                scrollToTopBtn.classList.toggle('show', y > 320);
            }
        });

        if (scrollToTopBtn) {
            scrollToTopBtn.addEventListener('click', function () {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }

    function setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
            anchor.addEventListener('click', function (e) {
                const href = anchor.getAttribute('href');
                if (!href || href === '#') return;

                const target = document.querySelector(href);
                if (!target) return;

                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }

    function setupStatsCounter() {
        const section = document.querySelector('.stats-section');
        const stats = document.querySelectorAll('.stat-number');

        if (!section || stats.length === 0 || !('IntersectionObserver' in window)) return;

        function animateStat(stat) {
            const original = (stat.textContent || '').trim();
            const target = parseInt(original.replace(/[^0-9]/g, ''), 10);
            if (!target || target <= 0) return;

            const duration = 900;
            let start = null;

            function frame(ts) {
                if (!start) start = ts;
                const progress = Math.min((ts - start) / duration, 1);
                const value = Math.floor(progress * target);
                stat.textContent = value.toLocaleString('es-PE');

                if (progress < 1) {
                    requestAnimationFrame(frame);
                } else {
                    stat.textContent = original;
                }
            }

            requestAnimationFrame(frame);
        }

        const observer = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                stats.forEach(animateStat);
                obs.unobserve(entry.target);
            });
        }, { threshold: 0.15 });

        observer.observe(section);
    }

    function setupReveal() {
        if (!('IntersectionObserver' in window)) return;

        const items = document.querySelectorAll(
            '.proyecto-card, .noticia-card, .mvv-card, .stat-card, .valor, .articulo-item, .perfil-card, .ayuda-card, .timeline-item'
        );

        const observer = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.style.animation = 'fadeInUp 0.7s ease forwards';
                obs.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -80px 0px' });

        items.forEach(function (item) {
            observer.observe(item);
        });
    }

    function setupContactForm() {
        const form = document.querySelector('.contacto-form');
        if (!form) return;

        const required = form.querySelectorAll('[required]');
        const email = form.querySelector('input[type="email"]');
        const messageField = form.querySelector('#mensaje');
        const counter = document.getElementById('char-count');
        const maxChars = 150;

        function updateCounter() {
            if (!messageField || !counter) return;
            const len = (messageField.value || '').length;
            counter.textContent = String(len);
        }

        if (messageField) {
            if (!messageField.hasAttribute('maxlength')) {
                messageField.setAttribute('maxlength', String(maxChars));
            }

            messageField.addEventListener('input', function () {
                if (messageField.value.length > maxChars) {
                    messageField.value = messageField.value.slice(0, maxChars);
                }
                updateCounter();
            });

            form.addEventListener('reset', function () {
                setTimeout(updateCounter, 0);
            });

            updateCounter();
        }

        function mark(field, ok) {
            field.classList.toggle('error', !ok);
        }

        function validate(field) {
            const value = (field.value || '').trim();
            let ok = value.length > 0;

            if (ok && email && field === email) {
                ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            }

            mark(field, ok);
            return ok;
        }

        required.forEach(function (field) {
            field.addEventListener('blur', function () { validate(field); });
            field.addEventListener('input', function () {
                if (field.classList.contains('error')) validate(field);
            });
        });

        form.addEventListener('submit', function (e) {
            let valid = true;
            required.forEach(function (field) {
                if (!validate(field)) valid = false;
            });

            if (!valid) {
                e.preventDefault();
                return;
            }

            const rawAction = (form.getAttribute('action') || '').trim();
            const hasRealSubmitTarget = rawAction !== '' && rawAction !== '#';

            // If there is a real endpoint (e.g., FormSubmit), allow native form submit.
            if (hasRealSubmitTarget) {
                return;
            }

            e.preventDefault();
            const msgClass = 'form-feedback';
            const old = form.querySelector('.' + msgClass);
            if (old) old.remove();

            const msg = document.createElement('p');
            msg.className = msgClass;
            msg.textContent = 'Gracias por escribirnos. Te responderemos pronto.';
            form.appendChild(msg);
            form.reset();
            updateCounter();
        });
    }

    function setupProgramsCarousel() {
        const carousel = document.getElementById('program-carousel');
        if (!carousel) return;

        const track = carousel.querySelector('.program-carousel-track');
        const slides = carousel.querySelectorAll('.program-tile');
        const dotsWrap = carousel.querySelector('.program-carousel-dots');
        const prev = carousel.querySelector('.program-carousel-btn.prev');
        const next = carousel.querySelector('.program-carousel-btn.next');

        if (!track || slides.length === 0) return;

        if (!dotsWrap) return;

        dotsWrap.innerHTML = '';
        slides.forEach(function (_, i) {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'program-dot' + (i === 0 ? ' is-active' : '');
            dot.setAttribute('aria-label', 'Ir al programa ' + (i + 1));
            dotsWrap.appendChild(dot);
        });

        const dots = dotsWrap.querySelectorAll('.program-dot');

        let index = 0;
        let timer = null;

        function goTo(newIndex) {
            index = (newIndex + slides.length) % slides.length;
            track.style.transform = 'translateX(-' + (index * 100) + '%)';

            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
                dot.setAttribute('aria-current', i === index ? 'true' : 'false');
            });
        }

        function startAutoplay() {
            stopAutoplay();
            timer = window.setInterval(function () {
                goTo(index + 1);
            }, 3400);
        }

        function stopAutoplay() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                goTo(index - 1);
                startAutoplay();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                goTo(index + 1);
                startAutoplay();
            });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                goTo(i);
                startAutoplay();
            });
        });

        carousel.addEventListener('mouseenter', stopAutoplay);
        carousel.addEventListener('mouseleave', startAutoplay);
        carousel.addEventListener('focusin', stopAutoplay);
        carousel.addEventListener('focusout', startAutoplay);

        goTo(0);
        startAutoplay();
    }

    function syncHomeLatestNews() {
        const homeGrid = document.getElementById('home-noticias-grid');
        if (!homeGrid) return;

        function normalizeImagePath(src) {
            if (!src) return 'images/proyecto1.jpg';
            if (src.indexOf('../') === 0) return src.replace('../', '');
            return src;
        }

        function truncateText(text, maxLen) {
            if (!text) return '';
            if (text.length <= maxLen) return text;
            return text.slice(0, maxLen).trimEnd() + '...';
        }

        fetch('html/noticias.html', { cache: 'no-store' })
            .then(function (res) {
                if (!res.ok) throw new Error('No se pudo cargar noticias.html');
                return res.text();
            })
            .then(function (html) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const items = Array.prototype.slice.call(
                    doc.querySelectorAll('.articulos-section .articulo-item'),
                    0,
                    3
                );

                if (!items.length) return;

                const badgeClasses = ['salud', 'educacion', 'alianzas'];
                homeGrid.innerHTML = '';

                items.forEach(function (item, index) {
                    const img = item.querySelector('.articulo-img');
                    const title = item.querySelector('h3');
                    const text = item.querySelector('p');
                    const fbLink = item.querySelector('.articulo-link-facebook');

                    const card = document.createElement('article');
                    card.className = 'noticia-card';

                    const badge = document.createElement('div');
                    badge.className = 'noticia-badge ' + badgeClasses[index % badgeClasses.length];
                    badge.textContent = 'Noticias';

                    const cardImg = document.createElement('img');
                    cardImg.src = normalizeImagePath(img ? img.getAttribute('src') : '');
                    cardImg.alt = img ? (img.getAttribute('alt') || 'Noticia SAVIDE') : 'Noticia SAVIDE';

                    const info = document.createElement('div');
                    info.className = 'noticia-info';

                    const fecha = document.createElement('span');
                    fecha.className = 'noticia-fecha';
                    fecha.textContent = 'Publicación reciente';

                    const heading = document.createElement('h3');
                    heading.textContent = title ? truncateText(title.textContent.trim(), 90) : 'Noticia SAVIDE';

                    const paragraph = document.createElement('p');
                    paragraph.textContent = text ? truncateText(text.textContent.trim(), 180) : '';

                    const link = document.createElement('a');
                    link.className = 'btn-noticia';
                    link.href = fbLink ? (fbLink.getAttribute('href') || 'html/noticias.html') : 'html/noticias.html';
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                    link.textContent = 'Ver en Facebook →';

                    info.appendChild(fecha);
                    info.appendChild(heading);
                    info.appendChild(paragraph);
                    info.appendChild(link);

                    card.appendChild(badge);
                    card.appendChild(cardImg);
                    card.appendChild(info);

                    homeGrid.appendChild(card);
                });
            })
            .catch(function () {
                // Si falla la carga, se mantienen las noticias estáticas del index.
            });
    }

    function setupA11y() {
        document.querySelectorAll('a.social-link').forEach(function (link) {
            if (!link.getAttribute('aria-label')) {
                const title = link.getAttribute('title');
                if (title) link.setAttribute('aria-label', title);
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupScrollUI();
        setupSmoothScroll();
        setupProgramsCarousel();
        syncHomeLatestNews();
        setupStatsCounter();
        setupReveal();
        setupContactForm();
        setupA11y();
    });
})();
