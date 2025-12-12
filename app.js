// Configuration constants
const TIERED_THRESHOLDS = {
    EPIC: { capacity: 9, target: 10, name: "Epic", colorClass: "epic-display" },
    LEGENDARY: { capacity: 12, target: 14, name: "Legendary", colorClass: "legendary-display" },
    RELIC: { capacity: 15, target: 17, name: "Relic", colorClass: "relic-display" },
    ANCIENT: { capacity: 17, target: 19, name: "Ancient", colorClass: "ancient-display" }
};

const FALLBACK_TARGET = 10;
const MAX_OBJECTS_PER_GROUP = 4;
let presets = [];
let currentPresetId = null;
const MAX_PRESETS = 30;

// Data structures
let objects = [];
let groups = [
    { 
        id: 1, 
        name: "Group 1", 
        tier: "RELIC",
        capacity: 15, 
        used: 0, 
        value: 0, 
        priority: 2, 
        objects: [], 
        maxObjects: MAX_OBJECTS_PER_GROUP, 
        targetValue: 17 
    },
    { 
        id: 2, 
        name: "Group 2", 
        tier: "EPIC",
        capacity: 9, 
        used: 0, 
        value: 0, 
        priority: 3, 
        objects: [], 
        maxObjects: MAX_OBJECTS_PER_GROUP, 
        targetValue: 10 
    },
    { 
        id: 3, 
        name: "Group 3", 
        tier: "ANCIENT",
        capacity: 17, 
        used: 0, 
        value: 0, 
        priority: 1, 
        objects: [], 
        maxObjects: MAX_OBJECTS_PER_GROUP, 
        targetValue: 19 
    }
];

// DOM Elements
const objectCostInput = document.getElementById('objectCost');
const objectValueInput = document.getElementById('objectValue');
const objectOption1Input = document.getElementById('objectOption1');
const objectOption2Input = document.getElementById('objectOption2');
const addObjectBtn = document.getElementById('addObjectBtn');
const clearObjectsBtn = document.getElementById('clearObjectsBtn');
const addSampleBtn = document.getElementById('addSampleBtn');
const objectsList = document.getElementById('objectsList');
const emptyObjectsMessage = document.getElementById('emptyObjectsMessage');
const calculateBtn = document.getElementById('calculateBtn');
const notification = document.getElementById('notification');


// DOM Elements for presets
const presetNameInput = document.getElementById('presetName');
const savePresetBtn = document.getElementById('savePresetBtn');
const loadPresetBtn = document.getElementById('loadPresetBtn');
const deletePresetBtn = document.getElementById('deletePresetBtn');
const presetSlots = document.getElementById('presetSlots');
const emptyPresetsMessage = document.getElementById('emptyPresetsMessage');

// Group configuration inputs
const capacityInputs = [
    document.getElementById('capacity1'),
    document.getElementById('capacity2'),
    document.getElementById('capacity3')
];

const priorityInputs = [
    document.getElementById('priority1'),
    document.getElementById('priority2'),
    document.getElementById('priority3')
];

// Group display elements
const groupCapacityDisplays = [
    document.getElementById('group1Capacity'),
    document.getElementById('group2Capacity'),
    document.getElementById('group3Capacity')
];

const groupUsedDisplays = [
    document.getElementById('group1Used'),
    document.getElementById('group2Used'),
    document.getElementById('group3Used')
];

const groupValueDisplays = [
    document.getElementById('group1Value'),
    document.getElementById('group2Value'),
    document.getElementById('group3Value')
];

const groupValueIndicators = [
    document.getElementById('group1ValueIndicator'),
    document.getElementById('group2ValueIndicator'),
    document.getElementById('group3ValueIndicator')
];

const groupObjectsContainers = [
    document.getElementById('group1Objects'),
    document.getElementById('group2Objects'),
    document.getElementById('group3Objects')
];

const groupPriorityDisplays = [
    document.getElementById('group1PriorityDisplay'),
    document.getElementById('group2PriorityDisplay'),
    document.getElementById('group3PriorityDisplay')
];

// Summary elements
const totalValueDisplay = document.getElementById('totalValue');
const totalCostDisplay = document.getElementById('totalCost');
const objectsAssignedDisplay = document.getElementById('objectsAssigned');

// Helper function to get tier configuration
function getTierConfig(capacity) {
    switch(parseInt(capacity)) {
        case 9: return TIERED_THRESHOLDS.EPIC;
        case 12: return TIERED_THRESHOLDS.LEGENDARY;
        case 15: return TIERED_THRESHOLDS.RELIC;
        case 17: return TIERED_THRESHOLDS.ANCIENT;
        default: return TIERED_THRESHOLDS.EPIC;
    }
}

// Preset functions


// Event Handlers
function handleSavePreset(event) {
    console.log('Save preset button clicked!', event);
    event?.preventDefault();
    
    const presetNameInput = document.getElementById('presetName');
    if (!presetNameInput) {
        console.error('Preset name input not found');
        showNotification('Error: Preset name input not found', 'error');
        return;
    }
    
    const name = presetNameInput.value.trim();
    console.log('Preset name:', name);
    
    if (!name) {
        showNotification('Please enter a name for your preset.', 'error');
        presetNameInput.focus();
        return;
    }
    
    // Save the preset
    savePreset(name);
}

function handleLoadPreset() {
    if (presets.length === 0) {
        showNotification('No presets available to load.', 'error');
        return;
    }
    
    // Show a simple selection dialog
    const presetNames = presets.map(p => p.name).join('\n');
    const selectedName = prompt(`Available presets:\n\n${presetNames}\n\nEnter the name to load:`);
    
    if (selectedName) {
        const preset = presets.find(p => p.name === selectedName);
        if (preset) {
            loadPreset(preset.id);
        } else {
            showNotification(`Preset "${selectedName}" not found.`, 'error');
        }
    }
}

function handleDeletePreset() {
    if (presets.length === 0) {
        showNotification('No presets available to delete.', 'error');
        return;
    }
    
    // Show a simple selection dialog
    const presetNames = presets.map(p => p.name).join('\n');
    const selectedName = prompt(`Available presets:\n\n${presetNames}\n\nEnter the name to delete:`);
    
    if (selectedName) {
        const preset = presets.find(p => p.name === selectedName);
        if (preset) {
            if (confirm(`Are you sure you want to delete preset "${selectedName}"?`)) {
                deletePreset(preset.id);
            }
        } else {
            showNotification(`Preset "${selectedName}" not found.`, 'error');
        }
    }
}

function handleExportPreset() {
    if (currentPresetId) {
        exportPreset(currentPresetId);
    } else {
        showNotification('No preset selected to export.', 'error');
    }
}

function handleImportPreset() {
    importPreset();
}

// Fix the savePreset function to be more robust
function savePreset(name) {
    console.log('Saving preset:', name);
    
    if (presets.length >= MAX_PRESETS) {
        showNotification(`Maximum ${MAX_PRESETS} presets reached. Delete some first.`, 'error');
        return;
    }
    
    // Check for duplicate name
    const duplicateIndex = presets.findIndex(p => p.name.toLowerCase() === name.toLowerCase());
    if (duplicateIndex !== -1) {
        if (!confirm(`Preset "${name}" already exists. Overwrite?`)) {
            return;
        }
        // Remove existing preset
        presets.splice(duplicateIndex, 1);
    }
    
    // Get target override values
    const targetOverrideInputs = [
        document.getElementById('targetOverride1'),
        document.getElementById('targetOverride2'),
        document.getElementById('targetOverride3')
    ];
    
    // Create preset data
    const presetData = {
        id: Date.now(),
        name: name,
        date: new Date().toISOString(),
        timestamp: Date.now(),
        objects: JSON.parse(JSON.stringify(objects)), // Deep copy
        groups: groups.map(group => ({
            id: group.id,
            tier: group.tier,
            capacity: group.capacity,
            priority: group.priority,
            targetValue: group.targetValue,
            used: group.used,
            value: group.value,
            objects: group.objects ? JSON.parse(JSON.stringify(group.objects)) : []
        })),
        settings: {
            capacityValues: [
                capacityInputs[0]?.value || '15',
                capacityInputs[1]?.value || '9',
                capacityInputs[2]?.value || '17'
            ],
            priorityValues: [
                priorityInputs[0]?.value || '2',
                priorityInputs[1]?.value || '3',
                priorityInputs[2]?.value || '1'
            ],
            targetOverrideValues: targetOverrideInputs ? [
                targetOverrideInputs[0]?.value || '',
                targetOverrideInputs[1]?.value || '',
                targetOverrideInputs[2]?.value || ''
            ] : ['', '', '']
        }
    };
    
    console.log('Preset data created:', presetData);
    
    // Save to presets array
    presets.push(presetData);
    currentPresetId = presetData.id;
    
    // Clear input
    const presetNameInput = document.getElementById('presetName');
    if (presetNameInput) presetNameInput.value = '';
    
    // Update UI
    renderPresetSlots();
    savePresetsToStorage();
    showNotification(`Preset "${name}" saved successfully!`, 'success');
}

function loadPreset(presetId) {
    console.log('Loading preset:', presetId);
    
    const preset = presets.find(p => p.id === presetId);
    if (!preset) {
        showNotification('Preset not found.', 'error');
        return;
    }
    
    if (!confirm(`Load preset "${preset.name}"? This will replace current data.`)) {
        return;
    }
    
    try {
        // Load objects
        objects = JSON.parse(JSON.stringify(preset.objects));
        
        // Load groups
        preset.groups.forEach((savedGroup, index) => {
            if (groups[index]) {
                groups[index] = {
                    ...groups[index],
                    ...savedGroup,
                    objects: savedGroup.objects || []
                };
                
                // Update UI inputs
                if (capacityInputs[index]) {
                    capacityInputs[index].value = savedGroup.capacity || capacityInputs[index].value;
                }
                if (priorityInputs[index]) {
                    priorityInputs[index].value = savedGroup.priority || priorityInputs[index].value;
                }
            }
        });
        
        // Load settings
        if (preset.settings) {
            // Load capacity values
            if (preset.settings.capacityValues) {
                preset.settings.capacityValues.forEach((value, index) => {
                    if (capacityInputs[index]) {
                        capacityInputs[index].value = value;
                    }
                });
            }
            
            // Load priority values
            if (preset.settings.priorityValues) {
                preset.settings.priorityValues.forEach((value, index) => {
                    if (priorityInputs[index]) {
                        priorityInputs[index].value = value;
                    }
                });
            }
            
            // Load target override values
            const targetOverrideInputs = [
                document.getElementById('targetOverride1'),
                document.getElementById('targetOverride2'),
                document.getElementById('targetOverride3')
            ];
            
            if (preset.settings.targetOverrideValues && targetOverrideInputs) {
                preset.settings.targetOverrideValues.forEach((value, index) => {
                    if (targetOverrideInputs[index]) {
                        targetOverrideInputs[index].value = value;
                    }
                });
            }
        }
        
        // Update current preset
        currentPresetId = presetId;
        
        // Update all UI
        renderObjectsList();
        renderPresetSlots();
        updateGroupDisplays();
        updatePriorityDisplays();
        
        showNotification(`Preset "${preset.name}" loaded successfully!`, 'success');
        
    } catch (error) {
        console.error('Error loading preset:', error);
        showNotification('Error loading preset. Check console for details.', 'error');
    }
}

function deletePreset(presetId) {
    const preset = presets.find(p => p.id === presetId);
    if (!preset) return;
    
	if (!confirm(`Delete preset "${preset.name}"? This will remove entire preset data.`)) {
        return;
    }
	
    // Remove preset
    presets = presets.filter(p => p.id !== presetId);
    
    // Clear current preset if it was deleted
    if (currentPresetId === presetId) {
        currentPresetId = null;
    }
    
    // Update UI and storage
    renderPresetSlots();
    savePresetsToStorage();
    showNotification(`Preset "${preset.name}" deleted.`, 'success');
}

function renderPresetSlots() {
    const presetSlotsElement = document.getElementById('presetSlots');
    const emptyPresetsMessageElement = document.getElementById('emptyPresetsMessage');
    
    if (!presetSlotsElement) {
        console.error('Preset slots elements not found!');
        return;
    }
    
    console.log('Rendering preset slots. Presets count:', presets.length);
    
    // Hide empty message if there are presets
    if (presets.length > 0) {
		if (emptyPresetsMessageElement) 
			emptyPresetsMessageElement.style.display = 'none';
    } else {
        //emptyPresetsMessageElement.style.display = 'block';
        presetSlotsElement.innerHTML = '<div class="empty-message" id="emptyPresetsMessage"><i class="fas fa-inbox fa-2x"></i><p>No presets saved yet. Save your first preset above.</p></div>';
        return;
    }
    
    // Clear the list
    presetSlotsElement.innerHTML = '';
    
    // Sort presets by date (newest first)
    const sortedPresets = [...presets].sort((a, b) => {
        const timeA = a.timestamp || new Date(a.date).getTime();
        const timeB = b.timestamp || new Date(b.date).getTime();
        return timeB - timeA;
    });
    
    console.log('Sorted presets:', sortedPresets.map(p => p.name));
    
    // Add each preset to the list
    sortedPresets.forEach(preset => {
        if (!preset || !preset.id || !preset.name) {
            console.warn('Invalid preset found:', preset);
            return;
        }
        
        const presetElement = document.createElement('div');
        presetElement.className = `object-item preset-slot ${currentPresetId === preset.id ? 'active' : ''}`;
        presetElement.dataset.id = preset.id;
        
        // Calculate average tier
        const avgTier = preset.groups ? calculateAverageTier(preset) : null;
        
        const dateStr = preset.date ? new Date(preset.date).toLocaleString() : 'Unknown date';
        const objectCount = preset.objects ? preset.objects.length : 0;
        
        presetElement.innerHTML = `
            <div class="preset-slot-info">
                <div class="preset-slot-name">
                    ${preset.name}
                    ${currentPresetId === preset.id ? '<span style="color: var(--success-color);"> (Current)</span>' : ''}
                </div>
                <div class="preset-slot-stats">
                    <span>Astrogems: ${objectCount}</span>
                    <span>Date: ${dateStr}</span>
                </div>
            </div>
            <div class="preset-slot-actions">
                <button class="preset-slot-btn" onclick="loadPreset(${preset.id})" title="Load preset">
                    <i class="fas fa-folder-open"></i>
                </button>
                <button class="preset-slot-btn preset-slot-btn-delete" onclick="deletePreset(${preset.id})" title="Delete preset">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
		
		
		
		presetElement.innerHTML = `
			<div class="object-info">
                <div class="object-value-display">${preset.name} ${currentPresetId === preset.id ? '<span style="color: var(--success-color);"> (Current)</span>' : ''}</div>
                <div class="object-details">
                    <span>Astrogems Added: ${objectCount}</span>
                </div>
				
				<div class="object-id">Date: ${dateStr}</div>
            </div>
            <div class="object-actions">
                <button class="btn-icon btn-edit" onclick="loadPreset(${preset.id})" title="Load Preset">
                    <i class="fas fa-file-import"></i>
                </button>
                <button class="btn-icon preset-slot-btn-delete" onclick="deletePreset(${preset.id})" title="Delete Preset">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
		`;	
        
        presetSlotsElement.appendChild(presetElement);
    });
    
    console.log('Finished rendering', presetSlotsElement.children.length, 'preset slots');
}

// Add a debug function to check if elements are properly loaded
function debugPresetSystem() {
    console.log('=== Preset System Debug ===');
    console.log('savePresetBtn exists:', !!document.getElementById('savePresetBtn'));
    console.log('presetNameInput exists:', !!document.getElementById('presetName'));
    console.log('Number of presets:', presets.length);
    console.log('Current preset ID:', currentPresetId);
    console.log('Objects count:', objects.length);
    console.log('Groups count:', groups.length);
}

function calculateAverageTier(preset) {
    if (!preset.groups || preset.groups.length === 0) return null;
    
    const tierValues = {
        'EPIC': 1,
        'LEGENDARY': 2,
        'RELIC': 3,
        'ANCIENT': 4
    };
    
    let total = 0;
    let count = 0;
    
    preset.groups.forEach(group => {
        if (group.tier && tierValues[group.tier]) {
            total += tierValues[group.tier];
            count++;
        }
    });
    
    if (count === 0) return null;
    
    const avg = Math.round(total / count);
    
    // Convert back to tier name
    const tierMap = {
        1: 'Epic',
        2: 'Legendary',
        3: 'Relic',
        4: 'Ancient'
    };
    
    return tierMap[avg] || null;
}

function savePresetsToStorage() {
    try {
        console.log('Saving presets to localStorage:', {
            count: presets.length,
            presets: presets,
            currentPresetId: currentPresetId
        });
        
        // Convert to JSON string
        const presetsString = JSON.stringify(presets);
        console.log('Presets JSON string length:', presetsString.length);
        
        // Save to localStorage
        localStorage.setItem('objectGroupingPresets', presetsString);
        
        if (currentPresetId) {
            localStorage.setItem('objectGroupingCurrentPreset', currentPresetId.toString());
        } else {
            localStorage.removeItem('objectGroupingCurrentPreset');
        }
        
        console.log('Presets saved successfully to localStorage');
        return true;
    } catch (e) {
        console.error('Error saving presets to localStorage:', e);
        showNotification('Error saving presets to storage. Check console for details.', 'error');
        return false;
    }
}

function loadPresetsFromStorage() {
    try {
        console.log('=== Loading presets from localStorage ===');
        
        // Check if key exists
        const hasPresetsKey = localStorage.getItem('objectGroupingPresets') !== null;
        console.log('Presets key exists in localStorage:', hasPresetsKey);
        
        if (!hasPresetsKey) {
            console.log('No presets found in localStorage, starting fresh.');
            presets = [];
            currentPresetId = null;
            return false;
        }
        
        // Load presets
        const savedPresets = localStorage.getItem('objectGroupingPresets');
        console.log('Raw presets data length:', savedPresets.length);
        
        if (!savedPresets || savedPresets === 'null' || savedPresets === 'undefined') {
            console.log('Presets data is empty or invalid');
            presets = [];
            currentPresetId = null;
            return false;
        }
        
        // Parse presets
        let parsedPresets;
        try {
            parsedPresets = JSON.parse(savedPresets);
            console.log('Successfully parsed presets JSON');
        } catch (parseError) {
            console.error('Failed to parse presets JSON:', parseError);
            console.log('Raw data (first 200 chars):', savedPresets.substring(0, 200));
            presets = [];
            currentPresetId = null;
            return false;
        }
        
        // Validate parsed data
        if (!Array.isArray(parsedPresets)) {
            console.error('Parsed presets is not an array:', typeof parsedPresets);
            presets = [];
        } else {
            // Filter out any invalid entries
            presets = parsedPresets.filter(preset => 
                preset && 
                preset.id && 
                preset.name && 
                typeof preset.name === 'string'
            );
            console.log(`Loaded ${presets.length} valid presets (filtered from ${parsedPresets.length} total)`);
            
            // Log preset names for debugging
            console.log('Preset names:', presets.map(p => p.name));
        }
        
        // Load current preset ID
        const savedCurrentPreset = localStorage.getItem('objectGroupingCurrentPreset');
        console.log('Current preset ID from storage:', savedCurrentPreset);
        
        if (savedCurrentPreset && savedCurrentPreset !== 'null' && savedCurrentPreset !== 'undefined') {
            const parsedId = parseInt(savedCurrentPreset);
            if (!isNaN(parsedId)) {
                // Verify this ID exists in our presets
                const presetExists = presets.some(p => p.id === parsedId);
                if (presetExists) {
                    currentPresetId = parsedId;
                    console.log('Current preset ID set to:', currentPresetId);
                } else {
                    console.log('Saved preset ID not found in presets, resetting to null');
                    currentPresetId = null;
                }
            } else {
                console.log('Invalid preset ID, resetting to null');
                currentPresetId = null;
            }
        } else {
            console.log('No valid current preset ID found');
            currentPresetId = null;
        }
        
        return true;
        
    } catch (e) {
        console.error('Critical error loading presets from localStorage:', e);
        showNotification('Error loading presets from storage. Starting fresh.', 'error');
        presets = [];
        currentPresetId = null;
        return false;
    }
}

// Export/Import functions
function exportPreset(presetId) {
    const preset = presets.find(p => p.id === presetId);
    if (!preset) return;
    
    const dataStr = JSON.stringify(preset, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${preset.name.replace(/[^a-z0-9]/gi, '_')}_preset.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

function importPreset() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        
        reader.onload = (event) => {
            try {
                const importedPreset = JSON.parse(event.target.result);
                
                // Validate preset structure
                if (!importedPreset.name || !Array.isArray(importedPreset.objects)) {
                    showNotification('Invalid preset file format.', 'error');
                    return;
                }
                
                // Generate new ID and update date
                importedPreset.id = Date.now();
                importedPreset.date = new Date().toISOString();
                importedPreset.timestamp = Date.now();
                
                // Add to presets
                presets.push(importedPreset);
                currentPresetId = importedPreset.id;
                
                // Update UI and storage
                renderPresetSlots();
                savePresetsToStorage();
                showNotification(`Preset "${importedPreset.name}" imported successfully!`, 'success');
                
            } catch (error) {
                console.error('Error reading preset file:', error);
                showNotification('Error reading preset file.', 'error');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// Update initApp() function to include presets
function initApp() {
    // Load saved data
    const hasSavedData = loadFromLocalStorage();
    const hasSavedPresets = loadPresetsFromStorage();
    
    // ... existing initApp code ...
    
    // Add event listeners for presets
    savePresetBtn.addEventListener('click', savePreset);
    loadPresetBtn.addEventListener('click', () => {
        if (presets.length === 0) {
            showNotification('No presets available to load.', 'error');
            return;
        }
        // Show preset selection modal or use the first one
        loadPreset(presets[0].id);
    });
    deletePresetBtn.addEventListener('click', () => {
        if (currentPresetId) {
            deletePreset(currentPresetId);
        } else {
            showNotification('No preset selected to delete.', 'error');
        }
    });
    
    // Allow Enter key to save preset
    presetNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') savePreset();
    });
    
	
	initializePresetSystem();
    // Render presets
    // Force render after a short delay to ensure DOM is ready
    setTimeout(() => {
        console.log('Force re-rendering presets after delay...');
        renderPresetSlots();
    }, 500);
    
    // Show notification if presets were loaded
    if (hasSavedPresets && presets.length > 0) {
        showNotification(`Loaded ${presets.length} saved presets.`, 'info');
    }
}

function initializePresetSystem() {
    console.log('Initializing preset system...');
    
    // Get all preset elements
    const presetElements = {
        name: document.getElementById('presetName'),
        saveBtn: document.getElementById('savePresetBtn'),
        loadBtn: document.getElementById('loadPresetBtn'),
        deleteBtn: document.getElementById('deletePresetBtn'),
        exportBtn: document.getElementById('exportPresetBtn'),
        importBtn: document.getElementById('importPresetBtn'),
        slots: document.getElementById('presetSlots'),
        emptyMessage: document.getElementById('emptyPresetsMessage')
    };
    
    // Debug: Check which elements exist
    console.log('Preset elements found:', {
        name: !!presetElements.name,
        saveBtn: !!presetElements.saveBtn,
        loadBtn: !!presetElements.loadBtn,
        deleteBtn: !!presetElements.deleteBtn,
        slots: !!presetElements.slots,
        emptyMessage: !!presetElements.emptyMessage
    });
    
    // Add event listeners
    if (presetElements.saveBtn) {
        console.log('Adding click listener to save button');
        presetElements.saveBtn.addEventListener('click', handleSavePreset);
    }
    
    if (presetElements.loadBtn) {
        presetElements.loadBtn.addEventListener('click', handleLoadPreset);
    }
    
    if (presetElements.deleteBtn) {
        presetElements.deleteBtn.addEventListener('click', handleDeletePreset);
    }
    
    if (presetElements.exportBtn) {
        presetElements.exportBtn.addEventListener('click', handleExportPreset);
    }
    
    if (presetElements.importBtn) {
        presetElements.importBtn.addEventListener('click', handleImportPreset);
    }
    
    // Enter key for preset name
    if (presetElements.name) {
        presetElements.name.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSavePreset();
        });
    }
    
    // Load presets from storage FIRST
    console.log('Loading presets from storage...');
    loadPresetsFromStorage();
    
    // THEN render them
    console.log('Rendering presets...');
    renderPresetSlots();
    
    console.log('Preset system initialized. Presets count:', presets.length);
}

// Update saveToLocalStorage to also save current preset
function saveToLocalStorage() {
    try {
        const data = {
            objects: objects,
            groups: groups.map(group => ({
                id: group.id,
                tier: group.tier,
                capacity: group.capacity,
                priority: group.priority,
                used: group.used,
                value: group.value,
                targetValue: group.targetValue
            })),
            capacityValues: [
                capacityInputs[0].value,
                capacityInputs[1].value,
                capacityInputs[2].value
            ],
            priorityValues: [
                priorityInputs[0].value,
                priorityInputs[1].value,
                priorityInputs[2].value
            ],
            targetOverrideValues: targetOverrideInputs ? [
                targetOverrideInputs[0].value,
                targetOverrideInputs[1].value,
                targetOverrideInputs[2].value
            ] : []
        };
        localStorage.setItem('objectGroupingData', JSON.stringify(data));
        
        // Also save current preset if it exists
        if (currentPresetId) {
            localStorage.setItem('objectGroupingCurrentPreset', currentPresetId);
        }
    } catch (e) {
        console.error('Error saving to localStorage:', e);
    }
}

// Add preset export/import functions (optional bonus)
function exportPreset(presetId) {
    const preset = presets.find(p => p.id === presetId);
    if (!preset) return;
    
    const dataStr = JSON.stringify(preset, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${preset.name.replace(/[^a-z0-9]/gi, '_')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

function importPreset() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = (event) => {
            try {
                const importedPreset = JSON.parse(event.target.result);
                
                // Validate preset structure
                if (!importedPreset.name || !Array.isArray(importedPreset.objects)) {
                    showNotification('Invalid preset file format.', 'error');
                    return;
                }
                
                // Add to presets
                importedPreset.id = Date.now();
                importedPreset.date = new Date().toISOString();
                presets.push(importedPreset);
                
                // Update UI and storage
                renderPresetSlots();
                savePresetsToStorage();
                showNotification(`Preset "${importedPreset.name}" imported successfully!`, 'success');
            } catch (error) {
                showNotification('Error reading preset file.', 'error');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// Save data to localStorage
function saveToLocalStorage() {
    try {
        const data = {
            objects: objects,
            groups: groups.map(group => ({
                id: group.id,
                tier: group.tier,
                capacity: group.capacity,
                priority: group.priority,
                used: group.used,
                value: group.value,
                targetValue: group.targetValue
            })),
            capacityValues: [
                capacityInputs[0].value,
                capacityInputs[1].value,
                capacityInputs[2].value
            ],
            priorityValues: [
                priorityInputs[0].value,
                priorityInputs[1].value,
                priorityInputs[2].value
            ]
        };
        localStorage.setItem('objectGroupingData', JSON.stringify(data));
    } catch (e) {
        console.error('Error saving to localStorage:', e);
    }
}

// Load data from localStorage
function loadFromLocalStorage() {
    try {
        const savedData = localStorage.getItem('objectGroupingData');
        
        if (savedData) {
            const data = JSON.parse(savedData);
            
            // Load objects
            if (data.objects && Array.isArray(data.objects)) {
                objects = data.objects;
            }
            
            // Load group settings
            if (data.groups && Array.isArray(data.groups)) {
                data.groups.forEach((savedGroup, index) => {
                    if (groups[index]) {
                        const tierConfig = getTierConfig(savedGroup.capacity || groups[index].capacity);
                        
                        groups[index].tier = savedGroup.tier || Object.keys(TIERED_THRESHOLDS).find(key => 
                            TIERED_THRESHOLDS[key].capacity === (savedGroup.capacity || groups[index].capacity)
                        ) || groups[index].tier;
                        
                        groups[index].capacity = savedGroup.capacity || groups[index].capacity;
                        groups[index].priority = savedGroup.priority || groups[index].priority;
                        groups[index].targetValue = savedGroup.targetValue || groups[index].targetValue;
                        
                        // Update UI inputs
                        if (capacityInputs[index]) {
                            capacityInputs[index].value = savedGroup.capacity || capacityInputs[index].value;
                        }
                        if (priorityInputs[index]) {
                            priorityInputs[index].value = savedGroup.priority || priorityInputs[index].value;
                        }
                    }
                });
            }
            
            // Load individual input values
            if (data.capacityValues && data.capacityValues.length === 3) {
                capacityInputs.forEach((input, index) => {
                    if (data.capacityValues[index]) {
                        input.value = data.capacityValues[index];
                    }
                });
            }
            
            if (data.priorityValues && data.priorityValues.length === 3) {
                priorityInputs.forEach((input, index) => {
                    if (data.priorityValues[index]) {
                        input.value = data.priorityValues[index];
                    }
                });
            }
            
            return true;
        }
    } catch (e) {
        console.error('Error loading from localStorage:', e);
    }
    return false;
}

// Initialize the app
function initApp() {
    // Load saved data
    const hasSavedData = loadFromLocalStorage();
	const hasSavedPresets = loadPresetsFromStorage();
    
    // Add event listeners
    addObjectBtn.addEventListener('click', addObject);
    clearObjectsBtn.addEventListener('click', clearObjects);
    addSampleBtn.addEventListener('click', addSampleObjects);
    calculateBtn.addEventListener('click', calculateOptimalGroups);
    
    // Allow Enter key to add objects
    objectValueInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addObject();
    });
    
    objectCostInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addObject();
    });
    
    // Update group configurations when inputs change
    capacityInputs.forEach((input, index) => {
        input.addEventListener('change', () => {
            const capacity = parseInt(input.value) || 9;
            const tierConfig = getTierConfig(capacity);
            const selectedOption = input.querySelector(`option[value="${capacity}"]`);
            const tierName = selectedOption ? selectedOption.dataset.tier : 'epic';
            
            groups[index].capacity = capacity;
            groups[index].tier = tierName.toUpperCase();
            groups[index].targetValue = tierConfig.target;
            updateGroupDisplays();
            saveToLocalStorage();
        });
    });
    
    priorityInputs.forEach((input, index) => {
        input.addEventListener('change', () => {
            groups[index].priority = parseInt(input.value);
            updatePriorityDisplays();
            saveToLocalStorage();
        });
    });
    
    // Update UI
    updatePriorityDisplays();
    renderObjectsList();
    updateGroupDisplays();
    
    // Show notification if data was loaded
    if (hasSavedData && objects.length > 0) {
        showNotification(`Loaded ${objects.length} saved astrogems from previous session/first preset`, 'info');
    } else if (objects.length === 0) {
        // Add a few sample objects by default if none exist
        setTimeout(() => {
            addSampleObjects();
        }, 500);
    }
}

// Add a new object
function addObject() {
    const cost = parseInt(objectCostInput.value);
    const value = parseInt(objectValueInput.value);
    const option1 = objectOption1Input.value;
    const option2 = objectOption2Input.value;
    
    if (isNaN(cost) || cost <= 0 || isNaN(value) || value <= 0) {
        showNotification('Please enter valid astrogem details (positive cost and value).', 'error');
        return;
    }
    
    // Create new object with auto-generated ID
    const objectId = objects.length > 0 ? Math.max(...objects.map(o => o.id)) + 1 : 1;
    const newObject = {
        id: objectId,
        cost,
        value,
        option1,
        option2,
        valueRatio: value / cost
    };
    
    objects.push(newObject);
    
    // Clear inputs
    objectCostInput.value = '';
    objectValueInput.value = '';
    objectOption1Input.value = '';
    objectOption2Input.value = '';

    
    // Focus back on value input
    objectValueInput.focus();
    
    // Update UI
    renderObjectsList();
    saveToLocalStorage();
	//Changing add/save button
    if (addObjectBtn.innerHTML == '\n<i class="fas fa-floppy-disk"></i> Save Astrogem\n')
		showNotification(`Astrogem #${objectId} saved successfully!`, 'success');
	else 
		showNotification(`Astrogem #${objectId} added successfully!`, 'success');
	
	addObjectBtn.innerHTML = '\n<i class="fas fa-plus"></i> Add Astrogem\n';
}

// Edit an existing object
function editObject(id) {
    const object = objects.find(obj => obj.id === id);
    if (!object) return;
    
    // Pre-fill the form with object data
    objectCostInput.value = object.cost;
    objectValueInput.value = object.value;
    objectOption1Input.value = object.option1;
    objectOption2Input.value = object.option2;
		addObjectBtn.innerHTML = '\n<i class="fas fa-floppy-disk"></i> Save Astrogem\n';
    
    // Remove the object from the list
    objects = objects.filter(obj => obj.id !== id);
    
    // Update UI
    renderObjectsList();
    saveToLocalStorage();
    
    showNotification(`Editing Astrogem #${object.id}`, 'info');
    objectValueInput.focus();
}

// Delete an object
function deleteObject(id) {
    const object = objects.find(obj => obj.id === id);
    if (!object) return;
    
    objects = objects.filter(obj => obj.id !== id);
    
    // Update UI
    renderObjectsList();
    saveToLocalStorage();
    
    showNotification(`Astrogem #${object.id} deleted.`, 'success');
}

// Clear all objects
function clearObjects() {
    if (objects.length === 0) {
        showNotification('No Astrogems to clear.', 'info');
        return;
    }
    
    if (confirm('Are you sure you want to clear all astrogems?')) {
        objects = [];
        renderObjectsList();
        saveToLocalStorage();
        showNotification('All astrogems cleared.', 'success');
    }
}

// Add sample objects for testing
function addSampleObjects() {
    const sampleObjects = [
        { cost: 8, value: 6},
        { cost: 6, value: 5},
        { cost: 4, value: 4},
        { cost: 5, value: 4},
        { cost: 3, value: 3},
        { cost: 5, value: 5},
        { cost: 4, value: 4},
        { cost: 6, value: 5},
        { cost: 10, value: 5},
        { cost: 4, value: 3},
        { cost: 3, value: 5},
		{ cost: 5, value: 4},
		{ cost: 4, value: 4},
		{ cost: 5, value: 3},
		{ cost: 6, value: 5},
		{ cost: 3, value: 4},
		{ cost: 4, value: 3},
		{ cost: 5, value: 4},
        { cost: 3, value: 2}
    ];
    
    let nextId = objects.length > 0 ? Math.max(...objects.map(o => o.id)) + 1 : 1;
    
    sampleObjects.forEach(obj => {
        objects.push({
            id: nextId++,
            cost: obj.cost,
            value: obj.value,
            option1: obj.option1,
            option2: obj.option2,
            valueRatio: obj.value / obj.cost
        });
    });
    
    renderObjectsList();
    saveToLocalStorage();
    showNotification(`${sampleObjects.length} sample astrogems added.`, 'success');
}

// Render the objects list
function renderObjectsList() {
    // Hide empty message if there are objects
    if (objects.length > 0) {
        emptyObjectsMessage.style.display = 'none';
    } else {
        emptyObjectsMessage.style.display = 'block';
    }
    
    // Clear the list
    objectsList.innerHTML = '';
    
    // Add each object to the list
    objects.forEach(object => {
        const objectElement = document.createElement('div');
        objectElement.className = 'object-item';
        
        // Build tags for options
        const tags = [];
        if (object.option1) tags.push(`Opt1: ${object.option1.toUpperCase()}`);
        if (object.option2) tags.push(`Opt2: ${object.option2.toUpperCase()}`);
        
        objectElement.innerHTML = `
            <div class="object-info">
                <div class="object-value-display">${object.cost} / ${object.value}</div>
                <div class="object-details">
                    <span>Willpower Cost: ${object.cost}</span>
					<span>Order Points: ${object.value}</span>
                </div>
				
                ${tags.length > 0 ? `
                    <div class="object-tags">
                        ${tags.map(tag => `<span class="object-tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="object-id">ID: ${object.id}</div>
            </div>
            <div class="object-actions">
                <button class="btn-icon btn-edit" onclick="editObject(${object.id})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-delete" onclick="deleteObject(${object.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        objectsList.appendChild(objectElement);
    });
}

// Calculate optimal groups with tiered thresholds
function calculateOptimalGroups() {
    if (objects.length === 0) {
        showNotification('Please add objects first.', 'error');
        return;
    }
    
    console.log('=== STARTING OPTIMIZATION ===');
    console.log('Total objects:', objects.length);
    console.log('Objects (sorted by value/cost):', objects.map(o => ({
        id: o.id,
        cost: o.cost,
        value: o.value,
        ratio: o.valueRatio
    })).sort((a, b) => b.ratio - a.ratio));
    
    // Reset groups
    groups.forEach(group => {
        group.used = 0;
        group.value = 0;
        group.objects = [];
        // Update target value based on current capacity
        const tierConfig = getTierConfig(group.capacity);
        group.targetValue = tierConfig.target;
    });
    
    // Update groups with current capacity and priority from inputs
    /* groups.forEach((group, index) => {
        group.capacity = parseInt(capacityInputs[index].value) || 9;
        group.priority = parseInt(priorityInputs[index].value);
        const tierConfig = getTierConfig(group.capacity);
        
        // Check for override target value // temporarily off
        if (targetOverrideInputs && targetOverrideInputs[index]) {
            const overrideValue = parseInt(targetOverrideInputs[index].value);
            if (!isNaN(overrideValue) && overrideValue > 0) {
                group.targetValue = overrideValue;
                console.log(`Group ${index + 1}: Using override target ${overrideValue}`);
            } else {
                group.targetValue = tierConfig.target;
                console.log(`Group ${index + 1}: Using tier target ${tierConfig.target} (${tierConfig.name})`);
            }
        } else {
            group.targetValue = tierConfig.target;
        }*/

		groups.forEach((group, index) => {
        group.capacity = parseInt(capacityInputs[index].value) || 9;
        group.priority = parseInt(priorityInputs[index].value);
        const tierConfig = getTierConfig(group.capacity);
        group.targetValue = tierConfig.target;
        group.tier = Object.keys(TIERED_THRESHOLDS).find(key => 
            TIERED_THRESHOLDS[key].capacity === group.capacity
        ) || 'EPIC';
    });

    
    console.log('Group configurations:', groups.map(g => ({
        name: g.name,
        capacity: g.capacity,
        target: g.targetValue,
        priority: g.priority
    })));
    
    // Step 1: Sort objects by value-to-cost ratio (descending)
    const availableObjects = [...objects]
        .map(obj => ({ ...obj, assigned: false }))
        .sort((a, b) => {
            // First by value-to-cost ratio
            if (b.valueRatio !== a.valueRatio) {
                return b.valueRatio - a.valueRatio;
            }
            // Then by value (descending)
            if (b.value !== a.value) {
                return b.value - a.value;
            }
            // Then by cost (ascending)
            return a.cost - b.cost;
        });
    
    console.log('Sorted objects for distribution:', availableObjects.map(o => ({
        id: o.id,
        value: o.value,
        cost: o.cost,
        ratio: o.valueRatio
    })));
    
    // Step 2: Sort groups by priority (descending)
    const sortedGroups = [...groups].sort((a, b) => {
        // First by priority
        if (b.priority !== a.priority) {
            return b.priority - a.priority;
        }
        // Then by target value (descending - higher targets first)
        return b.targetValue - a.targetValue;
    });
    
    console.log('Sorted groups for distribution:', sortedGroups.map(g => ({
        name: g.name,
        priority: g.priority,
        target: g.targetValue,
        capacity: g.capacity
    })));
    
    // Step 3: Assign objects to groups using greedy algorithm
    // We'll try multiple strategies for each group
    
    // Strategy 1: Try to reach target exactly with best objects
    for (const group of sortedGroups) {
        console.log(`\n=== Processing ${group.name} (Target: ${group.targetValue}, Capacity: ${group.capacity}) ===`);
        
        // Find best combination to reach target
        for (let i = 0; i < availableObjects.length; i++) {
            if (availableObjects[i].assigned) continue;
            if (group.objects.length >= group.maxObjects) break;
            
            const object = availableObjects[i];
            const newValue = group.value + object.value;
            const newCost = group.used + object.cost;
            
            // Check if we can add this object
            if (newCost <= group.capacity) {
                // For groups with capacity < 15, don't exceed 14
                if (group.capacity < 15 && newValue > 14) {
                    console.log(`Skipping object ${object.id} (value: ${object.value}) - would exceed 14 limit`);
                    continue;
                }
                
                // Calculate how close we are to target
                const currentDiff = Math.abs(group.targetValue - group.value);
                const newDiff = Math.abs(group.targetValue - newValue);
                
                // Prefer adding if it gets us closer to target
                // OR if we're still far from target (more than 30% away)
                const isFarFromTarget = group.value < group.targetValue * 0.7;
                
                if (newDiff <= currentDiff || isFarFromTarget) {
                    // Add object
                    group.objects.push(object);
                    group.used = newCost;
                    group.value = newValue;
                    availableObjects[i].assigned = true;
                    
                    console.log(`Added object ${object.id} (value: ${object.value}, cost: ${object.cost}) to ${group.name}`);
                    console.log(`Group now: value=${group.value}, cost=${group.used}, objects=${group.objects.length}`);
                    
                    // If we reached or exceeded target, move to next group
                    if (group.value >= group.targetValue) {
                        console.log(`✓ ${group.name} reached target ${group.targetValue}`);
                        break;
                    }
                }
            }
        }
    }
    
    // Strategy 2: Fill groups that are below target with remaining objects
    // Sort groups by how far they are from target (furthest below first)
    const groupsBelowTarget = groups
        .filter(g => g.value < g.targetValue && g.objects.length < g.maxObjects)
        .sort((a, b) => {
            const aDiff = a.targetValue - a.value;
            const bDiff = b.targetValue - b.value;
            return bDiff - aDiff; // Largest deficit first
        });
    
    console.log(`\n=== Filling groups below target ===`);
    console.log('Groups below target:', groupsBelowTarget.map(g => ({
        name: g.name,
        current: g.value,
        target: g.targetValue,
        deficit: g.targetValue - g.value
    })));
    
    for (const group of groupsBelowTarget) {
        console.log(`\nFilling ${group.name} (current: ${group.value}, target: ${group.targetValue})`);
        
        // Get remaining unassigned objects, sorted by value-to-cost ratio
        const remainingObjects = availableObjects
            .filter(o => !o.assigned)
            .sort((a, b) => b.valueRatio - a.valueRatio);
        
        for (const object of remainingObjects) {
            if (group.objects.length >= group.maxObjects) break;
            
            const newValue = group.value + object.value;
            const newCost = group.used + object.cost;
            
            if (newCost <= group.capacity) {
                // For groups with capacity < 15, don't exceed 14
                if (group.capacity < 15 && newValue > 14) {
                    continue;
                }
                
                // Add object
                group.objects.push(object);
                group.used = newCost;
                group.value = newValue;
                object.assigned = true;
                
                console.log(`Added object ${object.id} (value: ${object.value}, cost: ${object.cost})`);
                
                // Stop if we reached target
                if (group.value >= group.targetValue) {
                    console.log(`✓ ${group.name} now reached target`);
                    break;
                }
            }
        }
    }
    
    // Strategy 3: Distribute any remaining objects to maximize value
    // Sort groups by remaining capacity (descending)
    const groupsByRemainingCapacity = [...groups]
        .filter(g => g.objects.length < g.maxObjects)
        .sort((a, b) => {
            const aRemaining = a.capacity - a.used;
            const bRemaining = b.capacity - b.used;
            return bRemaining - aRemaining;
        });
    
    console.log(`\n=== Distributing remaining objects ===`);
    console.log('Groups by remaining capacity:', groupsByRemainingCapacity.map(g => ({
        name: g.name,
        remainingCapacity: g.capacity - g.used,
        slots: g.maxObjects - g.objects.length
    })));
    
    // Get remaining objects sorted by value-to-cost ratio
    const finalObjects = availableObjects
        .filter(o => !o.assigned)
        .sort((a, b) => b.valueRatio - a.valueRatio);
    
    console.log('Remaining objects:', finalObjects.length);
    
    for (const object of finalObjects) {
        for (const group of groupsByRemainingCapacity) {
            if (group.objects.length >= group.maxObjects) continue;
            
            const newValue = group.value + object.value;
            const newCost = group.used + object.cost;
            
            if (newCost <= group.capacity) {
                // For groups with capacity < 15, don't exceed 14
                if (group.capacity < 15 && newValue > 14) {
                    continue;
                }
                
                // Add object
                group.objects.push(object);
                group.used = newCost;
                group.value = newValue;
                object.assigned = true;
                
                console.log(`Added remaining object ${object.id} to ${group.name}`);
                break;
            }
        }
    }
    
    // Step 4: Try to optimize further by swapping objects between groups
    optimizeBySwapping();
    
    // Clear assigned flags
    availableObjects.forEach(obj => delete obj.assigned);
    
    // Update UI with results
    console.log('\n=== FINAL RESULTS ===');
    groups.forEach((group, i) => {
        console.log(`${group.name}: Value=${group.value}, Target=${group.targetValue}, Cost=${group.used}/${group.capacity}, Objects=${group.objects.length}`);
        console.log('Objects:', group.objects.map(o => `#${o.id} (v:${o.value}, c:${o.cost})`));
    });
    
    updateGroupDisplays();
    renderGroupObjects();
    updateSummary();
    saveToLocalStorage();
    
    showNotification(`Optimization complete!`, 'success');
}

// New optimization function to improve results by swapping objects
function optimizeBySwapping() {
    console.log('\n=== OPTIMIZING BY SWAPPING ===');
    
    let improvements = 0;
    const maxIterations = 10;
    
    for (let iter = 0; iter < maxIterations; iter++) {
        let madeImprovement = false;
        
        // Try all possible swaps between groups
        for (let i = 0; i < groups.length; i++) {
            for (let j = i + 1; j < groups.length; j++) {
                const groupA = groups[i];
                const groupB = groups[j];
                
                // Try swapping objects between groups
                for (const objA of groupA.objects) {
                    for (const objB of groupB.objects) {
                        // Check if swap is possible
                        const newCostA = groupA.used - objA.cost + objB.cost;
                        const newCostB = groupB.used - objB.cost + objA.cost;
                        
                        if (newCostA <= groupA.capacity && newCostB <= groupB.capacity) {
                            // Calculate new values
                            const newValueA = groupA.value - objA.value + objB.value;
                            const newValueB = groupB.value - objB.value + objA.value;
                            
                            // Calculate how close to targets
                            const oldDiffA = Math.abs(groupA.targetValue - groupA.value);
                            const oldDiffB = Math.abs(groupB.targetValue - groupB.value);
                            const newDiffA = Math.abs(groupA.targetValue - newValueA);
                            const newDiffB = Math.abs(groupB.targetValue - newValueB);
                            
                            // Total improvement
                            const oldTotalDiff = oldDiffA + oldDiffB;
                            const newTotalDiff = newDiffA + newDiffB;
                            
                            // Also check if it improves value for capacity-limited groups
                            const oldTotalValue = groupA.value + groupB.value;
                            const newTotalValue = newValueA + newValueB;
                            
                            // Make swap if it improves closeness to targets OR increases total value
                            if (newTotalDiff < oldTotalDiff || newTotalValue > oldTotalValue) {
                                // Perform swap
                                const indexA = groupA.objects.indexOf(objA);
                                const indexB = groupB.objects.indexOf(objB);
                                
                                if (indexA !== -1 && indexB !== -1) {
                                    // Swap objects
                                    groupA.objects[indexA] = objB;
                                    groupB.objects[indexB] = objA;
                                    
                                    // Update costs and values
                                    groupA.used = newCostA;
                                    groupA.value = newValueA;
                                    groupB.used = newCostB;
                                    groupB.value = newValueB;
                                    
                                    console.log(`Swap ${iter}.${improvements}: ${groupA.name}#${objA.id} ↔ ${groupB.name}#${objB.id}`);
                                    console.log(`  ${groupA.name}: ${groupA.value} (was ${groupA.value + objA.value - objB.value})`);
                                    console.log(`  ${groupB.name}: ${groupB.value} (was ${groupB.value + objB.value - objA.value})`);
                                    
                                    improvements++;
                                    madeImprovement = true;
                                }
                            }
                        }
                    }
                }
            }
        }
        
        if (!madeImprovement) {
            console.log(`No more improvements found after ${iter + 1} iterations`);
            break;
        }
    }
    
    console.log(`Total improvements: ${improvements}`);
}


// Update group displays with current values
function updateGroupDisplays() {
    groups.forEach((group, index) => {
        const tierConfig = getTierConfig(group.capacity);
        
        // Update capacity display with tier name and color
        groupCapacityDisplays[index].textContent = `${tierConfig.name}`;
        groupCapacityDisplays[index].className = tierConfig.colorClass;
        
        groupUsedDisplays[index].textContent = group.used;
        groupValueDisplays[index].textContent = group.value;
        
        // Update value indicator
        const valueIndicator = groupValueIndicators[index];
        const target = group.targetValue;
        const diff = group.value - target;
        const absDiff = Math.abs(diff);
        
        // For display purposes, Ancient has a special "perfect" value of 20
        // even though its target for calculations is 19
        const displayTarget = group.capacity === 17 ? 20 : target;
        const displayDiff = group.value - displayTarget;
        const displayAbsDiff = Math.abs(displayDiff);
        
        // Determine which tier we're dealing with
        const isAncient = group.capacity === 17;
        const isRelic = group.capacity === 15;
        const isEpicOrLegendary = group.capacity === 9 || group.capacity === 12;
        
        if (isAncient) {
            // Ancient tier special rules:
            // - 20 is "perfect" (even though target is 19)
            // - 19 is "close" 
            // - 18-21 is "acceptable"
            // - Otherwise show under/over
            
            if (group.value === 20) {
                valueIndicator.textContent = `✓ Perfect! 20`;
                valueIndicator.className = "value-indicator value-perfect";
            } else if (group.value === 19) {
                valueIndicator.textContent = `≈ Close 19/20`;
                valueIndicator.className = "value-indicator value-close";
            } else if (group.value >= 18 && group.value <= 21) {
                valueIndicator.textContent = `~ ${group.value}/20`;
                valueIndicator.className = "value-indicator value-acceptable";
            } else if (group.value < 18) {
                valueIndicator.textContent = `↓ ${20 - group.value} under 20`;
                valueIndicator.className = "value-indicator value-warning";
            } else {
                valueIndicator.textContent = `↑ ${group.value - 20} over 20`;
                valueIndicator.className = "value-indicator value-excess";
            }
            
        } else if (isRelic) {
            // Relic tier: target 17
            if (group.value === 17) {
                valueIndicator.textContent = `✓ Perfect! 17`;
                valueIndicator.className = "value-indicator value-perfect";
            } else if (group.value === 16 || group.value === 18) {
                valueIndicator.textContent = `≈ Close ${group.value}/17`;
                valueIndicator.className = "value-indicator value-close";
            } else if (group.value >= 15 && group.value <= 19) {
                valueIndicator.textContent = `~ ${group.value}/17`;
                valueIndicator.className = "value-indicator value-acceptable";
            } else if (group.value < 15) {
                valueIndicator.textContent = `↓ ${17 - group.value} under 17`;
                valueIndicator.className = "value-indicator value-warning";
            } else {
                valueIndicator.textContent = `↑ ${group.value - 17} over 17`;
                valueIndicator.className = "value-indicator value-excess";
            }
            
        } else if (isEpicOrLegendary) {
            // Epic/Legendary tier: target 14
            if (group.value === 14) {
                valueIndicator.textContent = `✓ Perfect! 14`;
                valueIndicator.className = "value-indicator value-perfect";
            } else if (group.value === 13 || group.value === 15) {
                valueIndicator.textContent = `≈ Close ${group.value}/14`;
                valueIndicator.className = "value-indicator value-close";
            } else if (group.value >= 12 && group.value <= 16) {
                valueIndicator.textContent = `~ ${group.value}/14`;
                valueIndicator.className = "value-indicator value-acceptable";
            } else if (group.value < 12) {
                valueIndicator.textContent = `↓ ${14 - group.value} under 14`;
                indicatorClass = 'value-warning';
            } else {
                valueIndicator.textContent = `↑ ${group.value - 14} over 14`;
                valueIndicator.className = "value-indicator value-excess";
            }
            
        } else {
            // Custom override targets
            if (group.value === target) {
                valueIndicator.textContent = `✓ Perfect! ${target}`;
                valueIndicator.className = "value-indicator value-perfect";
            } else if (Math.abs(diff) <= 1) {
                valueIndicator.textContent = `≈ Close ${group.value}/${target}`;
                valueIndicator.className = "value-indicator value-close";
            } else if (Math.abs(diff) <= 2) {
                valueIndicator.textContent = `~ ${group.value}/${target}`;
                valueIndicator.className = "value-indicator value-acceptable";
            } else if (diff < 0) {
                valueIndicator.textContent = `↓ ${absDiff} under ${target}`;
                valueIndicator.className = "value-indicator value-warning";
            } else {
                valueIndicator.textContent = `↑ ${absDiff} over ${target}`;
                valueIndicator.className = "value-indicator value-excess";
            }
        }
        
        // Add tooltip showing both display and calculation targets for Ancient
        let tooltip = `Value: ${group.value}`;
        if (isAncient) {
            tooltip += `\nDisplay Target: 20 (Perfect)\nCalculation Target: 19`;
        } else {
            tooltip += `\nTarget: ${target}`;
        }
        tooltip += `\nCapacity: ${group.capacity} (${tierConfig.name})`;
        valueIndicator.title = tooltip;
    });
    
    updatePriorityDisplays();
}

// Update priority displays
function updatePriorityDisplays() {
    const priorityText = {
        1: 'Low',
        2: 'Mid',
        3: 'High'
    };
    
    groups.forEach((group, index) => {
        groupPriorityDisplays[index].textContent = priorityText[group.priority] || 'Medium';
    });
}

// Render objects in each group
function renderGroupObjects() {
    groups.forEach((group, index) => {
        const container = groupObjectsContainers[index];
        
        if (group.objects.length === 0) {
            container.innerHTML = '<div class="empty-message">No astrogems assigned yet</div>';
            return;
        }
        
        container.innerHTML = '';
        
        group.objects.forEach(object => {
            // Build tags for options
            const tags = [];
            if (object.option1) tags.push(`Opt1: ${object.option1.toUpperCase()}`);
            if (object.option2) tags.push(`Opt2: ${object.option2.toUpperCase()}`);
            
            const objectElement = document.createElement('div');
            objectElement.className = 'group-object';
            objectElement.innerHTML = `
                <div>
                    <div class="group-object-details">Gem ID #${object.id}</div>
                    <div class="group-object-details">Cost: ${object.cost}, Points: ${object.value}</div>
                    ${tags.length > 0 ? `
                        <div class="group-object-tags">
                            ${tags.map(tag => `<span class="group-object-tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
            
            container.appendChild(objectElement);
        });
        
        // Add count indicator
        const countElement = document.createElement('div');
        countElement.style.textAlign = 'center';
        countElement.style.marginTop = '10px';
        countElement.style.fontSize = '0.85rem';
        countElement.style.opacity = '0.8';
        countElement.textContent = `${group.objects.length} of ${group.maxObjects} astrogems`;
        container.appendChild(countElement);
    });
}

// Update summary statistics
function updateSummary() {
    let totalValue = 0;
    let totalCost = 0;
    let totalAssigned = 0;
    let maxPossible = groups.length * MAX_OBJECTS_PER_GROUP;
    
    groups.forEach(group => {
        totalValue += group.value;
        totalCost += group.used;
        totalAssigned += group.objects.length;
    });
    
    totalValueDisplay.textContent = totalValue;
    totalCostDisplay.textContent = totalCost;
    objectsAssignedDisplay.textContent = `${totalAssigned}/${maxPossible}`;
}

// Show notification
function showNotification(message, type = 'info') {
    const icon = notification.querySelector('i');
    const content = notification.querySelector('.notification-content');
    
    // Set icon based on type
    if (type === 'success') {
        icon.className = 'fas fa-check-circle';
        notification.className = 'notification notification-success';
    } else if (type === 'error') {
        icon.className = 'fas fa-exclamation-circle';
        notification.className = 'notification notification-error';
    } else {
        icon.className = 'fas fa-info-circle';
        notification.className = 'notification notification-info';
    }
    
    content.textContent = message;
    
    // Show notification
    notification.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}


window.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded, setting up preset button...');
    
    // Wait a moment for all scripts to load
    setTimeout(() => {
        const saveBtn = document.getElementById('savePresetBtn');
        if (saveBtn) {
            console.log('Found save button, adding direct event listener');
            saveBtn.addEventListener('click', function(e) {
                console.log('DIRECT: Save button clicked!', e);
                handleSavePreset(e);
            });
        }
		renderPresetSlots();
    }, 1000);
});

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', initApp);
