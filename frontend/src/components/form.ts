import {CustomHttp} from "../services/custom-http";
import {Auth} from "../services/auth";
import config from "../../config/config";
import {FieldType} from "../type/field.type";

export class Form {
    readonly page: string;
    private rememberMeElement: HTMLInputElement | null = null;
    readonly processElement: HTMLElement | null = null;
    readonly accessToken: string | null = localStorage.getItem(Auth.accessTokenKey);
    readonly fields: FieldType[];
    private loginFormErrorMsgElement = document.getElementById('login-form-error-message');

    constructor(page: string) {
        this.page = page;
        const that: Form = this;
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
                regex: /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])[a-zA-Z\d]{8,}$/,
                valid: false,
            },
        ];

        if (this.page === 'signup') {
            this.fields.unshift(
                {
                    name: 'name',
                    id: 'exampleInputUsername',
                    element: null,
                    regex: /^([A-ZА-ЯЁ][a-zа-яё\-]*\s?){1,3}$/,
                    valid: false,
                },
                {
                    name: 'repeat-password',
                    id: 'exampleInputRepeatPassword',
                    element: null,
                    regex: /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])[a-zA-Z\d]{8,}$/,
                    valid: false,
                })
        }

        // if (accessToken) {
        //     location.href = '#/categories/income';
        //     return;
        // }

        if (this.page === 'login') {
            this.rememberMeElement = (document.getElementById('exampleCheck1') as HTMLInputElement);
        }

        this.fields.forEach(item => {
            item.element = document.getElementById(item.id);
            item.element.onchange = function () {
                that.validateField.call(that, item, this);
            }
        })

        this.processElement = document.getElementById('process');
        if (!this.processElement) return;
        (this.processElement as HTMLButtonElement).onclick = function () {
            that.processForm();
        }
    }

    private validateField(field: FieldType, element: any): void {
        if (!element.value || !element.value.match(field.regex)) {
            element.style.borderColor = 'red';
            field.valid = false;
        } else {
            element.style.borderColor = 'blue';
            field.valid = true;
        }
        this.validateForm();
    }

    private validateForm(): boolean {
        return this.fields.every(item => item.valid);
    }

    private async processForm(): Promise<void> {
        if (this.validateForm()) {
            const email: string | null = this.fields.find(item => item.name === 'email')!.element.value;
            const password: string | null = this.fields.find(item => item.name === 'password')!.element.value;
            if (!email) return;
            if (!password) return;

            if (this.page === 'signup') {
                if (!this.fields) return;
                const repeatPassword: string | null = this.fields.find(item => item.name === 'repeat-password')!.element!.value;
                const name: string | null = this.fields.find(item => item.name === 'name')!.element.value.split(' ')[1];
                const lastName: string | null = this.fields.find(item => item.name === 'name')!.element.value.split(' ')[0];

                if (repeatPassword == undefined) return;
                if (name == undefined) return;
                if (lastName == undefined) return;

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
                            location.href = "#/";
                        }
                    } catch (error) {
                        console.log(error);
                    }
                }
            }

            if (this.page === 'login') {
                try {
                    // if (!this.rememberMeElement.checked) return;
                    // const rememberMe: boolean = this.rememberMeElement.checked;
                    // if (!rememberMe) return;
                    const result: any = await CustomHttp.request(config.host + '/login', 'POST', {
                        email: email,
                        password: password,
                        rememberMe: this.rememberMeElement?.checked,
                    })

                    if (result) {
                        if (result.error || !result.tokens.accessToken || !result.tokens.refreshToken || !result.user.name || !result.user.lastName || !result.user.id) {
                            document.getElementById('login-form-error-message')!.style.display = 'block';
                            throw new Error(result.message);
                        }

                        Auth.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
                        Auth.setUserInfo({
                            name: result.user.name,
                            userId: result.user.id,
                            lastName: result.user.lastName,
                            rememberMe: this.rememberMeElement?.checked ? true : false,
                        })
                        location.href = "#/categories/income";
                        const sidebarUsernameElement = document.getElementById('sidebar-username');
                        if (sidebarUsernameElement) {
                            sidebarUsernameElement.innerText = result.user.name + ' ' + result.user.lastName;
                        }
                    } else {
                        if (this.loginFormErrorMsgElement) {
                            this.loginFormErrorMsgElement.style.display = 'block'
                        }
                    }
                } catch (error) {
                    if (this.loginFormErrorMsgElement) {
                        this.loginFormErrorMsgElement.style.display = 'block'
                    }
                    return console.log(error);
                }
            }
        }
    }
}
