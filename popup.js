function l(what) { return document.getElementById(what); }

const version = "v1.3";
let cupcakeCount = 0;
let clickValue = 1;
let cps = 0;
let upgradeClickCost = 10;

//settings
let backgroundImage = null;
let repeatX = false;
let repeatY = false;
let bgCover = false;

//text invertion
let invertedText = false;

//achievements
let achievements = {};

//stats
let totalCupcakes = 0;
let totalClicks = 0;

//player name
let playerName = '';

//main elements
const cupcakeImg = l('cupcake');
const cupcakeCountDisplay = l('cupcakeCount');
const cpsDisplay = l('cps');
const upgradeClickButton = l('upgradeClick');
const saveGameButton = l('saveGame');
const resetGameButton = l('resetGame');
const notificationContainer = l('notification-container') || document.createElement('div');
const versionDisplay = l('version');
const settingsButton = l('settings-button');
const overlay = l('overlay');

//settings itself
const settingsPanel = l('settings-panel');
const settingsCloseButton = l('settings-close');

//BG settings
const backgroundInput = l('background-input');
const repeatXCheckbox = l('repeat-x');
const repeatYCheckbox = l('repeat-y');
const removeBackgroundButton = l('remove-background');
const bgCoverCheckbox = l('bg-cover');

//TEXT settings
const toggleTextColorButton = l('toggle-text-color');

//changelog here
const changelogButton = l('changelog-button');
const changelogPanel = l('changelog-panel');
const changelogCloseButton = l('changelog-close');

//achievements
const achievementsContainer = l('achievements-container');
const achievementsCloseButton = l('achievements-close');
const achievementsPanel = l('achievements-panel');
const achievementsButton = l('achievements-button');
const normalAchievementsContainer = l('normal-achievements');
const hardAchievementsContainer = l('hard-achievements');
const shadowAchievementsContainer = l('shadow-achievements');

//stats
const totalCupcakesDisplay = l('total-cupcakes');
const totalClicksDisplay = l('total-clicks');

//player name
const playerNameContainer = l('playerNameContainer');
const playerNameDisplay = l('playerName');


if (!l('notification-container')) {
	notificationContainer.id = 'notification-container';
	document.body.appendChild(notificationContainer);
}

//player name functions
function generateRandomName() {
    const names = ["Cupcake", "Sweet Tooth", "Baker13", "Leinad", "Daniel_L", "Jonathan", "VAX325"];
    return names[Math.floor(Math.random() * names.length)];
}

function createCustomPrompt(title, subtitle, placeholder, callback) {
    const overlay = document.createElement('div');
    overlay.classList.add('custom-prompt-overlay');
    document.body.appendChild(overlay);

    const prompt = document.createElement('div');
    prompt.classList.add('custom-prompt');
    overlay.appendChild(prompt);

    const titleElement = document.createElement('h2');
    titleElement.textContent = title;
    prompt.appendChild(titleElement);

    const subtitleElement = document.createElement('p');
    subtitleElement.textContent = subtitle;
    prompt.appendChild(subtitleElement);

    const inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.placeholder = placeholder;
    prompt.appendChild(inputElement);

    const buttonsElement = document.createElement('div');
    buttonsElement.classList.add('custom-prompt-buttons');
    prompt.appendChild(buttonsElement);

    const okButton = document.createElement('button');
    okButton.classList.add('custom-prompt-button');
    okButton.textContent = 'OK';
    buttonsElement.appendChild(okButton);

    const cancelButton = document.createElement('button');
    cancelButton.classList.add('custom-prompt-button');
    cancelButton.textContent = 'Отмена';
    buttonsElement.appendChild(cancelButton);

    function closePrompt(value) {
        prompt.classList.remove('active');
        overlay.classList.remove('active');

        setTimeout(() => {
            overlay.remove();
            if (callback) {
                callback(value);
            }
        }, 200);
    }

    okButton.addEventListener('click', () => {
        closePrompt(inputElement.value);
    });

    cancelButton.addEventListener('click', () => {
        closePrompt(null);
    });

    overlay.classList.add('active');
    setTimeout(() => {
        prompt.classList.add('active');
    }, 10);

    return inputElement;
}

const achievementDefinitions = {
    "firstClick": {
        name: "Wake and bake",
        description: "Click for the first time.",
        quote: "And it all begins...",
        iconPosition: { x: 0, y: 5 },
        type: "normal"
    },
    "hundredClicks": {
        name: "Making some dough",
        description: "Click on cupcake for 100 times.",
        quote: "Click click click",
        iconPosition: { x: 2, y: 5 },
        type: "normal"
    },
    "upgradeClick": {
        name: "Bigger and Better",
        description: "Upgrade Click for the first time.",
        quote: "I need more power.",
        iconPosition: { x: 12, y: 0 },
        type: "normal"
    },
    "LotsOfCupcakes": {
    	name: "Lots Of Cupcakes",
        description: "Bake 50.000 cupcakes for all time.",
        quote: "Eh, my grandma can bake more.",
        iconPosition: { x: 3, y: 5 },
        type: "normal"
    },
    "ReallyLotsOfCupcakes": {
    	name: "Really Lots Of Cupcakes",
        description: "Bake 500.000 cupcakes for all time.",
        quote: "...",
        iconPosition: { x: 4, y: 5 },
        type: "normal"
    },
    "Millionaire": {
    	name: "Millionaire",
        description: "Bake 1.000.000 cupcakes for all time.",
        quote: "Millionaire... at least in a game. That counts, right?",
        iconPosition: { x: 5, y: 5 },
        type: "normal"
    },
    "ClickAddict": {
    	name: "Click Addict",
        description: "Click on cupcake 10.000 times.",
        quote: "...",
        iconPosition: { x: 5, y: 7 },
        type: "normal"
    },
    "Clickolympics": {
    	name: "Clickolympics",
        description: "Click on cupcake 20.000 times.",
        quote: "Didn't break your mouse yet?",
        iconPosition: { x: 6, y: 7 },
        type: "normal"
    },
    "TheApotheosisOfMadness": {
    	name: "The Apotheosis Of Madness",
        description: "Click on cupcake 30.000 times.",
        quote: "...",
        iconPosition: { x: 12, y: 1 },
        type: "hard"
    },
    "HyperPower": {
    	name: "Hyper Power",
        description: "Click on cupcake 100.000 times.",
        quote: "Well, that's really impressive... How?..",
        iconPosition: { x: 12, y: 2 },
        type: "shadow",
        revealed: false
    }
};

function createAchievementElement(achievementId, achievement) {
    const achievementDiv = document.createElement('div');
    achievementDiv.classList.add('achievement');
    achievementDiv.dataset.achievementId = achievementId;

    let iconX = achievement.iconPosition.x;
    let iconY = achievement.iconPosition.y;

    if (achievement.type === "hard" && !achievements[achievementId]) {
        iconX = 0;
        iconY = 7;
    }

    const iconDiv = document.createElement('div');
    iconDiv.classList.add('achievement-icon');
    iconDiv.style.backgroundPosition = `-${iconX*48}px -${iconY*48}px`;

    const detailsDiv = document.createElement('div');
    detailsDiv.classList.add('achievement-details');

    const nameDiv = document.createElement('div');
    nameDiv.classList.add('achievement-name');
    
    let nameText = achievement.name;
    if (achievement.type === "hard" && !achievements[achievementId]) {
        nameText = "???";
    }

    if (achievement.type === "hard") {
        const hardPrefix = document.createElement('span');
        hardPrefix.classList.add('hard-prefix');
        hardPrefix.textContent = "[Hard] ";
        nameDiv.appendChild(hardPrefix);
    }
    if (achievement.type === "shadow") {
        const shadowPrefix = document.createElement('span');
        shadowPrefix.classList.add('shadow-prefix');
        shadowPrefix.textContent = "[Shadow] ";
        nameDiv.appendChild(shadowPrefix);
    }
    nameDiv.textContent += nameText;

    const descriptionDiv = document.createElement('div');
    descriptionDiv.classList.add('achievement-description');

    let descriptionText = achievement.description;
    if (achievement.type === "hard" && !achievements[achievementId]) {
        descriptionText = "???";
    }
    descriptionDiv.textContent = descriptionText;

    const quoteQ = document.createElement('q');
    quoteQ.classList.add('achievement-quote');

    let quoteText = achievement.quote;
    if (achievement.type === "hard" && !achievements[achievementId]) {
        quoteText = "???";
    }
    quoteQ.textContent = quoteText;

    detailsDiv.appendChild(nameDiv);
    detailsDiv.appendChild(descriptionDiv);
    detailsDiv.appendChild(quoteQ);

    achievementDiv.appendChild(iconDiv);
    achievementDiv.appendChild(detailsDiv);

    return achievementDiv;
}

function updateAchievementDisplay() {
    normalAchievementsContainer.innerHTML = '';
    hardAchievementsContainer.innerHTML = '';
    shadowAchievementsContainer.innerHTML = '';

    for (const achievementId in achievementDefinitions) {
        const achievement = achievementDefinitions[achievementId];

        if (achievement.type === "shadow" && !achievement.revealed && !achievements[achievementId]) {
            continue;
        }
        
        const achievementDiv = createAchievementElement(achievementId, achievement);

        if (achievements[achievementId]) {
            achievementDiv.classList.add('unlocked');
        }

        switch (achievement.type) {
            case "normal":
                normalAchievementsContainer.appendChild(achievementDiv);
                break;
            case "hard":
                hardAchievementsContainer.appendChild(achievementDiv);
                break;
            case "shadow":
                shadowAchievementsContainer.appendChild(achievementDiv);
                break;
        }
    }
}

function Win(achievement) {
	achievements[achievement] = true;
	if (achievements[achievement].revealed == false) {
		achievements[achievement].revealed = true;
	}
	saveGame();
	showNotification("Achievement Won: " + achievements[achievement].name + "!");
}

function checkAchievements() {
    if (!achievements["firstClick"] && cupcakeCount > 0) {
        Win("firstClick");
    }
    if (!achievements["hundredClicks"] && cupcakeCount >= 100) {
        Win("hundredClicks");
    }
    if (!achievements["upgradeClick"] && clickValue > 1) {
        Win("upgradeClick");
    }
    if (!achievements["LotsOfCupcakes"] && totalCupcakes >= 50_000) {
        Win("LotsOfCupcakes");
    }
    if (!achievements["ReallyLotsOfCupcakes"] && totalCupcakes >= 500_000) {
        Win("ReallyLotsOfCupcakes");
    }
    if (!achievements["Millionaire"] && totalCupcakes >= 1_000_000) {
        Win("Millionaire");
    }
    if (!achievements["ClickAddict"] && totalClicks >= 10_000) {
        Win("ClickAddict");
    }
    if (!achievements["Clickolympics"] && totalClicks >= 20_000) {
        Win("Clickolympics");
    }
    if (!achievements["TheApotheosisOfMadness"] && totalClicks >= 30_000) {
        Win("TheApotheosisOfMadness");
    }
    if (!achievements["HyperPower"] && totalClicks >= 100_000) {
        Win("HyperPower");
    }
}

function updateDisplay() {
	cupcakeCountDisplay.textContent = cupcakeCount + " cupcakes";
	cpsDisplay.textContent = "cupcakes per second: " + cps;
	upgradeClickButton.textContent = "Upgrade Click Power (+1 per click) - " + upgradeClickCost + " cupcakes";

	applyBackground();
	//applyTextColor();

	checkAchievements();
    updateAchievementDisplay();

    totalCupcakesDisplay.textContent = totalCupcakes;
    totalClicksDisplay.textContent = totalClicks;

    playerNameDisplay.textContent = playerName;
}

function applyBackground() {
	if (backgroundImage) {
		document.body.style.backgroundImage = `url(${backgroundImage})`;
	} else {
		document.body.style.backgroundImage = '';
	}

	if (bgCover) {
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundRepeat = 'no-repeat';
        repeatXCheckbox.disabled = true;
        repeatYCheckbox.disabled = true;
    } else {
        document.body.style.backgroundSize = 'auto';
        document.body.style.backgroundRepeat = (repeatX ? 'repeat-x ' : 'no-repeat ') + (repeatY ? 'repeat-y' : 'no-repeat');
        repeatXCheckbox.disabled = false;
        repeatYCheckbox.disabled = false;
    }

	//document.body.style.backgroundPosition = 'center';
}

function applyTextColor() {
	if (!invertedText) {
		document.body.classList.add('inverted');
		notificationContainer.classList.add('inverted');
	} else {
		document.body.classList.remove('inverted');
		notificationContainer.classList.remove('inverted');
	}
}

function cupcakeClicked() {
    totalCupcakes += clickValue;
    totalClicks++;
	cupcakeCount += clickValue;
	cupcakeImg.classList.add('clicked');
	setTimeout(() => {
		cupcakeImg.classList.remove('clicked');
	}, 100);
	updateDisplay();
}

function upgradeClick() {
	if (cupcakeCount >= upgradeClickCost) {
		cupcakeCount -= upgradeClickCost;
		clickValue++;
		upgradeClickCost = Math.floor(upgradeClickCost * 1.25);
		updateDisplay();

		showNotification("Upgrade Purchased!");
	} else {
		showNotification("Not enough cupcakes to buy an upgrade!");
	}
}

function showNotification(what) {
	notificationContainer.textContent = what;
	notificationContainer.classList.add('show');

	setTimeout(() => {
		notificationContainer.classList.remove('show');
	}, 800);
}

function saveGame() {
	chrome.storage.sync.set({
		cupcakeCount: cupcakeCount,
		clickValue: clickValue,
		cps: cps,
		upgradeClickCost: upgradeClickCost,
		backgroundImage: backgroundImage,
        repeatX: repeatX,
        repeatY: repeatY,
        invertedText: invertedText,
        bgCover: bgCover,
        achievements: achievements,
        totalCupcakes: totalCupcakes,
        totalClicks: totalClicks,
        playerName: playerName
	}, function() {
		showNotification('Game saved!');
	});
}

function loadGame() {
	chrome.storage.sync.get(['cupcakeCount', 'clickValue', 'cps', 'upgradeClickCost', 'backgroundImage', 'repeatX', 'repeatY', 'invertedText', 'bgCover', 'achievements', 'totalCupcakes', 'totalClicks', 'playerName'], function(result) {
		if (result.cupcakeCount !== undefined) {
			cupcakeCount = result.cupcakeCount;
		}
		if (result.clickValue !== undefined) {
			clickValue = result.clickValue;
		}
		if (result.cps !== undefined) {
			cps = result.cps;
		}
		if (result.upgradeClickCost !== undefined) {
			upgradeClickCost = result.upgradeClickCost;
		} else {
			upgradeClickCost = 10;
		}
		if (result.backgroundImage !== undefined) {
            backgroundImage = result.backgroundImage;
        }
        if (result.repeatX !== undefined) {
            repeatX = result.repeatX;
        }
        if (result.repeatY !== undefined) {
            repeatY = result.repeatY;
        }
        if (result.invertedText !== undefined) {
            invertedText = result.invertedText;
        }
        if (result.bgCover !== undefined) {
            bgCover = result.bgCover;
        }
        if (result.achievements !== undefined) {
            achievements = result.achievements;
        } else {
            achievements = {};
        }
        if (result.totalCupcakes !== undefined) {
            totalCupcakes = result.totalCupcakes;
        }
        if (result.totalClicks !== undefined) {
            totalClicks = result.totalClicks;
        }

        playerName = result.playerName || generateRandomName();

        repeatXCheckbox.checked = repeatX;
        repeatYCheckbox.checked = repeatY;
        bgCoverCheckbox.checked = bgCover;

        //applyTextColor();
		updateDisplay();
	});
}

function resetGame() {
	//TODO : сделать кастомный промпт
	cupcakeCount = 0;
	clickValue = 1;
	cps = 0;
	upgradeClickCost = 10;
    backgroundImage = null;
    repeatX = false;
    repeatY = false;
    invertedText = false;
    bgCover = false;
    achievements = {};
    totalCupcakes = 0;
    totalClicks = 0;
    repeatXCheckbox.checked = false;
    repeatYCheckbox.checked = false;
    bgCoverCheckbox.checked = false;
    updateDisplay();
	chrome.storage.sync.clear(function() { showNotification('Game Reset!'); });
}

setInterval(saveGame, 60000); //autosave here

cupcakeImg.addEventListener('click', cupcakeClicked);
upgradeClickButton.addEventListener('click', upgradeClick);
saveGameButton.addEventListener('click', saveGame);
resetGameButton.addEventListener('click', resetGame);

//Open settings
settingsButton.addEventListener('click', () => {
    overlay.style.display = 'block';
    settingsPanel.style.display = 'block';
});

//Close settings
settingsCloseButton.addEventListener('click', () => {
    overlay.style.display = 'none';
    settingsPanel.style.display = 'none';
});

//BG change
backgroundInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            backgroundImage = event.target.result;
            applyBackground();
            saveGame();
        }
        reader.readAsDataURL(file);
    }
});

repeatXCheckbox.addEventListener('change', () => {
    repeatX = repeatXCheckbox.checked;
    applyBackground();
    saveGame();
});

repeatYCheckbox.addEventListener('change', () => {
    repeatY = repeatYCheckbox.checked;
    applyBackground();
    saveGame();
});

//Remove BG Click
removeBackgroundButton.addEventListener('click', () => {
    backgroundImage = null;
    applyBackground();
    saveGame();
});

//BG Cover
bgCoverCheckbox.addEventListener('change', () => {
    bgCover = bgCoverCheckbox.checked;
    applyBackground();
    saveGame();
});

//Open changelog
changelogButton.addEventListener('click', () => {
    overlay.style.display = 'block';
    changelogPanel.style.display = 'block';
});


//Close changelog
changelogCloseButton.addEventListener('click', () => {
    overlay.style.display = 'none';
    changelogPanel.style.display = 'none';
});

//Invert Text
toggleTextColorButton.addEventListener('click', () => {
    invertedText = !invertedText;
    applyTextColor();
    saveGame();
});

achievementsButton.addEventListener('click', () => {
    overlay.style.display = 'block';
    achievementsPanel.style.display = 'block';
    updateAchievementDisplay();
});

achievementsCloseButton.addEventListener('click', () => {
    overlay.style.display = 'none';
    achievementsPanel.style.display = 'none';
});

//player name click
playerNameContainer.addEventListener('click', () => {
    createCustomPrompt(
        'Change Name',
        'Enter new name:',
        'New Name',
        (value) => {
            if (value) {
                playerName = value;
                updateDisplay();
                saveGame();
                showNotification(`Name changed to ${playerName}!`);
            }
        }
    );
});

document.addEventListener('DOMContentLoaded', () => {
	loadGame();
	versionDisplay.textContent = version;
});
