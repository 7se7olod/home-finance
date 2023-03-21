import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Popup} from "../utils/popup";
import {DateFormatter} from "../utils/dateFormatter";
import {SvgBtns} from "../utils/svgBtns";
import {OperationType} from "../type/operation.type";

export class Operations {
    private createBtnElement: HTMLElement | null = document.getElementById('operations-create-btn');
    private dateInputFromElement: HTMLElement | null = document.getElementById('date-input-from');
    private dateInputToElement: HTMLElement | null = document.getElementById('date-input-to');
    private operationTableBody: HTMLElement | null = document.getElementById('operations-table-body-content');

    constructor() {
        this.init();
    }

    private init(): void {
        const currentDate = new Date();
        this.loadingOperations(DateFormatter.YYYY_MM_DD(currentDate), DateFormatter.YYYY_MM_DD(currentDate));
        this.activateButtons();
        if (this.createBtnElement) {
            this.createBtnElement.onclick = function () {
                location.href = '#/operations/create';
            }
        }
    }

    private activateButtons(): void {
        const that: Operations = this;
        const menuItems: HTMLCollectionOf<Element> | null = document.getElementsByClassName('operations-date-buttons');
        const currentDate: string = DateFormatter.YYYY_MM_DD(new Date());

        function onClick(event: Event): void {
            event.preventDefault();

            if (!menuItems) return;
            for (let i = 0; i < menuItems.length; i++) {
                menuItems[i].classList.remove('active');
            }

            (event.currentTarget as HTMLButtonElement).classList.add('active');
            switch ((event.currentTarget as HTMLButtonElement).innerText.toLowerCase()) {
                case 'сегодня':
                    that.loadingOperations(currentDate, currentDate);
                    break;

                case 'неделя':
                    that.loadingOperations(DateFormatter.weekDate, currentDate);
                    break;

                case 'месяц':
                    that.loadingOperations(DateFormatter.monthDate, currentDate);
                    break;

                case 'год':
                    that.loadingOperations(DateFormatter.yearDate, currentDate);
                    break;

                case 'все':
                    that.loadingOperations(DateFormatter.allDate, currentDate);
                    break;

                case 'интервал':
                    if (that.operationTableBody && that.dateInputFromElement && that.dateInputToElement) {
                        that.operationTableBody.innerHTML = '';
                        that.dateInputFromElement.onchange = function () {
                            const fromDateValue: string = (that.dateInputFromElement as HTMLInputElement).value;
                            const toDateValue: string = (that.dateInputToElement as HTMLInputElement).value;
                            if (fromDateValue && toDateValue) {
                                that.loadingOperations(fromDateValue, toDateValue);
                            } else {
                                if (that.operationTableBody) {
                                    that.operationTableBody.innerHTML = '';
                                }
                            }
                        }

                        that.dateInputToElement.onchange = function () {
                            const fromDateValue: string = (that.dateInputFromElement as HTMLInputElement).value;
                            const toDateValue: string = (that.dateInputToElement as HTMLInputElement).value;
                            if (fromDateValue && toDateValue) {
                                that.loadingOperations(fromDateValue, toDateValue);
                            } else {
                                if (that.operationTableBody) {
                                    that.operationTableBody.innerHTML = '';
                                }
                            }
                        }
                    }
                    break;
            }
        }

        for (let i = 0; i < menuItems.length; i++) {
            menuItems[i].addEventListener('click', onClick, false);
        }
    }

    public async loadingOperations(dateFrom: DateFormatter, dateTo: DateFormatter): Promise<void> {
        const emptyBlock: HTMLElement | null = document.getElementById('operations-empty-text');
        const result: OperationType[] = await CustomHttp.request(config.host + `/operations?period=interval&dateFrom=${dateFrom}&dateTo=${dateTo}`);
        if (emptyBlock) {
            emptyBlock.style.display = (result.length === 0) ? 'block' : 'none';
        }

        if (this.operationTableBody) {
            this.operationTableBody.innerHTML = '';
        }

        result.forEach((operation: OperationType, index: number) => {
            const tRow: HTMLElement | null = document.createElement('tr');
            const tHead: HTMLElement | null = document.createElement('th');
            const tdType: HTMLElement | null = document.createElement('td');
            const tdCategory: HTMLElement | null = document.createElement('td');
            const tdAmount: HTMLElement | null = document.createElement('td');
            const tdDate: HTMLElement | null = document.createElement('td');
            const tdComment: HTMLElement | null = document.createElement('td');
            const tdBtns: HTMLElement | null = document.createElement('td');
            const removeBtn: HTMLElement | null = document.createElement('button');
            const changeBtn: HTMLElement | null = document.createElement('button');
            const that = this;

            tRow.id = 'table-row-' + operation.id;
            removeBtn.innerHTML = SvgBtns.removeBtn;
            changeBtn.innerHTML = SvgBtns.editBtn;
            removeBtn.setAttribute('data-bs-toggle', "modal");
            removeBtn.setAttribute("data-bs-target", "#userModal");

            changeBtn.onclick = function () {
                localStorage.setItem('editOperation', JSON.stringify(operation.id));
                location.href = '#/operations/edit'
            }

            removeBtn.onclick = function (): void {
                Popup.setTextPopup(Popup.removeOperationText);
                Popup.setButtons(Popup.yesRemoveBtn, Popup.notRemoveBtn);
                const popupRemoveCategoryButtonElement = document.getElementById('popup-remove-category-btn');
                if (!popupRemoveCategoryButtonElement) return;
                popupRemoveCategoryButtonElement.onclick = async function (): Promise<void> {
                    const currentBalance: HTMLElement | null = document.getElementById('sidebar-user-balance');
                    if (!currentBalance) return;
                    let updatedBalance: number;
                    if (operation.type === 'income') {
                        updatedBalance = Number(currentBalance.innerText) - operation.amount;
                    } else {
                        updatedBalance = Number(currentBalance.innerText) + operation.amount;
                    }

                    currentBalance.innerText = updatedBalance.toString();
                    await CustomHttp.request(config.host + '/operations/' + operation.id, 'DELETE');
                    await CustomHttp.request(config.host + '/balance', 'PUT', {newBalance: updatedBalance});
                    that.loadingOperations(dateFrom, dateTo);
                }
            }

            tdBtns.appendChild(removeBtn);
            tdBtns.appendChild(changeBtn);
            tHead.innerText = (index + 1).toString();
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

            const operationTableContentElement = document.getElementById('operations-table-body-content');
            if (!operationTableContentElement) return;
            operationTableContentElement.appendChild(tRow);
        })
    }
}
