import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {TypesOfOperationsType} from "../type/types-of-operations.type";

export class EditCategory {
    readonly type: string;
    readonly incomeEditTitleText: string = 'Редактирование категории доходов';
    readonly expenseEditTitleText: string = 'Редактирование категории расходов';
    private editCategoryTitleElement: HTMLElement | null = document.getElementById('create-category-title');
    private editCategoryCancelBtnElement: HTMLElement | null = document.getElementById('create-category-cancel-btn');
    private editCategorySaveBtnElement: HTMLElement | null = document.getElementById('create-category-save-btn');
    private editCategoryInput: HTMLElement | null = document.getElementById('create-category-input');
    readonly categoryTitleInput: any = localStorage.getItem('editCategory');
    constructor(typeCategory: TypesOfOperationsType) {
        this.type = typeCategory;
        if (this.categoryTitleInput) {
            this.categoryTitleInput = JSON.parse(this.categoryTitleInput);
        }
        this.init();
    }

    private init(): void {
        const that: EditCategory = this;
        if (!this.editCategoryInput) return;
        if (!this.categoryTitleInput) return;
        if (!this.editCategoryTitleElement) return;
        if (!this.editCategoryCancelBtnElement) return;
        if (!this.editCategorySaveBtnElement) return;

        (this.editCategoryInput as HTMLInputElement).value = (this.categoryTitleInput as HTMLInputElement).title;
        if (this.type === TypesOfOperationsType.INCOME) {
            this.editCategoryTitleElement.innerText = this.incomeEditTitleText;
            this.editCategoryCancelBtnElement.onclick = function () {
                localStorage.removeItem('editCategory');
                location.href = '#/categories/income';
            }

            this.editCategorySaveBtnElement.onclick = async function () {
                const title: string = (that.editCategoryInput as HTMLInputElement).value.trim();
                if (title) {
                    await CustomHttp.request(config.host + '/categories/income/' + that.categoryTitleInput.id, 'PUT', {
                        title: title
                    })
                }
                localStorage.removeItem('editCategory');
                location.href = '#/categories/income';
            }
        }

        if (this.type === TypesOfOperationsType.EXPENSE) {
            this.editCategoryTitleElement.innerText = this.expenseEditTitleText;
            this.editCategoryCancelBtnElement.onclick = function () {
                localStorage.removeItem('editCategory');
                location.href = '#/categories/expenses';
            }


            this.editCategorySaveBtnElement.onclick = async function () {
                const title: string = (that.editCategoryInput as HTMLInputElement).value.trim();
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
