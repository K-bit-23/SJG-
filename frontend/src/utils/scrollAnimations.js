/**
 * Scroll Animations Utility
 * Adds scroll-triggered animations to elements
 */

class ScrollAnimations {
    constructor() {
        this.observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        this.observer = null;
        this.init();
    }

    init() {
        // Create Intersection Observer
        this.observer = new IntersectionObserver(
            this.handleIntersection.bind(this),
            this.observerOptions
        );

        // Observe all elements with scroll-animate class
        this.observeElements();

        // Add parallax effect to hero sections
        this.initParallax();

        // Add smooth scroll behavior
        this.initSmoothScroll();
    }

    observeElements() {
        const elements = document.querySelectorAll('.scroll-animate');
        elements.forEach(element => {
            this.observer.observe(element);
        });
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optionally unobserve after animation
                // this.observer.unobserve(entry.target);
            }
        });
    }

    initParallax() {
        const parallaxElements = document.querySelectorAll('.hero, [data-parallax]');

        if (parallaxElements.length === 0) return;

        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;

            parallaxElements.forEach(element => {
                const speed = element.dataset.parallaxSpeed || 0.5;
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        });
    }

    initSmoothScroll() {
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');

                // Skip if href is just "#"
                if (href === '#') return;

                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Add scroll progress indicator
    addScrollProgress() {
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        progressBar.innerHTML = '<div class="scroll-progress-bar"></div>';
        document.body.appendChild(progressBar);

        window.addEventListener('scroll', () => {
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (window.pageYOffset / windowHeight) * 100;

            const progressBarElement = document.querySelector('.scroll-progress-bar');
            if (progressBarElement) {
                progressBarElement.style.width = scrolled + '%';
            }
        });
    }

    // Stagger animation for child elements
    static staggerChildren(parentSelector, delay = 100) {
        const parent = document.querySelector(parentSelector);
        if (!parent) return;

        const children = parent.children;
        Array.from(children).forEach((child, index) => {
            child.style.animationDelay = `${index * delay}ms`;
        });
    }

    // Add animation on hover
    static addHoverAnimation(selector, animationClass) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                element.classList.add(animationClass);
            });

            element.addEventListener('animationend', () => {
                element.classList.remove(animationClass);
            });
        });
    }

    // Counter animation for numbers
    static animateCounter(element, target, duration = 2000) {
        const start = 0;
        const increment = target / (duration / 16); // 60fps
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 16);
    }

    // Reveal elements on scroll with custom animations
    static revealOnScroll(selector, animationClass = 'fade-in-up') {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add(animationClass);
                }
            });
        }, {
            threshold: 0.1
        });

        document.querySelectorAll(selector).forEach(element => {
            observer.observe(element);
        });
    }
}

// Initialize scroll animations when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ScrollAnimations();
    });
} else {
    new ScrollAnimations();
}

// Export for use in other modules
export default ScrollAnimations;
