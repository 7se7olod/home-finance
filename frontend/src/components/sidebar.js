import {Auth} from "../services/auth";
import {Popup} from "../utils/popup";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";

export class Sidebar {
    constructor() {
        this.contentElement = document.getElementById('content');
        this.stylesElement = document.getElementById('styles');
        this.titleElement = document.getElementById('title');
        this.popupElement = document.getElementById('popup');
        this.init();
    }

    async init() {
        const userData = Auth.getUserInfo();
        document.getElementById('sidebar-username').innerText = userData.name + ' ' + userData.lastName;

        document.getElementById('user-logout-btn').onclick = function () {
            Popup.setTextPopup(Popup.logoutText);
            Popup.setButtons(Popup.exitBtn, Popup.cancelBtn);
            document.getElementById('popup-logout-btn').onclick = function () {
                Auth.logout();
                location.href = "#/";
            }
        }

        // show-balance
        const resultBalance = await CustomHttp.request(config.host + '/balance');
        document.getElementById('sidebar-user-balance').innerText = resultBalance.balance;

        //mainPage button
        document.getElementById('sidebar-main-text').onclick = function () {
            location.href = '#/main';
        }

        // categories buttons
        document.getElementById('sidebar-income-button').onclick = function () {
            location.href = '#/categories/income';
        }
        document.getElementById('sidebar-expenses-button').onclick = function () {
            location.href = '#/categories/expenses';
        }

        document.getElementById('sidebar-income-and-expenses-text').onclick = function () {
            location.href = '#/operations';
        }


    this.popupElement.innerHTML = await fetch('templates/UI/modal.html').then(response => response.text());
    this.contentElement.innerHTML = await fetch(newRoute.template).then(response => response.text());
    this.stylesElement.setAttribute('href', newRoute.styles);
    this.titleElement.innerText = newRoute.title;
    }


}
