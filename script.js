/* ========================================
   Editorial Frontend: Choreographed Motion

   Motion Philosophy:
   - Staggered reveals with animation-delay
   - Smooth scroll with easing
   - Meaningful state changes on hover
   - Easing curves with character
======================================== */

document.addEventListener('DOMContentLoaded', () => {
    initRevealAnimations();
    initSmoothScroll();
    initHeaderBehavior();
    initMobileMenu();
    initParallaxEffects();
    initEmailCapture();
});

/* ========================================
   Reveal Animations (Intersection Observer)
======================================== */
function initRevealAnimations() {
    const reveals = document.querySelectorAll('.reveal');

    if (!reveals.length) return;

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Keep observing for re-triggers if desired
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    reveals.forEach(el => observer.observe(el));
}

/* ========================================
   Smooth Scroll for Anchor Links
======================================== */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');

            // Skip empty or just "#"
            if (targetId === '#') return;

            const target = document.querySelector(targetId);

            if (target) {
                e.preventDefault();

                // Get header height for offset
                const header = document.querySelector('.site-header');
                const headerHeight = header ? header.offsetHeight : 0;

                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = targetPosition - headerHeight - 20;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Close mobile menu if open
                closeMobileMenu();
            }
        });
    });
}

/* ========================================
   Header Scroll Behavior
======================================== */
function initHeaderBehavior() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    let lastScroll = 0;
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const currentScroll = window.pageYOffset;

                // Add background blur after scrolling
                if (currentScroll > 50) {
                    header.style.backgroundColor = 'rgba(247, 245, 242, 0.95)';
                    header.style.boxShadow = '0 1px 0 rgba(13, 13, 13, 0.06)';
                } else {
                    header.style.backgroundColor = 'rgba(247, 245, 242, 0.9)';
                    header.style.boxShadow = 'none';
                }

                lastScroll = currentScroll;
                ticking = false;
            });
            ticking = true;
        }
    });
}

/* ========================================
   Mobile Menu
======================================== */
function initMobileMenu() {
    const toggle = document.querySelector('.nav-toggle');
    const navActions = document.querySelector('.nav-actions');
    const navCenter = document.querySelector('.nav-center');

    if (!toggle) return;

    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        document.body.classList.toggle('menu-open');

        // Toggle visibility of nav items on mobile
        if (navActions) {
            navActions.classList.toggle('mobile-visible');
        }
        if (navCenter) {
            navCenter.classList.toggle('mobile-visible');
        }
    });
}

function closeMobileMenu() {
    const toggle = document.querySelector('.nav-toggle');
    const navActions = document.querySelector('.nav-actions');
    const navCenter = document.querySelector('.nav-center');

    if (toggle) {
        toggle.classList.remove('active');
        document.body.classList.remove('menu-open');

        if (navActions) navActions.classList.remove('mobile-visible');
        if (navCenter) navCenter.classList.remove('mobile-visible');
    }
}

/* ========================================
   Counter Animation (for stats)
======================================== */
function animateValue(element, start, end, duration, suffix = '') {
    const startTime = performance.now();
    const range = end - start;

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out cubic
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + range * easeOut);

        element.textContent = current + suffix;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// Observe stat values for animation
function initStatAnimations() {
    const statValues = document.querySelectorAll('.stat-value, .metric-value');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.animated) {
                entry.target.dataset.animated = 'true';

                const text = entry.target.textContent;
                const match = text.match(/(\d+)/);

                if (match) {
                    const num = parseInt(match[1]);
                    const suffix = text.replace(/\d+/, '');
                    animateValue(entry.target, 0, num, 1500, suffix);
                }
            }
        });
    }, { threshold: 0.5 });

    statValues.forEach(el => observer.observe(el));
}

// Initialize stat animations
document.addEventListener('DOMContentLoaded', initStatAnimations);

/* ========================================
   Magnetic Button Effect (optional enhancement)
======================================== */
function initMagneticButtons() {
    const buttons = document.querySelectorAll('.btn-primary, .btn-outline');

    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            btn.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
        });
    });
}

// Initialize magnetic effect
document.addEventListener('DOMContentLoaded', initMagneticButtons);

/* ========================================
   Parallax Effects
======================================== */
function initParallaxEffects() {
    // Only run on desktop (parallax can be janky on mobile)
    if (window.innerWidth < 1024) return;

    let ticking = false;

    // Elements with parallax
    const heroImage = document.querySelector('.hero-image');
    const heroHeadline = document.querySelector('.hero-headline');
    const sectionNumbers = document.querySelectorAll('.section-number');
    const pullQuote = document.querySelector('.pull-quote');
    const serviceCards = document.querySelectorAll('.service-card');
    const testimonialFeatured = document.querySelector('.testimonial-featured');
    const aboutImage = document.querySelector('.about-image');
    const ctaHeadline = document.querySelector('.cta-headline');

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrollY = window.pageYOffset;

                // Hero image - moves slower (creates depth)
                if (heroImage) {
                    const heroRect = heroImage.getBoundingClientRect();
                    if (heroRect.top < window.innerHeight && heroRect.bottom > 0) {
                        const speed = 0.15;
                        heroImage.style.transform = `translateY(${scrollY * speed}px)`;
                    }
                }

                // Hero headline - subtle upward movement
                if (heroHeadline) {
                    const heroRect = heroHeadline.getBoundingClientRect();
                    if (heroRect.top < window.innerHeight && heroRect.bottom > 0) {
                        const speed = 0.05;
                        heroHeadline.style.transform = `translateY(${scrollY * speed}px)`;
                    }
                }

                // Section numbers - float effect
                sectionNumbers.forEach(num => {
                    const rect = num.getBoundingClientRect();
                    if (rect.top < window.innerHeight && rect.bottom > 0) {
                        const offset = (rect.top - window.innerHeight / 2) * 0.1;
                        num.style.transform = `translateY(${offset}px)`;
                    }
                });

                // Pull quote - slower scroll
                if (pullQuote) {
                    const rect = pullQuote.getBoundingClientRect();
                    if (rect.top < window.innerHeight && rect.bottom > 0) {
                        const offset = (rect.top - window.innerHeight / 2) * 0.08;
                        pullQuote.style.transform = `translateY(${offset}px)`;
                    }
                }

                // Service cards - staggered depth
                serviceCards.forEach((card, index) => {
                    const rect = card.getBoundingClientRect();
                    if (rect.top < window.innerHeight && rect.bottom > 0) {
                        const speed = 0.03 + (index * 0.01);
                        const offset = (rect.top - window.innerHeight / 2) * speed;
                        card.style.transform = `translateY(${offset}px)`;
                    }
                });

                // Featured testimonial - float
                if (testimonialFeatured) {
                    const rect = testimonialFeatured.getBoundingClientRect();
                    if (rect.top < window.innerHeight && rect.bottom > 0) {
                        const offset = (rect.top - window.innerHeight / 2) * 0.06;
                        testimonialFeatured.style.transform = `translateY(${offset}px)`;
                    }
                }

                // About image - slow rise
                if (aboutImage) {
                    const rect = aboutImage.getBoundingClientRect();
                    if (rect.top < window.innerHeight && rect.bottom > 0) {
                        const offset = (rect.top - window.innerHeight / 2) * 0.1;
                        aboutImage.style.transform = `translateY(${offset}px)`;
                    }
                }

                // CTA headline - subtle float
                if (ctaHeadline) {
                    const rect = ctaHeadline.getBoundingClientRect();
                    if (rect.top < window.innerHeight && rect.bottom > 0) {
                        const offset = (rect.top - window.innerHeight / 2) * 0.04;
                        ctaHeadline.style.transform = `translateY(${offset}px)`;
                    }
                }

                ticking = false;
            });
            ticking = true;
        }
    });
}

/* ========================================
   CTA Button Click Tracking
======================================== */
document.addEventListener('DOMContentLoaded', () => {
    const ctaButtons = document.querySelectorAll('.btn-primary');

    ctaButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const buttonText = this.textContent.trim();
            const section = this.closest('section');
            const sectionClass = section ? section.className : 'unknown';

            // Analytics tracking placeholder
            console.log('CTA Clicked:', {
                button: buttonText,
                section: sectionClass,
                timestamp: new Date().toISOString()
            });

            // Uncomment for Google Analytics
            // if (typeof gtag !== 'undefined') {
            //     gtag('event', 'cta_click', {
            //         'button_text': buttonText,
            //         'button_section': sectionClass
            //     });
            // }
        });
    });
});

/* ========================================
   Email Capture: Top Bar + Lead Magnet
======================================== */

// ── CONFIGURE YOUR WEBHOOK HERE ──────────────────────────
// Replace with your Mailchimp, ConvertKit, N8N webhook, or any endpoint.
// The form will POST JSON: { email: "...", source: "topbar"|"leadmagnet" }
const EMAIL_WEBHOOK_URL = '/subscribe.php';
// ──────────────────────────────────────────────────────────

function initEmailCapture() {
    const topbar = document.getElementById('emailTopbar');
    const topbarClose = document.getElementById('topbarClose');
    const topbarForm = document.getElementById('topbarForm');
    const leadmagnetForm = document.getElementById('leadmagnetForm');

    // Check if user dismissed the topbar previously
    if (sessionStorage.getItem('topbar_dismissed')) {
        if (topbar) {
            topbar.classList.add('hidden');
            document.body.classList.add('topbar-dismissed');
        }
    }

    // Close topbar
    if (topbarClose) {
        topbarClose.addEventListener('click', () => {
            topbar.classList.add('hidden');
            document.body.classList.add('topbar-dismissed');
            sessionStorage.setItem('topbar_dismissed', '1');
        });
    }

    // Handle topbar form
    if (topbarForm) {
        topbarForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = topbarForm.querySelector('.topbar-input').value.trim();
            if (validateEmail(email)) {
                submitEmail(email, 'topbar', topbarForm);
            }
        });
    }

    // Handle lead magnet form
    if (leadmagnetForm) {
        leadmagnetForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = leadmagnetForm.querySelector('.leadmagnet-input').value.trim();
            if (validateEmail(email)) {
                submitEmail(email, 'leadmagnet', leadmagnetForm);
            }
        });
    }
}

async function submitEmail(email, source, formElement) {
    const btn = formElement.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Sending...';
    btn.disabled = true;

    try {
        if (EMAIL_WEBHOOK_URL) {
            await fetch(EMAIL_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, source, timestamp: new Date().toISOString() })
            });
        } else {
            // No webhook configured — log to console for testing
            console.log('Email captured (no webhook configured):', { email, source });
        }

        // Show success
        formElement.innerHTML = '<p class="form-success">Playbook sent! Check your inbox.</p>';

        // If topbar, auto-hide after 2s
        if (source === 'topbar') {
            setTimeout(() => {
                const topbar = document.getElementById('emailTopbar');
                if (topbar) {
                    topbar.classList.add('hidden');
                    document.body.classList.add('topbar-dismissed');
                }
            }, 2000);
        }
    } catch (err) {
        console.error('Email submission error:', err);
        btn.textContent = 'Try Again';
        btn.disabled = false;
    }
}

/* ========================================
   Form Validation Helper
======================================== */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/* ========================================
   Preloader (optional)
======================================== */
function initPreloader() {
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');

        // Trigger initial reveals after load
        setTimeout(() => {
            document.querySelectorAll('.hero .reveal').forEach(el => {
                el.classList.add('visible');
            });
        }, 100);
    });
}

// initPreloader(); // Uncomment to enable

/* ========================================
   Keyboard Navigation Enhancements
======================================== */
document.addEventListener('keydown', (e) => {
    // Close mobile menu on Escape
    if (e.key === 'Escape') {
        closeMobileMenu();
    }
});

/* ========================================
   Performance: Debounce & Throttle Utilities
======================================== */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
