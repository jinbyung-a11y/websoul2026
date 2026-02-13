// ========================================
// Main JS Initialization
// ========================================
let mainJSInitialized = false; // Prevent duplicate initialization

function initMainJS() {
    // Prevent duplicate initialization
    if (mainJSInitialized) {
        console.log('main.js already initialized, skipping...');
        return;
    }
    
    console.log('Initializing main.js...');
    
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');
    const navMenuWrapper = navMenu ? navMenu.closest('.nav-menu-wrapper') : null;
    const header = document.getElementById('header');
    
    // Header is required for menu and scroll behavior
    if (!header) {
        console.warn('Header not found, main.js initialization skipped');
        return;
    }
    if (!mobileMenuToggle) {
        console.warn('Mobile menu toggle not found');
    }
    if (!navMenu) {
        console.warn('Nav menu not found');
    }
    
    // ========================================
    // Text Size & Display Mode Settings
    // ========================================
    const textSizeBtn = document.getElementById('textSizeBtn');
    const settingsModal = document.getElementById('settingsModal');
    const settingsClose = document.getElementById('settingsClose');
    const resetSettings = document.getElementById('resetSettings');
    const applySettings = document.getElementById('applySettings');
    const textSizeBtns = document.querySelectorAll('.text-size-btn');
    const modeBtns = document.querySelectorAll('.mode-btn');

    // Load saved settings
    const savedTextSize = localStorage.getItem('textSize') || 'normal';
    const savedMode = localStorage.getItem('displayMode') || 'light';
    
    applyTextSize(savedTextSize);
    applyDisplayMode(savedMode);
    updateActiveButtons(savedTextSize, savedMode);

    // Open settings modal
    if (textSizeBtn) {
        textSizeBtn.addEventListener('click', function() {
            settingsModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    // Close settings modal
    if (settingsClose) {
        settingsClose.addEventListener('click', closeModal);
    }

    // Close modal on backdrop click
    settingsModal.addEventListener('click', function(e) {
        if (e.target === settingsModal) {
            closeModal();
        }
    });

    function closeModal() {
        settingsModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Text size selection
    textSizeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            textSizeBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Display mode selection
    modeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            modeBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Apply settings
    if (applySettings) {
        applySettings.addEventListener('click', function() {
            const selectedSize = document.querySelector('.text-size-btn.active').dataset.size;
            const selectedMode = document.querySelector('.mode-btn.active').dataset.mode;
            
            applyTextSize(selectedSize);
            applyDisplayMode(selectedMode);
            
            localStorage.setItem('textSize', selectedSize);
            localStorage.setItem('displayMode', selectedMode);
            
            closeModal();
        });
    }

    // Reset settings
    if (resetSettings) {
        resetSettings.addEventListener('click', function() {
            applyTextSize('normal');
            applyDisplayMode('light');
            updateActiveButtons('normal', 'light');
            
            localStorage.removeItem('textSize');
            localStorage.removeItem('displayMode');
        });
    }

    function applyTextSize(size) {
        const html = document.documentElement;
        html.className = html.className.replace(/text-\w+/g, '');
        html.classList.add('text-' + size);
    }

    function applyDisplayMode(mode) {
        const html = document.documentElement;
        if (mode === 'dark') {
            html.classList.add('dark-mode');
        } else {
            html.classList.remove('dark-mode');
        }
    }

    function updateActiveButtons(size, mode) {
        textSizeBtns.forEach(btn => {
            if (btn.dataset.size === size) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        modeBtns.forEach(btn => {
            if (btn.dataset.mode === mode) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // ========================================
    // KRDS-style Main Navigation Menu
    // ========================================
    let currentOpenDropdown = null;

    // Use event delegation to handle dynamically loaded menu items
    function initNavigationMenu() {
        const navMenu = document.getElementById('navMenu');
        const navBackdrop = document.getElementById('navBackdrop');
        
        console.log('Navigation menu initialization:');
        console.log('- navMenu found:', !!navMenu);
        console.log('- navBackdrop found:', !!navBackdrop);

        if (!navMenu) {
            console.warn('Nav menu not found! Navigation menu may not work.');
            return false;
        }

        // Use event delegation on navMenu to handle clicks on .nav-trigger
        navMenu.addEventListener('click', function(e) {
            const trigger = e.target.closest('.nav-trigger');
            if (!trigger) return;
            
            e.stopPropagation();
            const dropdownId = trigger.getAttribute('aria-controls');
            const dropdown = document.getElementById(dropdownId);
            
            if (!dropdown) {
                console.error('Dropdown not found for trigger:', dropdownId);
                return;
            }
            
            const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

            // Close currently open dropdown if different
            if (currentOpenDropdown && currentOpenDropdown !== dropdown) {
                closeDropdown(currentOpenDropdown);
            }

            // Toggle current dropdown
            if (isExpanded) {
                closeDropdown(dropdown);
            } else {
                openDropdown(dropdown, trigger);
            }
        });

        // Close dropdown when clicking backdrop
        if (navBackdrop) {
            navBackdrop.addEventListener('click', function() {
                if (currentOpenDropdown) {
                    closeDropdown(currentOpenDropdown);
                }
            });
        } else {
            console.warn('navBackdrop not found! Dropdown backdrop may not work.');
        }

        return true;
    }

    // Initialize navigation menu
    if (!initNavigationMenu()) {
        // Retry after a short delay if menu not found
        setTimeout(() => {
            console.log('Retrying navigation menu initialization...');
            initNavigationMenu();
        }, 200);
    }

    function openDropdown(dropdown, trigger) {
        if (!dropdown) {
            console.error('Cannot open dropdown: dropdown is null');
            return;
        }
        
        // Update aria-expanded - close all other dropdowns
        const allTriggers = document.querySelectorAll('.nav-trigger');
        allTriggers.forEach(t => t.setAttribute('aria-expanded', 'false'));
        trigger.setAttribute('aria-expanded', 'true');

        // Show dropdown
        dropdown.classList.add('active');
        const navBackdrop = document.getElementById('navBackdrop');
        if (navBackdrop) {
            navBackdrop.classList.add('active');
        } else {
            console.warn('navBackdrop not found, backdrop will not be shown');
        }
        currentOpenDropdown = dropdown;
        console.log('Dropdown opened:', dropdown.id);
    }

    function closeDropdown(dropdown) {
        if (!dropdown) return;

        const trigger = document.querySelector(`[aria-controls="${dropdown.id}"]`);
        if (trigger) {
            trigger.setAttribute('aria-expanded', 'false');
        }

        dropdown.classList.remove('active');
        const navBackdrop = document.getElementById('navBackdrop');
        if (navBackdrop) {
            navBackdrop.classList.remove('active');
        }
        currentOpenDropdown = null;
        console.log('Dropdown closed:', dropdown.id);
    }

    // Close dropdown when pressing Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && currentOpenDropdown) {
            closeDropdown(currentOpenDropdown);
        }
    });

    // ========================================
    // Mobile Menu Toggle
    // ========================================
    if (mobileMenuToggle && navMenuWrapper) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenuWrapper.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
            
            // Animate hamburger icon
            const spans = mobileMenuToggle.querySelectorAll('span');
            if (navMenuWrapper.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(7px, 7px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -7px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (navMenuWrapper && !navMenuWrapper.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
            navMenuWrapper.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
            
            const spans = mobileMenuToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
    
    // ========================================
    // Header Scroll Effect
    // ========================================
    let lastScroll = 0;
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });
    
    // ========================================
    // Smooth Scroll for Anchor Links
    // ========================================
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href !== '#' && href !== '') {
                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    const headerHeight = header.offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Close mobile menu if open
                    if (navMenuWrapper) {
                        navMenuWrapper.classList.remove('active');
                        mobileMenuToggle.classList.remove('active');
                    }
                }
            }
        });
    });
    
    // ========================================
    // Tab System (for sub pages)
    // ========================================
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
    
    // ========================================
    // Contact Form Handling
    // ========================================
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);
            
            // Here you would typically send the data to a server
            console.log('Form submitted:', data);
            
            // Show success message (you can customize this)
            alert('문의가 성공적으로 전송되었습니다. 빠른 시일 내에 답변드리겠습니다.');
            
            // Reset form
            contactForm.reset();
        });
    }
    
    // ========================================
    // Intersection Observer for Animations
    // ========================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements with animation
    const animatedElements = document.querySelectorAll('.service-card, .inclusion-card, .stat-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // ========================================
    // Lazy Loading Images (if any)
    // ========================================
    const lazyImages = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
    
    // ========================================
    // KRDS-style Side Navigation
    // ========================================
    const sideNavToggles = document.querySelectorAll('.side-nav-toggle');
    
    sideNavToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            const submenuId = this.getAttribute('aria-controls');
            const submenu = document.getElementById(submenuId);
            
            if (submenu) {
                // Toggle expanded state
                this.setAttribute('aria-expanded', !isExpanded);
                this.classList.toggle('active');
                submenu.classList.toggle('active');
            }
        });
    });
    
    // Set current page in side navigation
    const currentPath = window.location.pathname;
    const sideNavLinks = document.querySelectorAll('.side-nav-link');
    
    sideNavLinks.forEach(link => {
        const linkPath = new URL(link.href, window.location.origin).pathname;
        if (linkPath === currentPath) {
            link.setAttribute('aria-current', 'page');
            link.classList.add('active');
            
            // Expand parent submenu if exists
            const parentSubmenu = link.closest('.side-nav-submenu');
            if (parentSubmenu) {
                parentSubmenu.classList.add('active');
                const parentToggle = document.querySelector(`[aria-controls="${parentSubmenu.id}"]`);
                if (parentToggle) {
                    parentToggle.setAttribute('aria-expanded', 'true');
                    parentToggle.classList.add('active');
                }
            }
        }
    });
    
    // Mark as initialized
    mainJSInitialized = true;
    console.log('main.js initialization completed');
}

// Listen for header-loaded event from component-loader (reliable init after dynamic header)
document.addEventListener('header-loaded', function() {
    if (!mainJSInitialized && document.getElementById('header')) {
        console.log('header-loaded event: initializing main.js');
        initMainJS();
    }
});

// Auto-initialize only if header is already in DOM (not loaded dynamically)
// Otherwise, component-loader.js will call initMainJS after components are loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(function() {
            const header = document.getElementById('header');
            if (header && !header.querySelector('#header-placeholder') && !mainJSInitialized) {
                console.log('Header found in DOM, initializing main.js');
                initMainJS();
            }
        }, 300);
    });
} else {
    const header = document.getElementById('header');
    if (header && !header.querySelector('#header-placeholder') && !mainJSInitialized) {
        console.log('Header found in DOM, initializing main.js');
        initMainJS();
    }
}

// ========================================
// Utility Functions
// ========================================

// Debounce function for performance
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

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
