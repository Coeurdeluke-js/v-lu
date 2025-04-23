/**
 * V'lu - Main JavaScript (Refactorizado)
 * Proporciona funcionalidad interactiva al sitio web con código optimizado
 * Incluye comprobaciones para evitar errores por problemas en la estructura HTML
 */
document.addEventListener('DOMContentLoaded', function() {
  // Módulo principal de la aplicación
  const App = {
    // Cache de elementos DOM
    elements: {},
    
    // Configuración
    config: {
      scrollThreshold: 100,
      backToTopThreshold: 500,
      quoteRotationInterval: 6000,
      formResetDelay: 5000,
      newsletterSuccessDelay: 3000,
      animationStaggerDelay: 0.1
    },

    // Inicialización
    init() {
      this.cacheElements();
      this.fixHtmlIssues();
      this.setupEventListeners();
      this.setupAccordion();
      this.setupQuotesSlider();
      this.setupForms();
      this.setupFadeAnimations();
      this.setupHeroAnimation();
      
      // Ejecutar verificación inicial
      this.checkScrollEffects();
      
      console.log('V\'lu App initialized successfully');
    },
    
    // Cache de selectores DOM para optimizar rendimiento
    cacheElements() {
      this.elements = {
        header: document.querySelector('.header'),
        navToggle: document.querySelector('.nav-toggle'),
        navMenu: document.querySelector('.nav__menu'),
        navLinks: document.querySelectorAll('.nav__link'),
        backToTop: document.querySelector('.back-to-top'),
        accordionItems: document.querySelectorAll('.accordion__item'),
        quotesSlider: document.querySelector('.quotes-slider'),
        quoteItems: document.querySelectorAll('.quote'),
        sliderDots: document.querySelector('.slider-dots'),
        contactForm: document.getElementById('contactForm'),
        newsletterForm: document.querySelector('.newsletter-form'),
        heroContent: document.querySelector('.hero__content'),
        
        // Elementos para animaciones fade-in
        fadeTargets: [
          document.querySelectorAll('.section__title'),
          document.querySelectorAll('.card'),
          document.querySelectorAll('.values-item'),
          document.querySelectorAll('.testimonial'),
          document.querySelectorAll('.event')
        ]
      };
      
      // Unificar todos los elementos fade-in para un mejor manejo
      this.elements.fadeElements = this.gatherFadeElements();
    },
    
    // Corrección de problemas en la estructura HTML
    fixHtmlIssues() {
      // Corregir estructura de div anidados en la sección "Quiénes somos"
      const quienesSomosSection = document.getElementById('quienes-somos');
      if (quienesSomosSection) {
        // Buscar divs anidados incorrectamente
        const nestedDivs = quienesSomosSection.querySelectorAll('.section__content > .column');
        const extraClosingDivs = quienesSomosSection.querySelectorAll('.section__content > div > div:empty');
        
        // Eliminar divs vacíos extras
        extraClosingDivs.forEach(div => div.remove());
        
        // Verificar que la estructura de columnas sea correcta
        if (nestedDivs.length === 2) {
          const sectionContent = quienesSomosSection.querySelector('.section__content');
          if (sectionContent) {
            console.log('Fixed structure in "Quiénes somos" section');
          }
        }
      }
      
      // Validar otros elementos críticos
      this.validateCriticalElements();
    },
    
    // Validar que los elementos críticos existan en el DOM
    validateCriticalElements() {
      const criticalSelectors = [
        { name: 'header', selector: '.header' },
        { name: 'navMenu', selector: '.nav__menu' },
        { name: 'contactForm', selector: '#contactForm' },
        { name: 'heroContent', selector: '.hero__content' }
      ];
      
      let foundIssues = false;
      
      criticalSelectors.forEach(item => {
        if (!document.querySelector(item.selector)) {
          console.warn(`Critical element missing: ${item.name} (${item.selector})`);
          foundIssues = true;
        }
      });
      
      if (foundIssues) {
        console.warn('HTML structure issues detected. Some features may not work correctly.');
      }
    },
    
    // Unificar todos los elementos con fade-in para mejor manejo
    gatherFadeElements() {
      const allFadeElements = [];
      
      // Agregar elementos existentes con clase fade-in
      document.querySelectorAll('.fade-in').forEach(el => {
        allFadeElements.push(el);
      });
      
      // Agregar elementos de fadeTargets que aún no tienen la clase
      this.elements.fadeTargets.forEach(collection => {
        collection.forEach(el => {
          if (!el.classList.contains('fade-in')) {
            allFadeElements.push(el);
          }
        });
      });
      
      return allFadeElements;
    },

    // Configuración de escuchadores de eventos
    setupEventListeners() {
      const { navToggle, navMenu, navLinks, backToTop } = this.elements;
      
      // Navegación móvil
      if (navToggle) {
        navToggle.addEventListener('click', () => this.toggleMobileNav());
      }
      
      // Cierre de menú al hacer clic en enlaces
      if (navLinks && navLinks.length) {
        navLinks.forEach(link => {
          link.addEventListener('click', () => this.closeMobileNav());
        });
      }
      
      // Eventos de scroll con debounce para mejor rendimiento
      window.addEventListener('scroll', this.debounce(() => {
        this.checkScrollEffects();
      }, 10));
      
      // Botón volver arriba
      if (backToTop) {
        backToTop.addEventListener('click', (e) => {
          e.preventDefault();
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        });
      }
      
      // Evento de carga completada
      window.addEventListener('load', () => {
        document.body.classList.add('loaded');
      });
      
      // Prevenir scroll en móvil cuando el menú está abierto
      document.body.addEventListener('touchmove', (e) => {
        if (document.body.classList.contains('no-scroll')) {
          e.preventDefault();
        }
      }, { passive: false });
      
      // Comportamiento suave para todos los enlaces internos
      this.setupSmoothScrolling();
    },
    
    // Configurar desplazamiento suave para todos los enlaces internos
    setupSmoothScrolling() {
      const internalLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
      
      internalLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          const targetId = link.getAttribute('href');
          const targetElement = document.querySelector(targetId);
          
          if (targetElement) {
            e.preventDefault();
            
            const headerOffset = this.elements.header ? this.elements.header.offsetHeight : 0;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        });
      });
    },
    
    // Alternar navegación móvil
    toggleMobileNav() {
      const { navToggle, navMenu } = this.elements;
      
      if (!navToggle || !navMenu) return;
      
      navToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
      document.body.classList.toggle('no-scroll');
    },
    
    // Cerrar navegación móvil
    closeMobileNav() {
      const { navToggle, navMenu } = this.elements;
      
      if (!navToggle || !navMenu) return;
      
      navMenu.classList.remove('active');
      navToggle.classList.remove('active');
      document.body.classList.remove('no-scroll');
    },
    
    // Verificar efectos de scroll
    checkScrollEffects() {
      const { header, backToTop } = this.elements;
      const { scrollThreshold, backToTopThreshold } = this.config;
      const scrollY = window.scrollY;
      
      // Efecto de cabecera
      if (header) {
        header.classList.toggle('scrolled', scrollY > scrollThreshold);
      }
      
      // Botón volver arriba
      if (backToTop) {
        backToTop.classList.toggle('visible', scrollY > backToTopThreshold);
      }
      
      // Animaciones en scroll
      this.checkFadeElements();
    },
    
    // Configuración del acordeón
    setupAccordion() {
      const { accordionItems } = this.elements;
      
      if (!accordionItems || !accordionItems.length) return;
      
      accordionItems.forEach(item => {
        const header = item.querySelector('.accordion__header');
        if (header) {
          header.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Cierra todos los items
            accordionItems.forEach(otherItem => {
              otherItem.classList.remove('active');
              
              // Cambiar icono plus/minus
              const icon = otherItem.querySelector('.accordion__icon i');
              if (icon) {
                icon.className = 'fas fa-plus';
              }
            });
            
            // Si no estaba activo, actívalo
            if (!isActive) {
              item.classList.add('active');
              
              // Cambiar icono a minus
              const icon = item.querySelector('.accordion__icon i');
              if (icon) {
                icon.className = 'fas fa-minus';
              }
            }
          });
        }
      });
    },
    
    // Configuración del slider de citas
    setupQuotesSlider() {
      const { quotesSlider, quoteItems, sliderDots } = this.elements;
      
      if (!quotesSlider || !quoteItems || !quoteItems.length || !sliderDots) return;
      
      let currentQuote = 0;
      let sliderInterval = null;
      const dots = [];
      
      // Crear dots
      quoteItems.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('slider-dot');
        if (index === 0) dot.classList.add('active');
        
        dot.addEventListener('click', () => {
          this.goToQuote(index, dots, quoteItems);
          
          // Reiniciar el intervalo al hacer clic
          if (sliderInterval) {
            clearInterval(sliderInterval);
            sliderInterval = this.startQuoteRotation(dots, quoteItems);
          }
        });
        
        sliderDots.appendChild(dot);
        dots.push(dot);
      });
      
      // Mostrar cita inicial
      this.showQuote(currentQuote, dots, quoteItems);
      
      // Iniciar rotación automática
      sliderInterval = this.startQuoteRotation(dots, quoteItems);
    },
    
    // Iniciar rotación automática de citas
    startQuoteRotation(dots, quoteItems) {
      const { quoteRotationInterval } = this.config;
      let currentQuote = 0;
      
      return setInterval(() => {
        currentQuote = (currentQuote + 1) % quoteItems.length;
        this.goToQuote(currentQuote, dots, quoteItems);
      }, quoteRotationInterval);
    },
    
    // Ir a una cita específica
    goToQuote(index, dots, quoteItems) {
      this.showQuote(index, dots, quoteItems);
    },
    
    // Mostrar una cita específica
    showQuote(index, dots, quoteItems) {
      quoteItems.forEach((quote, i) => {
        quote.style.display = i === index ? 'block' : 'none';
      });
      
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    },
    
    // Configuración de formularios
    setupForms() {
      this.setupContactForm();
      this.setupNewsletterForm();
    },
    
    // Configuración del formulario de contacto
    setupContactForm() {
      const { contactForm } = this.elements;
      const { formResetDelay } = this.config;
      
      if (!contactForm) return;
      
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formMessage = contactForm.querySelector('.form-message');
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        
        if (!formMessage || !submitBtn) return;
        
        const originalBtnText = submitBtn.textContent;
        
        // Validar formulario
        if (!this.validateForm(contactForm)) {
          formMessage.textContent = 'Por favor completa todos los campos requeridos correctamente.';
          formMessage.classList.add('error');
          setTimeout(() => {
            formMessage.textContent = '';
            formMessage.classList.remove('error');
          }, 3000);
          return;
        }
        
        // Estado de carga
        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;
        
        // Simulación de envío (reemplazar con código real)
        setTimeout(() => {
          submitBtn.textContent = originalBtnText;
          submitBtn.disabled = false;
          
          // Mensaje de éxito
          formMessage.textContent = '¡Mensaje enviado con éxito! Te contactaremos pronto.';
          formMessage.classList.add('success');
          
          // Resetear formulario
          contactForm.reset();
          
          // Limpiar mensaje después de un tiempo
          setTimeout(() => {
            formMessage.textContent = '';
            formMessage.classList.remove('success');
          }, formResetDelay);
        }, 1500);
      });
    },
    
    // Validar formulario
    validateForm(form) {
      let isValid = true;
      const requiredFields = form.querySelectorAll('[required]');
      
      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          field.classList.add('error');
          isValid = false;
          
          // Eliminar clase de error al escribir
          field.addEventListener('input', function onInput() {
            field.classList.remove('error');
            field.removeEventListener('input', onInput);
          });
        }
        
        if (field.type === 'email' && !this.isValidEmail(field.value)) {
          field.classList.add('error');
          isValid = false;
        }
      });
      
      return isValid;
    },
    
    // Configuración del formulario de newsletter
    setupNewsletterForm() {
      const { newsletterForm } = this.elements;
      const { newsletterSuccessDelay } = this.config;
      
      if (!newsletterForm) return;
      
      newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const emailInput = newsletterForm.querySelector('input[type="email"]');
        const submitBtn = newsletterForm.querySelector('button');
        
        if (!emailInput || !submitBtn) return;
        
        const originalBtnText = submitBtn.textContent;
        
        // Validar email
        if (!this.isValidEmail(emailInput.value)) {
          emailInput.classList.add('error');
          alert('Por favor, introduce un email válido.');
          
          emailInput.addEventListener('input', function onInput() {
            emailInput.classList.remove('error');
            emailInput.removeEventListener('input', onInput);
          });
          return;
        }
        
        // Estado de carga
        submitBtn.textContent = 'Procesando...';
        submitBtn.disabled = true;
        
        // Simulación de suscripción
        setTimeout(() => {
          submitBtn.textContent = '¡Suscrito!';
          emailInput.value = '';
          
          // Resetear botón después de un tiempo
          setTimeout(() => {
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
          }, newsletterSuccessDelay);
        }, 1500);
      });
    },
    
    // Validar email
    isValidEmail(email) {
      if (!email || typeof email !== 'string') return false;
      const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email.toLowerCase());
    },
    
    // Configuración de animaciones de aparición
    setupFadeAnimations() {
      const { fadeTargets } = this.elements;
      const { animationStaggerDelay } = this.config;
      
      if (!fadeTargets || !fadeTargets.length) return;
      
      fadeTargets.forEach(collection => {
        if (!collection || !collection.length) return;
        
        collection.forEach((el, index) => {
          if (!el) return;
          
          el.classList.add('fade-in');
          // Agregar retraso para efecto escalonado
          el.style.transitionDelay = `${index * animationStaggerDelay}s`;
        });
      });
    },
    
    // Verificar elementos con efecto fade
    checkFadeElements() {
      const { fadeElements } = this.elements;
      const elementVisible = 150;
      
      if (!fadeElements || !fadeElements.length) return;
      
      fadeElements.forEach(el => {
        if (!el) return;
        
        const elementTop = el.getBoundingClientRect().top;
        
        if (elementTop < window.innerHeight - elementVisible) {
          el.classList.add('visible');
        }
      });
    },
    
    // Configuración de animación del héroe
    setupHeroAnimation() {
      const { heroContent } = this.elements;
      
      if (!heroContent) return;
      
      // Verificar si IntersectionObserver está disponible
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
          (entries, observer) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                heroContent.classList.add('animate');
                observer.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.6 }
        );
        
        observer.observe(heroContent);
      } else {
        // Fallback para navegadores que no soportan IntersectionObserver
        setTimeout(() => {
          heroContent.classList.add('animate');
        }, 500);
      }
    },
    
    // Función de debounce para optimizar eventos frecuentes
    debounce(func, wait) {
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
  };

  // Inicializar la aplicación
  App.init();
});