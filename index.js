import { shuffle } from "./utils.js";

// setup header section
let overlay = document.querySelector(".overlay");
let startGameBtn = overlay.querySelector("button");

startGameBtn.onclick = () => {
  let playerName = prompt("Your name:");

  // set player name
  let playerNameSpan = document.querySelector(".header .player-name");
  playerNameSpan.innerHTML = playerName || "--";

  overlay.style.display = "none";
};

const flipSpeedMillis = 2000;
const frontfaceImage = "question.png";
const backfaceImageNames = [
  "angular.png",
  "css3.png",
  "github.png",
  "gulbjs.png",
  "html5.png",
  "jestjs.png",
  "js.png",
  "mongodb.png",
  "python.png",
  "react.png",
];
const backfaceImages = shuffle([...backfaceImageNames, ...backfaceImageNames]);
const numCards = backfaceImages.length;

// create cards
let cards = document.querySelector(".cards");
for (let i = 0; i < numCards; i++) {
  let card = createCard(i);
  cards.append(card);
}

function createCard(index) {
  let card = document.createElement("div");
  card.classList.add("flippig-card");
  card.addEventListener("click", clickHandler);
  card.setAttribute("name", getCardName(index));
  card.append(
    createFrontFace(frontfaceImage),
    createBackFace(backfaceImages[index])
  );
  return card;
}

function getCardName(index) {
  return backfaceImages[index].split(".")[0];
}

function clickHandler() {
  if (cardNotMatched(this)) {
    flipCard(this);
    if (isPairMatched()) {
      matchCards();
    } else {
      updateWrongCount();
      unflipCardAfterMillis(this);
    }
  }
}

function cardNotMatched(card) {
  return !card.classList.contains("matched");
}

let metaData = {
  matchedPairs: 0,
  wrongCount: 0,
};

let cardsQueue = {
  activeCards: [],
  add: function (card) {
    this.activeCards.unshift(card);
  },
  remove: function (toBeRemoved) {
    this.activeCards = this.activeCards.filter((c) => c !== toBeRemoved);
  },
  clear: function () {
    this.activeCards.length = 0;
  },
};

function flipCard(card) {
  cardsQueue.add(card);
  playSound("fliped");
  card.classList.add("flip");
}

function unflipCardAfterMillis(card) {
  setTimeout(() => {
    if (cardNotMatched(card)) {
      cardsQueue.remove(card);
      card.classList.remove("flip");
    }
  }, flipSpeedMillis);
}

function playSound(audioId) {
  let audio = document.getElementById(audioId);
  audio.currentTime = 0;
  audio.play();
}

function isPairMatched() {
  let cards = cardsQueue.activeCards;
  return (
    cards[0] != null &&
    cards[1] != null &&
    cards[0] !== cards[1] &&
    cards[0].getAttribute("name") === cards[1].getAttribute("name")
  );
}

function matchCards() {
  cardsQueue.activeCards[0].classList.add("matched");
  cardsQueue.activeCards[1].classList.add("matched");
  cardsQueue.clear();

  metaData.wrongCount = 0;
  metaData.matchedPairs++;

  if (areAllPairsMatched()) {
    playSound("completed");
  } else {
    playSound("matched");
  }
}

function areAllPairsMatched() {
  return metaData.matchedPairs === numCards / 2;
}

function updateWrongCount() {
  let cards = cardsQueue.activeCards;
  if (cards[0] != cards[1] && ++metaData.wrongCount % 2 == 0) {
    document.querySelector(".header .wrong-count").innerHTML++;
    metaData.wrongCount = 0;
  }
}

function createFrontFace(frontFaceImage) {
  let face = document.createElement("div");
  face.classList = "card-face front";
  let img = document.createElement("img");
  img.src = "img/" + frontFaceImage;
  face.append(img);
  return face;
}

function createBackFace(backFaceImage) {
  let face = document.createElement("div");
  face.classList = "card-face back";
  let img = document.createElement("img");
  img.src = "img/" + backFaceImage;
  img.getAttribute;
  face.append(img);
  return face;
}
