// Configuration constants
const TIERED_THRESHOLDS = {
    EPIC: { capacity: 9, target: 10, name: "Epic", colorClass: "epic-display" },
    LEGENDARY: { capacity: 12, target: 14, name: "Legendary", colorClass: "legendary-display" },
    RELIC: { capacity: 15, target: 17, name: "Relic", colorClass: "relic-display" },
    ANCIENT: { capacity: 17, target: 19, name: "Ancient", colorClass: "ancient-display" }
};

const FALLBACK_TARGET = 10;
const MAX_OBJECTS_PER_GROUP = 4;

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
        targetValue: 14 
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
        showNotification(`Loaded ${objects.length} saved astrogems from previous session.`, 'info');
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
        { cost: 8, value: 6, option1: "a", option2: "b" },
        { cost: 6, value: 5, option1: "b", option2: "c" },
        { cost: 4, value: 4, option1: "c", option2: "d" },
        { cost: 5, value: 4, option1: "a", option2: "a" },
        { cost: 3, value: 3, option1: "d", option2: "b" },
        { cost: 5, value: 5, option1: "b", option2: "d" },
        { cost: 4, value: 4, option1: "c", option2: "a" },
        { cost: 6, value: 5, option1: "a", option2: "c" },
        { cost: 10, value: 8, option1: "d", option2: "d" },
        { cost: 4, value: 3, option1: "b", option2: "b" },
        { cost: 3, value: 4, option1: "c", option2: "c" },
        { cost: 3, value: 3, option1: "a", option2: "d" }
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
        showNotification('Please add astrogems first.', 'error');
        return;
    }
    
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
    groups.forEach((group, index) => {
        group.capacity = parseInt(capacityInputs[index].value) || 9;
        group.priority = parseInt(priorityInputs[index].value);
        const tierConfig = getTierConfig(group.capacity);
        group.targetValue = tierConfig.target;
        group.tier = Object.keys(TIERED_THRESHOLDS).find(key => 
            TIERED_THRESHOLDS[key].capacity === group.capacity
        ) || 'EPIC';
    });
    
    // Sort groups by priority (descending)
    const sortedGroups = [...groups].sort((a, b) => b.priority - a.priority);
    
    // Create a copy of objects sorted by value (descending)
    let availableObjects = [...objects].sort((a, b) => b.value - a.value);
    
    // First pass: Try to get each group as close to its target value as possible
    // Starting with highest priority groups first
    for (const group of sortedGroups) {
        const target = group.targetValue;
        
        // Try different combinations to get close to target
        // We'll use a greedy approach that tries to add objects without exceeding target too much
        for (let i = 0; i < availableObjects.length; i++) {
            const object = availableObjects[i];
            
            // Skip if object already assigned
            if (object.assigned) continue;
            
            // Check if we can add this object without exceeding max objects
            if (group.objects.length >= group.maxObjects) break;
            
            // Check if object fits in group capacity
            if (group.used + object.cost <= group.capacity) {
                // Calculate what the new value would be
                const newValue = group.value + object.value;
                
                // For groups with capacity < 15 (Epic/Legendary), don't exceed 14
                if (group.capacity < 15 && newValue > 14) {
                    continue; // Skip this object as it would exceed the limit
                }
                
                // Check if adding this object gets us closer to target
                // Or if we're still far from target, add it
                const currentDiff = Math.abs(target - group.value);
                const newDiff = Math.abs(target - newValue);
                
                // If it gets us closer to target, add it
                // Or if we're below target and this doesn't push us too far over
                if (newDiff <= currentDiff || (group.value < target && newValue <= target * 1.1)) {
                    // Assign object to group
                    group.objects.push(object);
                    group.used += object.cost;
                    group.value += object.value;
                    
                    // Mark object as assigned
                    object.assigned = true;
                    
                    // Remove from available objects array
                    availableObjects.splice(i, 1);
                    i--; // Adjust index after removal
                }
            }
        }
    }
    
    // Second pass: For groups that are still below their target, try to add more objects
    // Sort groups by how far they are from target (groups furthest below target first)
    const groupsByNeed = [...groups].sort((a, b) => {
        const aDiff = a.targetValue - a.value;
        const bDiff = b.targetValue - b.value;
        // Only consider groups below target
        if (aDiff > 0 && bDiff > 0) return bDiff - aDiff;
        if (aDiff > 0) return -1;
        if (bDiff > 0) return 1;
        return 0;
    });
    
    // Reset available objects (only unassigned ones)
    availableObjects = objects.filter(obj => !obj.assigned).sort((a, b) => b.value - a.value);
    
    for (const group of groupsByNeed) {
        // If group is already at or above target, skip
        if (group.value >= group.targetValue) continue;
        
        for (let i = 0; i < availableObjects.length; i++) {
            const object = availableObjects[i];
            
            // Skip if object already assigned
            if (object.assigned) continue;
            
            // Check if we can add this object without exceeding max objects
            if (group.objects.length >= group.maxObjects) break;
            
            // Check if object fits in group capacity
            if (group.used + object.cost <= group.capacity) {
                // For groups with capacity < 15 (Epic/Legendary), don't exceed 14
                const newValue = group.value + object.value;
                if (group.capacity < 15 && newValue > 14) {
                    continue; // Skip this object as it would exceed the limit
                }
                
                // Assign object to group
                group.objects.push(object);
                group.used += object.cost;
                group.value += object.value;
                
                // Mark object as assigned
                object.assigned = true;
                
                // Remove from available objects array
                availableObjects.splice(i, 1);
                i--; // Adjust index after removal
            }
        }
    }
    
    // Third pass: Distribute any remaining objects to groups with capacity
    // Sort groups by remaining capacity (descending)
    const groupsByCapacity = [...groups].sort((a, b) => {
        const aRemaining = a.capacity - a.used;
        const bRemaining = b.capacity - b.used;
        return bRemaining - aRemaining;
    });
    
    // Get remaining unassigned objects
    availableObjects = objects.filter(obj => !obj.assigned).sort((a, b) => b.valueRatio - a.valueRatio);
    
    for (const object of availableObjects) {
        for (const group of groupsByCapacity) {
            // Check if we can add this object without exceeding max objects
            if (group.objects.length >= group.maxObjects) continue;
            
            // Check if object fits in group capacity
            if (group.used + object.cost <= group.capacity) {
                // For groups with capacity < 15 (Epic/Legendary), check if adding would exceed 14
                if (group.capacity < 15 && (group.value + object.value) > 14) {
                    continue; // Skip for low capacity groups
                }
                
                // Assign object to group
                group.objects.push(object);
                group.used += object.cost;
                group.value += object.value;
                
                // Mark object as assigned
                object.assigned = true;
                break;
            }
        }
    }
    
    // Clear assigned flags for next calculation
    objects.forEach(obj => delete obj.assigned);
    
    // Update UI with results
    updateGroupDisplays();
    renderGroupObjects();
    updateSummary();
    saveToLocalStorage();
    
    showNotification(`Astrogems distributed using tiered thresholds!`, 'success');
}

// Update group displays with current values
function updateGroupDisplays() {
    groups.forEach((group, index) => {
        const tierConfig = getTierConfig(group.capacity);
        
        // Update capacity display with tier name and color
        groupCapacityDisplays[index].textContent = `${tierConfig.name} (${group.capacity})`;
        groupCapacityDisplays[index].className = tierConfig.colorClass;
        
        groupUsedDisplays[index].textContent = group.used;
        groupValueDisplays[index].textContent = group.value;
        
        // Update value indicator
        const valueIndicator = groupValueIndicators[index];
        const target = group.targetValue;
        const diff = group.value - target;
        
        // Determine which threshold level group is at
        let targetText = `Target: ${target}`;
        
        if (Math.abs(diff) <= 2) {
            valueIndicator.textContent = `✓ ${targetText}`;
            valueIndicator.className = "value-indicator value-good";
        } else if (diff > 0) {
            valueIndicator.textContent = `${targetText}, +${diff} over`;
            valueIndicator.className = "value-indicator value-excess";
        } else {
            valueIndicator.textContent = `${targetText}, ${Math.abs(diff)} under`;
            valueIndicator.className = "value-indicator value-warning";
        }
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

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', initApp);
