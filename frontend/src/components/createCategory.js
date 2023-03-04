import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";

export class CreateCategory {
    constructor(typeCategory) {
        this.type = typeCategory;
        this.incomeTitleText = 'Создание категории доходов';
        this.expenseTitleText = 'Создание категории расходов';
        this.createCategoryTitleElement = document.getElementById('create-category-title');
        this.createCategoryCancelBtnElement = document.getElementById('create-category-cancel-btn');
        this.editCategorySaveBtnElement = document.getElementById('create-category-save-btn');
        this.editCategoryInput = document.getElementById('create-category-input');
        this.init();
    }

    init() {
        if (this.type === "income") {
            this.createCategoryTitleElement.innerText = this.incomeTitleText;
            this.createCategoryCancelBtnElement.onclick = function () {
                location.href = '#/categories/income';
            }

            const that = this;
            this.editCategorySaveBtnElement.onclick = async function () {
                const title = that.editCategoryInput.value.trim();
                if (title) {
                    await CustomHttp.request(config.host + '/categories/income/', 'POST', {
                        title: title
                    })
                    location.href = '#/categories/income';
                } else {
                    alert('Пустая строка');
                }
            }
        }

        if (this.type === 'expense') {
            this.createCategoryTitleElement.innerText = this.expenseTitleText;
            this.createCategoryCancelBtnElement.onclick = function () {
                location.href = '#/categories/expenses';
            }

            const that = this;
            this.editCategorySaveBtnElement.onclick = async function () {
                const title = that.editCategoryInput.value.trim();
                if (title) {
                    await CustomHttp.request(config.host + '/categories/expense/', 'POST', {
                        title: title
                    })
                    location.href = '#/categories/expenses';
                } else {
                    alert('Пустая строка');
                }
            }
        }
    }
}
