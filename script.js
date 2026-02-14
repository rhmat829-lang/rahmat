(function () {
  'use strict';  
  // Utility function for querying single element
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  // Utility function for querying multiple elements
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  document.addEventListener('DOMContentLoaded', () => {
    updateYear();
    setupModal();
    setupSmoothScroll();
    setupFadeIn();
    setupFormHandler();
    // Added a handler for the new "Request a Quote" button in the hero section
    const heroQuoteBtn = $('.hero .primary-btn');
    if (heroQuoteBtn) heroQuoteBtn.addEventListener('click', () => $('#quoteBtn').click());
  });

  /**
   * Updates the year in the footer for copyright.
   */
  function updateYear() {
    const yearEl = $('#year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  }

  /**
   * Handles the Quote Request Modal logic, including opening, closing, and keyboard trap/focus.
   */
  function setupModal() {
    const modal = $('#modal');
    if (!modal) return;

    const openBtn = $('#quoteBtn');
    const closeBtn = $('#closeModal');
    const cancelBtn = $('#cancel');
    let previouslyFocused = null;
    let focusableSelectors = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
    const getFocusable = () => Array.from(modal.querySelectorAll(focusableSelectors)).filter(el => el.offsetParent !== null);

    function openModal() {
      if (modal.classList.contains('open')) return;
      previouslyFocused = document.activeElement;
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden'; // Prevent scrolling background
      
      const focusables = getFocusable();
      if (focusables.length) {
        focusables[0].focus(); // Focus the first element
      } else {
        modal.setAttribute('tabindex', '-1');
        modal.focus(); // Fallback focus on modal itself
      }
      document.addEventListener('keydown', handleKeydown);
    }

    function closeModal() {
      if (!modal.classList.contains('open')) return;
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus();
      document.removeEventListener('keydown', handleKeydown);
    }

    function handleBackdropClick(e) {
      if (e.target === modal) closeModal();
    }

    function handleKeydown(e) {
      if (e.key === 'Escape') {
        closeModal();
        return;
      }
      if (e.key === 'Tab') {
        const focusables = getFocusable();
        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        // Handle Tab loop (keyboard trap)
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    
    // Attach event listeners
    if (openBtn) openBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', handleBackdropClick);
  }

  /**
   * Enables smooth scrolling for all internal anchor links.
   */
  function setupSmoothScroll() {
    $$('a[href^="#"]').forEach(a => {
      const href = a.getAttribute('href');
      if (!href || href === '#' || href === '#!') return;
      a.addEventListener('click', function (e) {
        const target = document.querySelector(href);
        if (!target) return; 
        e.preventDefault();
        try {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (err) {
          // Fallback for older browsers
          const top = target.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
        // Improve accessibility by focusing the target section after scroll
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      });
    });
  }

  /**
   * Triggers the CSS fade-in animation on page load/ready.
   */
  function setupFadeIn() {
    const fadeEls = $$('.fade-in');
    if (!fadeEls.length) return;
    
    // Use requestAnimationFrame for smoother initial animation trigger
    const triggerFadeIn = () => {
        fadeEls.forEach((el, i) => {
            // Delay based on index for cascade effect
            setTimeout(() => el.classList.add('in'), 60 + i * 40);
        });
    };

    if (document.readyState === 'complete') {
      triggerFadeIn();
    } else {
      window.addEventListener('load', triggerFadeIn);
    }
  }

  /**
   * Handles the form submission for the quote request (simulated).
   */
  function setupFormHandler() {
    const quoteForm = $('#quoteForm');
    if (!quoteForm) return;

    quoteForm.addEventListener('submit', function (e) {
      e.preventDefault();
      
      try {
        const fd = new FormData(this);
        const name = (fd.get('name') || '').toString().trim() || 'Customer';
        
        alert(`Thank you, ${name}! We received your request and will contact you shortly.`);
        this.reset();
        
        // Close the modal upon successful submission
        const modal = $('#modal');
        if (modal && modal.classList.contains('open')) {
          const closeBtn = $('#closeModal');
          if (closeBtn) closeBtn.click();
          else modal.classList.remove('open');
        }
      } catch (err) {
        console.error('Form submit error:', err);
      }
    });
  }
})();