import {CustomHttp} from "../services/custom-http.js";
import {Auth} from "../services/auth.js";
import config from "../../config/config.js";

export class Form {

    constructor(page) {
        this.rememberMeElement = null;
        this.rememberMe = false;
        this.processElement = null;
        this.page = page;
        const accessToken = localStorage.getItem(Auth.accessTokenKey);
        const that = this;

        this.fields = [
            {
                name: 'email',
                id: 'exampleInputEmail1',
                element: null,
                regex: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                valid: false,
            },
            {
                name: 'password',
                id: 'exampleInputPassword1',
                element: null,
                regex: /^.*(?=.{8,})(?=.*[a-zA-Z])(?=.*\d).*$/,
                valid: false,
            },
        ];

        if (this.page === 'signup') {
            this.fields.unshift(
                {
                    name: 'name',
                    id: 'exampleInputUsername',
                    element: null,
                    regex: /^[a-zA-Zа-яА-Я]+ [a-zA-Zа-яА-Я]+ [a-zA-Zа-яА-Я]+$/,
                    valid: false,
                },
                {
                    name: 'repeat-password',
                    id: 'exampleInputRepeatPassword',
                    element: null,
                    regex: /^.*(?=.{8,})(?=.*[a-zA-Z])(?=.*\d).*$/,
                    valid: false,
                })
        }

        if (accessToken) {
            location.href = '#/categories/income';
            return;
        }

        if (this.page === 'login') {
            document.getElementById('toSignupBtn').onclick = function () {
                location.href = '#/signup';
            }

            this.rememberMeElement = document.getElementById('exampleCheck1');
        }

        this.fields.forEach(item => {
            item.element = document.getElementById(item.id);
            item.element.onchange = function () {
                that.validateField.call(that, item, this);
            }
        })

        this.processElement = document.getElementById('process');
        this.processElement.onclick = function () {
            that.processForm();
        }
    }

    validateField(field, element) {
        if (!element.value || !element.value.match(field.regex)) {
            element.style.borderColor = 'red';
            field.valid = false;
        } else {
            element.style.borderColor = 'blue';
            field.valid = true;
        }
        this.validateForm();
    }

    validateForm() {
        return this.fields.every(item => item.valid);
    }

    async processForm() {
        if (this.validateForm()) {
            const email = this.fields.find(item => item.name === 'email').element.value;
            const password = this.fields.find(item => item.name === 'password').element.value;

            if (this.page === 'signup') {
                const repeatPassword = this.fields.find(item => item.name === 'repeat-password').element.value;
                const name = this.fields.find(item => item.name === 'name').element.value.split(' ')[1];
                const lastName = this.fields.find(item => item.name === 'name').element.value.split(' ')[0];

                if (password === repeatPassword) {
                    try {
                        const result = await CustomHttp.request(config.host + '/signup', 'POST', {
                            name: name,
                            lastName: lastName,
                            email: email,
                            password: password,
                            passwordRepeat: repeatPassword,
                        })

                        if (result) {
                            if (result.error || !result.user) {
                                throw new Error(result.message);
                            }
                            console.log('Пользователь ' + name + ' зарегистрирован!');
                            alert('Пользователь ' + name + ' зарегистрирован!');
                            location.href = "#/";
                        }
                    } catch (error) {
                        console.log(error);
                    }
                } else {
                    alert('Пароли не совпадают!');
                }
            }

            if (this.page === 'login') {
                try {
                    const rememberMe = this.rememberMeElement.checked;
                    const result = await CustomHttp.request(config.host + '/login', 'POST', {
                        email: email,
                        password: password,
                        rememberMe: rememberMe,
                    })

                    if (result) {
                        if (result.error || !result.tokens.accessToken || !result.tokens.refreshToken || !result.user.name || !result.user.lastName || !result.user.id) {
                            document.getElementById('login-form-error-message').style.display = 'block';
                            throw new Error(result.message);
                        }
                        console.log(result);

                        Auth.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
                        Auth.setUserInfo({
                            name: result.user.name,
                            userId: result.user.id,
                            lastName: result.user.lastName,
                            rememberMe: rememberMe
                        })
                        location.href = "#/categories/income";
                        alert('Пользователь ' + result.user.name + ' вошел в систему!');
                        document.getElementById('sidebar-username').innerText = result.user.name + ' ' + result.user.lastName;
                    } else {
                        alert("Проверьте данные авторизации!");
                        document.getElementById('login-form-error-message').style.display = 'block';
                    }
                } catch (error) {
                    document.getElementById('login-form-error-message').style.display = 'block';
                    return console.log(error);
                }
            }
        }
    }
}
