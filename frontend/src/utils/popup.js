export class Popup {
    static logoutText = 'Вы действительно хотите выйти?';
    static incomeRemoveText = 'Вы действительно хотите удалить категорию? Связанные доходы будут удалены навсегда.';
    static expensesRemoveText = 'Вы действительно хотите удалить категорию? Связанные расходы будут удалены навсегда.';
    static removeOperationText = 'Вы действительно хотите удалить операцию?';
    static exitBtn = '<button type="button" class="btn btn-danger" data-bs-dismiss="modal" id="popup-logout-btn">Выйти</button>';
    static cancelBtn = '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>';
    static notRemoveBtn = '<button type="button" class="btn btn-danger" data-bs-dismiss="modal">Не удалять</button>';
    static yesRemoveBtn = '<button type="button" class="btn btn-success" data-bs-dismiss="modal" id="popup-remove-category-btn">Да, удалить</button>';

    static setButtons(leftButton, rightButton) {
        document.getElementById('btn-modal-content').innerHTML = leftButton + rightButton;
    }

    static setTextPopup(text) {
        document.getElementById('text-modal-content').innerText = text;
    }
}
