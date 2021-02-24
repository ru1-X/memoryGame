let cardArray = [];
let cardWhole = [];
let cardChosen = [];
let cardChosenId = [];
let cardWon = [];
let hasWon = false;
let click = 0;
let score = 0;
const levels = {
	easy: 4,
	normal: 6,
	hard: 9,
};
let level = "";
let num = 0;
let urlBreed_base = "https://api.thedogapi.com/v1/breeds";
let urlDog_base = "https://api.thedogapi.com/v1/images/search?limit=";
let breedGroup = [];
let page = 0;
let breed_id = 0;
let url = "";
let urlAll = [];

// create breed catelogue before the game start
let init = function () {
	let btn = document.getElementById("btn");
	let next = document.getElementById("next");
	let prev = document.getElementById("prev");

	let urlBreed = urlBreed_base + "?limit=10&page=0";
	getBreed(urlBreed);
	// link function to the next button
	next.onclick = function () {
		content = document.getElementById("breedname");
		content.innerHTML = " ";
		if (page >= 17) page = -1;
		page++;
		breedGroup = [];
		urlBreed = urlBreed_base + "?limit=10&page=" + String(page);
		getBreed(urlBreed);
	};
	// link the function to the prev button
	prev.onclick = function () {
		content = document.getElementById("breedname");
		content.innerHTML = " ";
		if (page <= 0) page = 17;
		page--;
		breedGroup = [];
		urlBreed = urlBreed_base + "?limit=10&page=" + String(page);
		getBreed(urlBreed);
	};
	btn.onclick = setting;
};

// initialise the game settings
let setting = function () {
	let diff = document.getElementById("difficulty");
	click = 0;
	score = 0;
	cardArray = [];
	cardWhole = [];
	urlAll = [];
	hasWon = false;
	level = diff.value;
	if (level == "easy") {
		num = levels.easy;
	} else if (level == "normal") {
		num = levels.normal;
	} else {
		num = levels.hard;
	}
	let checkboxs = document.querySelectorAll('input[type = "checkbox"]:checked');
	let allbreedId = [];
	for (let i = 0; i < checkboxs.length; i++) {
		allbreedId.push(checkboxs[i].value);
	}
	// if the user do not select any breeds
	if (checkboxs.length == 0) {
		url = urlDog_base + String(num) + "&mime_types=jpg";
		getDog(url);
	} else if (checkboxs.length == 1) {
		// when the user only select one breed
		url =
			urlDog_base +
			String(num) +
			"&mime_types=jpg" +
			"&breed_id=" +
			String(allbreedId[0]);
		getDog(url);
	} else {
		// when the user select multiple breeds
		let limitEachRound = 0;
		let remainder = 0;
		if (num >= allbreedId.length) {
			limitEachRound = parseInt(num / allbreedId.length);
			remainder = num % allbreedId.length;
		} else {
			// when the breed selected is greater than num(according to the difficulty), force the length of allbreedId = num
			limitEachRound = 1;
			allbreedId = allbreedId.slice(0, num);
		}
		for (let i = 0; i < allbreedId.length; i++) {
			url =
				urlDog_base +
				String(limitEachRound) +
				"&mime_types=jpg" +
				"&breed_id=" +
				String(allbreedId[i]);
			urlAll.push(url);
		}
		if (remainder != 0) {
			for (let i = 0; i < remainder; i++) {
				url =
					urlDog_base +
					String(limitEachRound) +
					"&mime_types=jpg" +
					"&breed_id=" +
					String(allbreedId[i]);
				urlAll.push(url);
			}
		}
		Promise.all(urlAll.map((url) => fetch(url).then((res) => res.json()))).then(
			(dogs) => {
				for (let j = 0; j < dogs.length; j++) {
					let dogArray = dogs[j];
					for (let i = 0; i < dogArray.length; i++) {
						let item = {};
						item["id"] = dogArray[i].id;
						item["url"] = dogArray[i].url;
						item["breeds"] = dogArray[i].breeds;
						cardArray.push(item);
					}
				}
				console.log(cardArray);
				createCard(cardArray);
			}
		);
	}

	// set Time count down
	createProgressbar(num, failOperation);
};

// create the time countsdown progress bar, the animation is paused in the css initially
// and it will be activated by this function
let createProgressbar = function (difficulty, callback) {
	let inner = document.getElementById("inner");
	let duration = 0;
	if (difficulty == 4) {
		duration = String(20) + "s";
	} else if (difficulty == 6) {
		duration = String(40) + "s";
	} else {
		duration = String(60) + "s";
	}

	inner.style.animation = "progressbar-countdown" + " " + duration;
	inner.style.animationPlayState = "running";
	if (typeof callback === "function") {
		inner.addEventListener("animationend", callback);
	}
};

// get all breeds
let getBreed = async function (urlBreed) {
	await fetch(urlBreed)
		.then((response) => response.json())
		.then((data) => {
			for (let i = 0; i < data.length; i++) {
				let itemBreed = {};
				itemBreed["name"] = data[i].name;
				itemBreed["id"] = data[i].id;
				breedGroup.push(itemBreed);
			}
			constructBreed(breedGroup);
		});
};

// construct the availbale breeds list
let constructBreed = function (breedGroup) {
	let select = document.getElementById("breedname");
	for (let i = 0; i < breedGroup.length; i++) {
		let div = document.createElement("div");
		let checkbox = document.createElement("input");
		let label = document.createElement("label");
		label.appendChild(document.createTextNode(breedGroup[i].name));
		checkbox.type = "checkbox";
		checkbox.value = breedGroup[i].id;
		select.appendChild(div);
		div.appendChild(checkbox);
		div.appendChild(label);
	}
};

let stopProgressBar = function () {
	inner.style.animation = "none";
	inner.offsetHeight;
	inner.style.animation = null;
};

// fetch dog information related to the url
let getDog = async function (url) {
	await fetch(url)
		.then((response) => response.json())
		.then((data) => {
			for (let i = 0; i < data.length; i++) {
				let item = {};
				item["id"] = data[i].id;
				item["url"] = data[i].url;
				item["breeds"] = data[i].breeds;
				cardArray.push(item);
			}
			if (num > cardArray.length) {
				alert(
					"there are not enough dogs in this breed" +
						"\n" +
						"please rechoose a breed"
				);
				stopProgressBar();
				return;
			}
			createCard(cardArray);
		});
};

// double the cardArray and randomlise the order
let createCard = function (cardArray) {
	cardWhole = cardArray.concat(cardArray);
	cardWhole.sort(() => 0.5 - Math.random());
	createBoard(cardWhole);
};

/* creat the board: 
	- create the images
	- link the flip function to each image 
*/
let createBoard = function (cardWhole) {
	let board = document.getElementById("board");
	// delete the board before click the restart each time
	board.innerHTML = " ";
	for (let i = 0; i < cardWhole.length; i++) {
		const card = document.createElement("img");
		card.setAttribute("src", "blank.png");
		card.setAttribute("image_id", i);
		card.onclick = flip;
		board.appendChild(card);
	}
};

// construct the flip function
let flip = function () {
	// count the flip times
	let flipTimes = document.getElementById("times");
	click += 1;
	flipTimes.innerHTML = click / 2;

	// selected card
	let cardId = this.getAttribute("image_id");
	cardChosen.push(cardWhole[cardId].id);
	cardChosenId.push(cardId);
	this.setAttribute("src", cardWhole[cardId].url);
	if (cardChosen.length == 2) {
		setTimeout(checkForMatch, 500);
	}
};

/* check whether two cards are matched
   if the id(fetched from the url) of two images are equal, then this two images are matched 
*/
let checkForMatch = function () {
	let cards = document.getElementsByTagName("img");
	let cardOne = cardChosenId[0];
	let cardTwo = cardChosenId[1];

	// If two cards are not matched, flip them back
	if (cardChosen[0] != cardChosen[1]) {
		cards[cardOne].setAttribute("src", "blank.png");
		cards[cardTwo].setAttribute("src", "blank.png");
	} else {
		cardWon.push(cardChosen);
	}
	cardChosen = [];
	cardChosenId = [];
	// After all match have been found
	if (cardWon.length === cardWhole.length / 2) {
		stopProgressBar();
		alert(
			"You have won the game" +
				"\n" +
				"Now you can click the image to see the breed information if you want 😁"
		);
		cardWon = [];
		hasWon = true;
	}
	if (hasWon) {
		wonOperation();
	}
};

// won operation after all cards have matched
let wonOperation = function () {
	let bestScore = document.getElementById("best_" + level);
	if (score === 0 || click / 2 < score) {
		score = click / 2;
		bestScore.innerHTML = score;
		// stroe the best results to the browser
		if (num == 4) {
			localStorage.setItem("score_easy", String(score));
		} else if (num == 6) {
			localStorage.setItem("score_normal", String(score));
		} else {
			localStorage.setItem("score_difficulty", String(score));
		}
	}
	// link the display dog information function
	let imgs = document.getElementsByTagName("img");
	for (let i = 0; i < imgs.length; i++) {
		imgs[i].onclick = displayInformation;
	}
	let close = document.getElementById("close");
	let modal = document.getElementById("myModal");
	// When the user clicks on (x), close the modal
	close.onclick = function () {
		modal.style.display = "none";
	};

	// after checking the information of dogs, press restart button to restart the game
	let restart = document.getElementById("restart");
	restart.onclick = setting;
};

// display detailed information of images after winning the game
let displayInformation = function () {
	let imageId = this.getAttribute("image_id");
	let information = cardWhole[imageId].breeds[0];
	let modal = document.getElementById("myModal");
	let headerInfo = document.getElementById("headerInfo");
	let imperial_weight = document.getElementById("imperial_weight");
	let imperial_metric = document.getElementById("imperial_metric");
	let imperial_height = document.getElementById("imperial_height");
	let metric_height = document.getElementById("metric_height");
	let id = document.getElementById("id");
	let name = document.getElementById("name");
	let bred_for = document.getElementById("bred_for");
	let breed_group = document.getElementById("breed_group");
	let life_span = document.getElementById("life_span");
	let temperament = document.getElementById("temperament");
	let reference = document.getElementById("reference");

	// display the modal and insert the information into the corresponding tag
	modal.style.display = "block";
	headerInfo.innerHTML = information.name;
	imperial_weight.innerHTML = information.weight.imperial;
	imperial_metric.innerHTML = information.weight.metric;
	imperial_height.innerHTML = information.height.imperial;
	metric_height.innerHTML = information.weight.metric;
	id.innerHTML = information.id;
	name.innerHTML = information.name;
	bred_for.innerHTML = information.bred_for;
	breed_group.innerHTML = information.breed_group;
	life_span.innerHTML = information.life_span;
	temperament.innerHTML = information.temperament;
	reference.innerHTML = information.reference_image_id;
};

//if the user fail the game(exceed the prescribed time), all cards will be fliped back and restart the game.
let failOperation = function () {
	alert("Sorry! You have failed the game. The game will restart in a second");
	let imgs = document.getElementsByTagName("img");
	for (let i = 0; i < imgs.length; i++) {
		imgs[i].setAttribute("src", "blank.png");
	}
	click = 0;
	cardWhole.sort(() => Math.random() - 0.5);
	// restart the animation
	stopProgressBar();
	createProgressbar(num, failOperation);
};

window.onload = init;
