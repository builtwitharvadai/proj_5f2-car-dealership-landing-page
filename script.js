/**
 * Premium Auto Sales - Interactive JavaScript Functionality
 * Implements smooth scrolling, mobile menu, form validation, lazy loading, and scroll-to-top
 * @generated-from: TASK-003
 * @modifies: index.html
 * @dependencies: ["index.html", "styles.css"]
 */

(function() {
  'use strict';

  // ============================================
  // Configuration & Constants
  // ============================================
  const CONFIG = Object.freeze({
    SCROLL_OFFSET: 80,
    SCROLL_DURATION: 800,
    SCROLL_TO_TOP_THRESHOLD: 300,
    LAZY_LOAD_ROOT_MARGIN: '50px',
    DEBOUNCE_DELAY: 150,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_REGEX: /^[\d\s\-\+\(\)]+$/,
  });

  const SELECTORS = Object.freeze({
    NAV_LINKS: 'nav a[href^="#"]',
    MOBILE_MENU_TOGGLE: '.mobile-menu-toggle',
    MOBILE_MENU: '.mobile-nav',
    CONTACT_FORM: '#contact-form',
    LAZY_IMAGES: 'img[loading="lazy"]',
    SCROLL_TO_TOP: '#scroll-to-top',
    HEADER: 'header',
  });

  const ARIA_LABELS = Object.freeze({
    MENU_OPEN: 'Open navigation menu',
    MENU_CLOSE: 'Close navigation menu',
    SCROLL_TO_TOP: 'Scroll to top of page',
  });

  // ============================================
  // Utility Functions
  // ============================================

  /**
   * Debounce function to limit execution rate
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
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

  /**
   * Easing function for smooth animations
   * @param {number} t - Time progress (0-1)
   * @returns {number} Eased value
   */
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  }

  /**
   * Get element offset from top of document
   * @param {HTMLElement} element - Target element
   * @returns {number} Offset in pixels
   */
  function getElementOffset(element) {
    if (!element) return 0;
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return rect.top + scrollTop;
  }

  /**
   * Log error with context
   * @param {string} context - Error context
   * @param {Error} error - Error object
   */
  function logError(context, error) {
    console.error(`[Premium Auto Sales] ${context}:`, error);
  }

  // ============================================
  // Smooth Scrolling Navigation
  // ============================================

  /**
   * Smooth scroll to target element
   * @param {HTMLElement} target - Target element to scroll to
   * @param {number} duration - Animation duration in milliseconds
   */
  function smoothScrollTo(target, duration = CONFIG.SCROLL_DURATION) {
    if (!target) return;

    const targetPosition = getElementOffset(target) - CONFIG.SCROLL_OFFSET;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const ease = easeInOutCubic(progress);

      window.scrollTo(0, startPosition + distance * ease);

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      } else {
        // Set focus to target for accessibility
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        target.removeAttribute('tabindex');
      }
    }

    requestAnimationFrame(animation);
  }

  /**
   * Initialize smooth scrolling for navigation links
   */
  function initSmoothScrolling() {
    try {
      const navLinks = document.querySelectorAll(SELECTORS.NAV_LINKS);

      navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
          const href = this.getAttribute('href');
          if (!href || !href.startsWith('#')) return;

          const targetId = href.substring(1);
          const targetElement = document.getElementById(targetId);

          if (targetElement) {
            e.preventDefault();
            smoothScrollTo(targetElement);

            // Update URL without jumping
            if (history.pushState) {
              history.pushState(null, null, href);
            }

            // Close mobile menu if open
            const mobileMenu = document.querySelector(SELECTORS.MOBILE_MENU);
            if (mobileMenu && mobileMenu.classList.contains('active')) {
              toggleMobileMenu();
            }
          }
        });

        // Keyboard navigation support
        link.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.click();
          }
        });
      });
    } catch (error) {
      logError('Smooth scrolling initialization', error);
    }
  }

  // ============================================
  // Mobile Menu Toggle
  // ============================================

  /**
   * Toggle mobile menu visibility
   */
  function toggleMobileMenu() {
    try {
      const menuToggle = document.querySelector(SELECTORS.MOBILE_MENU_TOGGLE);
      const mobileMenu = document.querySelector(SELECTORS.MOBILE_MENU);

      if (!menuToggle || !mobileMenu) return;

      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      const newState = !isExpanded;

      // Update ARIA attributes
      menuToggle.setAttribute('aria-expanded', newState.toString());
      menuToggle.setAttribute('aria-label', newState ? ARIA_LABELS.MENU_CLOSE : ARIA_LABELS.MENU_OPEN);

      // Toggle menu visibility
      mobileMenu.classList.toggle('active');
      menuToggle.classList.toggle('active');

      // Prevent body scroll when menu is open
      document.body.style.overflow = newState ? 'hidden' : '';

      // Focus management
      if (newState) {
        const firstLink = mobileMenu.querySelector('a');
        if (firstLink) firstLink.focus();
      } else {
        menuToggle.focus();
      }
    } catch (error) {
      logError('Mobile menu toggle', error);
    }
  }

  /**
   * Initialize mobile menu functionality
   */
  function initMobileMenu() {
    try {
      // Create mobile menu toggle button if it doesn't exist
      const header = document.querySelector(SELECTORS.HEADER);
      const nav = document.querySelector('nav');
      
      if (!header || !nav) return;

      let menuToggle = document.querySelector(SELECTORS.MOBILE_MENU_TOGGLE);
      
      if (!menuToggle) {
        menuToggle = document.createElement('button');
        menuToggle.className = 'mobile-menu-toggle';
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', ARIA_LABELS.MENU_OPEN);
        menuToggle.innerHTML = `
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        `;
        
        const headerContainer = header.querySelector('.header-container');
        if (headerContainer) {
          headerContainer.insertBefore(menuToggle, nav);
        }
      }

      // Add mobile-nav class to nav
      nav.classList.add('mobile-nav');

      // Event listeners
      menuToggle.addEventListener('click', toggleMobileMenu);

      // Close menu on escape key
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          const mobileMenu = document.querySelector(SELECTORS.MOBILE_MENU);
          if (mobileMenu && mobileMenu.classList.contains('active')) {
            toggleMobileMenu();
          }
        }
      });

      // Close menu when clicking outside
      document.addEventListener('click', function(e) {
        const mobileMenu = document.querySelector(SELECTORS.MOBILE_MENU);
        const menuToggle = document.querySelector(SELECTORS.MOBILE_MENU_TOGGLE);
        
        if (mobileMenu && 
            mobileMenu.classList.contains('active') && 
            !mobileMenu.contains(e.target) && 
            !menuToggle.contains(e.target)) {
          toggleMobileMenu();
        }
      });
    } catch (error) {
      logError('Mobile menu initialization', error);
    }
  }

  // ============================================
  // Contact Form Validation
  // ============================================

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} Validation result
   */
  function validateEmail(email) {
    return CONFIG.EMAIL_REGEX.test(email);
  }

  /**
   * Validate phone format
   * @param {string} phone - Phone to validate
   * @returns {boolean} Validation result
   */
  function validatePhone(phone) {
    return CONFIG.PHONE_REGEX.test(phone) && phone.replace(/\D/g, '').length >= 10;
  }

  /**
   * Show validation error
   * @param {HTMLElement} input - Input element
   * @param {string} message - Error message
   */
  function showError(input, message) {
    if (!input) return;

    const formGroup = input.closest('.form-group') || input.parentElement;
    let errorElement = formGroup.querySelector('.error-message');

    if (!errorElement) {
      errorElement = document.createElement('span');
      errorElement.className = 'error-message';
      errorElement.setAttribute('role', 'alert');
      formGroup.appendChild(errorElement);
    }

    errorElement.textContent = message;
    input.classList.add('error');
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', errorElement.id || 'error-' + input.name);
  }

  /**
   * Clear validation error
   * @param {HTMLElement} input - Input element
   */
  function clearError(input) {
    if (!input) return;

    const formGroup = input.closest('.form-group') || input.parentElement;
    const errorElement = formGroup.querySelector('.error-message');

    if (errorElement) {
      errorElement.textContent = '';
    }

    input.classList.remove('error');
    input.setAttribute('aria-invalid', 'false');
  }

  /**
   * Validate single form field
   * @param {HTMLElement} input - Input element to validate
   * @returns {boolean} Validation result
   */
  function validateField(input) {
    if (!input) return false;

    const value = input.value.trim();
    const type = input.type;
    const name = input.name;
    const isRequired = input.hasAttribute('required');

    // Clear previous errors
    clearError(input);

    // Required field validation
    if (isRequired && !value) {
      showError(input, 'This field is required');
      return false;
    }

    // Skip further validation if field is empty and not required
    if (!value && !isRequired) {
      return true;
    }

    // Email validation
    if (type === 'email' || name === 'email') {
      if (!validateEmail(value)) {
        showError(input, 'Please enter a valid email address');
        return false;
      }
    }

    // Phone validation
    if (type === 'tel' || name === 'phone') {
      if (!validatePhone(value)) {
        showError(input, 'Please enter a valid phone number (at least 10 digits)');
        return false;
      }
    }

    // Minimum length validation
    const minLength = input.getAttribute('minlength');
    if (minLength && value.length < parseInt(minLength, 10)) {
      showError(input, `Minimum ${minLength} characters required`);
      return false;
    }

    return true;
  }

  /**
   * Initialize contact form validation
   */
  function initFormValidation() {
    try {
      const form = document.querySelector(SELECTORS.CONTACT_FORM);
      if (!form) return;

      const inputs = form.querySelectorAll('input, textarea, select');

      // Real-time validation on blur
      inputs.forEach(input => {
        input.addEventListener('blur', function() {
          validateField(this);
        });

        // Clear error on input
        input.addEventListener('input', function() {
          if (this.classList.contains('error')) {
            clearError(this);
          }
        });
      });

      // Form submission validation
      form.addEventListener('submit', function(e) {
        e.preventDefault();

        let isValid = true;
        const formInputs = form.querySelectorAll('input, textarea, select');

        formInputs.forEach(input => {
          if (!validateField(input)) {
            isValid = false;
          }
        });

        if (isValid) {
          // Form is valid - handle submission
          const formData = new FormData(form);
          const data = Object.fromEntries(formData.entries());

          console.log('Form submitted successfully:', data);

          // Show success message
          const successMessage = document.createElement('div');
          successMessage.className = 'success-message';
          successMessage.setAttribute('role', 'status');
          successMessage.textContent = 'Thank you! Your message has been sent successfully.';
          form.insertBefore(successMessage, form.firstChild);

          // Reset form
          form.reset();

          // Remove success message after 5 seconds
          setTimeout(() => {
            successMessage.remove();
          }, 5000);
        } else {
          // Focus first error field
          const firstError = form.querySelector('.error');
          if (firstError) {
            firstError.focus();
          }
        }
      });
    } catch (error) {
      logError('Form validation initialization', error);
    }
  }

  // ============================================
  // Lazy Loading Images
  // ============================================

  /**
   * Initialize lazy loading for images
   */
  function initLazyLoading() {
    try {
      // Check for native lazy loading support
      if ('loading' in HTMLImageElement.prototype) {
        // Browser supports native lazy loading
        const images = document.querySelectorAll(SELECTORS.LAZY_IMAGES);
        images.forEach(img => {
          if (img.dataset.src) {
            img.src = img.dataset.src;
          }
        });
        return;
      }

      // Fallback to Intersection Observer
      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(
          (entries, observer) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                const img = entry.target;
                
                // Load image
                if (img.dataset.src) {
                  img.src = img.dataset.src;
                }

                // Remove loading attribute
                img.removeAttribute('loading');
                
                // Stop observing this image
                observer.unobserve(img);

                // Add loaded class for styling
                img.classList.add('loaded');
              }
            });
          },
          {
            rootMargin: CONFIG.LAZY_LOAD_ROOT_MARGIN,
          }
        );

        const lazyImages = document.querySelectorAll(SELECTORS.LAZY_IMAGES);
        lazyImages.forEach(img => {
          imageObserver.observe(img);
        });
      } else {
        // Fallback for older browsers - load all images
        const images = document.querySelectorAll(SELECTORS.LAZY_IMAGES);
        images.forEach(img => {
          if (img.dataset.src) {
            img.src = img.dataset.src;
          }
        });
      }
    } catch (error) {
      logError('Lazy loading initialization', error);
    }
  }

  // ============================================
  // Scroll to Top Button
  // ============================================

  /**
   * Create and initialize scroll to top button
   */
  function initScrollToTop() {
    try {
      // Create button if it doesn't exist
      let scrollButton = document.querySelector(SELECTORS.SCROLL_TO_TOP);

      if (!scrollButton) {
        scrollButton = document.createElement('button');
        scrollButton.id = 'scroll-to-top';
        scrollButton.className = 'scroll-to-top';
        scrollButton.setAttribute('aria-label', ARIA_LABELS.SCROLL_TO_TOP);
        scrollButton.innerHTML = '↑';
        document.body.appendChild(scrollButton);
      }

      // Show/hide button based on scroll position
      const toggleScrollButton = debounce(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > CONFIG.SCROLL_TO_TOP_THRESHOLD) {
          scrollButton.classList.add('visible');
          scrollButton.setAttribute('tabindex', '0');
        } else {
          scrollButton.classList.remove('visible');
          scrollButton.setAttribute('tabindex', '-1');
        }
      }, CONFIG.DEBOUNCE_DELAY);

      // Event listeners
      window.addEventListener('scroll', toggleScrollButton, { passive: true });

      scrollButton.addEventListener('click', function() {
        smoothScrollTo(document.body, CONFIG.SCROLL_DURATION);
      });

      // Keyboard support
      scrollButton.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.click();
        }
      });

      // Initial check
      toggleScrollButton();
    } catch (error) {
      logError('Scroll to top initialization', error);
    }
  }

  // ============================================
  // Initialization
  // ============================================

  /**
   * Initialize all interactive features
   */
  function init() {
    try {
      // Initialize features
      initSmoothScrolling();
      initMobileMenu();
      initFormValidation();
      initLazyLoading();
      initScrollToTop();

      console.log('[Premium Auto Sales] Interactive features initialized successfully');
    } catch (error) {
      logError('Initialization', error);
    }
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();