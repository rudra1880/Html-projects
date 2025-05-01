document.addEventListener('DOMContentLoaded', () => {
    console.log("JOYATO Website Initialized");

    // --- Theme Loading ---
    const savedTheme = localStorage.getItem('joyatoTheme') || 'theme-light'; // Default to light
    document.body.className = savedTheme; // Apply theme immediately
    console.log(`Applied theme: ${savedTheme}`);

    // --- Content Loading ---
    loadContentFromLocalStorage();

    // --- Update Footer Year ---
    const footerYear = document.getElementById('footer-year');
    if (footerYear) {
        footerYear.textContent = new Date().getFullYear();
    }

    // --- Scroll Animations ---
    setupScrollAnimations();

});

function loadContentFromLocalStorage() {
    const savedContent = localStorage.getItem('joyatoContent');
    if (!savedContent) {
        console.log("No saved content found in localStorage. Using default HTML content.");
        return; // No saved data, use default HTML
    }

    console.log("Loading content from localStorage...");
    try {
        const data = JSON.parse(savedContent);

        // Helper function to update element text
        const updateText = (id, value) => {
            const element = document.getElementById(id);
            if (element && value !== undefined && value !== null) {
                element.innerText = value;
            } else if (element) {
                 console.warn(`Element with ID '${id}' found, but no data provided.`);
            } else {
                 console.warn(`Element with ID '${id}' not found.`);
            }
        };

        // Update Main Heading & Tagline (Optional, but good practice)
        updateText('main-heading', data.mainHeading);
        updateText('main-tagline', data.mainTagline);

        // --- Update Section 1: About ---
        const aboutContentDiv = document.getElementById('about-content');
        if (aboutContentDiv && data.about) {
             // Use innerHTML cautiously, assuming data from control panel is safe
             // For complex structures, might need more specific updates
             if (data.about.htmlContent) { // If storing as HTML
                 aboutContentDiv.innerHTML = data.about.htmlContent;
             } else if (data.about.text) { // If storing plain text
                 aboutContentDiv.innerHTML = `<p>${data.about.text.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`; // Basic formatting
             }
        }

        // --- Update Section 2: Games ---
        const gamesGrid = document.getElementById('games-grid');
        if (gamesGrid && data.games && Array.isArray(data.games)) {
            gamesGrid.innerHTML = ''; // Clear default games
            data.games.forEach((game, index) => {
                const gameCard = document.createElement('div');
                gameCard.classList.add('game-card');
                // Ensure placeholder if thumbnail is missing/empty
                const thumbnailUrl = game.thumbnail || 'img/placeholder.png';
                const defaultThumb = 'img/placeholder.png';

                gameCard.innerHTML = `
                    <img src="${thumbnailUrl}" alt="${game.name || 'Game Thumbnail'}" class="game-thumbnail" data-game-id="${index + 1}" data-default-src="${defaultThumb}" onerror="this.onerror=null; this.src='${defaultThumb}';">
                    <h3 class="game-name">${game.name || 'Untitled Game'}</h3>
                    <p class="game-details">
                        Released: <span class="game-release">${game.releaseDate || 'TBA'}</span> |
                        Version: <span class="game-version">${game.version || 'N/A'}</span> <br>
                        Platform: <span class="game-platform">${game.platform || 'Unknown'}</span>
                    </p>
                    <p class="game-description">${game.description || 'No description available.'}</p>
                `;
                gamesGrid.appendChild(gameCard);
            });
        }

        // --- Update Section 3: Roadmap ---
        // Assuming 3 fixed roadmap items for simplicity based on initial structure
        updateText('roadmap-title-1', data.roadmap?.item1?.title);
        updateText('roadmap-desc-1', data.roadmap?.item1?.description);
        updateText('roadmap-title-2', data.roadmap?.item2?.title);
        updateText('roadmap-desc-2', data.roadmap?.item2?.description);
        updateText('roadmap-title-3', data.roadmap?.item3?.title);
        updateText('roadmap-desc-3', data.roadmap?.item3?.description);
        // Update dates if stored - requires IDs or different selectors
        // Example: updateText('roadmap-date-1', data.roadmap?.item1?.date);

        // --- Update Section 4: Company & Team ---
        updateText('company-staff-overview', data.company?.staffOverview);
        updateText('company-milestones', data.company?.milestones);

        const departmentsList = document.getElementById('company-departments');
        if (departmentsList && data.company?.departments && Array.isArray(data.company.departments)) {
             departmentsList.innerHTML = ''; // Clear defaults
             data.company.departments.forEach(dept => {
                 const li = document.createElement('li');
                 li.textContent = dept;
                 departmentsList.appendChild(li);
             });
        }

        const branchesList = document.getElementById('company-branches');
         if (branchesList && data.company?.branches && Array.isArray(data.company.branches)) {
             branchesList.innerHTML = ''; // Clear defaults
             data.company.branches.forEach(branch => {
                 const li = document.createElement('li');
                 // Assuming branch is an object { name: '...', details: '...' } or just a string
                 if (typeof branch === 'object' && branch !== null) {
                    li.innerHTML = `<strong>${branch.name || 'Unknown Branch'}</strong> ${branch.details || ''}`;
                 } else {
                    li.innerHTML = branch; // Assume string
                 }
                 branchesList.appendChild(li);
             });
         }

        const projectsList = document.getElementById('company-projects');
        if (projectsList && data.company?.projects && Array.isArray(data.company.projects)) {
            projectsList.innerHTML = ''; // Clear defaults
            data.company.projects.forEach(project => {
                const projectCard = document.createElement('div');
                projectCard.classList.add('project-card');
                projectCard.innerHTML = `
                    <h4 class="project-title">${project.title || 'Untitled Project'}</h4>
                    <p class="project-desc">${project.description || 'No details.'}</p>
                `;
                projectsList.appendChild(projectCard);
            });
        }

        // --- Update Section 5: Spotlight ---
        // Only updating descriptions as images are fixed in the prompt
        updateText('spotlight-desc-1', data.spotlight?.desc1);
        updateText('spotlight-desc-2', data.spotlight?.desc2);
        updateText('spotlight-desc-3', data.spotlight?.desc3);
        updateText('spotlight-desc-4', data.spotlight?.desc4);

        console.log("Content updated from localStorage.");

    } catch (error) {
        console.error("Error parsing or applying content from localStorage:", error);
        // Optionally clear corrupted data: localStorage.removeItem('joyatoContent');
    }
}

function setupScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    // Optional: Unobserve after animation to prevent re-triggering
                    // observer.unobserve(entry.target);
                } else {
                    // Optional: Remove class if you want animation to repeat on scroll up/down
                    // entry.target.classList.remove('is-visible');
                }
            });
        }, {
            threshold: 0.1 // Trigger when 10% of the element is visible
        });

        animatedElements.forEach(el => observer.observe(el));
        console.log(`IntersectionObserver set up for ${animatedElements.length} elements.`);
    } else {
        // Fallback for older browsers - simply make elements visible
        console.warn("IntersectionObserver not supported. Scroll animations disabled.");
        animatedElements.forEach(el => el.classList.add('is-visible'));
    }
}