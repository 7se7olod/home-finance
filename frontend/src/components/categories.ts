import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Popup} from "../utils/popup";
import {DateFormatter} from "../utils/dateFormatter";
import {IncomeExpenseType} from "../type/income-expense.type";
import {OperationType} from "../type/operation.type";
import {TypesOfOperationsType} from "../type/types-of-operations.type";

export class Categories {
    private cardItems: HTMLElement | null = document.getElementById('cards');
    private newBtnElement: HTMLElement | null = document.getElementById('category-new-item-button');
    private incomeCategories: IncomeExpenseType[] = [];
    private expenseCategories: IncomeExpenseType[] = [];
    private cards: any[];
    readonly type: TypesOfOperationsType;
    constructor(typeCategory: TypesOfOperationsType) {
        document.getElementById('category-title')!.innerText = (typeCategory === 'income') ? 'Доходы' : 'Расходы';
        this.type = typeCategory;
        this.cards = (typeCategory === TypesOfOperationsType.INCOME) ? this.incomeCategories : this.expenseCategories;
        this.init();
    }

    private async init(): Promise<void> {
        if (!this.newBtnElement) return;
        if (this.type === TypesOfOperationsType.INCOME) {
            const result: IncomeExpenseType[] = await CustomHttp.request(config.host + '/categories/income');
            result.forEach((item: IncomeExpenseType) => this.incomeCategories.push(item));
            this.newBtnElement.onclick = function () {
                location.href = '#/categories/income/create';
            }
        }

        if (this.type === TypesOfOperationsType.EXPENSE) {
            if (!this.newBtnElement) return;
            const result: IncomeExpenseType[] = await CustomHttp.request(config.host + '/categories/expense');
            result.forEach((item: IncomeExpenseType) => this.expenseCategories.push(item));
            this.newBtnElement.onclick = function () {
                location.href = '#/categories/expense/create';
            }
        }

        for (let i = 0; i < this.cards.length; i++) {
            const itemCard: HTMLElement | null = document.createElement('div');
            itemCard.innerHTML = await fetch('templates/UI/card.html').then(response => response.text());
            if (!this.cardItems) return;
            this.cardItems.appendChild(itemCard);
            const that = this;
            document.getElementsByClassName('card-item-title')[i].textContent = this.cards[i].title;
            const cardEditBtnElement: HTMLCollectionOf<Element> = document.getElementsByClassName('card-edit-btn');
            if (!cardEditBtnElement) return;
            (cardEditBtnElement[i] as HTMLButtonElement).onclick = function () {
                localStorage.setItem('editCategory', JSON.stringify(that.cards[i]));
                if (that.type === TypesOfOperationsType.INCOME) {
                    location.href = '#/categories/income/edit';
                }

                if (that.type === TypesOfOperationsType.EXPENSE) {
                    location.href = '#/categories/expense/edit';
                }
            }

            const cardRemoveBtnElement: HTMLCollectionOf<Element> = document.getElementsByClassName('card-remove-btn');
            (cardRemoveBtnElement[i] as HTMLButtonElement).onclick = async function () {
                const currentDate: string = DateFormatter.YYYY_MM_DD(new Date());
                const operations: OperationType[] = await CustomHttp.request(config.host + `/operations?period=interval&dateFrom=${DateFormatter.allDate}&dateTo=${currentDate}`);
                const currentBalance: HTMLElement | null = document.getElementById('sidebar-user-balance');
                let updatedBalance: number;

                if (that.type === TypesOfOperationsType.INCOME) {
                    Popup.setTextPopup(Popup.incomeRemoveText);
                    Popup.setButtons(Popup.yesRemoveBtn, Popup.notRemoveBtn);
                    document.getElementById('popup-remove-category-btn')!.onclick = async function () {
                        await CustomHttp.request(config.host + '/categories/income/' + that.cards[i].id, 'DELETE');

                        for (let j = 0; j < operations.length; j++) {
                            if (operations[j].category === that.cards[i].title) {
                                if (!currentBalance) return;
                                updatedBalance = Number(currentBalance.innerText) - operations[j].amount;
                                await CustomHttp.request(config.host + '/operations/' + operations[j].id, 'DELETE');
                                await CustomHttp.request(config.host + '/balance', 'PUT', {newBalance: updatedBalance});
                                currentBalance.innerText = updatedBalance.toString();
                            }
                        }
                        location.href = '#/categories/income';
                    }
                }

                if (that.type === TypesOfOperationsType.EXPENSE) {
                    Popup.setTextPopup(Popup.expensesRemoveText);
                    Popup.setButtons(Popup.yesRemoveBtn, Popup.notRemoveBtn);
                    const popupRemoveCategoryBtnElement = document.getElementById('popup-remove-category-btn');
                    if (!popupRemoveCategoryBtnElement) return;
                    popupRemoveCategoryBtnElement.onclick = async function () {
                        await CustomHttp.request(config.host + '/categories/expense/' + that.cards[i].id, 'DELETE');

                        for (let j = 0; j < operations.length; j++) {
                            if (operations[j].category === that.cards[i].title) {
                                if (!currentBalance) return;
                                updatedBalance = Number(currentBalance.innerText) + operations[j].amount;
                                await CustomHttp.request(config.host + '/operations/' + operations[j].id, 'DELETE');
                                await CustomHttp.request(config.host + '/balance', 'PUT', {newBalance: updatedBalance});
                                if (!currentBalance) return;
                                currentBalance.innerText = updatedBalance.toString();
                            }
                        }
                        location.href = '#/categories/expenses';
                    }
                }
            }
        }
        if (this.cardItems) {
            this.cardItems.appendChild(this.newBtnElement);
            this.newBtnElement.style.display = 'flex';
        }
    }
}
