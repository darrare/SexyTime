let atomicActions = [];
let modifiers = {};
let sceneTones = {};
let finishingMoves = {};
let alwaysAvailableModifiers = {};
let modifierGroups = {};
let mutuallyExclusiveModifiers = [];
let currentRound = 'foreplay';
let currentVibes = ['sensual', 'rough', 'teasing', 'neutral'];

let profileWhitelist = {
    atomicActions: new Set(),
    modifiers: new Set(),
    sceneTones: new Set(),
    finishingMoves: new Set()
};

async function loadData() {
    const [actionsRes, dataRes] = await Promise.all([
        fetch('Configs/atomic_actions.json'),
        fetch('Configs/other_data.json')
    ]);

    const actionsJson = await actionsRes.json();
    atomicActions = Object.entries(actionsJson).map(([key, value]) => ({ name: key, ...value }));

    const otherData = await dataRes.json();
    modifiers = otherData.modifiers || {};
    sceneTones = otherData.sceneTones || {};
    finishingMoves = otherData.finishingMoves || {};
    alwaysAvailableModifiers = otherData.alwaysAvailableModifiers || {};
    modifierGroups = otherData.modifierGroups || {};
    mutuallyExclusiveModifiers = otherData.mutuallyExclusiveModifiers || [];

    const toneSelect = document.getElementById('toneSelect');
    for (const [id, label] of Object.entries(sceneTones)) {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = label;
        toneSelect.appendChild(option);
    }

    setRound('foreplay');
    updateVibeButtonStyles();
    loadCouplesResultsFromQueryStringIfAvailable();
}

function handleProfileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const profileData = JSON.parse(e.target.result);
            applyProfileFiltering(profileData);
        } catch (err) {
            console.error("Invalid JSON uploaded:", err);
            alert("Failed to load profile. Please upload a valid JSON file.");
        }
    };
    reader.readAsText(file);
}

async function loadCouplesResultsFromQueryStringIfAvailable() {
    if (!isQueryParamAvailable(window.location.href, "y") || 
        !isQueryParamAvailable(window.location.href, "t")) {
            if (window.location.search && window.location.search != "") {
                $('#_gameFilterNotice').html("It looks like there is an error with your query string. Try coming back to this page from the couples results!");
            }
        return false;
    }

    var yourDataArray = readQueryStringDataAndGetResult(window.location.href, "y").dataArray;
    var theirDataArray = readQueryStringDataAndGetResult(window.location.href, "t").dataArray;
    var quizSectionsJson = await readQuizSectionsJson("Configs/QuizSections.json");

    var usefulData = buildUsefulDataCollectionFromCoupleData(yourDataArray, theirDataArray, quizSectionsJson);
    if (usefulData != null) {
        applyProfileFiltering(usefulData);
    }
}

function applyProfileFiltering(profileData) {
    profileWhitelist = { atomicActions: new Set(), modifiers: new Set(), sceneTones: new Set(), finishingMoves: new Set() };
    profileData.sections.forEach(section => {
        section.questions.forEach(question => {
            if (question.matchId >= 2) {
                (question.enabledAtomicActions || []).forEach(action => profileWhitelist.atomicActions.add(action));
                (question.enabledModifiers || []).forEach(mod => profileWhitelist.modifiers.add(mod));
                (question.enabledSceneTones || []).forEach(tone => profileWhitelist.sceneTones.add(tone));
                (question.enabledFinishingMoves || []).forEach(move => profileWhitelist.finishingMoves.add(move));
            }
        });
    });
    $('#_gameFilterNotice').html("Your couples quiz results have been applied and are actively filtering the responses!");
    console.log("Profile loaded! Whitelists:", profileWhitelist);
}

function setRound(round) {
    currentRound = round;
    document.querySelectorAll("#roundButtons button").forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(round + "Btn");
    if (activeBtn) activeBtn.classList.add('active');
}

function toggleVibe(vibe) {
    const index = currentVibes.indexOf(vibe);
    if (index > -1) {
        currentVibes.splice(index, 1);
    } else {
        currentVibes.push(vibe);
    }
    updateVibeButtonStyles();
}

function updateVibeButtonStyles() {
    document.querySelectorAll("#vibeButtons button").forEach(btn => {
        btn.classList.remove('active');
        if (currentVibes.includes(btn.dataset.vibe)) {
            btn.classList.add('active');
        }
    });
}

function randomSceneTone() {
    const toneSelect = document.getElementById('toneSelect');
    const options = toneSelect.querySelectorAll('option');
    const randomIndex = Math.floor(Math.random() * (options.length - 1)) + 1;
    toneSelect.selectedIndex = randomIndex;
}

function expandModifiers(actionAllowed) {
    let expanded = [];
    (actionAllowed || []).forEach(modId => {
        if (modifierGroups[modId]) {
            expanded.push(...Object.keys(modifierGroups[modId]));
        } else {
            expanded.push(modId);
        }
    });
    return expanded;
}

function enforceMutuallyExclusive(modifierList) {
    let finalList = [...modifierList];
    mutuallyExclusiveModifiers.forEach(group => {
        const matches = group.filter(id => finalList.includes(id));
        if (matches.length > 1) {
            const keepOne = matches[Math.floor(Math.random() * matches.length)];
            finalList = finalList.filter(id => !matches.includes(id) || id === keepOne);
        }
    });
    return finalList;
}

function generateAction(turnChoice) {
    if (!atomicActions.length) {
        document.getElementById('actionOutput').innerText = "Data is still loading...";
        return;
    }

    const turn = turnChoice === 'random' ? (Math.random() < 0.5 ? 'his' : 'her') : turnChoice;

    const availableActions = atomicActions.filter(action =>
        ((turn === 'his' && action.hisTurn) || (turn === 'her' && action.herTurn)) &&
        (Array.isArray(action.roundType) ? action.roundType.includes(currentRound) : action.roundType === currentRound) &&
        (profileWhitelist.atomicActions.size === 0 || profileWhitelist.atomicActions.has(action.name))
    );

    if (availableActions.length === 0) {
        document.getElementById('actionOutput').innerText = "No available actions for this phase!";
        return;
    }

    const action = availableActions[Math.floor(Math.random() * availableActions.length)];
    let output = (turn === 'her') ? action.herTurn : action.hisTurn;

    const toneSelect = document.getElementById('toneSelect');
    const selectedToneId = toneSelect.value;
    if (selectedToneId && sceneTones[selectedToneId]) {
        output = `[${sceneTones[selectedToneId]}] ` + output;
    }

    let finishingMoveUsed = null;

    if (!action.allowedModifiers || !action.allowedModifiers.includes("PREVENT_MODIFIERS")) {
        let expandedModifiers = expandModifiers(action.allowedModifiers);
        expandedModifiers.push(...Object.keys(alwaysAvailableModifiers));
        expandedModifiers = [...new Set(expandedModifiers)];
        expandedModifiers = enforceMutuallyExclusive(expandedModifiers);

        const availableVibes = currentVibes.length > 0 ? currentVibes : ['sensual', 'rough', 'teasing', 'neutral'];
        const vibeChoice = availableVibes[Math.floor(Math.random() * availableVibes.length)];

        let finalModifiers = expandedModifiers.filter(modId => {
            if (profileWhitelist.modifiers.size > 0 && !profileWhitelist.modifiers.has(modId)) return false;
            let mod = modifiers[modId] || alwaysAvailableModifiers[modId];
            if (!mod) return false;
            const styles = Array.isArray(mod.styleCategory) ? mod.styleCategory : [mod.styleCategory];
            return styles.includes(vibeChoice) || styles.includes("neutral");
        });

        finalModifiers = finalModifiers.slice(0, 3);

        const modifierSentences = finalModifiers.map(modId => {
            let mod = modifiers[modId] || alwaysAvailableModifiers[modId];
            return mod ? mod.text : null;
        }).filter(Boolean);

        if (modifierSentences.length) {
            output += " " + modifierSentences.join(" ");
        }
    }

    if (currentRound === 'climax' && Object.keys(finishingMoves).length > 0) {
        const finishingMoveIds = Object.keys(finishingMoves).filter(moveId =>
            profileWhitelist.finishingMoves.size === 0 || profileWhitelist.finishingMoves.has(moveId)
        );
        const randomFinishingId = finishingMoveIds[Math.floor(Math.random() * finishingMoveIds.length)];
        const finishingText = finishingMoves[randomFinishingId];

        if (finishingText) {
            output += " " + finishingText;
            finishingMoveUsed = finishingText;
        }
    }

    document.getElementById('actionOutput').innerText = output;
}

loadData();