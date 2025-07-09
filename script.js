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
        this.countriesContainer = document.getElementById('countriesContainer');
        this.eventOutputTextarea = document.getElementById('eventOutput');
        this.localizationOutputTextarea = document.getElementById('localizationOutput');
        this.masterTagInput = document.getElementById('masterTag');
        this.puppetIdeologyInput = document.getElementById('puppetIdeology');
        this.enableGovernmentNameCheckbox = document.getElementById('enableGovernmentName');

        // Add event listeners
        this.addCountryBtn.addEventListener('click', () => this.addCountry());
        this.generateBtn.addEventListener('click', () => this.generateOutput());
        this.clearBtn.addEventListener('click', () => this.clearAll());
        this.copyEventBtn.addEventListener('click', () => this.copyToClipboard('event'));
        this.copyLocalizationBtn.addEventListener('click', () => this.copyToClipboard('localization'));
        this.enableGovernmentNameCheckbox.addEventListener('change', () => this.toggleGovernmentNameFields());

        // Add first country by default
        this.addCountry();
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
                <div class="form-group government-name-field ${this.enableGovernmentNameCheckbox.checked ? 'enabled' : ''}">
                    <label for="governmentName_${countryId}">Government Name:</label>
                    <input type="text" id="governmentName_${countryId}" name="governmentName_${countryId}">
                </div>
                <div class="form-group">
                    <label for="nationFullName_${countryId}">Nation Full Name:</label>
                    <input type="text" id="nationFullName_${countryId}" name="nationFullName_${countryId}" required>
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
        const isEnabled = this.enableGovernmentNameCheckbox.checked;
        
        governmentNameElements.forEach(element => {
            if (isEnabled) {
                element.classList.add('enabled');
            } else {
                element.classList.remove('enabled');
            }
        });
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
        if (this.enableGovernmentNameCheckbox.checked) {
            const governmentName = document.getElementById(`governmentName_${countryId}`).value.trim();
            result.governmentName = governmentName || null;
        }

        return result;
    }

    validateCountryData(country) {
        const basicValidation = country.targetTag && 
               country.stateIds.length > 0 && 
               country.nationFullName;
        
        // If government name is enabled, validate it too
        if (this.enableGovernmentNameCheckbox.checked) {
            return basicValidation && country.governmentName;
        }
        
        return basicValidation;
    }

    formatOutput(masterTag, puppetIdeology, countries) {
        const generateTexasReleaseCode = (masterTag, targetTag, stateIds, governmentName, nationFullName) => {
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

\t\t\tset_popularities = {
\t\t\t\tsyndicalist = 5
\t\t\t\tsocial_democrat = 5
\t\t\t\tsocial_liberal = 0
\t\t\t\tmarket_liberal = 0
\t\t\t\tsocial_conservative = 20
\t\t\t\tauthoritarian_democrat = 50
\t\t\t\tpaternal_autocrat = 10
\t\t\t\tnational_populist = 10
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
            const localization = `OTT_${targetTag}_OCC:0 "${nationFullName}"\n\n${masterTag}_establish_rk_${targetTag}:0 "Establish ${nationFullName}"`;

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
                 country.nationFullName
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
            this.countriesContainer.innerHTML = '';
            this.eventOutputTextarea.value = '';
            this.localizationOutputTextarea.value = '';
            this.countryCounter = 0;
            this.addCountry();
        }
    }

    async copyToClipboard(type) {
        try {
            const textToCopy = type === 'event' ? this.eventOutputTextarea.value : this.localizationOutputTextarea.value;
            const buttonElement = type === 'event' ? this.copyEventBtn : this.copyLocalizationBtn;
            
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
            const textareaToCopy = type === 'event' ? this.eventOutputTextarea : this.localizationOutputTextarea;
            textareaToCopy.select();
            document.execCommand('copy');
            alert(`${type === 'event' ? 'Event code' : 'Localization'} copied to clipboard!`);
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.countryFormatter = new CountryFormatter();
}); 