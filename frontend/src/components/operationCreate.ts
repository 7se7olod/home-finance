import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {IncomeExpenseType} from "../type/income-expense.type";
import {OperationType} from "../type/operation.type";

export class OperationCreate {
    readonly operationType: string;
    private titleOperationElement: HTMLElement | null = document.getElementById('operation-create-title');
    private createSelectTypeElement: HTMLElement | null = document.getElementById('operation-create-select-type');
    private cancelButtonElement: HTMLElement | null = document.getElementById('operations-create-cancel-btn');
    private createButtonElement: HTMLElement | null = document.getElementById('operations-create-new-btn');
    private amountInputElement: HTMLElement | null = document.getElementById('operation-create-input-number');
    private dateInputElement: HTMLElement | null = document.getElementById('operation-create-input-date');
    private commentInputElement: HTMLElement | null = document.getElementById('operation-create-input-comment');
    private createSelectCategoryElement: HTMLElement | null = document.getElementById('operation-create-select-category');
    private expenseCategories: IncomeExpenseType[] = [];
    private incomeCategories: IncomeExpenseType[] = [];
    private editOperation: OperationType | null;
    readonly operationId: any = localStorage.getItem('editOperation');
    constructor(type: string) {
        if (this.operationId) {
            this.operationId = JSON.parse(this.operationId);
        }
        this.operationType = type;
        this.editOperation = null;

        if (type === 'edit') {
            if (this.titleOperationElement && this.createButtonElement) {
                this.titleOperationElement.innerText = 'Редактирование дохода/расхода';
                this.createButtonElement.innerText = 'Сохранить';
            }
        }

        this.init();
    }

    private async init(): Promise<void> {
        const that: OperationCreate = this;
        const expensesResult: IncomeExpenseType[] = await CustomHttp.request(config.host + '/categories/expense');
        const incomeResult: IncomeExpenseType[] = await CustomHttp.request(config.host + '/categories/income');
        expensesResult.forEach(expense => this.expenseCategories.push(expense));
        incomeResult.forEach(income => this.incomeCategories.push(income));

        if (!this.createSelectTypeElement) return;
        this.createSelectTypeElement.addEventListener('change', function (e: Event) {
            const selectType: string = (e.target as HTMLInputElement).value;
            that.loadingCategories(selectType);
        })

        if (this.operationType === 'edit') {
            this.editOperation = await CustomHttp.request(config.host + '/operations/' + this.operationId);
            if (!this.editOperation) return;
            this.loadingCategories(this.editOperation.type);
        }

        if (!this.cancelButtonElement) return;
        this.cancelButtonElement.onclick = function () {
            location.href = '#/operations';
            localStorage.removeItem('editOperation');
        }

        if (!this.createButtonElement) return;
        this.createButtonElement.onclick = async function () {
            const createSelectCategoryElement = document.getElementById('operation-create-select-category');
            const comment: string = (that.commentInputElement as HTMLInputElement).value;
            const date: string = (that.dateInputElement as HTMLInputElement).value;
            const type: string = (that.createSelectTypeElement as HTMLInputElement).value;
            const amount: number = Number((that.amountInputElement as HTMLInputElement).value.replace('$', ''));
            const categoryID: number = Number((createSelectCategoryElement as HTMLInputElement).value);

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

    private loadingCategories(selectType: string): void {
        if (!this.createSelectCategoryElement) return;
        this.createSelectCategoryElement.innerHTML = '';

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

    private async filledInputs(type: string): Promise<void> {
        this.editOperation = await CustomHttp.request(config.host + '/operations/' + this.operationId);
        const optionTypeElement = document.getElementById(`option-${type}`);
        if (!optionTypeElement) return;
        optionTypeElement.setAttribute('selected', 'selected');
        const options: HTMLCollectionOf<HTMLElement> = document.getElementsByTagName("option");
        for (let i = 0; i < options.length; i++) {
            if (!this.editOperation) return;
            if (options[i].innerText === this.editOperation.category) {
                options[i].setAttribute('selected', 'selected');
            }
        }
        if (this.amountInputElement && this.dateInputElement && this.commentInputElement && this.editOperation!.amount && this.editOperation!.date && this.editOperation!.comment) {
            if (!this.editOperation) return;
            (this.amountInputElement as HTMLInputElement).value = this.editOperation.amount + '$';
            (this.dateInputElement as HTMLInputElement).value = this.editOperation.date;
            (this.commentInputElement as HTMLInputElement).value = this.editOperation.comment;
        }
    }

    private loadOptions(categories: IncomeExpenseType[]): void {
        const createSelectCategoryElement: HTMLElement | null = document.getElementById('operation-create-select-category');
        if (!createSelectCategoryElement) return;
        createSelectCategoryElement.innerHTML = '';
        categories.forEach((category: IncomeExpenseType) => {
            const optionCategory = document.createElement('option');
            optionCategory.innerText = category.title;
            optionCategory.value = category.id.toString();
            if (!createSelectCategoryElement) return;
            createSelectCategoryElement.appendChild(optionCategory);
        })
    }
}
