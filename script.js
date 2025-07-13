class CountryFormatter {
    constructor() {
        this.countryCounter = 0;
        this.init();
    }

    init() {
        // Get DOM elements
        this.addCountryBtn = document.getElementById('addCountryBtn');
        this.generateBtn = document.getElementById('generateBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.copyEventBtn = document.getElementById('copyEventBtn');
        this.copyLocalizationBtn = document.getElementById('copyLocalizationBtn');
        this.copyCategoryBtn = document.getElementById('copyCategoryBtn');
        this.countriesContainer = document.getElementById('countriesContainer');
        this.categoryOutputSection = document.getElementById('categoryOutputSection');
        this.categoryOutputTextarea = document.getElementById('categoryOutput');
        this.eventOutputTextarea = document.getElementById('eventOutput');
        this.localizationOutputTextarea = document.getElementById('localizationOutput');
        this.masterTagInput = document.getElementById('masterTag');
        this.puppetIdeologyInput = document.getElementById('puppetIdeology');
        this.enableGovernmentNameCheckbox = document.getElementById('enableGovernmentName');
        this.enableLeaderFieldsCheckbox = document.getElementById('enableLeaderFields');
        this.generateFullCodeCheckbox = document.getElementById('generateFullCode');
        this.fullCodeSettings = document.getElementById('fullCodeSettings');
        this.addFocusBtn = document.getElementById('addFocusBtn');
        this.focusIdsTableBody = document.getElementById('focusIdsTableBody');
        this.addPartyBtn = document.getElementById('addPartyBtn');
        this.popularityTableBody = document.getElementById('popularityTableBody');
        this.totalPopularitySpan = document.getElementById('totalPopularity');
        this.validationMessageSpan = document.getElementById('validationMessage');
        this.popularityChart = null;

        // Add event listeners
        this.addCountryBtn.addEventListener('click', () => this.addCountry());
        this.generateBtn.addEventListener('click', () => this.generateOutput());
        this.clearBtn.addEventListener('click', () => this.clearAll());
        this.copyEventBtn.addEventListener('click', () => this.copyToClipboard('event'));
        this.copyLocalizationBtn.addEventListener('click', () => this.copyToClipboard('localization'));
        this.copyCategoryBtn.addEventListener('click', () => this.copyToClipboard('category'));
        this.enableGovernmentNameCheckbox.addEventListener('change', () => this.toggleGovernmentNameFields());
        this.enableLeaderFieldsCheckbox.addEventListener('change', () => this.toggleLeaderFields());
        this.generateFullCodeCheckbox.addEventListener('change', () => this.toggleFullCodeGeneration());
        this.addFocusBtn.addEventListener('click', () => this.addFocusRow());
        this.addPartyBtn.addEventListener('click', () => this.addPartyRow());

        // Initialize popularity settings
        this.initializePopularitySettings();

        // Add first country by default
        this.addCountry();
    }

    initializePopularitySettings() {
        // Default popularity values from the original code
        const defaultParties = [
            { name: 'syndicalist', popularity: 5.0 },
            { name: 'social_democrat', popularity: 5.0 },
            { name: 'social_liberal', popularity: 0.0 },
            { name: 'market_liberal', popularity: 0.0 },
            { name: 'social_conservative', popularity: 20.0 },
            { name: 'authoritarian_democrat', popularity: 50.0 },
            { name: 'paternal_autocrat', popularity: 10.0 },
            { name: 'national_populist', popularity: 10.0 }
        ];

        // Add default parties to table
        defaultParties.forEach(party => {
            this.addPartyRow(party.name, party.popularity);
        });

        // Initialize pie chart
        this.initializePieChart();
        this.updatePopularityDisplay();
    }

    addPartyRow(partyName = '', popularity = 0.0) {
        const row = document.createElement('tr');
        const partyId = Date.now() + Math.random(); // Unique ID for each row
        
        row.innerHTML = `
            <td>
                <input type="text" class="party-input" value="${partyName}" 
                       placeholder="Party name" data-party-id="${partyId}">
            </td>
            <td>
                <input type="number" class="popularity-input" value="${popularity}" 
                       min="0" max="100" step="0.1" data-party-id="${partyId}">
            </td>
            <td>
                <button type="button" class="remove-party-btn" onclick="countryFormatter.removePartyRow(this)">
                    Remove
                </button>
            </td>
        `;

        this.popularityTableBody.appendChild(row);

        // Add event listeners for real-time updates
        const partyInput = row.querySelector('.party-input');
        const popularityInput = row.querySelector('.popularity-input');
        
        partyInput.addEventListener('input', () => this.updatePopularityDisplay());
        popularityInput.addEventListener('input', () => this.updatePopularityDisplay());

        this.updatePopularityDisplay();
    }

    removePartyRow(button) {
        const row = button.closest('tr');
        row.remove();
        this.updatePopularityDisplay();
    }

    updatePopularityDisplay() {
        const parties = this.getPopularityData();
        const total = parties.reduce((sum, party) => sum + party.popularity, 0);
        
        // Update total display
        this.totalPopularitySpan.textContent = `Total: ${total.toFixed(1)}%`;
        
        // Update validation message
        const validationMessage = this.validationMessageSpan;
        if (Math.abs(total - 100) < 0.1) {
            validationMessage.textContent = '✓ Valid';
            validationMessage.className = 'validation-message valid';
        } else {
            validationMessage.textContent = `Must equal 100% (currently ${total.toFixed(1)}%)`;
            validationMessage.className = 'validation-message invalid';
        }

        // Update pie chart
        this.updatePieChart(parties);
    }

    getPopularityData() {
        const rows = this.popularityTableBody.querySelectorAll('tr');
        const parties = [];
        
        rows.forEach(row => {
            const partyInput = row.querySelector('.party-input');
            const popularityInput = row.querySelector('.popularity-input');
            
            const partyName = partyInput.value.trim();
            const popularity = parseFloat(popularityInput.value) || 0;
            
            if (partyName) {
                parties.push({
                    name: partyName,
                    popularity: popularity
                });
            }
        });
        
        return parties;
    }

    initializePieChart() {
        const ctx = document.getElementById('popularityChart').getContext('2d');
        
        this.popularityChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
                        '#4BC0C0', '#FF6384', '#36A2EB', '#FFCE56'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: false,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            padding: 8,
                            font: {
                                size: 11
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed.toFixed(1) + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    updatePieChart(parties) {
        if (!this.popularityChart) return;
        
        const validParties = parties.filter(party => party.popularity > 0);
        
        this.popularityChart.data.labels = validParties.map(party => party.name);
        this.popularityChart.data.datasets[0].data = validParties.map(party => party.popularity);
        this.popularityChart.update();
    }

    generatePopularitiesBlock() {
        const parties = this.getPopularityData();
        return parties.map(party => 
            `\t\t\t\t${party.name} = ${party.popularity.toFixed(1)}`
        ).join('\n');
    }

    addCountry() {
        const countryId = this.countryCounter++;
        const countryDiv = document.createElement('div');
        countryDiv.className = 'country-item';
        countryDiv.dataset.countryId = countryId;

        countryDiv.innerHTML = `
            <button type="button" class="remove-country" onclick="countryFormatter.removeCountry(${countryId})">&times;</button>
            <h3>Country ${countryId + 1}</h3>
            
            <div class="country-row">
                <div class="form-group">
                    <label for="countryTag_${countryId}">Target Tag:</label>
                    <input type="text" id="countryTag_${countryId}" name="countryTag_${countryId}" required>
                </div>
                <div class="form-group">
                    <label for="stateIds_${countryId}">State IDs:</label>
                    <input type="text" id="stateIds_${countryId}" name="stateIds_${countryId}" placeholder="1,2,3,4" required>
                </div>
                <div class="form-group government-name-field ${this.enableGovernmentNameCheckbox && this.enableGovernmentNameCheckbox.checked ? 'enabled' : ''}">
                    <label for="governmentName_${countryId}">Government Name:</label>
                    <input type="text" id="governmentName_${countryId}" name="governmentName_${countryId}">
                </div>
                <div class="form-group">
                    <label for="nationFullName_${countryId}">Nation Full Name:</label>
                    <input type="text" id="nationFullName_${countryId}" name="nationFullName_${countryId}" required>
                </div>
            </div>
            
            <div class="country-row leader-fields ${this.enableLeaderFieldsCheckbox && this.enableLeaderFieldsCheckbox.checked ? 'enabled' : ''}">
                <div class="form-group">
                    <label for="leaderName_${countryId}">Leader Name:</label>
                    <input type="text" id="leaderName_${countryId}" name="leaderName_${countryId}">
                </div>
                <div class="form-group">
                    <label for="leaderPortrait_${countryId}">Leader Portrait Path:</label>
                    <input type="text" id="leaderPortrait_${countryId}" name="leaderPortrait_${countryId}" placeholder="gfx/leaders/TAG/Portrait_Name.png">
                </div>
                <div class="form-group">
                    <label for="leaderIdeology_${countryId}">Leader Ideology:</label>
                    <input type="text" id="leaderIdeology_${countryId}" name="leaderIdeology_${countryId}" placeholder="absolute_monarchy_subtype">
                </div>
            </div>
        `;

        this.countriesContainer.appendChild(countryDiv);
    }

    removeCountry(countryId) {
        const countryElement = document.querySelector(`[data-country-id="${countryId}"]`);
        if (countryElement) {
            countryElement.remove();
        }
        
        // If no countries left, add one
        if (this.countriesContainer.children.length === 0) {
            this.addCountry();
        }
    }

    toggleGovernmentNameFields() {
        const governmentNameElements = document.querySelectorAll('.government-name-field');
        const isEnabled = this.enableGovernmentNameCheckbox && this.enableGovernmentNameCheckbox.checked;
        
        governmentNameElements.forEach(element => {
            if (isEnabled) {
                element.classList.add('enabled');
            } else {
                element.classList.remove('enabled');
            }
        });
    }

    toggleLeaderFields() {
        const leaderFieldsElements = document.querySelectorAll('.leader-fields');
        const isEnabled = this.enableLeaderFieldsCheckbox && this.enableLeaderFieldsCheckbox.checked;
        
        leaderFieldsElements.forEach(element => {
            if (isEnabled) {
                element.classList.add('enabled');
            } else {
                element.classList.remove('enabled');
            }
        });
    }

    toggleFullCodeGeneration() {
        const isEnabled = this.generateFullCodeCheckbox && this.generateFullCodeCheckbox.checked;
        
        if (isEnabled) {
            this.fullCodeSettings.classList.add('enabled');
            this.categoryOutputSection.style.display = 'block';
            // Initialize with some default focus IDs if empty
            if (this.focusIdsTableBody.children.length === 0) {
                this.addFocusRow('OTT_United_Once_More');
                this.addFocusRow('OTT_Egypt_Khedivate');
            }
        } else {
            this.fullCodeSettings.classList.remove('enabled');
            this.categoryOutputSection.style.display = 'none';
        }
    }

    addFocusRow(focusId = '') {
        const row = document.createElement('tr');
        const focusRowId = Date.now() + Math.random(); // Unique ID for each row
        
        row.innerHTML = `
            <td>
                <input type="text" class="focus-input" value="${focusId}" 
                       placeholder="Focus ID (e.g., OTT_United_Once_More)" data-focus-id="${focusRowId}">
            </td>
            <td>
                <button type="button" class="remove-focus-btn" onclick="countryFormatter.removeFocusRow(this)">
                    Remove
                </button>
            </td>
        `;

        this.focusIdsTableBody.appendChild(row);
    }

    removeFocusRow(button) {
        const row = button.closest('tr');
        row.remove();
    }

    getFocusIds() {
        const rows = this.focusIdsTableBody.querySelectorAll('tr');
        const focusIds = [];
        
        rows.forEach(row => {
            const focusInput = row.querySelector('.focus-input');
            const focusId = focusInput.value.trim();
            
            if (focusId) {
                focusIds.push(focusId);
            }
        });
        
        return focusIds;
    }

    generateDecisionCategoryBlock(masterTag) {
        const focusIds = this.getFocusIds();
        
        // Generate the focus conditions
        let focusConditions = '';
        if (focusIds.length > 0) {
            if (focusIds.length === 1) {
                focusConditions = `\t\thas_completed_focus = ${focusIds[0]}`;
            } else {
                focusConditions = `\t\tOR = {\n`;
                focusIds.forEach(focusId => {
                    focusConditions += `\t\t\thas_completed_focus = ${focusId}\n`;
                });
                focusConditions += `\t\t}`;
            }
        }

        const decisionCategoryBlock = `${masterTag}_great_game = {
\ticon = GFX_decision_category_foreign_policy

\tallowed = {
\t\toriginal_tag = ${masterTag}
\t}

\tvisible = { 
${focusConditions}
\t}
}`;

        return decisionCategoryBlock;
    }

    async generateOutput() {
        try {
            const masterTag = this.masterTagInput.value.trim();
            if (!masterTag) {
                alert('Please enter a master country tag');
                return;
            }

            const puppetIdeology = this.puppetIdeologyInput.value.trim();
            if (!puppetIdeology) {
                alert('Please enter a puppet ideology');
                return;
            }

            // Validate popularity settings
            const parties = this.getPopularityData();
            const total = parties.reduce((sum, party) => sum + party.popularity, 0);
            if (Math.abs(total - 100) >= 0.1) {
                alert(`Popularity settings must total 100% (currently ${total.toFixed(1)}%)`);
                return;
            }

            const countries = [];
            const countryItems = this.countriesContainer.querySelectorAll('.country-item');

            for (let item of countryItems) {
                const countryId = item.dataset.countryId;
                const country = await this.extractCountryData(countryId);
                
                if (this.validateCountryData(country)) {
                    countries.push(country);
                } else {
                    alert(`Please fill in all required fields for Country ${parseInt(countryId) + 1}`);
                    return;
                }
            }

            if (countries.length === 0) {
                alert('Please add at least one country');
                return;
            }

            const { eventCode, localization } = this.formatOutput(masterTag, puppetIdeology, countries);
            this.eventOutputTextarea.value = eventCode;
            this.localizationOutputTextarea.value = localization;
            
            // Generate category code if Generate Full Code is enabled
            if (this.generateFullCodeCheckbox && this.generateFullCodeCheckbox.checked) {
                const categoryCode = this.generateDecisionCategoryBlock(masterTag);
                this.categoryOutputTextarea.value = categoryCode;
            } else {
                this.categoryOutputTextarea.value = '';
            }
            
        } catch (error) {
            console.error('Error generating output:', error);
            alert('Error generating output. Please check your inputs.');
        }
    }

    async extractCountryData(countryId) {
        const targetTag = document.getElementById(`countryTag_${countryId}`).value.trim();
        const stateIdsStr = document.getElementById(`stateIds_${countryId}`).value.trim();
        const nationFullName = document.getElementById(`nationFullName_${countryId}`).value.trim();

        // Parse state IDs array
        let stateIds = [];
        if (stateIdsStr) {
            try {
                stateIds = stateIdsStr.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
            } catch (e) {
                throw new Error(`Invalid state IDs format for country ${countryId}`);
            }
        }

        const result = {
            targetTag,
            stateIds,
            nationFullName
        };

        // Only include government name if enabled
        if (this.enableGovernmentNameCheckbox && this.enableGovernmentNameCheckbox.checked) {
            const governmentName = document.getElementById(`governmentName_${countryId}`).value.trim();
            result.governmentName = governmentName || null;
        }

        // Only include leader data if enabled
        if (this.enableLeaderFieldsCheckbox && this.enableLeaderFieldsCheckbox.checked) {
            const leaderName = document.getElementById(`leaderName_${countryId}`).value.trim();
            const leaderPortrait = document.getElementById(`leaderPortrait_${countryId}`).value.trim();
            const leaderIdeology = document.getElementById(`leaderIdeology_${countryId}`).value.trim();
            result.leaderName = leaderName || null;
            result.leaderPortrait = leaderPortrait || null;
            result.leaderIdeology = leaderIdeology || null;
        }

        return result;
    }

    validateCountryData(country) {
        const basicValidation = country.targetTag && 
               country.stateIds.length > 0 && 
               country.nationFullName;
        
        let valid = basicValidation;
        
        // If government name is enabled, validate it too
        if (this.enableGovernmentNameCheckbox && this.enableGovernmentNameCheckbox.checked) {
            valid = valid && country.governmentName;
        }
        
        // If leader fields are enabled, validate them too
        if (this.enableLeaderFieldsCheckbox && this.enableLeaderFieldsCheckbox.checked) {
            valid = valid && country.leaderName && country.leaderPortrait && country.leaderIdeology;
        }
        
        return valid;
    }

    formatOutput(masterTag, puppetIdeology, countries) {
        const generateTexasReleaseCode = (masterTag, targetTag, stateIds, governmentName, nationFullName, leaderName, leaderPortrait, leaderIdeology) => {
            // Generate the state list for `available`
            const stateListAvailable = stateIds.map(stateId => 
                `\t\t${stateId} = { owner = { OR = { original_tag = ${masterTag} is_subject_of = ${masterTag} } } }`
            ).join('\n');

            // Generate the state list for `add_core_of`
            const stateListCore = stateIds.map(stateId => 
                `\t\t${stateId} = { add_core_of = ${targetTag} }`
            ).join('\n');

            // Build the highlight_states block
            let highlightCode = `\t\thighlight_states = {\n\t\t\thighlight_state_targets = {\n`;
            stateIds.forEach(state => {
                highlightCode += `\t\t\t\tstate = ${state}\n`;
            });
            highlightCode += `\t\t\t}\n\t\t\thighlight_color_while_active = 3\n\t\t\thighlight_color_before_active = 2\n\t\t}`;

            const eventCode = `${masterTag}_establish_rk_${targetTag} = {
\ticon = generic_prepare_civil_war

${highlightCode}

\tavailable = {
${stateListAvailable}
\t}

\tfire_only_once = yes

\tai_will_do = {
\t\tfactor = 5
\t}
\tcomplete_effect = {
\t\trelease = ${targetTag}
\t\t${targetTag} = {
\t\t\tevery_core_state = {
\t\t\t\tremove_core_of = ${targetTag}
\t\t\t}
\t\t}
${stateListCore}

\t\t${targetTag} = { 
\t\t\tevery_core_state = {
\t\t\t\tlimit = {
\t\t\t\t\tAND = {
\t\t\t\t\t\tNOT = { 
\t\t\t\t\t\t\tis_core_of = ${masterTag}
\t\t\t\t\t\t}
\t\t\t\t\t\tOR = {
\t\t\t\t\t\t\tis_owned_by = ${masterTag}
\t\t\t\t\t\t\tOWNER = { is_subject_of = ${masterTag}} 
\t\t\t\t\t\t}
\t\t\t\t\t}
\t\t\t\t}
\t\t\t\ttransfer_state_to = ${targetTag}
\t\t\t}
\t\t}
\t\t${targetTag} = { 
\t\t\tset_cosmetic_tag = OTT_${targetTag}_OCC
\t\t\tload_focus_tree = generic_focus            
${leaderName && leaderPortrait && leaderIdeology ? `
\t\t\tcreate_country_leader = {
\t\t\t\tname = "${leaderName}"
\t\t\t\tpicture = "${leaderPortrait}"
\t\t\t\texpire = "1.1.1"
\t\t\t\tideology = ${leaderIdeology}
\t\t\t\ttraits = {
\t\t\t\t}
\t\t\t}` : ''}

\t\t\tset_popularities = {
${this.generatePopularitiesBlock()}
\t\t\t}
\t\t\tset_party_name = {
\t\t\t\tideology = paternal_autocrat
\t\t\t\tname = "${governmentName}"
\t\t\t\tlong_name = "${governmentName}"
\t\t\t}
\t\t\tset_party_name = {
\t\t\t\tideology = authoritarian_democrat
\t\t\t\tname = "${governmentName}"
\t\t\t\tlong_name = "${governmentName}"
\t\t\t}

\t\t\t${masterTag} = {
\t\t\t\tset_autonomy = {
\t\t\t\t\ttarget = ${targetTag}
\t\t\t\t\tautonomous_state = kx_colored_puppet
\t\t\t\t}
\t\t\t}

\t\t\tset_politics = {
\t\t\t\truling_party = authoritarian_democrat
\t\t\t\telections_allowed = no
\t\t\t}
\t\t}
\t}
}`;

            // Localization template
            const localization = `${masterTag}_${targetTag}_OCC:0 "${nationFullName}"\n${masterTag}_establish_rk_${targetTag}:0 "Establish ${nationFullName}"`;

            return { eventCode, localization };
        };

        // Generate event code and localization for each country
        let allEventCodes = [];
        let allLocalizations = [];

                 countries.forEach(country => {
             // Use default government name if not provided
             const governmentName = country.governmentName || "Provisional Government";
             
             const { eventCode, localization } = generateTexasReleaseCode(
                 masterTag, 
                 country.targetTag, 
                 country.stateIds, 
                 governmentName, 
                 country.nationFullName,
                 country.leaderName,
                 country.leaderPortrait,
                 country.leaderIdeology
             );
             allEventCodes.push(eventCode);
             allLocalizations.push(localization);
         });

        return {
            eventCode: allEventCodes.join('\n\n'),
            localization: allLocalizations.join('\n\n')
        };
    }

    clearAll() {
        if (confirm('Are you sure you want to clear all data?')) {
            this.masterTagInput.value = '';
            this.puppetIdeologyInput.value = '';
            this.enableGovernmentNameCheckbox.checked = false;
            this.enableLeaderFieldsCheckbox.checked = false;
            this.generateFullCodeCheckbox.checked = false;
            this.countriesContainer.innerHTML = '';
            this.eventOutputTextarea.value = '';
            this.localizationOutputTextarea.value = '';
            this.categoryOutputTextarea.value = '';
            this.countryCounter = 0;
            
            // Reset popularity settings
            this.popularityTableBody.innerHTML = '';
            this.initializePopularitySettings();
            
            // Reset focus IDs
            this.focusIdsTableBody.innerHTML = '';
            this.toggleFullCodeGeneration();
            
            this.addCountry();
        }
    }

    async copyToClipboard(type) {
        try {
            let textToCopy, buttonElement;
            
            if (type === 'event') {
                textToCopy = this.eventOutputTextarea.value;
                buttonElement = this.copyEventBtn;
            } else if (type === 'category') {
                textToCopy = this.categoryOutputTextarea.value;
                buttonElement = this.copyCategoryBtn;
            } else {
                textToCopy = this.localizationOutputTextarea.value;
                buttonElement = this.copyLocalizationBtn;
            }
            
            await navigator.clipboard.writeText(textToCopy);
            
            // Show feedback
            const originalText = buttonElement.textContent;
            buttonElement.textContent = 'Copied!';
            buttonElement.style.background = '#28a745';
            
            setTimeout(() => {
                buttonElement.textContent = originalText;
                buttonElement.style.background = '';
            }, 2000);
            
        } catch (err) {
            // Fallback for older browsers
            let textareaToCopy, alertMessage;
            
            if (type === 'event') {
                textareaToCopy = this.eventOutputTextarea;
                alertMessage = 'Event code copied to clipboard!';
            } else if (type === 'category') {
                textareaToCopy = this.categoryOutputTextarea;
                alertMessage = 'Category code copied to clipboard!';
            } else {
                textareaToCopy = this.localizationOutputTextarea;
                alertMessage = 'Localization copied to clipboard!';
            }
            
            textareaToCopy.select();
            document.execCommand('copy');
            alert(alertMessage);
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.countryFormatter = new CountryFormatter();
}); 