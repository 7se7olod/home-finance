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
        const onClick = function (event) {
            event.preventDefault();

            for (let i = 0; i < menuItems.length; i++) {
                menuItems[i].classList.remove('active');
            }

            event.currentTarget.classList.add('active');

            const currentDate = DateFormatter.YYYY_MM_DD(new Date());
            if (event.currentTarget.innerText.toLowerCase() === 'сегодня') {
                that.loadingOperations(currentDate, currentDate);
            }

            if (event.currentTarget.innerText.toLowerCase() === 'неделя') {
                that.loadingOperations(DateFormatter.weekDate, currentDate);
            }

            if (event.currentTarget.innerText.toLowerCase() === 'месяц') {
                that.loadingOperations(DateFormatter.monthDate, currentDate);
            }

            if (event.currentTarget.innerText.toLowerCase() === 'год') {
                that.loadingOperations(DateFormatter.yearDate, currentDate);
            }

            if (event.currentTarget.innerText.toLowerCase() === 'все') {
                that.loadingOperations(DateFormatter.allDate, currentDate);
            }

            if (event.currentTarget.innerText.toLowerCase() === 'интервал') {
                that.dateInputFromElement.onchange = function () {
                    const fromDateValue = that.dateInputFromElement.value;
                    const toDateValue = that.dateInputToElement.value;
                    if (fromDateValue && toDateValue) {
                        that.loadingOperations(fromDateValue, toDateValue);
                    }
                }

                that.dateInputToElement.onchange = function () {
                    const fromDateValue = that.dateInputFromElement.value;
                    const toDateValue = that.dateInputToElement.value;
                    if (fromDateValue && toDateValue) {
                        that.loadingOperations(fromDateValue, toDateValue);
                    }
                }
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

        const incomeOperationAmount = []
        const incomeOperationCategory = []
        const expenseOperationAmount = []
        const expenseOperationCategory = []
        result.forEach(operation => {
            if (operation.type === 'income') {
                incomeOperationCategory.push(operation.category);
                incomeOperationAmount.push(operation.amount);
            }

            if (operation.type === 'expense') {
                expenseOperationCategory.push(operation.category);
                expenseOperationAmount.push(operation.amount);
            }
        })

        emptyIncomeText.style.display = (incomeOperationCategory.length === 0) ? 'block' : 'none';
        emptyExpenseText.style.display = (expenseOperationCategory.length === 0) ? 'block' : 'none';

        this.incomeChart.data.datasets[0].data = incomeOperationAmount;
        this.incomeChart.data.labels = incomeOperationCategory;
        this.incomeChart.update();
        this.expenseChart.data.datasets[0].data = expenseOperationAmount;
        this.expenseChart.data.labels = expenseOperationCategory;
        this.expenseChart.update();
    }
}
