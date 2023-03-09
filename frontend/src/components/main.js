import Chart from 'chart.js/auto'
import {DateFormatter} from "../utils/dateFormatter";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";

export class Main {
    constructor() {
        this.dateInputFromElement = document.getElementById('date-input-from');
        this.dateInputToElement = document.getElementById('date-input-to');

        this.incomeChart = new Chart(
            document.getElementById('pie-income'),
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
            document.getElementById('pie-expense'),
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
        const currentDate = DateFormatter.YYYY_MM_DD(new Date());
        this.loadingOperations(currentDate, currentDate);
        this.activateButtons();
    }

    activateButtons() {
        const that = this;
        const menuItems = document.getElementsByClassName('operations-date-buttons');
        const currentDate = DateFormatter.YYYY_MM_DD(new Date());

        const onClick = function (event) {
            event.preventDefault();

            for (let i = 0; i < menuItems.length; i++) {
                menuItems[i].classList.remove('active');
            }

            event.currentTarget.classList.add('active');

            switch (event.currentTarget.innerText.toLowerCase()) {
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
                    const fromDateValue = that.dateInputFromElement.value;
                    const toDateValue = that.dateInputToElement.value;
                    that.dateInputFromElement.onchange = function () {
                        if (fromDateValue && toDateValue) {
                            that.loadingOperations(fromDateValue, toDateValue);
                        }
                    }

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

    async loadingOperations(dateFrom, dateTo) {
        const result = await CustomHttp.request(config.host + `/operations?period=interval&dateFrom=${dateFrom}&dateTo=${dateTo}`);
        const emptyExpenseText = document.getElementById('main-page-empty-text-expense');
        const emptyIncomeText = document.getElementById('main-page-empty-text-income');

        const incomeCategoriesMap = new Map();
        const expenseCategoriesMap = new Map();
        const incomeCategories = [];
        const incomeAmounts = [];
        const expenseCategories = [];
        const expenseAmounts = [];

        result.forEach(operation => {
            if (operation.type === 'income') {
                const category = operation.category;
                const amount = operation.amount;
                if (incomeCategoriesMap.has(category)) {
                    incomeCategoriesMap.set(category, incomeCategoriesMap.get(category) + amount);
                } else {
                    incomeCategoriesMap.set(category, amount);
                }
            }

            if (operation.type === 'expense') {
                const category = operation.category;
                const amount = operation.amount;
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

        emptyIncomeText.style.display = (incomeCategories.length === 0) ? 'block' : 'none';
        emptyExpenseText.style.display = (expenseCategories.length === 0) ? 'block' : 'none';

        this.incomeChart.data.datasets[0].data = incomeAmounts;
        this.incomeChart.data.labels = incomeCategories;
        this.incomeChart.update();
        this.expenseChart.data.datasets[0].data = expenseAmounts;
        this.expenseChart.data.labels = expenseCategories;
        this.expenseChart.update();


        // const incomeOperation = {categories: [], amounts: []};
        // const expenseOperation = {categories: [], amounts: []};
        // result.forEach(operation => {
        //     if (operation.type === 'income') {
        //         incomeOperation.categories.push(operation.category);
        //         incomeOperation.amounts.push(operation.amount)
        //     }
        //
        //     if (operation.type === 'expense') {
        //         expenseOperation.categories.push(operation.category);
        //         expenseOperation.amounts.push(operation.amount);
        //     }
        // })
        //
        // emptyIncomeText.style.display = (incomeOperation.categories.length === 0) ? 'block' : 'none';
        // emptyExpenseText.style.display = (expenseOperation.categories.length === 0) ? 'block' : 'none';
        //
        // this.incomeChart.data.datasets[0].data = incomeOperation.amounts;
        // this.incomeChart.data.labels = incomeOperation.categories;
        // this.incomeChart.update();
        // this.expenseChart.data.datasets[0].data = expenseOperation.amounts;
        // this.expenseChart.data.labels = expenseOperation.categories;
        // this.expenseChart.update();
    }
}
