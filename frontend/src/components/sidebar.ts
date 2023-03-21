import {Auth} from "../services/auth";
import {Popup} from "../utils/popup";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {UserType} from "../type/user.type";
import {BalanceType} from "../type/balance.type";

export class Sidebar {
    private contentElement: HTMLElement | null = document.getElementById('content');
    private stylesElement: HTMLElement | null = document.getElementById('styles');
    private titleElement: HTMLElement | null = document.getElementById('title');
    private popupElement: HTMLElement | null = document.getElementById('popup');
    private sidebarUsernameTitleElement: HTMLElement | null = document.getElementById('sidebar-username');
    private userLogoutBtnElement: HTMLElement | null = document.getElementById('user-logout-btn');
    private popupLogoutBtnElement: HTMLElement | null = document.getElementById('popup-logout-btn');

    constructor() {
        this.init();
    }

    private async init(): Promise<void> {
        const that: Sidebar = this;
        const userData: UserType | undefined = Auth.getUserInfo();
        if (!userData) return;
        if (this.sidebarUsernameTitleElement && this.userLogoutBtnElement) {
            this.sidebarUsernameTitleElement.innerText = userData.name + ' ' + userData.lastName;
            this.userLogoutBtnElement.onclick = function () {
                Popup.setTextPopup(Popup.logoutText);
                Popup.setButtons(Popup.exitBtn, Popup.cancelBtn);
                if (that.popupLogoutBtnElement) {
                    that.popupLogoutBtnElement.onclick = function () {
                        Auth.logout();
                        location.href = "#/";
                    }
                }
            }
        }

        const resultBalance: BalanceType = await CustomHttp.request(config.host + '/balance');
        if (resultBalance) {
            document.getElementById('sidebar-user-balance')!.innerText = resultBalance.balance.toString();
        }

        if (this.popupElement && this.contentElement && this.stylesElement && this.titleElement) {
            this.popupElement.innerHTML = await fetch('templates/UI/modal.html').then(response => response.text());
        }

        const userLogoutBtnElement: HTMLElement | null = document.getElementById('user-logout-btn');
        if (!userLogoutBtnElement) return;
        (userLogoutBtnElement as HTMLButtonElement).onclick = function () {
            Popup.setTextPopup(Popup.logoutText);
            Popup.setButtons(Popup.exitBtn, Popup.cancelBtn);
            console.log(Popup.logoutText);
            const popupLogoutBtnElement: HTMLElement | null = document.getElementById('popup-logout-btn');
            if (!popupLogoutBtnElement) return;
            (popupLogoutBtnElement as HTMLButtonElement).onclick = function () {
                Auth.logout();
                location.href = "#/";
            }
        }

        const categoriesBtn: HTMLElement | null = document.getElementById('sidebar-categories-button');
        const fcollapse: HTMLElement | null = document.getElementById('flush-collapseOne');
        const categoriesBlock: HTMLElement | null = document.getElementById('categories-collapse');
        const arrow: HTMLElement | null = document.getElementById('arrow');

        if (!categoriesBtn || !categoriesBlock || !fcollapse) return;
        fcollapse.addEventListener('show.bs.collapse', function () {
            categoriesBtn.classList.add('text-white');
            categoriesBtn.style.backgroundColor = '#0d6efd';
            categoriesBlock.classList.add('border');
            categoriesBlock.classList.add('border-primary');
            categoriesBlock.classList.add('rounded-3');
            (arrow as SVGElement | null)!.style.transform = 'rotate(90deg)';
            (arrow as SVGElement | null)!.style.fill = '#ffffff';
        });

        fcollapse.addEventListener('hide.bs.collapse', function () {
            categoriesBtn.classList.remove('text-white');
            categoriesBtn.style.backgroundColor = 'transparent';
            categoriesBlock.classList.remove('border');
            categoriesBlock.classList.remove('border-primary');
            categoriesBlock.classList.remove('rounded-3');
            (arrow as SVGElement | null)!.style.transform = 'rotate(0)';
            (arrow as SVGElement | null)!.style.fill = '#052C65';
            blur()
        });

        this.setActiveLink()
        window.addEventListener('hashchange', this.setActiveLink);
    }

    private setActiveLink(): void {
        const urlRoute: string = window.location.hash.split('?')[0];
        const links: NodeListOf<HTMLElement> | null = document.querySelectorAll('.nav-link');
        links.forEach((link: HTMLElement) => {
            const href: string | null = link.getAttribute('href');
            if (href === urlRoute) {
                link.classList.add('active');
                link.classList.add('text-light');
                (link.firstElementChild as SVGElement).style.fill = 'white';
            } else {
                link.classList.remove('active');
                link.classList.remove('text-light');
                (link.firstElementChild as SVGElement).style.fill = '#052C65';
            }
        });
    }
}
