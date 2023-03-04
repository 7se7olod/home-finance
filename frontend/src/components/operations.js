import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Popup} from "../utils/popup";
import {DateFormatter} from "../utils/dateFormatter";
import {SvgBtns} from "../utils/svgBtns";

export class Operations {
    constructor() {
        this.createBtnElement = document.getElementById('operations-create-btn');
        this.dateInputFromElement = document.getElementById('date-input-from');
        this.dateInputToElement = document.getElementById('date-input-to');
        this.operationTableBody = document.getElementById('operations-table-body-content');
        this.init();
    }

    init() {
        const currentDate = new Date();
        this.loadingOperations(DateFormatter.YYYY_MM_DD(currentDate), DateFormatter.YYYY_MM_DD(currentDate));
        this.activateButtons();
        this.createBtnElement.onclick = function () {
            location.href = '#/operations/create';
        }
    }

    activateButtons() {
        const that = this;
        const menuItems = document.getElementsByClassName('operations-date-buttons');
        const onClick = function (event) {
            event.preventDefault();

            for (let i = 0; i < menuItems.length; i++) {
                menuItems[i].classList.remove('active');
            }

            event.currentTarget.classList.add('active');

            const currentDate = DateFormatter.YYYY_MM_DD(new Date());
            if (event.currentTarget.innerText.toLowerCase() === 'сегодня') {
                that.loadingOperations(currentDate, currentDate);
            }

            if (event.currentTarget.innerText.toLowerCase() === 'неделя') {
                that.loadingOperations(DateFormatter.weekDate, currentDate);
            }

            if (event.currentTarget.innerText.toLowerCase() === 'месяц') {
                that.loadingOperations(DateFormatter.monthDate, currentDate);
            }

            if (event.currentTarget.innerText.toLowerCase() === 'год') {
                that.loadingOperations(DateFormatter.yearDate, currentDate);
            }

            if (event.currentTarget.innerText.toLowerCase() === 'все') {
                that.loadingOperations(DateFormatter.allDate, currentDate);
            }

            if (event.currentTarget.innerText.toLowerCase() === 'интервал') {
                that.operationTableBody.innerHTML = '';

                that.dateInputFromElement.onchange = function () {
                    const fromDateValue = that.dateInputFromElement.value;
                    const toDateValue = that.dateInputToElement.value;
                    if (fromDateValue && toDateValue) {
                        that.loadingOperations(fromDateValue, toDateValue);
                    } else {
                        that.operationTableBody.innerHTML = '';
                    }
                }

                that.dateInputToElement.onchange = function () {
                    const fromDateValue = that.dateInputFromElement.value;
                    const toDateValue = that.dateInputToElement.value;
                    if (fromDateValue && toDateValue) {
                        that.loadingOperations(fromDateValue, toDateValue);
                    } else {
                        that.operationTableBody.innerHTML = '';
                    }
                }
            }
        };

        for (let i = 0; i < menuItems.length; i++) {
            menuItems[i].addEventListener('click', onClick, false);
        }
    }

    async loadingOperations(dateFrom, dateTo) {
        const emptyBlock = document.getElementById('operations-empty-text');
        const result = await CustomHttp.request(config.host + `/operations?period=interval&dateFrom=${dateFrom}&dateTo=${dateTo}`);
        emptyBlock.style.display = (result.length === 0) ? 'block' : 'none';
        if (this.operationTableBody) {
            this.operationTableBody.innerHTML = '';
        }

        result.forEach((operation, index) => {
            const tRow = document.createElement('tr');
            const tHead = document.createElement('th');
            const tdType = document.createElement('td');
            const tdCategory = document.createElement('td');
            const tdAmount = document.createElement('td');
            const tdDate = document.createElement('td');
            const tdComment = document.createElement('td');
            const tdBtns = document.createElement('td');
            const removeBtn = document.createElement('button');
            const changeBtn = document.createElement('button');
            const that = this;

            tRow.id = 'table-row-' + operation.id;
            removeBtn.innerHTML = SvgBtns.removeBtn;
            changeBtn.innerHTML = SvgBtns.editBtn;
            removeBtn.setAttribute('data-bs-toggle', "modal");
            removeBtn.setAttribute("data-bs-target","#userModal");

            changeBtn.onclick = function () {
                localStorage.setItem('editOperation', JSON.stringify(operation.id));
                location.href = '#/operations/edit'
            }

            removeBtn.onclick = function () {
                Popup.setTextPopup(Popup.removeOperationText);
                Popup.setButtons(Popup.yesRemoveBtn, Popup.notRemoveBtn);
                document.getElementById('popup-remove-category-btn').onclick = async function () {
                    const currentBalance = document.getElementById('sidebar-user-balance');
                    let updatedBalance;
                    if (operation.type === 'income') {
                        updatedBalance = Number(currentBalance.innerText) - operation.amount;
                    } else {
                        updatedBalance = Number(currentBalance.innerText) + operation.amount;
                    }

                    currentBalance.innerText = updatedBalance;
                    await CustomHttp.request(config.host + '/operations/' + operation.id, 'DELETE');
                    await CustomHttp.request(config.host + '/balance', 'PUT', {newBalance: updatedBalance });
                    that.loadingOperations(dateFrom, dateTo);
                }
            }

            tdBtns.appendChild(removeBtn);
            tdBtns.appendChild(changeBtn);
            tHead.innerText = index + 1;
            tRow.appendChild(tHead);
            tRow.appendChild(tdType);
            tdCategory.innerText = operation.category;
            tRow.appendChild(tdCategory);
            tdAmount.innerText = operation.amount + '$';
            tRow.appendChild(tdAmount);
            tdDate.innerText = DateFormatter.DD_MM_YYYY(new Date(operation.date));
            tRow.appendChild(tdDate);
            tdComment.innerText = operation.comment;
            tRow.appendChild(tdComment);
            tRow.appendChild(tdBtns);

            if (operation.type === 'income') {
                tdType.style.color = 'green';
                tdType.innerText = 'доход';
            }

            if (operation.type === 'expense') {
                tdType.style.color = 'red';
                tdType.innerText = 'расход';
            }

            document.getElementById('operations-table-body-content').appendChild(tRow);
        })
    }
}
