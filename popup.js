function l(what) { return document.getElementById(what); }

const version = "v1.1";
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


if (!l('notification-container')) {
	notificationContainer.id = 'notification-container';
	document.body.appendChild(notificationContainer);
}

const achievementDefinitions = {
    "firstClick": {
        name: "Wake and bake",
        description: "Click for the first time.",
        quote: "And it all begins...",
        iconPosition: { x: 0, y: 5 }
    },
    "hundredClicks": {
        name: "Making some dough",
        description: "Click on cupcake for 100 times.",
        quote: "Click click click",
        iconPosition: { x: 2, y: 5 }
    },
    "upgradeClick": {
        name: "Bigger and Better",
        description: "Upgrade Click for the first time.",
        quote: "I need more power.",
        iconPosition: { x: 12, y: 0 }
    }
};


function createAchievementElement(achievementId, achievement) {
    const achievementDiv = document.createElement('div');
    achievementDiv.classList.add('achievement');
    achievementDiv.dataset.achievementId = achievementId;

    const iconX = achievement.iconPosition.x;
    const iconY = achievement.iconPosition.y;

    const iconDiv = document.createElement('div');
    iconDiv.classList.add('achievement-icon');
    //iconDiv.style.backgroundPosition = `-${iconX}px -${iconY}px`;

    iconDiv.style.backgroundPosition = `-${iconX*48}px -${iconY*48}px`;

    const detailsDiv = document.createElement('div');
    detailsDiv.classList.add('achievement-details');

    const nameDiv = document.createElement('div');
    nameDiv.classList.add('achievement-name');
    nameDiv.textContent = achievement.name;

    const descriptionDiv = document.createElement('div');
    descriptionDiv.classList.add('achievement-description');
    descriptionDiv.textContent = achievement.description;

    const quoteQ = document.createElement('q');
    quoteQ.classList.add('achievement-quote');
    quoteQ.textContent = achievement.quote;

    detailsDiv.appendChild(nameDiv);
    detailsDiv.appendChild(descriptionDiv);
    detailsDiv.appendChild(quoteQ);

    achievementDiv.appendChild(iconDiv);
    achievementDiv.appendChild(detailsDiv);

    return achievementDiv;
}

function updateAchievementDisplay() {
    achievementsContainer.innerHTML = '';

    for (const achievementId in achievementDefinitions) {
        const achievement = achievementDefinitions[achievementId];
        const achievementDiv = createAchievementElement(achievementId, achievement);

        if (achievements[achievementId]) {
            achievementDiv.classList.add('unlocked');
        }

        achievementsContainer.appendChild(achievementDiv);
    }
}

function checkAchievements() {
    if (!achievements["firstClick"] && cupcakeCount > 0) {
        achievements["firstClick"] = true;
        showNotification("Получено достижение: Первый шаг!");
        saveGame();
    }

    if (!achievements["hundredClicks"] && cupcakeCount >= 100) {
        achievements["hundredClicks"] = true;
        showNotification("Получено достижение: 100 кликов!");
        saveGame();
    }

    if (!achievements["upgradeClick"] && clickValue > 1) {
        achievements["upgradeClick"] = true;
        showNotification("Получено достижение: Улучшение!");
        saveGame();
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
        achievements: achievements
	}, function() {
		showNotification('Game saved!');
	});
}

function loadGame() {
	chrome.storage.sync.get(['cupcakeCount', 'clickValue', 'cps', 'upgradeClickCost', 'backgroundImage', 'repeatX', 'repeatY', 'invertedText', 'bgCover', 'achievements'], function(result) {
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

document.addEventListener('DOMContentLoaded', () => {
	loadGame();
	versionDisplay.textContent = version;
});