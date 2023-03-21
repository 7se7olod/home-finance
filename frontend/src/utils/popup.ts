
export class Popup {
    public static logoutText: string = 'Вы действительно хотите выйти?';
    public static incomeRemoveText: string = 'Вы действительно хотите удалить категорию? Связанные доходы будут удалены навсегда.';
    public static expensesRemoveText: string = 'Вы действительно хотите удалить категорию? Связанные расходы будут удалены навсегда.';
    public static removeOperationText: string = 'Вы действительно хотите удалить операцию?';
    public static exitBtn: string = '<button type="button" class="btn btn-danger" data-bs-dismiss="modal" id="popup-logout-btn">Выйти</button>';
    public static cancelBtn: string = '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>';
    public static notRemoveBtn: string = '<button type="button" class="btn btn-danger" data-bs-dismiss="modal">Не удалять</button>';
    public static yesRemoveBtn: string = '<button type="button" class="btn btn-success" data-bs-dismiss="modal" id="popup-remove-category-btn">Да, удалить</button>';

    public static setButtons(leftButtonText: string, rightButtonText: string): void {
        const modalContentBtnElement = document.getElementById('btn-modal-content');
        if (leftButtonText && rightButtonText && modalContentBtnElement) {
            modalContentBtnElement.innerHTML = leftButtonText + rightButtonText;
        }
    }

    public static setTextPopup(text: string): void {
        const textModalContentElement: HTMLElement | null = document.getElementById('text-modal-content');
        if (text && textModalContentElement) {
            textModalContentElement.innerText = text;
        }
    }
}
