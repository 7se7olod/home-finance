import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";

export class OperationCreate {
    constructor(type) {
        this.operationType = type;
        this.titleOperationElement = document.getElementById('operation-create-title');
        this.createSelectTypeElement = document.getElementById('operation-create-select-type');
        this.cancelButtonElement = document.getElementById('operations-create-cancel-btn');
        this.createButtonElement = document.getElementById('operations-create-new-btn');
        this.amountInputElement = document.getElementById('operation-create-input-number');
        this.dateInputElement = document.getElementById('operation-create-input-date');
        this.commentInputElement = document.getElementById('operation-create-input-comment');
        this.expenseCategories = [];
        this.incomeCategories = [];
        this.editOperation = null;

        if (type === 'edit') {
            this.titleOperationElement.innerText = 'Редактирование дохода/расхода';
            this.createButtonElement.innerText = 'Сохранить';
        }

        this.init();
    }

    async init() {
        const that = this;
        const expensesResult = await CustomHttp.request(config.host + '/categories/expense');
        const incomeResult = await CustomHttp.request(config.host + '/categories/income');
        expensesResult.forEach(expense => this.expenseCategories.push(expense));
        incomeResult.forEach(income => this.incomeCategories.push(income));

        this.createSelectTypeElement.addEventListener('change', function (e) {
            let selectType = e.target.value;
            that.loadingCategories(selectType);
        })

        if (this.operationType === 'edit') {
            this.operationId = JSON.parse(localStorage.getItem('editOperation'));
            this.editOperation = await CustomHttp.request(config.host + '/operations/' + this.operationId);
            this.loadingCategories(this.editOperation.type);
        }

        this.cancelButtonElement.onclick = function () {
            location.href = '#/operations';
            localStorage.removeItem('editOperation');
        }

        this.createButtonElement.onclick = async function () {
            const createSelectCategoryElement = document.getElementById('operation-create-select-category');
            const comment = that.commentInputElement.value;
            const date = that.dateInputElement.value;
            const type = that.createSelectTypeElement.value;
            const amount = Number(that.amountInputElement.value.replace('$', ''));
            const categoryID = Number(createSelectCategoryElement.value);

            if (comment && date && type && amount && categoryID) {
                const body = {
                    type: type,
                    amount: amount,
                    date: date,
                    comment: comment,
                    category_id: categoryID
                }

                if (that.operationType === 'edit') {
                    await CustomHttp.request(config.host + '/operations/' + that.operationId, 'PUT', body);
                } else {
                    await CustomHttp.request(config.host + '/operations', 'POST', body);
                }
                location.href = '#/operations';
                localStorage.removeItem('editOperation');
            }
        }
    }

    loadingCategories(selectType) {
        const createSelectCategoryElement = document.getElementById('operation-create-select-category');
        createSelectCategoryElement.innerHTML = '';

        if (selectType === 'income') {
            this.loadOptions(this.incomeCategories);
            if (this.operationType === 'edit') {
                this.filledInputs(selectType)
            }
        }

        if (selectType === 'expense') {
            this.loadOptions(this.expenseCategories);
            if (this.operationType === 'edit') {
                this.filledInputs(selectType)
            }
        }
    }

    async filledInputs(type) {
        this.operationId = JSON.parse(localStorage.getItem('editOperation'));
        this.editOperation = await CustomHttp.request(config.host + '/operations/' + this.operationId);
        document.getElementById(`option-${type}`).setAttribute('selected', 'selected');
        const options = document.getElementsByTagName("option");
        for (let i = 0; i < options.length; i++) {
            if (options[i].innerText === this.editOperation.category) {
                options[i].setAttribute('selected', 'selected');
            }
        }
        this.amountInputElement.value = this.editOperation.amount + '$';
        this.dateInputElement.value = this.editOperation.date;
        this.commentInputElement.value = this.editOperation.comment;
    }

    loadOptions(categories) {
        const createSelectCategoryElement = document.getElementById('operation-create-select-category');
        createSelectCategoryElement.innerHTML = '';
        categories.forEach(income => {
            const optionCategory = document.createElement('option');
            optionCategory.innerText = income.title;
            optionCategory.value = income.id;
            createSelectCategoryElement.appendChild(optionCategory);
        })
    }
}
