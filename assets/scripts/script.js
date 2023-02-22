const booksArray = [];
let searchResult = [];
const BOOKS_KEY = 'SHELFLIFY';
const SAVE_EVENT = 'save_event';
const RENDER_EVENT = 'render_event';


const checkStorage = () => {
    if (typeof (localStorage) !== 'undefined') {
        return true;
    } else {
        return alert('Your browser doesnt support local storage');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const addBookForm = document.getElementById('form');
    const searchBar = document.getElementById('search');

    if (checkStorage) {
        if (localStorage.getItem(BOOKS_KEY) != null) {
            loadData()
        } else {
            localStorage.setItem(BOOKS_KEY, JSON.stringify(booksArray));
        }
    }

    addBookForm.addEventListener('submit', (event) => {
        addBookItem();
        event.preventDefault();
    });

    searchBar.addEventListener('keyup', () => {
        const keyword = searchBar.value.toLowerCase();


        searchResult = booksArray.filter((object) => {
            return object.title.toLowerCase().includes(keyword)
        })

        document.dispatchEvent(new Event(RENDER_EVENT));
    });

});

function syncSearchResult() {
    const keyword = document.getElementById('search').value.toLowerCase();

    searchResult = booksArray.filter((object) => {
        return object.title.toLowerCase().includes(keyword)
    })
}

function loadData() {
    if (checkStorage) {
        const fetched = localStorage.getItem(BOOKS_KEY)
        const parsed = JSON.parse(fetched)

        for (const data of parsed) {
            booksArray.push(data)
        }

        document.dispatchEvent(new Event(RENDER_EVENT));
    }
}

function generateBookId() {
    return +new Date();
}

function generateBookData(id, title, author, year, isCompleted) {
    return {
        id: id,
        title: title,
        author: author,
        year: year,
        isCompleted: isCompleted
    }

}

function addBookItem() {
    const titleValue = document.getElementById('title').value;
    const authorValue = document.getElementById('author').value;
    const yearValue = document.getElementById('year').value;
    const isCompleted = document.getElementById('is-completed').checked;

    const newBookID = generateBookId();
    const newBookData = generateBookData(newBookID, titleValue, authorValue, yearValue, isCompleted);

    booksArray.push(newBookData);
    saveData('🎉 Book Added');
    syncSearchResult();
    document.dispatchEvent(new Event(RENDER_EVENT));

}

function displayToast(msg) {
    const mainElement = document.querySelector('main');
    const toast = document.createElement('div');
    const toastId = +new Date();
    toast.classList.add('toast');
    toast.innerText = msg;
    toast.setAttribute('id', toastId);

    mainElement.append(toast);
    removeToast(toastId)
}

function removeToast(toastId) {
    const mainElement = document.querySelector('main');
    const toast = document.getElementById(toastId);

    setTimeout(() => {
        mainElement.removeChild(toast);
    }, 2000)
}


function saveData(message) {
    document.dispatchEvent(new Event(SAVE_EVENT));
    displayToast(message);
}


function findBookById(id) {
    for (const book of booksArray) {
        if (id == book.id) {
            return booksArray.indexOf(book);
        }
    }
}

function removeBook(objectId) {

    if (checkStorage) {
        const targetId = findBookById(objectId);
        booksArray.splice(targetId, 1);
        syncSearchResult();
        saveData('🗑️ Book Removed');
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

function editBook(objectId) {
    const targetIdx = findBookById(objectId);

    let newTitleValue = document.getElementById('edit_title').value;

    let newAuthorValue = document.getElementById('edit_author').value;

    let newYearValue = document.getElementById('edit_year').value;

    if (newTitleValue === "") {
        newTitleValue = booksArray[targetIdx].title;
    }

    if (newAuthorValue === "") {
        newAuthorValue = booksArray[targetIdx].author;
    }

    if (newYearValue === "") {
        newYearValue = booksArray[targetIdx].year;
    }

    booksArray[targetIdx].title = newTitleValue;
    booksArray[targetIdx].author = newAuthorValue;
    booksArray[targetIdx].year = newYearValue;

    syncSearchResult();
    saveData('📕 Edit Success');
    document.dispatchEvent(new Event(RENDER_EVENT));
}

function makeModal(action, target, message) {
    const mainElement = document.querySelector('main');

    const modalBackdrop = document.createElement('div');
    const modalContainer = document.createElement('div');
    const modalTitle = document.createElement('h3');
    const modalContent = document.createElement('div');
    const modalMessage = document.createElement('div');
    const modalAction = document.createElement('div');
    const confirmBtn = document.createElement('button');
    const cancelBtn = document.createElement('button');

    modalBackdrop.classList.add('modals-backdrop');
    modalContainer.classList.add('modals-container');
    modalTitle.innerText = 'Confirm Action';
    modalContent.classList.add('modals-content');
    modalMessage.append(message);
    modalAction.classList.add('modals-action');
    confirmBtn.setAttribute('id', 'ok');
    confirmBtn.addEventListener('click', () => {
        action(target)
        modalBackdrop.remove();
    })
    confirmBtn.innerText = 'Confirm';
    cancelBtn.setAttribute('id', 'cancel');
    cancelBtn.innerText = 'Cancel';
    cancelBtn.addEventListener('click', () => {
        modalBackdrop.remove();
    })

    modalAction.append(confirmBtn, cancelBtn);
    modalContent.append(modalMessage);
    modalContainer.append(modalTitle, modalContent, modalAction);
    modalBackdrop.append(modalContainer);
    mainElement.append(modalBackdrop);
}

function makeModalFormInput(inputType, label, id, isRequired) {

    const inputGroup = document.createElement('div');
    const labelElement = document.createElement('label');
    const inputElement = document.createElement('input');

    inputGroup.classList.add('form-group');
    labelElement.classList.add('form-title');
    labelElement.innerText = label;
    labelElement.setAttribute('for', id);
    inputElement.setAttribute('id', id);
    inputElement.setAttribute('type', inputType);

    if (isRequired) { inputElement.required = isRequired }

    inputGroup.append(labelElement, inputElement);


    return inputGroup;
}

function makeModalForm(objectId) {
    const targetIdx = findBookById(objectId);
    const form = document.createElement('form');
    const inputTitle = makeModalFormInput('text', 'Title', 'edit_title', true);
    const inputAuthor = makeModalFormInput('text', 'Author', 'edit_author', true);
    const inputYear = makeModalFormInput('number', 'Year', 'edit_year', true);

    inputTitle.lastChild.value = booksArray[targetIdx].title;
    inputAuthor.lastChild.value = booksArray[targetIdx].author;
    inputYear.lastChild.value = booksArray[targetIdx].year;

    form.setAttribute('id', 'edit_form');
    form.append(inputTitle, inputAuthor, inputYear);

    return form;
}

function makeItem(object) {
    const itemContainer = document.createElement('div');
    itemContainer.classList.add('item');
    itemContainer.setAttribute('id', object.id);

    const itemTitle = document.createElement('h3');
    itemTitle.innerText = object.title;

    const itemInfoContainer = document.createElement('div');
    itemInfoContainer.classList.add('item-info');

    const itemAuthor = document.createElement('p');
    itemAuthor.innerText = object.author;

    const itemYear = document.createElement('p');
    itemYear.innerText = object.year;

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('btn-container');

    const removeBtn = document.createElement('button');
    removeBtn.classList.add('fa-solid', 'fa-trash');
    removeBtn.addEventListener('click', () => {
        makeModal(removeBook, object.id, 'Are you sure to delete?');
    });

    const editBtn = document.createElement('button');
    editBtn.classList.add('fa-solid', 'fa-pen-to-square');
    editBtn.addEventListener('click', () => {
        makeModal(editBook, object.id, makeModalForm(object.id));
    });

    itemInfoContainer.append(itemAuthor, itemYear);
    itemContainer.append(itemTitle, itemInfoContainer, buttonContainer);
    buttonContainer.append(removeBtn, editBtn);

    if (object.isCompleted) {
        const undoBtn = document.createElement('button');
        undoBtn.classList.add('fa-solid', 'fa-arrow-rotate-left');
        buttonContainer.append(undoBtn);
        undoBtn.addEventListener('click', () => {
            object.isCompleted = false;
            saveData('✅ Moved Book to Uncompleted');
            document.dispatchEvent(new Event(RENDER_EVENT));
        });
    } else {
        const checkBtn = document.createElement('button');
        checkBtn.classList.add('fa-solid', 'fa-check');
        buttonContainer.append(checkBtn);
        checkBtn.addEventListener('click', () => {
            object.isCompleted = true;
            saveData('✅ Moved Book to Completed');
            document.dispatchEvent(new Event(RENDER_EVENT));
        });
    }

    return itemContainer;
}

document.addEventListener(SAVE_EVENT, () => {
    if (checkStorage) {
        const dataString = JSON.stringify(booksArray);
        localStorage.setItem(BOOKS_KEY, dataString);
    }
});

document.addEventListener(RENDER_EVENT, () => {
    const searchBarValue = document.getElementById('search').value;
    const completedSection = document.getElementById('completed');
    const uncompletedSection = document.getElementById('uncompleted');
    const uncompletedCountField = document.getElementById('ucount');
    const completedCountField = document.getElementById('ccount');
    let completedCount = 0;
    let uncompletedCount = 0;

    completedSection.innerHTML = '';
    uncompletedSection.innerHTML = '';

    if (searchBarValue == '') {
        for (const book of booksArray) {
            const item = makeItem(book);

            if (book.isCompleted) {
                completedSection.append(item)
                completedCount += 1;
            } else {
                uncompletedSection.append(item)
                uncompletedCount += 1;
            }
        }
    } else {
        for (const result of searchResult) {
            const item = makeItem(result);

            if (result.isCompleted) {
                completedSection.append(item)
                completedCount += 1;
            } else {
                uncompletedSection.append(item)
                uncompletedCount += 1;
            }
        }
    }

    if (completedSection.childElementCount == 0) {
        completedSection.innerText = 'No data was found 😪';
    }

    if (uncompletedSection.childElementCount == 0) {
        uncompletedSection.innerText = 'No data was found 😪';
    }

    uncompletedCountField.innerText = uncompletedCount;
    completedCountField.innerText = completedCount;
});
