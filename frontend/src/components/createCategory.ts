import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {TypesOfOperationsType} from "../type/types-of-operations.type";

export class CreateCategory {
    readonly type: string;
    private incomeTitleText: string = 'Создание категории доходов';
    private expenseTitleText: string = 'Создание категории расходов';
    private createCategoryTitleElement: HTMLElement | null = document.getElementById('create-category-title');
    private createCategoryCancelBtnElement: HTMLElement | null = document.getElementById('create-category-cancel-btn');
    private editCategorySaveBtnElement: HTMLElement | null = document.getElementById('create-category-save-btn');
    private editCategoryInput: HTMLElement | null = document.getElementById('create-category-input');
    constructor(typeCategory: TypesOfOperationsType) {
        this.type = typeCategory;
        this.init();
    }

    private init(): void {
        if (this.type === TypesOfOperationsType.INCOME) {
            if (!this.createCategoryTitleElement) return;
            if (!this.createCategoryCancelBtnElement) return;
            this.createCategoryTitleElement.innerText = this.incomeTitleText;
            this.createCategoryCancelBtnElement.onclick = function () {
                location.href = '#/categories/income';
            }

            const that = this;
            if (!this.editCategorySaveBtnElement) return;
            this.editCategorySaveBtnElement.onclick = async function () {
                const title: string = (that.editCategoryInput as HTMLInputElement).value.trim();
                if (title) {
                    await CustomHttp.request(config.host + '/categories/income/', 'POST', {
                        title: title
                    })
                    location.href = '#/categories/income';
                }
            }
        }

        if (this.type === TypesOfOperationsType.EXPENSE) {
            if (!this.createCategoryTitleElement) return;
            if (!this.createCategoryCancelBtnElement) return;
            this.createCategoryTitleElement.innerText = this.expenseTitleText;
            this.createCategoryCancelBtnElement.onclick = function () {
                location.href = '#/categories/expenses';
            }

            const that = this;
            if (!this.editCategorySaveBtnElement) return;
            this.editCategorySaveBtnElement.onclick = async function () {
                const title = (that.editCategoryInput as HTMLInputElement).value.trim();
                if (title) {
                    await CustomHttp.request(config.host + '/categories/expense/', 'POST', {
                        title: title
                    })
                    location.href = '#/categories/expenses';
                }
            }
        }
    }
}
