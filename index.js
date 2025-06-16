let gameState = "running";
let muted = false;
let mainAudio = document.querySelector("#completed");
const flipSpeedMillis = 1500;
const frontfaceImage = "question.png";
const backfaceImageNames = [
  "angel_10963317.png",
  "angry-face_10963400.png",
  "angry-face_10963446.png",
  "angry-face_10963456.png",
  "blind_10963583.png",
  "cool-dude_10963425.png",
  "crying_10963412.png",
  "dead_10963598.png",
  "dollar-eye_10963493.png",
  "happy-face_10963590.png",
  "happy-face_10963605.png",
  "heart-eyes_10963327.png",
  "hearts_10963331.png",
  "kiss_10963357.png",
  "mask-face_10963577.png",
  "melting_10963322.png",
  "nerd-glasses_10963521.png",
  "no-mouth_10963502.png",
  "sad-face_10963478.png",
  "sleeping_10963569.png",
  "sleepy_10963562.png",
  "smiling-face_10963291.png",
  "smiling-face_10963367.png",
  "surprised_10963396.png",
  "surprised_10963547.png",
  "vomiting_10963464.png",
  "zipped_10963505.png",
];

// Difficulty settings
const difficultySettings = {
  easy: { minCardWidth: 90, minCardHeight: 90, gapX: 16, gapY: 16 },
  medium: { minCardWidth: 110, minCardHeight: 120, gapX: 20, gapY: 20 },
  hard: { minCardWidth: 90, minCardHeight: 100, gapX: 20, gapY: 20 },
};

let currentDifficulty = "easy";

function calculateCardDimensions(difficulty) {
  const { minCardWidth, minCardHeight, gapX, gapY } = difficultySettings[difficulty];
  const cardsContainer = document.querySelector(".cards");
  const h1Height = document.querySelector("h1").clientHeight;

  const viewportWidth = cardsContainer.clientWidth;
  const viewportHeight = cardsContainer.clientHeight - h1Height;

  // Estimate columns based on minimum width and gap
  let columns = Math.floor((viewportWidth + gapX) / (minCardWidth + gapX));
  let rows = Math.floor((viewportHeight + gapY) / (minCardHeight + gapY));

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
  const cardSize = {
    width: (viewportWidth - (columns - 1) * gapX) / columns,
    height: (viewportHeight - (rows - 1) * gapY) / rows,
  };

  return { columns, rows, cardSize, evenTotalCards };
}

// Function to adjust the grid layout and card sizes
function adjustGridLayout() {
  const { columns, rows, cardSize, evenTotalCards } = calculateCardDimensions(currentDifficulty);
  const cardsContainer = document.querySelector(".cards");

  // Clear existing cards
  cardsContainer.innerHTML = "";

  // Set grid styles
  cardsContainer.style.display = "grid";
  cardsContainer.style.gridTemplateColumns = `repeat(${columns}, ${cardSize.width}px)`;
  cardsContainer.style.gridTemplateRows = `repeat(${rows}, ${cardSize.height}px)`;
  cardsContainer.style.columnGap = `${difficultySettings[currentDifficulty].gapX}px`;
  cardsContainer.style.rowGap = `${difficultySettings[currentDifficulty].gapY}px`;

  // Create card elements
  const imagePairs = createImagePairs(evenTotalCards / 2);
  for (let i = 0; i < evenTotalCards; i++) {
    const card = createCard(imagePairs[i]);
    card.style.width = `${cardSize.width}px`;
    card.style.height = `${cardSize.height}px`;
    cardsContainer.append(card);
  }
}

// Function to create pairs of images
function createImagePairs(numPairs) {
  const shuffledImages = shuffle([...backfaceImageNames]);
  const pairs = [];

  for (let i = 0; i < numPairs; i++) {
    const image = backfaceImageNames[i % backfaceImageNames.length];
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

function createFrontFace() {
  let face = document.createElement("div");
  face.classList = "card-face front rotating-border";
  let img = document.createElement("img");
  img.src = "img/question-mark_10264101.png";
  img.classList.add("front-img");
  face.append(img);
  return face;
}

function createBackFace(backFaceImage) {
  let face = document.createElement("div");
  face.classList = "card-face back";
  let img = document.createElement("img");
  img.src = "img/emoji/" + backFaceImage;
  img.classList.add("photo");
  face.append(img);
  return face;
}

function shuffle(array) {
  const arr = array.slice(); // Make a shallow copy to avoid modifying original
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // Random index from 0 to i
    [arr[i], arr[j]] = [arr[j], arr[i]]; // Swap elements
  }
  return arr;
}
