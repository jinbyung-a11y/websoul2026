// ========================================
// Component Loader
// ========================================
(function() {
    'use strict';

    // Calculate base path based on current file location
    function getBasePath() {
        const href = window.location.href;
        const pathname = window.location.pathname;
        
        // Handle file:// protocol - path relative to current document's directory
        if (href.startsWith('file://')) {
            // At project root (e.g. .../홈페이지리뉴얼/index.html) -> basePath ''
            // In subfolder (e.g. .../accessibility/guide.html) -> basePath '../'
            const atRoot = pathname.endsWith('index.html');
            const basePath = atRoot ? '' : '../';
            console.log('Calculated basePath (file):', basePath || '(root)', 'from pathname:', pathname);
            return basePath;
        }
        
        // Handle http:// and https:// protocols (GitHub Pages: /repo-name/ or /repo-name/accessibility/...)
        const path = pathname;
        const pathParts = path.split('/').filter(p => p && !p.endsWith('.html'));
        let depth;
        if (pathParts.length === 0) {
            depth = 0;
        } else if (pathParts.length === 1) {
            // One segment: /repo-name/ or /repo-name/index.html = site root (depth 0). /accessibility/guide.html = depth 1.
            const atRoot = pathname.endsWith('/') || pathname.endsWith('index.html');
            depth = atRoot ? 0 : 1;
        } else {
            depth = Math.max(0, pathParts.length - 1);
        }
        const basePath = depth > 0 ? '../'.repeat(depth) : '';
        console.log('Calculated basePath:', basePath || '(root)', 'from pathname:', pathname, 'pathParts:', pathParts);
        return basePath;
    }

    // Update all links and images with data-base-path attribute
    function updateBasePaths(basePath) {
        const links = document.querySelectorAll('a[data-base-path]');
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('http') && !href.startsWith('#')) {
                // Check if this link is inside a side navigation (submenu)
                // Submenu links point to files in the same folder, so don't add basePath
                const isSubmenuLink = link.closest('.side-navigation') !== null;
                
                if (isSubmenuLink) {
                    // Submenu links should remain as-is (same folder)
                    // Just ensure we have the original href stored
                    if (!link.getAttribute('data-original-href')) {
                        link.setAttribute('data-original-href', href);
                    }
                    console.log('Submenu link (no basePath):', href);
                    return; // Skip basePath update for submenu links
                }
                
                // Get the original href (stored in data-original-href if exists, otherwise use current href)
                let originalHref = link.getAttribute('data-original-href') || href;
                
                // If this is the first time processing, store the original href
                if (!link.getAttribute('data-original-href')) {
                    link.setAttribute('data-original-href', originalHref);
                }
                
                // Remove any existing base path from the original href
                let cleanHref = originalHref.replace(/^(\.\.\/)+/, '');
                
                // Add correct base path if needed
                let newHref = cleanHref;
                if (basePath && !cleanHref.startsWith('/') && !cleanHref.startsWith('http')) {
                    newHref = basePath + cleanHref;
                }
                
                link.setAttribute('href', newHref);
                console.log('Updated link:', originalHref, '->', newHref, '(basePath:', basePath + ')');
            }
        });

        document.querySelectorAll('img[data-base-path]').forEach(img => {
            const src = img.getAttribute('src');
            if (src && !src.startsWith('http') && !src.startsWith('data:')) {
                let originalSrc = img.getAttribute('data-original-src') || src;
                if (!img.getAttribute('data-original-src')) {
                    img.setAttribute('data-original-src', originalSrc);
                }
                let cleanSrc = originalSrc.replace(/^(\.\.\/)+/, '');
                let newSrc = basePath ? basePath + cleanSrc : cleanSrc;
                img.setAttribute('src', newSrc);
            }
        });
    }

    // Load component HTML
    function loadComponent(componentPath, targetSelector) {
        // Resolve to absolute URL so fetch works on all hosts (incl. GitHub Pages)
        let absolutePath = componentPath;
        if (window.location.protocol === 'file:') {
            const baseUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
            absolutePath = new URL(componentPath, baseUrl).href;
        } else {
            absolutePath = new URL(componentPath, window.location.href).href;
        }
        
        return fetch(absolutePath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load component: ${componentPath} (Status: ${response.status})`);
                }
                return response.text();
            })
            .then(html => {
                const target = document.querySelector(targetSelector);
                if (target) {
                    target.innerHTML = html;
                    console.log('Component HTML inserted:', componentPath);
                    
                    // For header component, wait for DOM and dispatch event so main.js can init
                    if (targetSelector === '#header-placeholder') {
                        return new Promise((resolve) => {
                            const header = document.getElementById('header');
                            if (header) {
                                console.log('Header element detected in DOM');
                                document.dispatchEvent(new CustomEvent('header-loaded'));
                                setTimeout(() => resolve(true), 50);
                                return;
                            }
                            const observer = new MutationObserver((mutations, obs) => {
                                const headerEl = document.getElementById('header');
                                if (headerEl) {
                                    console.log('Header element detected in DOM');
                                    obs.disconnect();
                                    document.dispatchEvent(new CustomEvent('header-loaded'));
                                    setTimeout(() => resolve(true), 50);
                                }
                            });
                            observer.observe(target, { childList: true, subtree: true });
                            setTimeout(() => {
                                observer.disconnect();
                                if (document.getElementById('header')) {
                                    document.dispatchEvent(new CustomEvent('header-loaded'));
                                }
                                resolve(true);
                            }, 500);
                        });
                    }
                    
                    // Don't update paths here - will be done after all components load
                    return true;
                }
                console.error('Target selector not found:', targetSelector);
                return false;
            })
            .catch(error => {
                console.error('Error loading component:', componentPath, error);
                console.error('Attempted URL:', absolutePath);
                return false;
            });
    }

    // Determine which submenu to load based on current path
    function getSubmenuType() {
        const path = window.location.pathname.toLowerCase();
        
        if (path.includes('/accessibility/')) {
            return 'accessibility';
        } else if (path.includes('/consulting/')) {
            return 'consulting';
        } else if (path.includes('/portfolio/')) {
            return 'portfolio';
        } else if (path.includes('/solution/')) {
            return 'solution';
        } else if (path.includes('/support/')) {
            return 'support';
        } else if (path.includes('/about/')) {
            return 'about';
        } else if (path.includes('/digital/')) {
            return 'consulting'; // digital uses consulting submenu
        } else if (path.includes('/digital-inclusion/')) {
            return 'digital-inclusion';
        }
        
        return null; // No submenu for index or other pages
    }

    // Initialize components
    function initComponents() {
        const basePath = getBasePath();
        const componentsBasePath = basePath + 'components/';
        
        console.log('Initializing components...');
        console.log('Current URL:', window.location.href);
        console.log('Current pathname:', window.location.pathname);
        console.log('Base path:', basePath, '(length:', basePath.length + ')');
        console.log('Components path:', componentsBasePath);
        
        const loadPromises = [];
        
        // Load header
        const headerPlaceholder = document.querySelector('#header-placeholder');
        if (headerPlaceholder) {
            console.log('Loading header from:', componentsBasePath + 'header.html');
            loadPromises.push(loadComponent(componentsBasePath + 'header.html', '#header-placeholder'));
        } else {
            console.warn('Header placeholder not found, creating one...');
            const body = document.body;
            if (body) {
                const headerDiv = document.createElement('div');
                headerDiv.id = 'header-placeholder';
                body.insertBefore(headerDiv, body.firstChild);
                loadPromises.push(loadComponent(componentsBasePath + 'header.html', '#header-placeholder'));
            }
        }

        // Load footer
        const footerPlaceholder = document.querySelector('#footer-placeholder');
        if (footerPlaceholder) {
            loadPromises.push(loadComponent(componentsBasePath + 'footer.html', '#footer-placeholder'));
        } else {
            const body = document.body;
            if (body) {
                const footerDiv = document.createElement('div');
                footerDiv.id = 'footer-placeholder';
                body.appendChild(footerDiv);
                loadPromises.push(loadComponent(componentsBasePath + 'footer.html', '#footer-placeholder'));
            }
        }

        // Load submenu if needed
        const submenuType = getSubmenuType();
        console.log('Submenu type:', submenuType);
        if (submenuType) {
            const submenuPlaceholder = document.querySelector('#submenu-placeholder');
            if (submenuPlaceholder) {
                console.log('Loading submenu from:', componentsBasePath + 'submenu-' + submenuType + '.html');
                loadPromises.push(loadComponent(componentsBasePath + 'submenu-' + submenuType + '.html', '#submenu-placeholder'));
            } else {
                console.warn('Submenu placeholder not found, trying to find page-container...');
                const pageContainer = document.querySelector('.page-container');
                if (pageContainer) {
                    console.log('Found page-container, creating submenu placeholder');
                    const submenuDiv = document.createElement('div');
                    submenuDiv.id = 'submenu-placeholder';
                    pageContainer.insertBefore(submenuDiv, pageContainer.firstChild);
                    loadPromises.push(loadComponent(componentsBasePath + 'submenu-' + submenuType + '.html', '#submenu-placeholder'));
                } else {
                    console.warn('Neither submenu placeholder nor page-container found');
                }
            }
        } else {
            console.log('No submenu needed for this page');
        }
        
        // Wait for all components to load, then update all paths and initialize main.js
        Promise.all(loadPromises).then((results) => {
            console.log('All components loaded:', results);
            // Update all paths one more time to ensure consistency
            setTimeout(() => {
                const finalBasePath = getBasePath();
                console.log('Final update of all base paths with:', finalBasePath);
                updateBasePaths(finalBasePath);
                
                // Initialize main.js after all components are loaded
                // Use a more reliable method to wait for DOM to be ready
                const initMainJSWithRetry = (retries = 5) => {
                    const header = document.getElementById('header');
                    const navMenu = document.getElementById('navMenu');
                    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
                    
                    if (header && navMenu && typeof initMainJS === 'function') {
                        console.log('All required elements found, initializing main.js');
                        console.log('Header:', header);
                        console.log('Nav menu:', navMenu);
                        console.log('Mobile menu toggle:', mobileMenuToggle);
                        initMainJS();
                    } else if (retries > 0) {
                        console.log(`Waiting for header elements... (${retries} retries left)`);
                        if (!header) console.warn('Header not found yet');
                        if (!navMenu) console.warn('Nav menu not found yet');
                        if (!mobileMenuToggle) console.warn('Mobile menu toggle not found yet');
                        setTimeout(() => initMainJSWithRetry(retries - 1), 100);
                    } else {
                        console.error('Failed to initialize main.js: required elements not found');
                        if (typeof initMainJS === 'function') {
                            console.warn('Attempting to initialize anyway...');
                            initMainJS();
                        }
                    }
                };
                
                // Start initialization with retry
                setTimeout(() => initMainJSWithRetry(), 100);
            }, 100);
        }).catch((error) => {
            console.error('Error loading components:', error);
            // Still try to initialize main.js even if some components failed
            setTimeout(() => {
                if (typeof initMainJS === 'function') {
                    console.log('Initializing main.js despite component loading errors');
                    initMainJS();
                }
            }, 200);
        });
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initComponents);
    } else {
        initComponents();
    }

    // Export for manual initialization if needed
    window.ComponentLoader = {
        init: initComponents,
        loadComponent: loadComponent,
        getBasePath: getBasePath
    };
})();
