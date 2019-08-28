let storage = {
  data: JSON.parse(localStorage.getItem('tableData')) || [],
  currentId: localStorage.getItem('currentId') || 1,
  sortName: true,
  sortValue: true,
};

function render() {
  const tableBody = document.querySelector('table').querySelector('tbody');
  let { data } = storage;
  tableBody.innerHTML = '';  

  if (data.length === 0) {
    tableBody.innerHTML = `
      <tr class="emptyField">
        <td colspan="3">
          Table is empty :с
        </td>
      </tr>`;
  };

  for (let i = 0; i < data.length; i++) {
    const tdName = document.createElement('td');
    tdName.innerHTML = `<p class="edit-text">${data[i].name}</p>`;
    tdName.append(createEditButton(data[i].id));
    tdName.classList.add('edit-name');

    const tdValue = document.createElement('td');
    tdValue.classList.add('edit-value');
    tdValue.innerHTML = `<p class="edit-text">${data[i].value}</p>`;
    tdValue.append(createEditButton(data[i].id));
    
    const deleteButton = document.createElement('td');
    deleteButton.innerHTML = '<span>&times;</span>';
    deleteButton.classList.add('deleteBtn');
    deleteButton.addEventListener('click', ({ target }) => {
      if (target.tagName !== 'SPAN') return;
      const position = data.findIndex(item => item.id === data[i].id);
      data.splice(position, 1);
      render();
    })
    const field = document.createElement('tr');
    field.classList.add('field');

    field.append(tdName, tdValue, deleteButton);
    tableBody.append(field);
  };
};

function createAddContainer() {
  const { data } = storage;

  const addContainer = document.querySelector('.add-container');
  const addLink = document.querySelector('.add');
  const addButton = document.querySelector('.add-button');
  const cancelButton = document.querySelector('.add-buttonCancel');
  const inputName = addContainer.querySelector('input[data-name]');
  const inputValue = addContainer.querySelector('input[data-value]');

  addContainer.style.display = "none";

  addLink.addEventListener('click', () => {
    addContainer.style.display = "";
    inputName.classList.remove('required');
    inputValue.classList.remove('required');
    inputName.value = '';
    inputValue.value = '';
  });

  let addData = {}
  addContainer.addEventListener('input', ({ target }) => {
    if (target.dataset.name !== undefined) {
      addData.name = target.value;
    } else {
      addData.value = target.value;
    };
  });

  addButton.addEventListener('click', () => {
    if (inputName.value.trim() !== '' && inputValue.value.trim() !== '') {
      inputName.value = '';
      inputValue.value = '';

      addData.id = storage.currentId++;
      data.push(Object.assign({}, addData));
      addContainer.style.display = "none";
      render();
    } else {
        inputName.value.trim() !== '' ? inputName.classList.remove('required') : inputName.classList.add('required');
        inputValue.value.trim() !== '' ?  inputValue.classList.remove('required') : inputValue.classList.add('required');
    };
  });

  cancelButton.addEventListener('click', () => addContainer.style.display = "none");
};

function createEditContainer(id, parent) {
  const { data } = storage;
  const editContainer = document.createElement('div');
  editContainer.classList.add('edit-container');
  const editText = parent.querySelector('.edit-text');
  const editBtn = parent.querySelector('.edit-buttonEdit')
  const currentEditTd = parent.classList.contains('edit-name') ? 'name' : 'value';
  editBtn.style.display = "none";
  editText.style.display = "none";

  const inputEdit = document.createElement('input');
  inputEdit.type = 'text';
  inputEdit.classList.add('edit-input');
  inputEdit.value = editText.innerHTML;

  const buttonOk = document.createElement('button');
  buttonOk.classList.add('edit-buttonOk');
  buttonOk.innerHTML = 'save';
  
  const buttonCancel = document.createElement('button');
  buttonCancel.classList.add('edit-buttonCancel');
  buttonCancel.innerHTML = 'cancel';

  buttonCancel.addEventListener('click', () => {
    editContainer.style.display = "none";
    editText.style.display = "";
    editBtn.style.display = "";
  })

  buttonOk.addEventListener('click', () => {
    if (inputEdit.value.trim() !== '') {
      data.find(item => item.id === id)[currentEditTd] = inputEdit.value;
      editContainer.style.display = "none";
      editText.style.display = "";
      editBtn.style.display = "";
      editText.innerText = `${inputEdit.value}`;
    };
  });

  editContainer.append(inputEdit, buttonOk, buttonCancel);
  parent.append(editContainer);
};

function createEditButton(id) {
  const editButton = document.createElement('button');
  editButton.classList.add('edit-buttonEdit');

  editButton.addEventListener('click', ({ target }) => {
    createEditContainer(id, target.offsetParent);
  });
  
  return editButton;
};

function jsonInTable() {
  const textarea = document.querySelector('#textarea-json');
  const btnDownload = document.querySelector('.textarea-download');
  const btnUnload = document.querySelector('.textarea-unload');

  btnUnload.addEventListener('click', () => {
    let unloadData = storage.data.map(item => {
      return {
        name: item.name,
        value: item.value,
      };
    })
    textarea.value = JSON.stringify(unloadData);
  })

  btnDownload.addEventListener('click', () => {
    const jsonData = JSON.parse(textarea.value);
    for (let i = 0; i < jsonData.length; i++) {
      storage.data.push(
       {
         name: jsonData[i].name,
         value: jsonData[i].value,
         id: storage.currentId++,
       }
      );
    };
    render();
  });
}

function sortTable() {
  let {data, sortName, sortValue} = storage;
  const thead = document.querySelector('thead');
  thead.addEventListener('click', ({ target }) => {
    switch (target.dataset.sort) {
      case 'name':
        data.sort((a, b) => sortName ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
        sortName = !sortName;
        render();
        break;
      case 'value':
        data.sort((a, b) => sortValue ? a.value.localeCompare(b.value) : b.value.localeCompare(a.value));
        sortValue = !sortValue;
        render();
        break;
    }
  })
}

sortTable();
createAddContainer();
jsonInTable();
render();

window.addEventListener("beforeunload", () => {
  if (storage.data.length === 0) {
    localStorage.setItem('tableData', null)
  } else {
      localStorage.setItem('tableData', JSON.stringify(storage.data));
      localStorage.setItem('currentId', storage.currentId);
  }
})
