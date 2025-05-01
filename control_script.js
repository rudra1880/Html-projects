document.addEventListener('DOMContentLoaded', () => {
    console.log("Control Panel Initialized");

    const form = document.getElementById('control-form');
    const saveButton = document.getElementById('save-button');
    const statusMessage = document.getElementById('save-status');

    const gamesListContainer = document.getElementById('games-list');
    const addGameButton = document.getElementById('add-game-btn');
    const gameTemplate = document.getElementById('game-entry-template');

    const projectsListContainer = document.getElementById('projects-list');
    const addProjectButton = document.getElementById('add-project-btn');
    const projectTemplate = document.getElementById('project-entry-template');

    const branchesListContainer = document.getElementById('branches-list');
    const addBranchButton = document.getElementById('add-branch-btn');
    const branchTemplate = document.getElementById('branch-entry-template');

    // --- Load Existing Data ---
    loadDataFromLocalStorage();

    // --- Event Listeners ---
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        saveDataToLocalStorage();
    });

    addGameButton.addEventListener('click', () => {
        addDynamicEntry(gameTemplate, gamesListContainer);
    });

    addProjectButton.addEventListener('click', () => {
        addDynamicEntry(projectTemplate, projectsListContainer);
    });

    addBranchButton.addEventListener('click', () => {
         addDynamicEntry(branchTemplate, branchesListContainer);
     });

    // --- Functions ---

    function addDynamicEntry(template, container, data = null) {
        if (!template || !container) {
            console.error("Template or container missing for dynamic entry.");
            return;
        }
        const clone = template.content.cloneNode(true);
        const entryDiv = clone.querySelector('div'); // Get the first div within the template

        if (data) {
            // Populate fields if data is provided (used during loading)
            const inputs = entryDiv.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                const name = input.getAttribute('name');
                // Adjust key names based on template vs data structure
                let dataKey = name;
                if (template.id === 'game-entry-template') {
                    dataKey = name.replace('game', '').charAt(0).toLowerCase() + name.slice(5); // gameName -> name
                } else if (template.id === 'project-entry-template') {
                    dataKey = name.replace('project', '').charAt(0).toLowerCase() + name.slice(8); // projectTitle -> title
                } else if (template.id === 'branch-entry-template') {
                     dataKey = name.replace('branch', '').charAt(0).toLowerCase() + name.slice(7); // branchName -> name
                }

                if (data[dataKey] !== undefined && data[dataKey] !== null) {
                    input.value = data[dataKey];
                }
            });
        }
         // Ensure remove button works even when added dynamically (inline onclick used in template)
         // Or add event listener here if preferred over inline onclick
         /*
         const removeBtn = entryDiv.querySelector('.remove-btn');
         if (removeBtn) {
             removeBtn.addEventListener('click', () => {
                 entryDiv.remove();
             });
         }
         */

        container.appendChild(entryDiv);
    }


    function loadDataFromLocalStorage() {
        console.log("Attempting to load data from localStorage...");
        const savedContent = localStorage.getItem('joyatoContent');
        const savedTheme = localStorage.getItem('joyatoTheme');

        // Load Theme
        if (savedTheme) {
            const themeRadioButton = document.querySelector(`input[name="theme"][value="${savedTheme}"]`);
            if (themeRadioButton) {
                themeRadioButton.checked = true;
            }
        }

        // Load Content
        if (!savedContent) {
            console.log("No content data found in localStorage.");
             // Optionally add one empty game/project/branch entry as a starting point
             addDynamicEntry(gameTemplate, gamesListContainer);
             addDynamicEntry(projectTemplate, projectsListContainer);
             addDynamicEntry(branchTemplate, branchesListContainer);
            return;
        }

        try {
            const data = JSON.parse(savedContent);
            console.log("Loaded data:", data);

            // Helper to set value safely
            const setValue = (id, value) => {
                const element = document.getElementById(id);
                if (element && value !== undefined && value !== null) {
                    element.value = value;
                }
            };

             // General
            setValue('ctrl-main-heading', data.mainHeading);
            setValue('ctrl-main-tagline', data.mainTagline);

            // About
            setValue('ctrl-about-content', data.about?.htmlContent || data.about?.text); // Prioritize htmlContent if exists

            // Games (Dynamic)
            gamesListContainer.innerHTML = ''; // Clear any default/template residue
            if (data.games && Array.isArray(data.games)) {
                data.games.forEach(gameData => addDynamicEntry(gameTemplate, gamesListContainer, gameData));
            } else {
                addDynamicEntry(gameTemplate, gamesListContainer); // Add one empty if none saved
            }


            // Roadmap (Fixed structure)
            setValue('ctrl-roadmap-title-1', data.roadmap?.item1?.title);
            setValue('ctrl-roadmap-desc-1', data.roadmap?.item1?.description);
            setValue('ctrl-roadmap-title-2', data.roadmap?.item2?.title);
            setValue('ctrl-roadmap-desc-2', data.roadmap?.item2?.description);
            setValue('ctrl-roadmap-title-3', data.roadmap?.item3?.title);
            setValue('ctrl-roadmap-desc-3', data.roadmap?.item3?.description);

            // Company & Team
            setValue('ctrl-company-staff', data.company?.staffOverview);
            setValue('ctrl-company-milestones', data.company?.milestones);
            const departmentsTextarea = document.getElementById('ctrl-company-departments');
            if (departmentsTextarea && data.company?.departments && Array.isArray(data.company.departments)) {
                departmentsTextarea.value = data.company.departments.join('\n');
            }

             // Branches (Dynamic)
             branchesListContainer.innerHTML = '';
             if (data.company?.branches && Array.isArray(data.company.branches)) {
                  data.company.branches.forEach(branchData => {
                      // Handle both string and object formats from index.js loading
                     if(typeof branchData === 'string'){
                         // Attempt to parse simple format like "Name: Details"
                         const parts = branchData.split(':');
                         const name = parts[0]?.trim();
                         const details = parts.slice(1).join(':').trim();
                         addDynamicEntry(branchTemplate, branchesListContainer, { name: name, details: details });
                     } else if (typeof branchData === 'object' && branchData !== null) {
                         addDynamicEntry(branchTemplate, branchesListContainer, branchData);
                     }
                 });
             } else {
                addDynamicEntry(branchTemplate, branchesListContainer);
             }

            // Projects (Dynamic)
            projectsListContainer.innerHTML = '';
            if (data.company?.projects && Array.isArray(data.company.projects)) {
                data.company.projects.forEach(projectData => addDynamicEntry(projectTemplate, projectsListContainer, projectData));
             } else {
                 addDynamicEntry(projectTemplate, projectsListContainer);
             }


            // Spotlight Descriptions
            setValue('ctrl-spotlight-desc-1', data.spotlight?.desc1);
            setValue('ctrl-spotlight-desc-2', data.spotlight?.desc2);
            setValue('ctrl-spotlight-desc-3', data.spotlight?.desc3);
            setValue('ctrl-spotlight-desc-4', data.spotlight?.desc4);


            console.log("Form populated from localStorage.");

        } catch (error) {
            console.error("Error parsing data from localStorage:", error);
            statusMessage.textContent = "Error loading saved data. It might be corrupted.";
            statusMessage.style.color = 'red';
             // Optionally clear corrupted data: localStorage.removeItem('joyatoContent');
        }
    }


    function saveDataToLocalStorage() {
        console.log("Saving data to localStorage...");
        const data = {};

        // --- Collect Data ---

        // General
        data.mainHeading = document.getElementById('ctrl-main-heading').value;
        data.mainTagline = document.getElementById('ctrl-main-tagline').value;


        // About
        data.about = {
            // Store as HTML to preserve formatting entered by user
            htmlContent: document.getElementById('ctrl-about-content').value
        };

        // Games (Dynamic)
        data.games = [];
        const gameEntries = gamesListContainer.querySelectorAll('.game-entry');
        gameEntries.forEach(entry => {
            data.games.push({
                name: entry.querySelector('[name="gameName"]').value,
                releaseDate: entry.querySelector('[name="gameReleaseDate"]').value,
                version: entry.querySelector('[name="gameVersion"]').value,
                platform: entry.querySelector('[name="gamePlatform"]').value,
                description: entry.querySelector('[name="gameDescription"]').value,
                thumbnail: entry.querySelector('[name="gameThumbnail"]').value
            });
        });

        // Roadmap (Fixed structure)
        data.roadmap = {
            item1: {
                title: document.getElementById('ctrl-roadmap-title-1').value,
                description: document.getElementById('ctrl-roadmap-desc-1').value
            },
            item2: {
                title: document.getElementById('ctrl-roadmap-title-2').value,
                description: document.getElementById('ctrl-roadmap-desc-2').value
            },
             item3: {
                title: document.getElementById('ctrl-roadmap-title-3').value,
                description: document.getElementById('ctrl-roadmap-desc-3').value
            }
        };

        // Company & Team
        data.company = {
            staffOverview: document.getElementById('ctrl-company-staff').value,
            milestones: document.getElementById('ctrl-company-milestones').value,
            departments: document.getElementById('ctrl-company-departments').value.split('\n').map(d => d.trim()).filter(d => d), // Split by newline, trim, remove empty
            branches: [],
            projects: []
        };

         // Branches (Dynamic)
        const branchEntries = branchesListContainer.querySelectorAll('.branch-entry');
         branchEntries.forEach(entry => {
             data.company.branches.push({
                 name: entry.querySelector('[name="branchName"]').value,
                 details: entry.querySelector('[name="branchDetails"]').value
             });
         });

        // Projects (Dynamic)
        const projectEntries = projectsListContainer.querySelectorAll('.project-entry');
        projectEntries.forEach(entry => {
            data.company.projects.push({
                title: entry.querySelector('[name="projectTitle"]').value,
                description: entry.querySelector('[name="projectDescription"]').value
            });
        });


        // Spotlight Descriptions
        data.spotlight = {
            desc1: document.getElementById('ctrl-spotlight-desc-1').value,
            desc2: document.getElementById('ctrl-spotlight-desc-2').value,
            desc3: document.getElementById('ctrl-spotlight-desc-3').value,
            desc4: document.getElementById('ctrl-spotlight-desc-4').value
        };

        // --- Save Data & Theme ---
        try {
            const jsonData = JSON.stringify(data);
            localStorage.setItem('joyatoContent', jsonData);

            const selectedTheme = document.querySelector('input[name="theme"]:checked').value;
            localStorage.setItem('joyatoTheme', selectedTheme);

            console.log("Data saved:", data);
            console.log("Theme saved:", selectedTheme);

            // Visual Feedback
            statusMessage.textContent = "Changes saved successfully!";
            statusMessage.style.color = 'green';
            setTimeout(() => { statusMessage.textContent = ''; }, 3000); // Clear message after 3 seconds

        } catch (error) {
            console.error("Error saving data to localStorage:", error);
            statusMessage.textContent = "Error saving data. Changes were not saved.";
            statusMessage.style.color = 'red';
             if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                 statusMessage.textContent += " LocalStorage might be full.";
             }
        }
    }

}); // End DOMContentLoaded