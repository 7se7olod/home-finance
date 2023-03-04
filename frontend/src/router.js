import {Form} from "./components/form.js";
import {Auth} from "./services/auth.js";
import {Categories} from "./components/categories.js";
import {Popup} from "./utils/popup";
import {CustomHttp} from "./services/custom-http";
import config from "../config/config";
import {CreateCategory} from "./components/createCategory";
import {EditCategory} from "./components/editCategory";
import {Operations} from "./components/operations";
import {OperationCreate} from "./components/operationCreate";
import {Main} from "./components/main";

export class Router {
    constructor() {
        this.contentElement = document.getElementById('content');
        this.stylesElement = document.getElementById('styles');
        this.titleElement = document.getElementById('title');
        this.popupElement = document.getElementById('popup');
        this.mainElement = document.getElementById('main');
        this.sidebarContentElement = document.getElementById('sidebar-content');

        this.rotes = [
            {
                route: '#/',
                title: 'Вход',
                template: 'templates/login.html',
                styles: 'css/form.css',
                load: () => {
                    new Form('login');
                }
            },
            {
                route: '#/signup',
                title: 'Регистрация',
                template: 'templates/signup.html',
                styles: 'css/form.css',
                load: () => {
                    new Form('signup');
                }
            },
            {
                route: '#/categories/income',
                title: 'Доходы',
                template: 'templates/categories.html',
                styles: 'css/categories.css',
                load: () => {
                    new Categories('income');
                }
            },
            {
                route: '#/categories/expenses',
                title: 'Расходы',
                template: 'templates/categories.html',
                styles: 'css/categories.css',
                load: () => {
                    new Categories('expenses');
                }
            },
            {
                route: '#/categories/income/create',
                title: 'Создание категории доходов',
                template: 'templates/createCategory.html',
                styles: 'css/createCategory.css',
                load: () => {
                    new CreateCategory('income');
                }
            },
            {
                route: '#/categories/expense/create',
                title: 'Создание категории расходов',
                template: 'templates/createCategory.html',
                styles: 'css/createCategory.css',
                load: () => {
                    new CreateCategory('expense');
                }
            },
            {
                route: '#/categories/expense/edit',
                title: 'Редактирование категории расходов',
                template: 'templates/createCategory.html',
                styles: 'css/createCategory.css',
                load: () => {
                    new EditCategory('expense');
                }
            },
            {
                route: '#/categories/income/edit',
                title: 'Редактирование категории доходов',
                template: 'templates/createCategory.html',
                styles: 'css/createCategory.css',
                load: () => {
                    new EditCategory('income');
                }
            },
            {
                route: '#/operations',
                title: 'Доходы и расходы',
                template: 'templates/operations.html',
                styles: 'css/operations.css',
                load: () => {
                    new Operations();
                }
            },
            {
                route: '#/operations/create',
                title: 'Создание дохода/расхода',
                template: 'templates/operationCreate.html',
                styles: 'css/operationCreate.css',
                load: () => {
                    new OperationCreate('create');
                }
            },
            {
                route: '#/operations/edit',
                title: 'Редактирование дохода/расхода',
                template: 'templates/operationCreate.html',
                styles: 'css/operationCreate.css',
                load: () => {
                    new OperationCreate('edit');
                }
            },
            {
                route: '#/main',
                title: 'Главная',
                template: 'templates/main.html',
                styles: 'css/main.css',
                load: () => {
                    new Main();
                }
            },
        ];
    }

    async openRote() {
        const urlRoute = window.location.hash.split('?')[0];
        if (urlRoute === '#/logout') {
            await Auth.logout();
            window.location.href = '#/';
            return;
        }


        const newRoute = this.rotes.find(item => {
            return item.route === urlRoute;
        });

        if (!newRoute) {
            window.location.href = '#/';
            return;
        }

        if (urlRoute === '#/') {
            this.mainElement.style.justifyContent = 'center';
            this.mainElement.style.alignItems = 'center';
            this.contentElement.style.marginLeft = "0";
            this.sidebarContentElement.style.display = 'none';
        } else if (urlRoute === '#/signup') {
            this.mainElement.style.justifyContent = 'center';
            this.mainElement.style.alignItems = 'center';
            this.contentElement.style.marginLeft = "0";
            this.sidebarContentElement.style.display = 'none';
        } else {
            this.mainElement.style.justifyContent = 'start';
            this.mainElement.style.alignItems = 'start';
            document.getElementById('content').style.marginLeft = "219px";
            this.sidebarContentElement.style.display = 'flex';


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

        }

        this.popupElement.innerHTML = await fetch('templates/UI/modal.html').then(response => response.text());
        this.contentElement.innerHTML = await fetch(newRoute.template).then(response => response.text());
        this.stylesElement.setAttribute('href', newRoute.styles);
        this.titleElement.innerText = newRoute.title;


        function setActiveLink() {
            const links = document.querySelectorAll('.nav-link');
            links.forEach(link => {
                const href = link.getAttribute('href');
                if (href === urlRoute) {
                    link.classList.add('active');
                    link.classList.add('text-light');
                    link.firstElementChild.style.fill = 'white'
                } else {
                    link.classList.remove('active');
                    link.classList.remove('text-light');
                    link.firstElementChild.style.fill = '#052C65'
                }
            });
        }

        const categoriesBtn = document.getElementById('sidebar-categories-button');
        const fcollapse = document.getElementById('flush-collapseOne');
        const categoriesBlock = document.getElementById('categories-collapse');
        const arrow = document.getElementById('arrow');

        fcollapse.addEventListener('show.bs.collapse', function () {
            categoriesBtn.classList.add('text-white');
            categoriesBtn.style.backgroundColor = '#0d6efd';
            categoriesBlock.classList.add('border');
            categoriesBlock.classList.add('border-primary');
            categoriesBlock.classList.add('rounded-3');
            arrow.style.transform = 'rotate(90deg)';
            arrow.style.fill = '#ffffff';
        });

        fcollapse.addEventListener('hide.bs.collapse', function () {
            categoriesBtn.classList.remove('text-white');
            categoriesBtn.style.backgroundColor = 'transparent';
            categoriesBlock.classList.remove('border');
            categoriesBlock.classList.remove('border-primary');
            categoriesBlock.classList.remove('rounded-3');
            arrow.style.transform = 'rotate(0)';
            arrow.style.fill = '#052C65';
            this.blur()
        });

        setActiveLink()
        window.addEventListener('hashchange', setActiveLink);


        // const userInfo = Auth.getUserInfo();
        // const accessToken = localStorage.getItem(Auth.accessTokenKey);
        // if (userInfo && accessToken) {
        //     this.profileElement.style.display = 'flex';
        //     this.profileNameElement.innerText = userInfo.fullName;
        // } else {
        //     this.profileElement.style.display = 'none';
        // }

        newRoute.load();
    }
}
