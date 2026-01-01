class CountryFormatter {
    constructor() {
        this.countryCounter = 0;
        this.ideologyData = null;
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
        this.loadJsonBtn = document.getElementById('loadJsonBtn');
        this.jsonFileInput = document.getElementById('jsonFile');
        this.saveDataBtn = document.getElementById('saveDataBtn');
        this.loadDataBtn = document.getElementById('loadDataBtn');
        this.loadDataTextarea = document.getElementById('loadDataTextarea');
        this.loadDataFile = document.getElementById('loadDataFile');
        this.governmentNameFillField = document.getElementById('governmentNameFillField');
        this.bulkGovernmentNameInput = document.getElementById('bulkGovernmentName');
        this.bulkGovernmentIdeologyInput = document.getElementById('bulkGovernmentIdeology');
        this.fillAllGovernmentNamesBtn = document.getElementById('fillAllGovernmentNamesBtn');
        this.leaderFieldsFillField = document.getElementById('leaderFieldsFillField');
        this.bulkLeaderNameInput = document.getElementById('bulkLeaderName');
        this.bulkLeaderPortraitInput = document.getElementById('bulkLeaderPortrait');
        this.bulkLeaderIdeologyInput = document.getElementById('bulkLeaderIdeology');
        this.fillAllLeaderFieldsBtn = document.getElementById('fillAllLeaderFieldsBtn');

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
        this.loadJsonBtn.addEventListener('click', () => this.loadCountriesFromJson());
        this.fillAllGovernmentNamesBtn.addEventListener('click', () => this.fillAllGovernmentNames());
        this.fillAllLeaderFieldsBtn.addEventListener('click', () => this.fillAllLeaderFields());
        this.saveDataBtn.addEventListener('click', () => this.saveFormData());
        this.loadDataBtn.addEventListener('click', () => this.loadFormData());

        // Initialize popularity settings
        this.initializePopularitySettings();

        // Load ideology data and initialize Select2
        this.loadIdeologyData();
        this.initializeBulkLeaderIdeologySelect();

        // Initialize field visibility
        this.toggleGovernmentNameFields();
        this.toggleLeaderFields();

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
                       min="0" max="100" step="1" data-party-id="${partyId}">
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

        // Destroy existing chart if it exists
        if (this.popularityChart) {
            this.popularityChart.destroy();
        }

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
            `\t\t\t\t${party.name} = ${Math.round(party.popularity)}`
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

            <div class="info-section country-info-section enabled">
                <h4>Country Info</h4>
                <div class="country-row">
                    <div class="form-group">
                        <label for="countryTag_${countryId}">Target Tag:</label>
                        <input type="text" id="countryTag_${countryId}" name="countryTag_${countryId}" required>
                    </div>
                    <div class="form-group">
                        <label for="nationFullName_${countryId}">Nation Full Name:</label>
                        <input type="text" id="nationFullName_${countryId}" name="nationFullName_${countryId}" required>
                    </div>
                    <div class="form-group">
                        <label for="stateIds_${countryId}">State Core IDs:</label>
                        <input type="text" id="stateIds_${countryId}" name="stateIds_${countryId}" placeholder="1,2,3,4" required>
                    </div>
                    <div class="form-group required-states-container">
                        <div class="state-ids-with-checkbox">
                            <label for="requiredStateIds_${countryId}">Required State IDs:</label>
                            <input type="text" id="requiredStateIds_${countryId}" name="requiredStateIds_${countryId}" placeholder="5,6,7,8" required>
                            <label class="checkbox-label">
                                <input type="checkbox" id="useOrForRequired_${countryId}" name="useOrForRequired_${countryId}">
                                Use OR block
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div class="info-section government-info-section ${this.enableGovernmentNameCheckbox && this.enableGovernmentNameCheckbox.checked ? 'enabled' : ''}">
                <h4>Government Info</h4>
                <div class="country-row">
                    <div class="form-group">
                        <label for="governmentName_${countryId}">Government Name:</label>
                        <input type="text" id="governmentName_${countryId}" name="governmentName_${countryId}">
                    </div>
                    <div class="form-group">
                        <label for="governmentIdeology_${countryId}">Government Ideology:</label>
                        <select id="governmentIdeology_${countryId}" name="governmentIdeology_${countryId}">
                            <option value="">Select Ideology</option>
                            <option value="totalist">Totalist</option>
                            <option value="syndicalist">Syndicalist</option>
                            <option value="radical_socialist">Radical Socialist</option>
                            <option value="social_democrat">Social Democrat</option>
                            <option value="social_liberal">Social Liberal</option>
                            <option value="market_liberal">Market Liberal</option>
                            <option value="social_conservative">Social Conservative</option>
                            <option value="authoritarian_democrat">Authoritarian Democrat</option>
                            <option value="paternal_autocrat">Paternal Autocrat</option>
                            <option value="national_populist">National Populist</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="info-section leader-info-section ${this.enableLeaderFieldsCheckbox && this.enableLeaderFieldsCheckbox.checked ? 'enabled' : ''}">
                <h4>Leader Info</h4>
                <div class="country-row">
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
                        <select id="leaderIdeology_${countryId}" name="leaderIdeology_${countryId}" style="width: 100%;">
                            <option value="">Select Ideology</option>
                        </select>
                    </div>
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
        const governmentInfoSections = document.querySelectorAll('.government-info-section');
        const isEnabled = this.enableGovernmentNameCheckbox && this.enableGovernmentNameCheckbox.checked;

        governmentInfoSections.forEach(section => {
            if (isEnabled) {
                section.classList.add('enabled');
            } else {
                section.classList.remove('enabled');
            }
        });

        // Show/hide the fill field
        if (this.governmentNameFillField) {
            this.governmentNameFillField.style.display = isEnabled ? 'flex' : 'none';
        }
    }

    toggleLeaderFields() {
        const leaderInfoSections = document.querySelectorAll('.leader-info-section');
        const isEnabled = this.enableLeaderFieldsCheckbox && this.enableLeaderFieldsCheckbox.checked;

        leaderInfoSections.forEach(section => {
            if (isEnabled) {
                section.classList.add('enabled');
            } else {
                section.classList.remove('enabled');
            }
        });

        // Show/hide the fill field
        if (this.leaderFieldsFillField) {
            this.leaderFieldsFillField.style.display = isEnabled ? 'flex' : 'none';
        }
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
        const requiredStateIdsStr = document.getElementById(`requiredStateIds_${countryId}`).value.trim();
        const nationFullName = document.getElementById(`nationFullName_${countryId}`).value.trim();

        // Parse claim state IDs array
        let claimStates = [];
        if (stateIdsStr) {
            try {
                claimStates = stateIdsStr.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
            } catch (e) {
                throw new Error(`Invalid claim state IDs format for country ${countryId}`);
            }
        }

        // Parse required state IDs array (core states)
        let coreStates = [];
        if (requiredStateIdsStr) {
            try {
                coreStates = requiredStateIdsStr.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
            } catch (e) {
                throw new Error(`Invalid required state IDs format for country ${countryId}`);
            }
        }

        const useOrForRequired = document.getElementById(`useOrForRequired_${countryId}`).checked;

        const result = {
            targetTag,
            claimStates,
            coreStates,
            nationFullName,
            useOrForRequired
        };

        // Only include government data if enabled
        if (this.enableGovernmentNameCheckbox && this.enableGovernmentNameCheckbox.checked) {
            const governmentName = document.getElementById(`governmentName_${countryId}`).value.trim();
            const governmentIdeology = document.getElementById(`governmentIdeology_${countryId}`).value.trim();
            result.governmentName = governmentName || null;
            result.governmentIdeology = governmentIdeology || null;
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
               country.claimStates.length > 0 &&
               country.coreStates.length > 0 &&
               country.nationFullName;

        let valid = basicValidation;
        
        // If government name is enabled, validate it too
        if (this.enableGovernmentNameCheckbox && this.enableGovernmentNameCheckbox.checked) {
            valid = valid && country.governmentName && country.governmentIdeology;
        }
        
        // If leader fields are enabled, validate them too
        if (this.enableLeaderFieldsCheckbox && this.enableLeaderFieldsCheckbox.checked) {
            valid = valid && country.leaderName && country.leaderPortrait && country.leaderIdeology;
        }
        
        return valid;
    }

    formatOutput(masterTag, puppetIdeology, countries) {
        const generateNewReleaseCode = (masterTag, targetTag, claimStates, coreStates, governmentName, governmentIdeology, nationFullName, leaderName, leaderPortrait, leaderIdeology, useOrForRequired, puppetIdeology, enableGovernmentName) => {
            // Generate highlight_states using core states
            let highlightCode = `\t\thighlight_states = {\n\t\t\thighlight_state_targets = {\n`;
            coreStates.forEach(state => {
                highlightCode += `\t\t\t\tstate = ${state}\n`;
            });
            highlightCode += `\t\t\t}\n\t\t\thighlight_color_while_active = 3\n\t\t\thighlight_color_before_active = 2\n\t\t}`;

            // Generate available conditions using core states (owner check)
            let availableOwnerChecks;
            if (useOrForRequired) {
                availableOwnerChecks = `\t\tOR = {\n${coreStates.map(state =>
                    `\t\t\t${state} = { owner = { OR = { original_tag = ${masterTag} is_subject_of = ${masterTag} } } }`
                ).join('\n')}\n\t\t}`;
            } else {
                availableOwnerChecks = coreStates.map(state =>
                    `\t\t${state} = { owner = { OR = { original_tag = ${masterTag} is_subject_of = ${masterTag} } } }`
                ).join('\n');
            }

            // Generate available conditions using core states (NOT is_core_of check)
            const availableCoreChecks = coreStates.map(state =>
                `\t\t\t\t${state} = { NOT = { is_core_of = ${masterTag} } }`
            ).join('\n');

            // Generate add_core_of using both claim states and core states (combined and deduplicated)
            const allStatesForCores = [...new Set([...claimStates, ...coreStates])]; // Combine and deduplicate
            const addCoreBlocks = allStatesForCores.map(state =>
                `\t\t${state} = { add_core_of = ${targetTag} }`
            ).join('\n');

            const eventCode = `${masterTag}_establish_rk_${targetTag} = {
\ticon = generic_prepare_civil_war

${highlightCode}

\tavailable = {
\t\tif = {
\t\t\tlimit = {
\t\t\t\t${targetTag} = { exists = yes }
\t\t\t}
\t\t\t${targetTag} = { is_subject_of = ${masterTag} }
\t\t}
${availableOwnerChecks}
\t\tOR = {
${availableCoreChecks}
\t\t}
\t}

\tfire_only_once = yes

\tai_will_do = {
\t\tfactor = 5
\t}
\tcomplete_effect = {
\t\t${targetTag} = {
\t\t\tevery_core_state = {
\t\t\t\tremove_core_of = ${targetTag}
\t\t\t}
\t\t\tevery_state = {
\t\t\t\tlimit = {
\t\t\t\t\tis_claimed_by = ${targetTag}
\t\t\t\t}
\t\t\t\tremove_claim_by = ${targetTag}
\t\t\t}
\t\t}
${addCoreBlocks}
\t\trelease = ${targetTag}
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
\t\t\tset_cosmetic_tag = ${masterTag}_${targetTag}_OCC
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
${enableGovernmentName ? `\t\t\tset_party_name = {
\t\t\t\tideology = ${governmentIdeology || 'paternal_autocrat'}
\t\t\t\tname = "${governmentName}"
\t\t\t\tlong_name = "${governmentName}"
\t\t\t}` : ''}

\t\t\t${masterTag} = {
\t\t\t\tset_autonomy = {
\t\t\t\t\ttarget = ${targetTag}
\t\t\t\t\tautonomous_state = kx_colored_puppet
\t\t\t\t}
\t\t\t}

\t\t\tset_politics = {
\t\t\t\truling_party = ${puppetIdeology}
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
             
             const { eventCode, localization } = generateNewReleaseCode(
                 masterTag,
                 country.targetTag,
                 country.claimStates,
                 country.coreStates,
                 governmentName,
                 country.governmentIdeology,
                 country.nationFullName,
                 country.leaderName,
                 country.leaderPortrait,
                 country.leaderIdeology,
                 country.useOrForRequired,
                 puppetIdeology,
                 this.enableGovernmentNameCheckbox.checked
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
            if (this.puppetIdeologyInput) this.puppetIdeologyInput.value = '';
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

    async loadCountriesFromJson() {
        try {
            const fileInput = this.jsonFileInput;
            if (!fileInput.files || fileInput.files.length === 0) {
                alert('Please select a JSON file first');
                return;
            }

            const file = fileInput.files[0];
            const text = await file.text();
            const countriesData = JSON.parse(text);

            if (!Array.isArray(countriesData)) {
                alert('Invalid JSON format. Expected an array of country objects.');
                return;
            }

            // Clear existing countries
            this.countriesContainer.innerHTML = '';

            // Add countries from JSON
            countriesData.forEach(countryData => {
                this.addCountryFromJson(countryData);
            });

            alert(`Loaded ${countriesData.length} countries from JSON file`);

        } catch (error) {
            console.error('Error loading JSON:', error);
            alert('Error loading JSON file. Please check the file format.');
        }
    }

    addCountryFromJson(countryData) {
        const countryId = this.countryCounter++;
        const countryDiv = document.createElement('div');
        countryDiv.className = 'country-item';
        countryDiv.dataset.countryId = countryId;

        // Format state arrays as comma-separated strings
        const claimStatesStr = (countryData.claim_state || []).join(', ');
        const coreStatesStr = (countryData.core_state || []).join(', ');

        countryDiv.innerHTML = `
            <button type="button" class="remove-country" onclick="countryFormatter.removeCountry(${countryId})">&times;</button>
            <h3>Country ${countryId + 1}</h3>

            <div class="info-section country-info-section enabled">
                <h4>Country Info</h4>
                <div class="country-row">
                    <div class="form-group">
                        <label for="countryTag_${countryId}">Target Tag:</label>
                        <input type="text" id="countryTag_${countryId}" name="countryTag_${countryId}" value="${countryData.tag || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="nationFullName_${countryId}">Nation Full Name:</label>
                        <input type="text" id="nationFullName_${countryId}" name="nationFullName_${countryId}" required>
                    </div>
                    <div class="form-group">
                        <label for="stateIds_${countryId}">State Core IDs:</label>
                        <input type="text" id="stateIds_${countryId}" name="stateIds_${countryId}" value="${claimStatesStr}" placeholder="1,2,3,4" required>
                    </div>
                    <div class="form-group required-states-container">
                        <div class="state-ids-with-checkbox">
                            <label for="requiredStateIds_${countryId}">Required State IDs:</label>
                            <input type="text" id="requiredStateIds_${countryId}" name="requiredStateIds_${countryId}" value="${coreStatesStr}" placeholder="5,6,7,8" required>
                            <label class="checkbox-label">
                                <input type="checkbox" id="useOrForRequired_${countryId}" name="useOrForRequired_${countryId}">
                                Use OR block
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div class="info-section government-info-section ${this.enableGovernmentNameCheckbox && this.enableGovernmentNameCheckbox.checked ? 'enabled' : ''}">
                <h4>Government Info</h4>
                <div class="country-row">
                    <div class="form-group">
                        <label for="governmentName_${countryId}">Government Name:</label>
                        <input type="text" id="governmentName_${countryId}" name="governmentName_${countryId}">
                    </div>
                    <div class="form-group">
                        <label for="governmentIdeology_${countryId}">Government Ideology:</label>
                        <select id="governmentIdeology_${countryId}" name="governmentIdeology_${countryId}">
                            <option value="">Select Ideology</option>
                            <option value="totalist">Totalist</option>
                            <option value="syndicalist">Syndicalist</option>
                            <option value="radical_socialist">Radical Socialist</option>
                            <option value="social_democrat">Social Democrat</option>
                            <option value="social_liberal">Social Liberal</option>
                            <option value="market_liberal">Market Liberal</option>
                            <option value="social_conservative">Social Conservative</option>
                            <option value="authoritarian_democrat">Authoritarian Democrat</option>
                            <option value="paternal_autocrat">Paternal Autocrat</option>
                            <option value="national_populist">National Populist</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="info-section leader-info-section ${this.enableLeaderFieldsCheckbox && this.enableLeaderFieldsCheckbox.checked ? 'enabled' : ''}">
                <h4>Leader Info</h4>
                <div class="country-row">
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
                        <select id="leaderIdeology_${countryId}" name="leaderIdeology_${countryId}" style="width: 100%;">
                            <option value="">Select Ideology</option>
                        </select>
                    </div>
                </div>
            </div>
        `;

        this.countriesContainer.appendChild(countryDiv);

        // Initialize Select2 for the new leader ideology select
        this.initializeLeaderIdeologySelect(countryId);
    }

    loadIdeologyData() {
        // Embedded ideology data to avoid CORS issues with local file access
        this.ideologyData = [{
            "totalist": ["totalist_subtype","natsynd_subtype","authcom_subtype","sorelianism_subtype","national_communism_subtype","technocratic_socialism_subtype","georgian_socialism_subtype","mladorossi_subtype","autocratic_socialist_subtype","red_junta_subtype","caponism_subtype","juche_subtype","molotovism_subtype","obammunism_subtype","esoteric_leninism_subtype","tot_afrofuture_subtype","left_townerism_subtype","popcom_subtype","tot_left_panafricanism_subtype","tot_authentice_subtype","jacobinism_subtype","hoxhaism_subtype","ultra_hoxhaism_subtype","tot_paneuropeanism_subtype","totalist_savinkovism_subtype","heat_miserism_subtype","commie_elfism_subtype","fitzhughism_subtype","social_futurism_subtype","militant_atheism_subtype","technocracy_subtype","maximato_subtype","tot_developing_leftism_subtype","richytskyi_thought_subtype","anarcho_pastoralism_subtype","tot_tridemism_subtype","tot_leftcraftism_subtype","hardliner_bolshevism_subtype","red_ustase_subtype","tot_mexicayotlism_subtype","tot_kadroism_subtype","socialist_security_state_subtype","william_foster_thought_subtype","anarcho_bolshevism_subtype","pan_somalism_subtype","lovestoneism_subtype","volkisch_communitarianism_subtype","internationalism_subtype","corn_communism_subtype","tot_right_panafricanism_subtype","machiavellian_socialism_subtype","burnhamite_thought_subtype","tot_anarcho_communism_subtype","comrades_coast_subtype","tot_illegalism_subtype","tot_red_cossack_dictatorship_subtype","tot_islamic_socialism_subtype","socialist_feminism_subtype","neo_socialism_subtype","tot_bahai_universalism_subtype","broad_communism_subtype","tot_negritude_subtype","tot_noirism_subtype","mariateguismo_subtype","bordigism_subtype","christian_communism_subtype","tot_italian_left_futurism_subtype","tot_reformed_natsynd_subtype","massimalismo_subtype","tot_social_credit_subtype","tot_nkrumaism_subtype","tot_kleptocracy_subtype","national_jacobinism_subtype","tot_agrarian_socialism_subtype","tot_market_socialist_subtype","tot_bukharinist_subtype","tot_euro_panafricanism_subtype","tot_left_nationalism_subtype","british_maximism_subtype","left_boulangism_subtype","zinovievism_subtype","council_communism_subtype","peasant_charterism_subtype","waisi_movement_subtype","evidentist_technocracy_subtype","arab_ihya_subtype","lindholmism_subtype","tot_clientelism_subtype","cargo_cult_subtype","tot_macianismo_subtype","tot_matswanism_subtype"],
            "syndicalist": ["syndicalist_subtype","anarcho_syndicalist_subtype","feminist_syndicalist_subtype","syn_afrofuture_subtype","syn_left_panafricanism_subtype","syn_fascism_subtype","african_syndicalism_subtype","liberalized_syndicalism_subtype","centralized_syndicalism_subtype","democratic_syndicalism_subtype","agrarian_syndicalism_subtype","de_leonism_subtype","syn_georgism_subtype","eco_syndicalism_subtype","syn_developing_leftism_subtype","esperanto_syndicalism_subtype","syn_mexicayotlism_subtype","syn_islamic_socialism_subtype","syn_buddhist_socialism_subtype","syn_internationalism_subtype","syn_esoteric_leninism_subtype","syn_cowboy_communalism_subtype","syn_comrades_coast_subtype","syn_kleptocracy_subtype","syn_illegalism_subtype","syn_caponism_subtype","syn_noirism_subtype","syn_bahai_universalism_subtype","syn_negritude_subtype","syn_mariateguismo_subtype","christian_syndicalism_subtype","reformed_natsynd_subtype","syn_nkrumaism_subtype","modernismo_nicaraguense_subtype","syn_radical_progressivism_subtype","syn_euro_panafricanism_subtype","syn_tridemism_subtype","syn_anarchism_subtype","syn_left_nationalism_subtype","syn_teetotalism_subtype","yellow_syndicalism_subtype","syn_kotahitanga_subtype","aboriginal_garveyism_subtype","syn_gandhism_subtype","syn_anarcho_communism_subtype","libertarian_possibilism_subtype","anarcho_abertzalism_subtype","syn_sandinismo_subtype","syn_utopian_technocracy_subtype","syn_broad_communism_subtype","syn_popcom_subtype","syn_council_communism_subtype","syn_matswanism_subtype","syn_guild_socialism_subtype","anthropophagic_movement_subtype","syn_technocratic_socialism_subtype","syn_mutualism_subtype","syn_individualist_anarchism_subtype","syn_clientelism_subtype","syn_bukharinist_subtype","syn_italian_left_futurism_subtype","syn_hardliner_bolshevism_subtype","syn_revolutionary_bolivarianism_subtype","syn_police_state_subtype"],
            "radical_socialist": ["radical_socialist_subtype","christian_socialism_subtype","anarchism_subtype","agrarian_socialism_subtype","monsoc_subtype","moderate_socialist_subtype","market_socialist_subtype","fascism_subtype","radical_progressivism_subtype","radsoc_left_panafricanism_subtype","radsoc_kimbanguism_subtype","radsoc_austromarxism_subtype","alcoholism_subtype","radsoc_red_junta_subtype","radsoc_anarcho_syndicalist_subtype","illegalism_subtype","moderate_obammunism_subtype","radsoc_communism_subtype","radsoc_national_communism_subtype","zhdanovism_subtype","radsoc_tridemism_subtype","left_eurasianism_subtype","bellamyism_subtype","eco_anarchism_subtype","sandinismo_subtype","left_nationalism_subtype","apartheid_socialism_subtype","radsoc_indigenous_communitarianism_subtype","developing_leftism_subtype","mexicayotlism_subtype","leftcraftism_subtype","narodism_subtype","utopian_technocracy_subtype","quaker_socialism_subtype","radsoc_popular_patriotism_subtype","islamic_socialism_subtype","buddhist_socialism_subtype","radsoc_pan_somalism_subtype","eco_socialism_subtype","frontier_socialism_subtype","social_hiveism_subtype","bukharinist_subtype","radsoc_hoahaoism_subtype","radsoc_coconut_subtype","radsoc_internationalism_subtype","radsoc_caodaism_subtype","radsoc_esoteric_leninism_subtype","radsoc_machiavellian_socialism_subtype","cowboy_communalism_subtype","anarcho_communism_subtype","radsoc_comrades_coast_subtype","radsoc_popcom_subtype","radsoc_kleptocracy_subtype","radsoc_caponism_subtype","red_cossack_dictatorship_subtype","radsoc_socialist_feminism_subtype","radsoc_revisionist_marxism_subtype","bahai_universalism_subtype","negritude_subtype","radsoc_noirism_subtype","radsoc_mariateguismo_subtype","radsoc_liberal_socialism_subtype","christian_anarchism_subtype","radsoc_georgism_subtype","italian_left_futurism_subtype","radsoc_colonial_govt_subtype","radsoc_de_leonism_subtype","radsoc_humanistic_capitalism_subtype","radsoc_social_credit_subtype","jermanism_subtype","nkrumaism_subtype","vardamanism_subtype","radsoc_paneuropeanism_subtype","gandhism_subtype","market_leninism_subtype","soltangalievism_subtype","euro_panafricanism_subtype","revolutionary_bolivarianism_subtype","radsoc_clientelism_subtype","radsoc_paternal_socialism_subtype","radsoc_yellow_syndicalism_subtype","left_carlism_subtype","radsoc_syndicalist_subtype","radsoc_jeffersonianism_subtype","radsoc_kritarchy_subtype","laborismo_esperantista_subtype","radsoc_council_communism_subtype","matswanism_subtype","francoism_subtype","radsoc_guild_socialism_subtype","saavedrista_republicanism_subtype","mutualism_subtype","individualist_anarchism_subtype","radsoc_cargo_cult_subtype","radsoc_macianismo_subtype","malthusianism_subtype"],
            "social_democrat": ["social_democrat_subtype","syndie_social_democrat_subtype","marechal_democracy_subtype","socdem_true_whigs_subtype","socdem_warlordism_subtype","socdem_democratic_socialism_subtype","socdem_longism_subtype","socdem_radical_progressivism_subtype","socdem_left_panafricanism_subtype","socdem_republican_panafricanism_subtype","socdem_fascism_subtype","austromarxism_subtype","democratic_hussitism_subtype","socdem_jadidism_subtype","socdem_tridemism_subtype","santaism_subtype","wholesome_grinchism_subtype","georgism_subtype","socdem_dixiecrat_subtype","socdem_junta_subtype","socdem_left_nationalism_subtype","socdem_agrarianism_subtype","indigenous_communitarianism_subtype","socdem_developing_leftism_subtype","socdem_christian_socialism_subtype","figuerismo_subtype","socdem_colonial_govt_subtype","socdem_vlasovism_subtype","socdem_narodism_subtype","popular_patriotism_subtype","socdem_bonapartism_subtype","socdem_sandinismo_subtype","socdem_mexicayotlism_subtype","socdem_humanistic_capitalism_subtype","socdem_paternal_socialism_subtype","socdem_utopian_technocracy_subtype","socdem_reformed_belgicism_subtype","teetotalism_subtype","socdem_islamic_socialism_subtype","socdem_buddhist_socialism_subtype","socdem_pan_somalism_subtype","socdem_islamism_subtype","socdem_clientelism_subtype","socdem_kleptocracy_subtype","socdem_tribal_councilism_subtype","socdem_jeffersonianism_subtype","socdem_mercenary_democracy_subtype","socdem_mladorossi_subtype","socdem_coconut_subtype","socdem_internationalism_subtype","socdem_esoteric_leninism_subtype","sardism_subtype","socdem_pharaonism_subtype","socdem_cowboy_communalism_subtype","socdem_illegalism_subtype","socdem_crime_syndicate_subtype","socdem_cossack_democracy_subtype","socdem_progressive_conservatism_subtype","socdem_spiritualism_subtype","socdem_market_socialist_subtype","socdem_kimbanguism_subtype","revisionist_marxism_subtype","socdem_negritude_subtype","scandinavism_subtype","liberal_socialism_subtype","concretismo_subtype","socdem_liberalized_syndicalism_subtype","socdem_jermanism_subtype","socdem_national_progressivism_subtype","socdem_bahai_universalism_subtype","socdem_gandhism_subtype","socdem_burkhanism_subtype","socdem_euro_panafricanism_subtype","socdem_socialist_feminism_subtype","authoritarian_social_democracy_subtype","lenschian_tendency_subtype","langism_subtype","chinese_federalism_subtype","socdem_normal_dixiecrat_subtype","socdem_iberian_federalism_subtype","socdem_paneuropeanism_subtype","batllismo_subtype","socdem_venizelism_subtype","nordic_model_subtype","socdem_christian_democracy_subtype","guild_socialism_subtype","calderonismo_subtype","spiritual_socialism_subtype","socdem_waisi_movement_subtype","janismo_subtype","socdem_apartheid_socialism_subtype","socdem_individualist_anarchism_subtype","socdem_lerrouxismo_subtype","macianismo_subtype","socdem_left_social_credit_subtype","socdem_eco_socialism_subtype"],
            "social_liberal": ["social_liberal_subtype","centrist_subtype","soclib_agrarianism_subtype","soclib_true_whigs_subtype","soclib_warlordism_subtype","soclib_longism_subtype","soclib_republican_panafricanism_subtype","national_socialism_subtype","paneuropeanism_subtype","kerenskyism_subtype","national_liberalism_subtype","radical_liberalism_subtype","jadidism_subtype","soclib_tridemism_subtype","mccarthyism_subtype","soclib_indigenous_communitarianism_subtype","soclib_tribal_councilism_subtype","meritocratic_liberalism_subtype","soclib_colonial_govt_subtype","soclib_narodism_subtype","classical_liberalism_subtype","soclib_kimbanguism_subtype","soclib_humanistic_capitalism_subtype","soclib_dixiecrat_subtype","soclib_pan_somalism_subtype","soclib_islamism_subtype","soclib_jacksonianism_subtype","jeffersonianism_subtype","soclib_christian_democracy_subtype","soclib_kotahitanga_subtype","soclib_progressive_democracy_subtype","soclib_sardism_subtype","pharaonism_subtype","regionalism_subtype","soclib_spiritualism_subtype","soclib_crime_syndicate_subtype","soclib_cossack_democracy_subtype","soclib_popular_patriotism_subtype","soclib_authoritarian_liberalism_subtype","soclib_noirism_subtype","soclib_scandinavism_subtype","mazzinianesimo_subtype","soclib_liberal_socialism_subtype","soclib_radical_progressivism_subtype","soclib_teetotalism_subtype","national_progressivism_subtype","soclib_utopian_technocracy_subtype","soclib_burkhanism_subtype","soclib_euro_panafricanism_subtype","cultural_mannism_subtype","soclib_christian_socialism_subtype","soclib_reformed_belgicism_subtype","soclib_internationalism_subtype","kritarchy_subtype","jindyworobak_subtype","soclib_aboriginal_garveyism_subtype","soclib_chinese_federalism_subtype","managerial_technicracy_subtype","soclib_blasquismo_subtype","lerrouxismo_subtype","soclib_sicilianism_subtype","soclib_liberal_feminism_subtype","soclib_liberal_conservative_subtype","soclib_normal_dixiecrat_subtype","socialist_federalism_subtype","soclib_georgism_subtype","community_movement_subtype","laurentism_subtype","soclib_oligarchy_subtype","venizelism_subtype","bernardismo_subtype","mambu_theology_subtype","soclib_social_credit_subtype","soclib_right_georgism_subtype","soclib_clientelism_subtype"],
            "market_liberal": ["market_liberal_subtype","free_market_capitalist_subtype","libertarian_subtype","ancap_subtype","marlib_agrarianism_subtype","marlib_true_whigs_subtype","marlib_warlordism_subtype","liberal_conservative_subtype","marlib_republican_panafricanism_subtype","marlib_national_liberalism_subtype","marlib_jadidism_subtype","marlib_crime_syndicate_subtype","pan_asianism_subtype","tribal_councilism_subtype","marlib_colonial_govt_subtype","humanistic_capitalism_subtype","progressive_democracy_subtype","marlib_classical_liberalism_subtype","marlib_centrist_subtype","marlib_reformed_belgicism_subtype","marlib_pan_somalism_subtype","marlib_islamism_subtype","marlib_hamiltonianism_subtype","mercenary_democracy_subtype","marlib_kotahitanga_subtype","marlib_police_state_subtype","marlib_pharaonism_subtype","marlib_jeffersonianism_subtype","marlib_christian_democracy_subtype","marlib_dixiecrat_subtype","marlib_populist_dixiecrat_subtype","minarchism_subtype","right_georgism_subtype","objectivism_subtype","marlib_toryism_subtype","marlib_authoritarian_liberalism_subtype","marlib_kemalism_subtype","marlib_paneuropeanism_subtype","marlib_scandinavism_subtype","liberalism_spirit_subtype","marlib_qualunquismo_subtype","marlib_radical_liberalism_subtype","marlib_oligarchy_subtype","weberian_liberalism_subtype","marlib_kritarchy_subtype","futuriblesisme_subtype","enlightened_conservatism_subtype","marlib_tridemism_subtype","marlib_kleptocracy_subtype","blasquismo_subtype","marlib_lerrouxismo_subtype","marlib_internationalism_subtype","marlib_whiggism_subtype","liberal_feminism_subtype","marlib_radical_progressivism_subtype","marlib_venizelism_subtype","marlib_clientelism_subtype","marlib_flemish_nationalism_subtype","nupela_pasin_subtype","marlib_popular_patriotism_subtype"],
            "social_conservative": ["social_conservative_subtype","moderate_authoritarianism_subtype","christian_democracy_subtype","soccon_agrarianism_subtype","soccon_true_whigs_subtype","soccon_warlordism_subtype","soccon_longism_subtype","soccon_republican_panafricanism_subtype","soccon_kimbanguism_subtype","conservative_populism_subtype","soccon_jadidism_subtype","dixiecrat_subtype","national_conservative_subtype","paternal_socialism_subtype","soccon_ukrainian_conservatism_subtype","soccon_bonapartism_subtype","soccon_tribal_chiefdom_subtype","clientelism_subtype","soccon_colonial_govt_subtype","christian_technocracy_subtype","soccon_oligarchy_subtype","toryism_subtype","soccon_pan_somalism_subtype","soccon_islamism_subtype","whiggism_subtype","soccon_mercenary_democracy_subtype","soccon_neo_feudalism_subtype","neo_confucianism_subtype","soccon_coconut_subtype","soccon_generic_national_democracy_subtype","optimal_system_subtype","soccon_hamiltonianism_subtype","progressive_conservatism_subtype","soccon_cossack_democracy_subtype","soccon_spiritualism_subtype","soccon_maurrassism_subtype","soccon_gaullism_subtype","soccon_scandinavism_subtype","popularism_subtype","pelleyism_subtype","soccon_occultism_subtype","soccon_theosophy_subtype","qadhimism_subtype","soccon_synarchism_subtype","soccon_euro_panafricanism_subtype","costa_rican_nationalism_subtype","soccon_paneuropeanism_subtype","soccon_reformed_belgicism_subtype","soccon_prussian_constitutionalism_subtype","soccon_negritude_subtype","humanisme_integral_subtype","soccon_tridemism_subtype","soccon_liberal_conservative_subtype","soccon_right_georgism_subtype","noucentisme_subtype","iberian_federalism_subtype","soccon_maurism_subtype","soccon_populist_dixiecrat_subtype","soccon_popular_patriotism_subtype","herrerismo_subtype","conservative_feminism_subtype","soccon_chosid_nyi_subtype","soccon_ulmanism_subtype","castilhismo_subtype","soccon_progressive_democracy_subtype","sidonismo_subtype","soccon_nupela_pasin_subtype","soccon_kritarchy_subtype","soccon_imaginism_subtype","soccon_hilozoismo_subtype"],
            "authoritarian_democrat": ["authoritarian_democrat_subtype","autdem_christian_democracy_subtype","longism_subtype","authdem_junta_subtype","oligarchy_subtype","prussian_constitutionalism_subtype","colonial_govt_subtype","authdem_warlordism_subtype","authdem_cossack_subtype","eurasianism_subtype","authdem_republican_panafricanism_subtype","authdem_right_panafricanism_subtype","authdem_kimbanguism_subtype","police_state_subtype","national_democracy_subtype","czech_national_democracy_subtype","authoritarian_liberalism_subtype","authdem_tridemism_subtype","kemalism_subtype","social_machine_subtype","authdem_pan_asianism_subtype","ukrainian_conservatism_subtype","authdem_bonapartism_subtype","authdem_boer_nationalism_subtype","tribal_chiefdom_subtype","vlasovism_subtype","washingtonism_subtype","authdem_caudillo_populism_subtype","authdem_revolution_nationale_subtype","authdem_toryism_subtype","authdem_bolivarianism_subtype","authdem_agrarianism_subtype","authdem_pan_somalism_subtype","islamism_subtype","hamiltonianism_subtype","authdem_jacksonianism_subtype","authdem_austropopulism_subtype","authdem_social_credit_subtype","authdem_pirate_republic_subtype","authdem_diemism_subtype","authdem_coconut_subtype","authdem_mercenary_democracy_subtype","authdem_national_conservative_subtype","roerichism_subtype","generic_national_democracy_subtype","social_nationalism_subtype","authdem_monsoc_subtype","authdem_cossack_democracy_subtype","authdem_spiritualism_subtype","security_state_subtype","authdem_gaullism_subtype","authdem_theosophy_subtype","authdem_scandinavism_subtype","qualunquismo_subtype","authdem_corporatocracy_subtype","authdem_rocquisme_subtype","authdem_pelleyism_subtype","hearstian_democracy_subtype","authdem_occultism_subtype","authdem_qadhimism_subtype","authdem_burkhanism_subtype","authdem_savinkovism_subtype","cariato_subtype","authdem_kritarchy_subtype","authdem_poujadisme_subtype","rejuvenated_prussianism_subtype","authdem_noucentisme_subtype","maurism_subtype","authdem_solidarism_subtype","authdem_iberian_federalism_subtype","authdem_red_tinted_autocracy_subtype","peronism_subtype","authdem_conservative_feminism_subtype","authdem_chosid_nyi_subtype","authdem_christian_crusade_subtype","authdem_kleptocracy_subtype","authdem_right_syndicalism_subtype","estado_novo_subtype","antarctic_expedition_subtype","gustavianism_subtype","authdem_flemish_nationalism_subtype","yali_gurek_theology_subtype","authdem_dixiecrat_subtype","authdem_populist_dixiecrat_subtype","authdem_right_technocracy_subtype","authdem_right_georgism_subtype","authdem_carlism_subtype","authdem_integrism_subtype"],
            "paternal_autocrat": ["paternal_autocrat_subtype","junta_subtype","theocracy_subtype","absolute_monarchy_subtype","red_tinted_autocracy_subtype","corporatocracy_subtype","pataut_ancap_subtype","jacksonianism_subtype","autocratic_colonial_govt_subtype","pataut_warlordism_subtype","pataut_cossack_subtype","neo_feudalism_subtype","pataut_afrofuture_subtype","kleptocracy_subtype","pataut_longism_subtype","pataut_right_panafricanism_subtype","pataut_kimbanguism_subtype","crime_syndicate_subtype","pataut_christian_democracy_subtype","hussitism_subtype","snow_miserism_subtype","grinchism_subtype","pataut_authoritarian_liberalism_subtype","pataut_pan_asianism_subtype","pataut_ukrainian_conservatism_subtype","pataut_bonapartism_subtype","pataut_boer_nationalism_subtype","caudillo_populism_subtype","pataut_tribal_chiefdom_subtype","pataut_baltic_christianity_subtype","pataut_clientelism_subtype","pataut_washingtonism_subtype","right_technocracy_subtype","austropopulism_subtype","revolution_nationale_subtype","neo_porfiriatoismo_subtype","bolivarianism_subtype","pataut_belgicism_subtype","flemish_nationalism_subtype","pataut_legionarism_subtype","pataut_pan_somalism_subtype","pataut_islamism_subtype","social_credit_subtype","pirate_republic_subtype","pataut_diemism_subtype","pataut_kotahitanga_subtype","pataut_coconut_subtype","pataut_national_conservative_subtype","roerichism_subtype","pataut_hispanism_subtype","pataut_popular_patriotism_subtype","carlism_subtype","pataut_minarchism_subtype","pataut_right_georgism_subtype","pataut_caponism_subtype","pataut_right_syndicalism_subtype","gaullism_subtype","pataut_theosophy_subtype","laurismo_subtype","neoborbonismo_subtype","pataut_oligarchy_subtype","yugoslavism_subtype","rocquisme_subtype","scientific_monarchism_subtype","pataut_pelleyism_subtype","pataut_hearstian_democracy_subtype","pataut_occultism_subtype","pataut_volkism_subtype","elective_monarchy_subtype","pataut_qadhimism_subtype","pataut_czech_national_democracy_subtype","pan_netherlandism_subtype","pataut_savinkovism_subtype","spectral_state_subtype","pataut_kritarchy_subtype","poujadisme_subtype","pataut_tridemism_subtype","pataut_security_state_subtype","pataut_synarchism_subtype","pataut_maurism_subtype","integrism_subtype","pataut_maurrassism_subtype","pataut_toryism_subtype","pataut_agrarianism_subtype","pataut_iberian_federalism_subtype","pataut_solidarism_subtype","terrismo_subtype","nuevo_ideal_nacional_subtype","pataut_conservative_feminism_subtype","duplessism_subtype","chosid_nyi_subtype","metaxism_subtype","yan_xishan_thought_subtype","vapsism_subtype","universism_subtype","getulismo_subtype","christian_crusade_subtype","pataut_scandinavism_subtype","pataut_gustavianism_subtype","pataut_police_state_subtype","socialismo_militar_subtype","pataut_trujillato_subtype","imaginism_subtype","pataut_hilozoismo_subtype","pataut_paneuropeanism_subtype","pataut_popularism_subtype"],
            "national_populist": ["national_populist_subtype","integralism_subtype","fundementalism_subtype","militarism_subtype","savinkovism_subtype","solidarism_subtype","scythianism_subtype","legionarism_subtype","lovecraftianism_subtype","natpop_true_whigs_subtype","occultism_subtype","natpop_corporatocracy_subtype","pioism_subtype","natpop_warlordism_subtype","authentice_subtype","merc_subtype","natpop_afrofuture_subtype","klan_nationalism_subtype","goering_loyalism_subtype","townerism_subtype","right_syndicalism_subtype","national_basedism_subtype","natpop_right_panafricanism_subtype","natpop_kimbanguism_subtype","ariosophy_subtype","volkism_subtype","natpop_paneuropeanism_subtype","national_radicalism_subtype","mathengeism_subtype","toy_santaism_subtype","national_restorationism_subtype","natpop_bonapartism_subtype","natpop_boer_nationalism_subtype","natpop_tribal_chiefdom_subtype","baltic_christianity_subtype","ukrainian_nationalism_subtype","crnogoroslavlje_subtype","maurrassism_subtype","kadroism_subtype","belgicism_subtype","autentico_subtype","natpop_bolivarianism_subtype","tseghakronism_subtype","rexism_subtype","natpop_flemish_nationalism_subtype","natpop_popular_patriotism_subtype","reformed_belgicism_subtype","natpop_pan_somalism_subtype","vasconcelosismo_subtype","natpop_volkisch_communitarianism_subtype","wandervogel_subtype","natpop_pan_asianism_subtype","caodaism_subtype","coconut_subtype","hoahaoism_subtype","hispanism_subtype","natpop_roerichism_subtype","anarcho_totalitarianism_subtype","natpop_neo_feudalism_subtype","natpop_carlism_subtype","british_israelism_subtype","nordicism_subtype","leopardism_subtype","national_maximalism_subtype","natpop_islamism_subtype","black_hebrew_israelism_subtype","islamic_black_nationalism_subtype","moorish_science_temple_subtype","nation_of_islam_subtype","scientology_subtype","spiritualism_subtype","monopolized_anarchism_subtype","natpop_pirate_republic_subtype","natpop_indigenous_communitarianism_subtype","noirism_subtype","ethereal_noirism_subtype","theosophy_subtype","natpop_kleptocracy_subtype","natpop_revolution_nationale_subtype","sicilianism_subtype","natpop_yugoslavism_subtype","italian_right_futurism_subtype","italian_legionarism_subtype","natpop_social_credit_subtype","natpop_colonial_govt_subtype","national_security_state_subtype","dionysian_yoga_subtype","synarchism_subtype","burkhanism_subtype","natpop_pan_netherlandism_subtype","god_knowers_subtype","neokonservatismus_subtype","natpop_agrarianism_subtype","panchayat_system_subtype","natpop_militant_atheism_subtype","natpop_kritarchy_subtype","neo_maurrassism_subtype","lepenisme_subtype","natpop_poujadisme_subtype","natpop_humanisme_integral_subtype","natpop_tridemism_subtype","natpop_integrism_subtype","liberating_nationalism_subtype","natpop_conservative_feminism_subtype","nacionalismo_subtype","natpop_chosid_nyi_subtype","natpop_national_conservative_subtype","natpop_tribal_councilism_subtype","shintaisei_subtype","consistent_way_subtype","taarausk_subtype","neo_rexurdimento_subtype","natpop_universism_subtype","pan_iranism_subtype","phalangism_subtype","syrian_social_nationalism_subtype","cultured_magic_subtype","evolian_thought_subtype","kryvianism_subtype","natpop_oligarchy_subtype","muertismo_subtype","hindutva_subtype","korpelaism_subtype","natpop_scandinavism_subtype","socialist_falange_subtype","natpop_vapsism_subtype","trujillato_subtype","nacismo_subtype","lapuanliike_subtype","natpop_regionalism_subtype","great_way_subtype","riksvitalism_subtype","tagarab_theology_subtype","natpop_macianismo_subtype","misteryism_subtype","hilozoismo_subtype","natpop_right_technocracy_subtype","natpop_austropopulism_subtype","credo_legionario_subtype"]
        }];
        console.log('Ideology data loaded from embedded data');
    }

    initializeBulkLeaderIdeologySelect() {
        const selectElement = document.getElementById('bulkLeaderIdeology');
        if (!selectElement || !this.ideologyData) return;

        const data = this.ideologyData[0]; // The JSON has an array with one object

        // Clear existing options except the placeholder
        selectElement.innerHTML = '<option value="">Select Ideology</option>';

        // Add options grouped by main ideology
        Object.keys(data).forEach(mainIdeology => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = mainIdeology.charAt(0).toUpperCase() + mainIdeology.slice(1).replace(/_/g, ' ');

            data[mainIdeology].forEach(subtype => {
                const option = document.createElement('option');
                option.value = subtype;
                option.textContent = subtype.replace(/_/g, ' ');
                optgroup.appendChild(option);
            });

            selectElement.appendChild(optgroup);
        });

        // Add change event listener for native select
        selectElement.addEventListener('change', function() {
            // Optional: Add custom behavior here if needed
        });
    }

    initializeLeaderIdeologySelect(countryId) {
        const selectElement = document.getElementById(`leaderIdeology_${countryId}`);
        if (!selectElement || !this.ideologyData) return;

        const data = this.ideologyData[0]; // The JSON has an array with one object

        // Clear existing options except the placeholder
        selectElement.innerHTML = '<option value="">Select Ideology</option>';

        // Add options grouped by main ideology
        Object.keys(data).forEach(mainIdeology => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = mainIdeology.charAt(0).toUpperCase() + mainIdeology.slice(1).replace(/_/g, ' ');

            data[mainIdeology].forEach(subtype => {
                const option = document.createElement('option');
                option.value = subtype;
                option.textContent = subtype.replace(/_/g, ' ');
                optgroup.appendChild(option);
            });

            selectElement.appendChild(optgroup);
        });

        // Add change event listener for native select
        selectElement.addEventListener('change', function() {
            // Optional: Add custom behavior here if needed
        });
    }

    fillAllGovernmentNames() {
        const governmentName = this.bulkGovernmentNameInput.value.trim();
        const governmentIdeology = this.bulkGovernmentIdeologyInput.value.trim();

        if (!governmentName && !governmentIdeology) {
            alert('Please enter at least a government name or ideology');
            return;
        }

        let totalFilled = 0;
        let nameFilled = 0;
        let ideologyFilled = 0;

        // Get all country items
        const countryItems = document.querySelectorAll('.country-item');

        countryItems.forEach(countryItem => {
            // Find government field inputs within this country
            const governmentNameInput = countryItem.querySelector('input[id^="governmentName_"]');
            const governmentIdeologyInput = countryItem.querySelector('select[id^="governmentIdeology_"]');

            if (governmentNameInput && !governmentNameInput.value.trim() && governmentName) {
                governmentNameInput.value = governmentName;
                nameFilled++;
                totalFilled++;
            }

            if (governmentIdeologyInput && (!governmentIdeologyInput.value || governmentIdeologyInput.value === '') && governmentIdeology) {
                governmentIdeologyInput.value = governmentIdeology;
                // Trigger change event for Select2
                governmentIdeologyInput.dispatchEvent(new Event('change'));
                ideologyFilled++;
                totalFilled++;
            }
        });

        const messages = [];
        if (nameFilled > 0) messages.push(`${nameFilled} government names`);
        if (ideologyFilled > 0) messages.push(`${ideologyFilled} government ideologies`);

        alert(`Filled ${totalFilled} empty government fields: ${messages.join(', ')}`);
    }

    fillAllLeaderFields() {
        const leaderName = this.bulkLeaderNameInput.value.trim();
        const leaderPortrait = this.bulkLeaderPortraitInput.value.trim();
        const leaderIdeology = this.bulkLeaderIdeologyInput.value.trim();

        if (!leaderName && !leaderPortrait && !leaderIdeology) {
            alert('Please enter at least one leader field value');
            return;
        }

        let totalFilled = 0;
        let nameFilled = 0;
        let portraitFilled = 0;
        let ideologyFilled = 0;

        // Get all country items
        const countryItems = document.querySelectorAll('.country-item');

        countryItems.forEach(countryItem => {
            // Find leader field inputs within this country
            const leaderNameInput = countryItem.querySelector('input[id^="leaderName_"]');
            const leaderPortraitInput = countryItem.querySelector('input[id^="leaderPortrait_"]');
            const leaderIdeologyInput = countryItem.querySelector('select[id^="leaderIdeology_"]');

            if (leaderNameInput && !leaderNameInput.value.trim() && leaderName) {
                leaderNameInput.value = leaderName;
                nameFilled++;
                totalFilled++;
            }

            if (leaderPortraitInput && !leaderPortraitInput.value.trim() && leaderPortrait) {
                leaderPortraitInput.value = leaderPortrait;
                portraitFilled++;
                totalFilled++;
            }

            if (leaderIdeologyInput && (!leaderIdeologyInput.value || leaderIdeologyInput.value === '') && leaderIdeology) {
                leaderIdeologyInput.value = leaderIdeology;
                // Trigger change event for Select2
                leaderIdeologyInput.dispatchEvent(new Event('change'));
                ideologyFilled++;
                totalFilled++;
            }
        });

        const messages = [];
        if (nameFilled > 0) messages.push(`${nameFilled} leader names`);
        if (portraitFilled > 0) messages.push(`${portraitFilled} portrait paths`);
        if (ideologyFilled > 0) messages.push(`${ideologyFilled} ideologies`);

        alert(`Filled ${totalFilled} empty leader fields: ${messages.join(', ')}`);
    }

    saveFormData() {
        const formData = {
            // Basic settings
            masterTag: this.masterTagInput.value,
            puppetIdeology: this.puppetIdeologyInput.value,

            // Checkbox states
            enableGovernmentName: this.enableGovernmentNameCheckbox.checked,
            enableLeaderFields: this.enableLeaderFieldsCheckbox.checked,
            generateFullCode: this.generateFullCodeCheckbox.checked,

            // Focus IDs
            focusIds: this.getFocusIds(),

            // Popularity data
            popularityData: this.getPopularityData(),

            // Country data
            countries: []
        };

        // Collect data from all countries
        const countryItems = document.querySelectorAll('.country-item');
        countryItems.forEach(countryItem => {
            const countryId = countryItem.dataset.countryId;
            const countryData = {
                targetTag: document.getElementById(`countryTag_${countryId}`).value,
                nationFullName: document.getElementById(`nationFullName_${countryId}`).value,
                claimStates: document.getElementById(`stateIds_${countryId}`).value.split(',').map(s => s.trim()).filter(s => s),
                coreStates: document.getElementById(`requiredStateIds_${countryId}`).value.split(',').map(s => s.trim()).filter(s => s),
                useOrForRequired: document.getElementById(`useOrForRequired_${countryId}`).checked
            };

            // Add optional government data
            if (this.enableGovernmentNameCheckbox.checked) {
                countryData.governmentName = document.getElementById(`governmentName_${countryId}`).value;
                countryData.governmentIdeology = document.getElementById(`governmentIdeology_${countryId}`).value;
            }

            // Add optional leader data
            if (this.enableLeaderFieldsCheckbox.checked) {
                countryData.leaderName = document.getElementById(`leaderName_${countryId}`).value;
                countryData.leaderPortrait = document.getElementById(`leaderPortrait_${countryId}`).value;
                countryData.leaderIdeology = document.getElementById(`leaderIdeology_${countryId}`).value;
            }

            formData.countries.push(countryData);
        });

        // Convert to JSON and download file
        const jsonString = JSON.stringify(formData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `release-generator-config-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        alert('Form data saved and downloaded as JSON file!');
    }

    async loadFormData() {
        try {
            let jsonString;

            // Check if a file is selected
            if (this.loadDataFile.files && this.loadDataFile.files[0]) {
                const file = this.loadDataFile.files[0];
                jsonString = await file.text();
            } else {
                // Use textarea content
                jsonString = this.loadDataTextarea.value.trim();
                if (!jsonString) {
                    alert('Please select a file or enter JSON data to load');
                    return;
                }
            }

            const formData = JSON.parse(jsonString);

            // Clear existing data
            this.clearAll();

            // Load basic settings
            if (formData.masterTag) this.masterTagInput.value = formData.masterTag;
            if (formData.puppetIdeology) this.puppetIdeologyInput.value = formData.puppetIdeology;

            // Load checkbox states
            if (formData.enableGovernmentName !== undefined) {
                this.enableGovernmentNameCheckbox.checked = formData.enableGovernmentName;
                this.toggleGovernmentNameFields();
            }
            if (formData.enableLeaderFields !== undefined) {
                this.enableLeaderFieldsCheckbox.checked = formData.enableLeaderFields;
                this.toggleLeaderFields();
            }
            if (formData.generateFullCode !== undefined) {
                this.generateFullCodeCheckbox.checked = formData.generateFullCode;
                this.toggleFullCodeGeneration();
            }

            // Load focus IDs
            if (formData.focusIds && Array.isArray(formData.focusIds)) {
                formData.focusIds.forEach(focusId => {
                    this.addFocusRow(focusId);
                });
            }

            // Load popularity data
            if (formData.popularityData && Array.isArray(formData.popularityData)) {
                // Clear existing popularity table
                this.popularityTableBody.innerHTML = '';

                // Add saved popularity data
                formData.popularityData.forEach(party => {
                    this.addPartyRow(party.name, party.popularity);
                });

                // Update chart
                this.updatePopularityDisplay();
            }

            // Load countries
            if (formData.countries && Array.isArray(formData.countries)) {
                formData.countries.forEach(countryData => {
                    this.addCountryFromData(countryData);
                });
            }

            alert('Form data loaded successfully!');

        } catch (error) {
            console.error('Error loading form data:', error);
            alert('Error loading JSON data. Please check the format.');
        }
    }

    addCountryFromData(countryData) {
        const countryId = this.countryCounter++;
        const countryDiv = document.createElement('div');
        countryDiv.className = 'country-item';
        countryDiv.dataset.countryId = countryId;

        // Format arrays as comma-separated strings
        const claimStatesStr = (countryData.claimStates || []).join(', ');
        const coreStatesStr = (countryData.coreStates || []).join(', ');

        countryDiv.innerHTML = `
            <button type="button" class="remove-country" onclick="countryFormatter.removeCountry(${countryId})">&times;</button>
            <h3>Country ${countryId + 1}</h3>

            <div class="info-section country-info-section enabled">
                <h4>Country Info</h4>
                <div class="country-row">
                    <div class="form-group">
                        <label for="countryTag_${countryId}">Target Tag:</label>
                        <input type="text" id="countryTag_${countryId}" name="countryTag_${countryId}" value="${countryData.targetTag || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="nationFullName_${countryId}">Nation Full Name:</label>
                        <input type="text" id="nationFullName_${countryId}" name="nationFullName_${countryId}" value="${countryData.nationFullName || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="stateIds_${countryId}">State Core IDs:</label>
                        <input type="text" id="stateIds_${countryId}" name="stateIds_${countryId}" value="${claimStatesStr}" placeholder="1,2,3,4" required>
                    </div>
                    <div class="form-group required-states-container">
                        <div class="state-ids-with-checkbox">
                            <label for="requiredStateIds_${countryId}">Required State IDs:</label>
                            <input type="text" id="requiredStateIds_${countryId}" name="requiredStateIds_${countryId}" value="${coreStatesStr}" placeholder="5,6,7,8" required>
                            <label class="checkbox-label">
                                <input type="checkbox" id="useOrForRequired_${countryId}" name="useOrForRequired_${countryId}" ${countryData.useOrForRequired ? 'checked' : ''}>
                                Use OR block
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div class="info-section government-info-section ${this.enableGovernmentNameCheckbox && this.enableGovernmentNameCheckbox.checked ? 'enabled' : ''}">
                <h4>Government Info</h4>
                <div class="country-row">
                    <div class="form-group">
                        <label for="governmentName_${countryId}">Government Name:</label>
                        <input type="text" id="governmentName_${countryId}" name="governmentName_${countryId}" value="${countryData.governmentName || ''}">
                    </div>
                    <div class="form-group">
                        <label for="governmentIdeology_${countryId}">Government Ideology:</label>
                        <select id="governmentIdeology_${countryId}" name="governmentIdeology_${countryId}">
                            <option value="">Select Ideology</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="info-section leader-info-section ${this.enableLeaderFieldsCheckbox && this.enableLeaderFieldsCheckbox.checked ? 'enabled' : ''}">
                <h4>Leader Info</h4>
                <div class="country-row">
                    <div class="form-group">
                        <label for="leaderName_${countryId}">Leader Name:</label>
                        <input type="text" id="leaderName_${countryId}" name="leaderName_${countryId}" value="${countryData.leaderName || ''}">
                    </div>
                    <div class="form-group">
                        <label for="leaderPortrait_${countryId}">Leader Portrait Path:</label>
                        <input type="text" id="leaderPortrait_${countryId}" name="leaderPortrait_${countryId}" value="${countryData.leaderPortrait || ''}" placeholder="gfx/leaders/TAG/Portrait_Name.png">
                    </div>
                    <div class="form-group">
                        <label for="leaderIdeology_${countryId}">Leader Ideology:</label>
                        <select id="leaderIdeology_${countryId}" name="leaderIdeology_${countryId}">
                            <option value="">Select Ideology</option>
                        </select>
                    </div>
                </div>
            </div>
        `;

        this.countriesContainer.appendChild(countryDiv);

        // Initialize Select2 for the new select elements
        this.initializeLeaderIdeologySelect(countryId);

        // Set government ideology value if it exists
        if (countryData.governmentIdeology) {
            setTimeout(() => {
                const govSelect = document.getElementById(`governmentIdeology_${countryId}`);
                if (govSelect) {
                    govSelect.value = countryData.governmentIdeology;
                    govSelect.dispatchEvent(new Event('change'));
                }
            }, 100);
        }

        // Set leader ideology value if it exists
        if (countryData.leaderIdeology) {
            setTimeout(() => {
                const leaderSelect = document.getElementById(`leaderIdeology_${countryId}`);
                if (leaderSelect) {
                    leaderSelect.value = countryData.leaderIdeology;
                    leaderSelect.dispatchEvent(new Event('change'));
                }
            }, 100);
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