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

// Difficulty settings
const difficultySettings = {
  easy: { minCardWidth: 100 },
  medium: { minCardWidth: 110 },
  hard: { minCardWidth: 90 },
};

let currentDifficulty = "easy";
 
function calculateCardDimensions(difficulty, gapX, gapY) {
  const { minCardWidth } = difficultySettings[difficulty];
  const cardsContainer = document.querySelector(".cards");
  const viewportWidth = cardsContainer.clientWidth;
  const viewportHeight = cardsContainer.clientHeight;

  // Estimate columns based on minimum width and gap
  let columns = Math.floor((viewportWidth + gapX) / (minCardWidth + gapX));
  let rows = Math.floor((viewportHeight + gapY) / (minCardWidth + gapY));

  // Make sure we have an even number of cards
  let evenTotalCards = columns * rows;
  if (evenTotalCards % 2 !== 0) {
    if (columns > rows) {
      columns--;
    } else {
      rows--;
    }
    evenTotalCards = columns * rows;
  }

  // Calculate exact size based on available space and gaps
  const cardSize = Math.min(
    (viewportWidth - (columns - 1) * gapX) / columns,
    (viewportHeight - (rows - 1) * gapY) / rows
  );

  return { columns, rows, cardSize, evenTotalCards };
}


// Function to adjust the grid layout and card sizes
function adjustGridLayout(difficulty, gapX = 10, gapY = 10) {
  const { columns, rows, cardSize, evenTotalCards } = calculateCardDimensions(difficulty, gapX, gapY);
  const cardsContainer = document.querySelector(".cards");

  // Clear existing cards
  cardsContainer.innerHTML = "";

  // Set grid styles
  cardsContainer.style.display = "grid";
  cardsContainer.style.gridTemplateColumns = `repeat(${columns}, ${cardSize}px)`;
  cardsContainer.style.gridTemplateRows = `repeat(${rows}, ${cardSize}px)`;
  cardsContainer.style.columnGap = `${gapX}px`;
  cardsContainer.style.rowGap = `${gapY}px`;

  // Create card elements
  const imagePairs = createImagePairs(evenTotalCards / 2);
  for (let i = 0; i < evenTotalCards; i++) {
    const card = createCard(imagePairs[i]);
    card.style.width = `${cardSize}px`;
    card.style.height = `${cardSize}px`;
    cardsContainer.append(card);
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
  img.classList.add("photo")
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
