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
let read_status = '';
let editMode = false;
let editIndex;
let edit_buttons = [];

window.onload = (e) => displayLibrary(myLibrary);

status_input.forEach(input => {
  input.addEventListener('click', () => {
    if (input === reading_input) {
      pageNum_input.setAttribute('required', '');
    } else {
      pageNum_input.removeAttribute('required');
    }
  });
});

form.addEventListener('submit', (e) => {
  if (editMode) {
    editBook(e);
    editMode = false;
  } else {
    addBookToLibrary(e);
  }
});

cancel_btn.addEventListener('click', () => {
  editMode = false;
  resetForm();
  edit_buttons.forEach(btn => btn.classList.remove('clicked')); // Switch off all edit buttons
});

function displayLibrary(library) {
  library.forEach(book => displayBook(book));
}

function Book(title, author, pages, status) {
  this.date = new Date().toLocaleDateString();
  this.title = title;
  this.author = author;
  this.pages = pages;
  this.status = status;
}

function isInLibrary(newBook) {
  for (const book of myLibrary) {
    if (book.title.toLowerCase() === newBook.title.toLowerCase()) return true;
  }
  return false;
}

function getStatus() {
  for (let i = 0; i < status_input.length; i++) {
    if (status_input[i].checked) {
      read_status = status_input[i].labels[0].innerText;
      if (i === 1) read_status += pageNum_input.value;
    }
  }
  return read_status;
}

function addBookToLibrary(e) {
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

function resetForm() {
  form.reset();
  pageNum_input.removeAttribute('required');
}

function displayBook(book) {
  const row = tbody.insertRow();
  const date_cell = row.insertCell(0);
  const title_cell = row.insertCell(1);
  const author_cell = row.insertCell(2);
  const pages_cell = row.insertCell(3);
  const status_cell = row.insertCell(4);
  const action_cell = row.insertCell(5);
  date_cell.innerHTML = book.date;
  title_cell.innerHTML = book.title;
  author_cell.innerHTML = book.author;
  pages_cell.innerHTML = book.pages;
  status_cell.innerHTML = book.status;

  const index = myLibrary.indexOf(book);
  action_cell.innerHTML = `<button id='edit' data-index='${index}'>Edit</button><button id='remove' data-index='${index}'>Remove</button>`;
  edit_buttons = document.querySelectorAll('#edit');
  activateActionButtons(book, index);
}

function activateActionButtons(book, index) {
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

function fillEditForm(element) {
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

function editBook(e) {
  e.preventDefault();
  const editedBook = new Book(title_input.value, author_input.value, pages_input.value, getStatus());  
  myLibrary.splice(editIndex, 1, editedBook)
  localStorage.setItem('books', JSON.stringify(myLibrary));
  tbody.innerHTML = '';
  displayLibrary(myLibrary);
  form.reset();
  pageNum_input.removeAttribute('required');
}

function removeBook(e) {
  myLibrary.splice(e.target.dataset.index, 1);
  localStorage.setItem('books', JSON.stringify(myLibrary));
  tbody.innerHTML = '';
  displayLibrary(myLibrary);
}

function sortData(library) {
  // sort library
  displayLibrary(library);
}