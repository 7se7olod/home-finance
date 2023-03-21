import Chart from 'chart.js/auto'
import {DateFormatter} from "../utils/dateFormatter";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {OperationType} from "../type/operation.type";

export class Main {
    private dateInputFromElement: HTMLElement | null = document.getElementById('date-input-from');
    private dateInputToElement: HTMLElement | null = document.getElementById('date-input-to');
    private pieExpenseElement: HTMLElement | null = document.getElementById('pie-expense');
    private pieIncomeElement: HTMLElement | null = document.getElementById('pie-income');
    private incomeChart: any;
    private expenseChart: any;
    constructor() {
        if (!this.pieExpenseElement) return;
        if (!this.pieIncomeElement) return;
        this.incomeChart = new Chart(
            (this.pieIncomeElement as HTMLCanvasElement),
            {
                type: 'pie',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Доходы',
                        data: [],
                        backgroundColor: [
                            'rgba(253, 126, 20, 1)',
                            'rgb(194,220,20)',
                            'rgb(70,253,20)',
                            'rgb(20,253,113)',
                            'rgb(20,24,253)',
                            'rgb(140,20,253)',
                            'rgba(220, 53, 69, 1)',
                            'rgba(32, 201, 151, 1)',
                            'rgba(13, 110, 253, 1)',
                            'rgb(20,199,253)',
                            'rgba(255, 193, 7, 1)',
                        ],
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: false,
                            text: 'Доходы'
                        }
                    }
                },
            }
        );

        this.expenseChart = new Chart(
            (this.pieExpenseElement as HTMLCanvasElement),
            {
                type: 'pie',
                data: {
                    labels: ['Пусто'],
                    datasets: [{
                        label: 'Расходы',
                        data: [],
                        backgroundColor: [
                            'rgba(220, 53, 69, 1)',
                            'rgba(32, 201, 151, 1)',
                            'rgba(13, 110, 253, 1)',
                            'rgb(20,199,253)',
                            'rgba(255, 193, 7, 1)',
                            'rgba(253, 126, 20, 1)',
                            'rgb(195,222,18)',
                            'rgb(70,253,20)',
                            'rgb(20,253,113)',
                            'rgb(20,24,253)',
                            'rgb(140,20,253)',
                        ],
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: false,
                            text: 'Расходы'
                        }
                    }
                },
            }
        );

        this.init();
    }

    async init() {
        const currentDate: DateFormatter = DateFormatter.YYYY_MM_DD(new Date());
        if (!currentDate) return;
        this.loadingOperations(currentDate, currentDate);
        this.activateButtons();
    }

    activateButtons() {
        const that = this;
        const menuItems = document.getElementsByClassName('operations-date-buttons');
        const currentDate = DateFormatter.YYYY_MM_DD(new Date());

        const onClick = function (event: Event) {
            event.preventDefault();

            for (let i = 0; i < menuItems.length; i++) {
                menuItems[i].classList.remove('active');
            }

            if (!event.currentTarget) return;
            (event.currentTarget as HTMLButtonElement).classList.add('active');

            switch ((event.currentTarget as HTMLButtonElement).innerText.toLowerCase()) {
                case 'сегодня':
                    that.loadingOperations(currentDate, currentDate);
                    break;

                case 'неделя':
                    that.loadingOperations(DateFormatter.weekDate, currentDate);
                    break;

                case 'месяц':
                    that.loadingOperations(DateFormatter.monthDate, currentDate);
                    break;

                case 'год':
                    that.loadingOperations(DateFormatter.yearDate, currentDate);
                    break;

                case 'все':
                    that.loadingOperations(DateFormatter.allDate, currentDate);
                    break;

                case 'интервал':
                    const fromDateValue: string = (that.dateInputFromElement as HTMLInputElement).value;
                    const toDateValue: string = (that.dateInputToElement as HTMLInputElement).value;
                    if (!that.dateInputFromElement) return;
                    that.dateInputFromElement.onchange = function () {
                        if (fromDateValue && toDateValue) {
                            that.loadingOperations(fromDateValue, toDateValue);
                        }
                    }

                    if (!that.dateInputToElement) return;
                    that.dateInputToElement.onchange = function () {
                        if (fromDateValue && toDateValue) {
                            that.loadingOperations(fromDateValue, toDateValue);
                        }
                    }
                    break;
            }
        };

        for (let i = 0; i < menuItems.length; i++) {
            menuItems[i].addEventListener('click', onClick, false);
        }
    }

    private async loadingOperations(dateFrom: DateFormatter, dateTo: DateFormatter): Promise<void> {
        const result: OperationType[] = await CustomHttp.request(config.host + `/operations?period=interval&dateFrom=${dateFrom}&dateTo=${dateTo}`);
        const emptyExpenseText: HTMLElement | null = document.getElementById('main-page-empty-text-expense');
        const emptyIncomeText: HTMLElement | null = document.getElementById('main-page-empty-text-income');

        const incomeCategoriesMap: Map<any, any> = new Map();
        const expenseCategoriesMap = new Map();
        const incomeCategories: any[] = [];
        const incomeAmounts: any[] = [];
        const expenseCategories: any[] = [];
        const expenseAmounts: any[] = [];

        if (!result) return;
        result.forEach((operation: OperationType) => {
            if (operation.type === 'income') {
                const category: string = operation.category;
                const amount: number = operation.amount;
                if (incomeCategoriesMap.has(category)) {
                    incomeCategoriesMap.set(category, incomeCategoriesMap.get(category) + amount);
                } else {
                    incomeCategoriesMap.set(category, amount);
                }
            }

            if (operation.type === 'expense') {
                const category: string = operation.category;
                const amount: number = operation.amount;
                if (expenseCategoriesMap.has(category)) {
                    expenseCategoriesMap.set(category, expenseCategoriesMap.get(category) + amount);
                } else {
                    expenseCategoriesMap.set(category, amount);
                }
            }
        })

        incomeCategoriesMap.forEach((value, key) => {
            incomeCategories.push(key);
            incomeAmounts.push(value);
        });

        expenseCategoriesMap.forEach((value, key) => {
            expenseCategories.push(key);
            expenseAmounts.push(value);
        });

        if (!emptyExpenseText) return;
        if (!emptyIncomeText) return;
        emptyIncomeText.style.display = (incomeCategories.length === 0) ? 'block' : 'none';
        emptyExpenseText.style.display = (expenseCategories.length === 0) ? 'block' : 'none';

        this.incomeChart.data.datasets[0].data = incomeAmounts;
        this.incomeChart.data.labels = incomeCategories;
        this.incomeChart.update();
        this.expenseChart.data.datasets[0].data = expenseAmounts;
        this.expenseChart.data.labels = expenseCategories;
        this.expenseChart.update();
    }
}


