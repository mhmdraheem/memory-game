let gameState = "running";
let muted = false;

const flipSpeedMillis = 1500;
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

// const backfaceImageNames = [
//   "fa-regular fa-face-smile",
//   "fa-regular fa-face-tired",
//   "fa-regular fa-face-surprise",
//   "fa-regular fa-face-smile-wink",
//   "fa-regular fa-face-smile-beam",
//   "fa-regular fa-face-sad-tear",
//   "fa-regular fa-face-sad-cry",
//   "fa-regular fa-face-rolling-eyes",
//   "fa-regular fa-face-meh-blank",
//   "fa-regular fa-face-meh",
// ];

// document.querySelector(".sound").addEventListener("click", () => {
//   if (mainAudio.paused) {
//     muted = false;
//     startAudio();
//     document.querySelector(".sound").classList.remove("fa-volume-xmark");
//     document.querySelector(".sound").classList.add("fa-volume-low");
//   } else {
//     muted = true;
//     mainAudio.pause();
//     document.querySelector(".sound").classList.remove("fa-volume-low");
//     document.querySelector(".sound").classList.add("fa-volume-xmark");
//   }
// });

// Difficulty settings
const difficultySettings = {
  easy: { minCardWidth: 130 },
  medium: { minCardWidth: 110 },
  hard: { minCardWidth: 90 },
};

let currentDifficulty = "easy";

function calculateCardDimensions(difficulty) {
  const gap = 60;
  const { minCardWidth } = difficultySettings[difficulty];
  const cardsContainer = document.querySelector(".cards");
  const viewportWidth = cardsContainer.clientWidth;
  const viewportHeight = cardsContainer.clientHeight;

  // Calculate the number of columns and rows
  let columns = Math.floor(viewportWidth / (minCardWidth + gap));
  let rows = Math.floor(viewportHeight / (minCardWidth * 1 + gap));

  // Ensure the total number of cards is even
  let evenTotalCards = columns * rows;
  if (evenTotalCards % 2 !== 0) {
    // If the total number of cards is odd, reduce the number of columns or rows to make it even
    if (columns > rows) {
      columns--;
    } else {
      rows--;
    }
    evenTotalCards = columns * rows;
  }

  // Calculate the card size to fill the container exactly
  const cardWidth = (viewportWidth - (columns - 1) * gap) / columns;
  const cardHeight = (viewportHeight - (rows - 1) * gap) / rows;
  return { columns, rows, cardWidth, cardHeight, evenTotalCards };
}

// Function to adjust the grid layout and card sizes
function adjustGridLayout(difficulty) {
  const { columns, rows, cardWidth, cardHeight, evenTotalCards } = calculateCardDimensions(difficulty);
  const cardsContainer = document.querySelector(".cards");

  // Clear existing cards
  cardsContainer.innerHTML = "";

  // Set grid template columns and rows
  cardsContainer.style.gridTemplateColumns = `repeat(${columns}, ${cardWidth}px)`;
  cardsContainer.style.gridTemplateRows = `repeat(${rows}, ${cardHeight}px)`;

  // Create pairs of images
  const imagePairs = createImagePairs(evenTotalCards / 2);

  // Create cards to fill the grid
  for (let i = 0; i < evenTotalCards; i++) {
    const card = createCard(imagePairs[i]);
    cardsContainer.append(card);

    // Adjust card size
    card.style.width = `${cardWidth}px`;
    card.style.height = `${cardHeight}px`;
  }
}

// Function to create pairs of images
function createImagePairs(numPairs) {
  const shuffledImages = shuffle([...backfaceImageNames]);
  const pairs = [];

  for (let i = 0; i < numPairs; i++) {
    const image = shuffledImages[i % shuffledImages.length];
    pairs.push(image, image); // Add two copies of the same image
  }

  return shuffle(pairs); // Shuffle the pairs to randomize their positions
}

// Adjust grid layout on window resize
window.addEventListener("resize", () => adjustGridLayout(currentDifficulty));
adjustGridLayout(currentDifficulty);

function createCard(imageName) {
  let card = document.createElement("div");
  card.classList.add("flippig-card");
  card.addEventListener("click", clickHandler);
  card.setAttribute("name", imageName);
  card.append(createFrontFace(frontfaceImage), createBackFace(imageName));
  return card;
}

function clickHandler() {
  if (cardNotMatched(this)) {
    flipCard(this);

    let matchedPair = getMatchedPair(this);
    if (matchedPair.length === 1) {
      matchedPair.push(this);
      matchCards(matchedPair);
    }
  }
}

function cardNotMatched(card) {
  return !card.classList.contains("matched");
}

let metaData = {
  matchedPairs: 0,
};

let cardsQueue = {
  activeCards: [],
  add: function (card) {
    this.activeCards.push(card);
  },
  clear: function () {
    this.activeCards.length = 0;
  },
};

function flipCard(card) {
  cardsQueue.add(card);
  playSound("fliped");
  card.classList.add("flip");

  setTimeout(() => {
    let idx = cardsQueue.activeCards.indexOf(card);
    if (idx > -1) {
      cardsQueue.activeCards.splice(idx, 1);
    }

    if (cardNotMatched(card)) {
      card.classList.remove("flip");
    }
  }, flipSpeedMillis);
}

function playSound(audioId) {
  let audio = document.getElementById(audioId);
  audio.currentTime = 0;
  audio.play();
}

function getMatchedPair(card) {
  return cardsQueue.activeCards.filter((c) => c !== card && c.getAttribute("name") === card.getAttribute("name"));
}

function matchCards(matchedCards) {
  matchedCards.forEach((c) => {
    c.classList.add("matched");
  });

  metaData.matchedPairs++;

  if (areAllPairsMatched()) {
    mainAudio.pause();
    playSound("completed");
    triggerConfetti();
    reset();
    gameState = "stopped";
  } else {
    playSound("matched");
  }
}

function reset() {
  metaData.matchedPairs = 0;
  cardsQueue.activeCards = [];
}

function triggerConfetti() {
  confetti({
    particleCount: 1000,
    spread: 360,
    origin: { y: 0.5 },
    ticks: 500,
    gravity: 0.7,
  });
}

function areAllPairsMatched() {
  const totalCards = document.querySelectorAll(".flippig-card").length;
  return metaData.matchedPairs === totalCards / 2;
}

function createFrontFace(frontFaceImage) {
  let face = document.createElement("div");
  face.classList = "card-face front rotating-border";
  let img = document.createElement("img");
  img.src = "img/help_16799228.png";
  img.classList.add("front-img");
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

function shuffle(array) {
  let currentIndex = array.length;

  while (currentIndex != 0) {
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array;
}

const mainAudio = document.getElementById("bgAudio");
// mainAudio.addEventListener("ended", () => {
//   mainAudio.currentTime = 0;
//   mainAudio.play();
// });

function startAudio() {
  // mainAudio.play();
  // mainAudio.volume = 0.1;
}

document.addEventListener(
  "click",
  () => {
    if (mainAudio.paused && gameState === "running") {
      startAudio();
    }
  },
  { once: true }
);

document.addEventListener("visibilitychange", function () {
  if (document.hidden) {
    // mainAudio.pause();
  } else {
    // if (gameState === "running" && !muted) startAudio();
  }
});
