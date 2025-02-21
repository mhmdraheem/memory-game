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
  easy: { minCardSize: 80, gap: 10 },
  medium: { minCardSize: 60, gap: 10 },
  hard: { minCardSize: 40, gap: 10 },
};

let currentDifficulty = "easy";

function calculateCardDimensions(difficulty) {
  const { minCardSize, gap } = difficultySettings[difficulty];
  const cardsContainer = document.querySelector(".cards");
  const viewportWidth = cardsContainer.clientWidth;
  const viewportHeight = window.innerHeight - 150;

  // Calculate the number of columns and rows
  let columns = Math.floor(viewportWidth / (minCardSize + gap));
  let rows = Math.floor(viewportHeight / (minCardSize + gap));

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

// Handle difficulty change
const difficultyDropdown = document.getElementById("difficulty");
difficultyDropdown.addEventListener("change", (event) => {
  currentDifficulty = event.target.value;
  adjustGridLayout(currentDifficulty);
});

const restartButton = document.querySelector(".restart");
restartButton.addEventListener("click", (event) => {
  reset();
  adjustGridLayout(currentDifficulty);

  audio.currentTime = 0;
  audio.play();
});

// Set default difficulty on page load
difficultyDropdown.value = currentDifficulty;
adjustGridLayout(currentDifficulty);

function createCard(imageName) {
  let card = document.createElement("div");
  card.classList.add("flippig-card");
  card.addEventListener("click", clickHandler);
  card.setAttribute("name", imageName.split(".")[0]);
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
    audio.pause();
    playSound("completed");
    triggerConfetti();
    reset();
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
  return face;
}

function createBackFace(backFaceImage) {
  let face = document.createElement("div");
  face.classList = "card-face back";
  let img = document.createElement("img");
  img.src = "img/" + backFaceImage;
  img.classList.add("photo");
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

const audio = document.getElementById("bgAudio");
audio.play();

document.addEventListener(
  "click",
  () => {
    const audio = document.getElementById("bgAudio");
    if (audio.paused) {
      audio.play();
    }
  },
  { once: true }
);

audio.addEventListener("ended", () => {
  audio.currentTime = 0;
  audio.play();
});
