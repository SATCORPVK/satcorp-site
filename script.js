/*
 * WebBuilder Guide JavaScript
 *
 * This script adds interactivity to the demo site. It implements a
 * responsive hamburger menu, dark‑mode toggle, accordion panels for
 * the learning roadmap, copy‑to‑clipboard functionality for the code
 * sample, form validation with feedback, and a back‑to‑top button. It
 * also writes the current year into the footer. All interactions are
 * unobtrusive and enhance accessibility by preserving semantic HTML
 * structure while providing clear feedback to screen‑reader users.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Navigation toggle for mobile
  const menuToggle = document.querySelector('.menu-toggle');
  const navList = document.querySelector('nav ul');
  menuToggle.addEventListener('click', () => {
    navList.classList.toggle('active');
    menuToggle.classList.toggle('open');
  });
  // Close the menu when a link is clicked (mobile)
  document.querySelectorAll('nav ul li a').forEach(link => {
    link.addEventListener('click', () => {
      navList.classList.remove('active');
      menuToggle.classList.remove('open');
    });
  });

  // Accordion functionality
  const accordionItems = document.querySelectorAll('.accordion-item');
  accordionItems.forEach(item => {
    const header = item.querySelector('.accordion-header');
    header.addEventListener('click', () => {
      const openItem = document.querySelector('.accordion-item.active');
      // If another item is open, close it first
      if (openItem && openItem !== item) {
        openItem.classList.remove('active');
      }
      // Toggle the clicked item
      item.classList.toggle('active');
    });
  });

  // Copy code to clipboard
  const copyBtn = document.querySelector('.copy-btn');
  if (copyBtn) {
    const code = document.querySelector('.code-block pre code').innerText;
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(code).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
        }, 2000);
      }).catch(() => {
        // Fallback: if clipboard API fails
        copyBtn.textContent = 'Press Ctrl+C to copy';
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
        }, 3000);
      });
    });
  }

  // Dark mode toggle
  const themeToggle = document.getElementById('theme-toggle');
  const setTheme = (theme) => {
    document.body.classList.toggle('dark', theme === 'dark');
    // Update button icon: moon for light theme, sun for dark
    themeToggle.textContent = theme === 'dark' ? '☀' : '🌙';
  };
  // Initialize theme from localStorage or default to light
  const savedTheme = localStorage.getItem('theme') || 'light';
  setTheme(savedTheme);
  // Toggle theme on button click
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.body.classList.contains('dark') ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  });

  // Contact form validation
  const form = document.getElementById('contact-form');
  const response = document.getElementById('form-response');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    if (!name || !email || !message) {
      response.style.color = 'var(--secondary-color)';
      response.textContent = 'Please fill in all required fields.';
      return;
    }
    // Simple email validation pattern
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      response.style.color = 'var(--secondary-color)';
      response.textContent = 'Please enter a valid email address.';
      return;
    }
    // Success message
    response.style.color = 'var(--primary-color)';
    response.textContent = 'Thanks for reaching out! We will get back to you soon.';
    // Clear form fields
    form.reset();
  });

  // Back to top button
  const backToTop = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTop.classList.add('show');
    } else {
      backToTop.classList.remove('show');
    }
  });
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Insert current year into footer
  document.getElementById('year').textContent = new Date().getFullYear();

  /*
   * Enhanced interactivity for the badass site
   * -----------------------------------------
   * This section handles kinetic typography in the hero heading, displays a random
   * daily tip, animates elements on scroll with IntersectionObserver, and
   * triggers progress bar widths when the progress container enters the viewport.
   */

  // 1. Kinetic typography: wrap each character of the hero h1 in spans with staggered animation delays.
  const heroHeading = document.querySelector('#hero h1');
  if (heroHeading) {
    const headingText = heroHeading.textContent;
    heroHeading.textContent = '';
    let charIndex = 0;
    headingText.split('')
      .forEach((char) => {
        // Preserve spaces without wrapping them in spans so whitespace remains
        if (char === ' ') {
          heroHeading.appendChild(document.createTextNode(' '));
        } else {
          const span = document.createElement('span');
          span.textContent = char;
          // Add a slight delay between letters for a cascading effect
          span.style.animationDelay = `${charIndex * 0.05}s`;
          heroHeading.appendChild(span);
          charIndex += 1;
        }
      });
  }

  // 2. Display a random daily tip from an array of best practices
  const tips = [
    'Keep your content accessible and user‑friendly.',
    'Optimize images and use lazy loading for faster pages.',
    'Use CSS variables for flexible theming.',
    'Write semantic HTML for better SEO and accessibility.',
    'Start with mobile‑first design for responsive layouts.',
    'Add micro‑interactions to enhance user experience.',
    'Plan your site’s structure before you start coding.',
    'Use version control like Git to manage your code.'
  ];
  const tipEl = document.getElementById('daily-tip');
  if (tipEl) {
    const randomIndex = Math.floor(Math.random() * tips.length);
    tipEl.textContent = tips[randomIndex];
  }

  // 3. IntersectionObserver to animate fade-in and progress bars
  const fadeEls = document.querySelectorAll('.fade-in');
  if (fadeEls.length > 0) {
    const observerOptions = {
      threshold: 0.2
    };
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // If the element is the progress container, animate bars
          if (entry.target.classList.contains('progress-container')) {
            const bars = entry.target.querySelectorAll('.bar');
            bars.forEach(bar => {
              const perc = bar.getAttribute('data-perc');
              // Only set width if not already set
              if (!bar.style.width) {
                bar.style.width = `${perc}%`;
              }
            });
          }
          obs.unobserve(entry.target);
        }
      });
    }, observerOptions);
    fadeEls.forEach(el => observer.observe(el));
  }
});
