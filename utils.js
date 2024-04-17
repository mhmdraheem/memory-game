export function shuffle(array) {
  let currentIndex = array.length;

  while (currentIndex != 0) {
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array;
}

export function onClickOutside(element, callback) {
  document.addEventListener("click", (event) => {
    if (!element.contains(event.target)) {
      callback();
    }
  });
}

export function list(listId, onListItemClick) {
  let list = document.getElementById(listId);
  let selector = list.querySelector(".selector");
  let ul = list.querySelector("ul");

  selector.onclick = () => {
    ul.classList.replace("hide-list", "show-list");
  };

  onClickOutside(list, () => {
    hideList();
  });

  function hideList() {
    ul.classList.replace("show-list", "hide-list");
  }

  let listItems = ul.querySelectorAll("li");
  listItems.forEach((item) => {
    item.onclick = (event) => {
      hideList();

      // display the selected value inside the selector
      const selectedValue = event.target.innerHTML;
      selector.innerHTML = selectedValue;

      onListItemClick(selectedValue, event);
    };
  });
}
