const myLibrary = localStorage.getItem('books') ? JSON.parse(localStorage.getItem('books')) : [];
const title_input = document.getElementById('title');
const author_input = document.getElementById('author');
const pages_input = document.getElementById('pages');
const status_input = document.getElementsByName('status');
const pageNum_input = document.getElementById('page-number');
const reading_input = document.getElementById('reading');
const cancel_btn = document.getElementById('cancel');
const form = document.querySelector('form');
const tbody = document.querySelector('tbody');
const sort_buttons = document.querySelectorAll('.fa-sort');
let readStatus = '';
let editMode = false;
let editIndex;
let edit_buttons = [];
let ascSort = true;

window.onload = (e) => displayLibrary(myLibrary);

status_input.forEach(input => { // add required attribute for page number if books is "current reading"
  input.addEventListener('click', () => {
    if (input === reading_input) {
      pageNum_input.setAttribute('required', '');
    } else {
      pageNum_input.removeAttribute('required');
      pageNum_input.value = '';
    }
  });
});

form.addEventListener('submit', (e) => { // if edit mode is on, update book date, else add new book
  if (editMode) {
    editBook(e);
    editMode = false;
  } else {
    addBookToLibrary(e);
  }
});

cancel_btn.addEventListener('click', () => { // reset form when hitting cancel
  editMode = false;
  resetForm();
  edit_buttons.forEach(btn => btn.classList.remove('clicked')); // Switch off all edit buttons
});

function displayLibrary(library) { // display all book data
  library.forEach(book => displayBook(book));
}

function Book(title, author, pages, status) { // set up new book
  this.date = new Date();
  this.title = title;
  this.author = author;
  this.pages = pages;
  this.status = status;
}

function isInLibrary(newBook) { // check if book exists u=in library
  for (const book of myLibrary) {
    if (book.title.toLowerCase() === newBook.title.toLowerCase()) return true;
  }
  return false;
}

function getStatus() { // get book's reading status
  for (let i = 0; i < status_input.length; i++) {
    if (status_input[i].checked) {
      readStatus = status_input[i].labels[0].innerText;
      if (i === 1) readStatus += pageNum_input.value;
    }
  }
  return readStatus;
}

function addBookToLibrary(e) { // add new book to database
  e.preventDefault();
  const newBook = new Book(title_input.value, author_input.value, pages_input.value, getStatus());  
  if (!isInLibrary(newBook)) {
    myLibrary.push(newBook);
    localStorage.setItem('books', JSON.stringify(myLibrary));
    displayBook(newBook);
    resetForm();
  } else {
    alert('This book is already in your library.');
  }
}

function resetForm() { // reset book input form
  form.reset();
  pageNum_input.removeAttribute('required');
}

function displayBook(book) { // display each book in database
  const index = myLibrary.indexOf(book);
  const row = tbody.insertRow();
  const date_cell = row.insertCell(0);
  const title_cell = row.insertCell(1);
  const author_cell = row.insertCell(2);
  const pages_cell = row.insertCell(3);
  const status_cell = row.insertCell(4);
  const action_cell = row.insertCell(5);
  date_cell.innerHTML = new Date(book.date).toLocaleDateString();
  title_cell.innerHTML = book.title;
  author_cell.innerHTML = book.author;
  pages_cell.innerHTML = book.pages;
  status_cell.innerHTML = book.status;
  action_cell.innerHTML = `<button id='edit' data-index='${index}'>Edit</button><button id='remove' data-index='${index}'>Remove</button>`;
  edit_buttons = document.querySelectorAll('#edit');
  activateActionButtons(book, index);
}

function activateActionButtons(book, index) { // activate remove and edit buttons
  const edit_btn = document.querySelector(`#edit[data-index='${index}']`);
  const remove_btn = document.querySelector(`#remove[data-index='${index}']`);
  remove_btn.addEventListener('click', removeBook);
  edit_btn.addEventListener('click', () => {
    edit_buttons.forEach(btn => btn.classList.remove('clicked')); // Switch off all edit buttons
    edit_btn.classList.add('clicked'); // Switch on chosen edit button
    editMode = true;
    fillEditForm(edit_btn);
  });
}

function fillEditForm(element) { // fill form with book info when clicking edit button
  resetForm();
  editIndex = element.dataset.index;
  title_input.value = myLibrary[editIndex].title;
  author_input.value = myLibrary[editIndex].author;
  pages_input.value = myLibrary[editIndex].pages;
  if (myLibrary[editIndex].status[0] === 'F') {
    document.getElementById('read').checked = true;
  } else if (myLibrary[editIndex].status[0] === 'N') {
    document.getElementById('not-read').checked = true;
  } else {
    reading_input.checked = true;
    pageNum_input.setAttribute('required', '');
    pageNum_input.value = myLibrary[editIndex].status.split(' ')[3];
  }
}

function updateStorageAndDisplay() { // update book database
  localStorage.setItem('books', JSON.stringify(myLibrary));
  tbody.innerHTML = '';
  displayLibrary(myLibrary);
}

function editBook(e) { // edit book info
  e.preventDefault();
  myLibrary[editIndex].title = title_input.value;
  myLibrary[editIndex].author = author_input.value;
  myLibrary[editIndex].pages = pages_input.value;
  myLibrary[editIndex].status = getStatus();
  updateStorageAndDisplay();
  resetForm();
}

function removeBook(e) { // remove book from database
  myLibrary.splice(e.target.dataset.index, 1);
  updateStorageAndDisplay();
}

sort_buttons.forEach(btn => btn.addEventListener('click', (e) => { // add sort events to sort buttons
  ascSort = !ascSort;
  sortData(e);
  resetForm();
}));

// sort book data
function sortData(e) {
  const key = e.target.dataset.sort;

  if (key === 'date') { 
    myLibrary.sort((a, b) => new Date(a.date) - new Date(b.date)); // ascending sort by date added 
  } else if (key === 'pages') {
    myLibrary.sort((a, b) => a.pages - b.pages); // ascending sort by number of pages
  } else {
    myLibrary.sort((a, b) => a[key].toLowerCase() < b[key].toLowerCase() ? -1 : 1); // ascending sort by author, title, and reading status

    // ascending sort by reading pages if status is "current reading"
    if (key === 'status') {
      let spliceIndex;

      for (let i = 0; i < myLibrary.length; i++) {
        if (myLibrary[i].status[0] === 'C') {
          spliceIndex = i;
          break;
        } 
      }

      const currentReadArr = myLibrary.filter(book => book.status[0] === 'C');

      // sort ascending by current reading pages
      currentReadArr.sort((a, b) => parseInt(a.status.split(' ')[3]) - parseInt(b.status.split(' ')[3]));

      // replace unsorted "current reading" books by sorted "current reading" books
      myLibrary.splice(spliceIndex, currentReadArr.length, ...currentReadArr);
    }
  }

  // sort by descending order
  if (!ascSort) myLibrary.reverse(); 

  updateStorageAndDisplay();
}