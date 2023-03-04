import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";

export class EditCategory {

    constructor(typeCategory) {
        this.type = typeCategory;
        this.incomeEditTitleText = 'Редактирование категории доходов';
        this.expenseEditTitleText = 'Редактирование категории расходов';
        this.editCategoryTitleElement = document.getElementById('create-category-title');
        this.editCategoryCancelBtnElement = document.getElementById('create-category-cancel-btn');
        this.editCategorySaveBtnElement = document.getElementById('create-category-save-btn');
        this.editCategoryInput = document.getElementById('create-category-input');
        this.categoryTitleInput = JSON.parse(localStorage.getItem('editCategory'));
        this.init();
    }

    init() {
        this.editCategoryInput.value = this.categoryTitleInput.title;
        if (this.type === 'income') {
            this.editCategoryTitleElement.innerText = this.incomeEditTitleText;
            this.editCategoryCancelBtnElement.onclick = function () {
                localStorage.removeItem('editCategory');
                location.href = '#/categories/income';
            }

            const that = this;
            this.editCategorySaveBtnElement.onclick = async function () {
                const title = that.editCategoryInput.value.trim();
                if (title) {
                    await CustomHttp.request(config.host + '/categories/income/' + that.categoryTitleInput.id, 'PUT', {
                        title: title
                    })
                }
                localStorage.removeItem('editCategory');
                location.href = '#/categories/income';
            }
        }

        if (this.type === 'expense') {
            this.editCategoryTitleElement.innerText = this.expenseEditTitleText;
            this.editCategoryCancelBtnElement.onclick = function () {
                localStorage.removeItem('editCategory');
                location.href = '#/categories/expenses';
            }

            const that = this;
            this.editCategorySaveBtnElement.onclick = async function () {
                const title = that.editCategoryInput.value.trim();
                if (title) {
                    await CustomHttp.request(config.host + '/categories/expense/' + that.categoryTitleInput.id, 'PUT', {
                        title: title
                    })
                }
                localStorage.removeItem('editCategory');
                location.href = '#/categories/expenses';
            }
        }
    }
}
