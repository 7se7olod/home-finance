import {Form} from "./components/form";
import {Auth} from "./services/auth";
import {Categories} from "./components/categories";
import {CreateCategory} from "./components/createCategory";
import {EditCategory} from "./components/editCategory";
import {Operations} from "./components/operations";
import {OperationCreate} from "./components/operationCreate";
import {Main} from "./components/main";
import {RouteType} from "./type/route.type";
import {TypesOfOperationsType} from "./type/types-of-operations.type";
import {Sidebar} from "./components/sidebar";

export class Router {
    private contentElement: Element | null = document.getElementById('content');
    private stylesElement: HTMLElement | null = document.getElementById('styles');
    private titleElement: HTMLElement | null = document.getElementById('title');
    private popupElement: HTMLElement | null = document.getElementById('popup');
    private mainElement: HTMLElement | null = document.getElementById('main');
    private sidebarContentElement: HTMLElement | null = document.getElementById('sidebar-content');
    private routes: RouteType[];

    constructor() {
        new Sidebar();
        this.routes = [
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
                    new Categories(TypesOfOperationsType.INCOME);
                    // new Sidebar();
                }
            },
            {
                route: '#/categories/expenses',
                title: 'Расходы',
                template: 'templates/categories.html',
                styles: 'css/categories.css',
                load: () => {
                    new Categories(TypesOfOperationsType.EXPENSE);
                }
            },
            {
                route: '#/categories/income/create',
                title: 'Создание категории доходов',
                template: 'templates/createCategory.html',
                styles: 'css/createCategory.css',
                load: () => {
                    new CreateCategory(TypesOfOperationsType.INCOME);
                }
            },
            {
                route: '#/categories/expense/create',
                title: 'Создание категории расходов',
                template: 'templates/createCategory.html',
                styles: 'css/createCategory.css',
                load: () => {
                    new CreateCategory(TypesOfOperationsType.EXPENSE);
                }
            },
            {
                route: '#/categories/expense/edit',
                title: 'Редактирование категории расходов',
                template: 'templates/createCategory.html',
                styles: 'css/createCategory.css',
                load: () => {
                    new EditCategory(TypesOfOperationsType.EXPENSE);
                }
            },
            {
                route: '#/categories/income/edit',
                title: 'Редактирование категории доходов',
                template: 'templates/createCategory.html',
                styles: 'css/createCategory.css',
                load: () => {
                    new EditCategory(TypesOfOperationsType.INCOME);
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

    public async openRoute(): Promise<void> {
        const urlRoute: string = window.location.hash.split('?')[0];
        if (urlRoute === '#/logout') {
            await Auth.logout();
            window.location.href = '#/';
            return;
        }

        const newRoute: RouteType | undefined = this.routes.find(item => {
            return item.route === urlRoute;
        });

        if (!newRoute) {
            window.location.href = '#/';
            return;
        }

        if (this.contentElement && this.popupElement && this.stylesElement && this.titleElement) {
            this.popupElement.innerHTML = await fetch('templates/UI/modal.html').then((response: Response) => response.text());
            this.contentElement.innerHTML = await fetch(newRoute.template).then((response: Response) => response.text());
            this.stylesElement.setAttribute('href', newRoute.styles);
            this.titleElement.innerText = newRoute.title;
        }

        if (!this.mainElement || !this.contentElement || !this.sidebarContentElement) return;
        if (urlRoute === '#/' || urlRoute === '#/signup') {
            (this.mainElement as HTMLElement).style.justifyContent = 'center';
            (this.mainElement as HTMLElement).style.alignItems = 'center';
            (this.contentElement as HTMLElement).style.marginLeft = "0";
            (this.sidebarContentElement as HTMLElement).style.display = 'none';
        } else {
            (this.mainElement as HTMLElement)!.style.justifyContent = 'start';
            (this.mainElement as HTMLElement)!.style.alignItems = 'start';
            (this.contentElement as HTMLElement)!.style.marginLeft = "219px";
            (this.sidebarContentElement as HTMLElement)!.style.display = 'flex';
        }

        newRoute.load();
    }
}
