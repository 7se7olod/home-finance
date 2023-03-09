import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";
import {Popup} from "../utils/popup.js";
import {DateFormatter} from "../utils/dateFormatter";

export class Categories {
    constructor(typeCategory) {
        document.getElementById('category-title').innerText = (typeCategory === 'income') ? 'Доходы' : 'Расходы';
        this.incomeCategories = [];
        this.expenseCategories = [];
        this.type = typeCategory;
        this.cards = (typeCategory === 'income') ? this.incomeCategories : this.expenseCategories;
        this.cardItems = document.getElementById('cards');
        this.newBtnElement = document.getElementById('category-new-item-button');
        this.init();
    }

    async init() {
        if (this.type === 'income') {
            const result = await CustomHttp.request(config.host + '/categories/income');
            result.forEach(item => this.incomeCategories.push(item));
            this.newBtnElement.onclick = function () {
                location.href = '#/categories/income/create';
            }
        }

        if (this.type === 'expenses') {
            const result = await CustomHttp.request(config.host + '/categories/expense');
            result.forEach(item => this.expenseCategories.push(item));
            this.newBtnElement.onclick = function () {
                location.href = '#/categories/expense/create';
            }
        }

        for (let i = 0; i < this.cards.length; i++) {
            const itemCard = document.createElement('div');
            itemCard.innerHTML = await fetch('templates/UI/card.html').then(response => response.text());
            this.cardItems.appendChild(itemCard);
            const that = this;
            document.getElementsByClassName('card-item-title')[i].textContent = this.cards[i].title;
            document.getElementsByClassName('card-edit-btn')[i].onclick = function () {
                localStorage.setItem('editCategory', JSON.stringify(that.cards[i]));
                if (that.type === 'income') {
                    location.href = '#/categories/income/edit';
                }

                if (that.type === 'expenses') {
                    location.href = '#/categories/expense/edit';
                }
            }

            document.getElementsByClassName('card-remove-btn')[i].onclick = async function () {
                const currentDate = DateFormatter.YYYY_MM_DD(new Date());
                const operations = await CustomHttp.request(config.host + `/operations?period=interval&dateFrom=${DateFormatter.allDate}&dateTo=${currentDate}`);
                const currentBalance = document.getElementById('sidebar-user-balance');
                let updatedBalance;

                if (that.type === 'income') {
                    Popup.setTextPopup(Popup.incomeRemoveText);
                    Popup.setButtons(Popup.yesRemoveBtn, Popup.notRemoveBtn);
                    document.getElementById('popup-remove-category-btn').onclick = async function () {
                        await CustomHttp.request(config.host + '/categories/income/' + that.cards[i].id, 'DELETE');

                        for (let j = 0; j < operations.length; j++) {
                            if (operations[j].category === that.cards[i].title) {
                                updatedBalance = Number(currentBalance.innerText) - operations[j].amount;
                                await CustomHttp.request(config.host + '/operations/' + operations[j].id, 'DELETE');
                                await CustomHttp.request(config.host + '/balance', 'PUT', {newBalance: updatedBalance});
                                currentBalance.innerText = updatedBalance;
                            }
                        }
                        location.href = '#/categories/income';
                    }
                }

                if (that.type === 'expenses') {
                    Popup.setTextPopup(Popup.expensesRemoveText);
                    Popup.setButtons(Popup.yesRemoveBtn, Popup.notRemoveBtn);
                    document.getElementById('popup-remove-category-btn').onclick = async function () {
                        await CustomHttp.request(config.host + '/categories/expense/' + that.cards[i].id, 'DELETE');

                        for (let j = 0; j < operations.length; j++) {
                            if (operations[j].category === that.cards[i].title) {
                                updatedBalance = Number(currentBalance.innerText) + operations[j].amount;
                                await CustomHttp.request(config.host + '/operations/' + operations[j].id, 'DELETE');
                                await CustomHttp.request(config.host + '/balance', 'PUT', {newBalance: updatedBalance});
                                currentBalance.innerText = updatedBalance;
                            }
                        }
                        location.href = '#/categories/expenses';
                    }
                }
            }
        }
        this.cardItems.appendChild(this.newBtnElement);
        this.newBtnElement.style.display = 'flex';
    }
}
