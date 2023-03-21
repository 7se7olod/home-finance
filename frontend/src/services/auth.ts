import config from "../../config/config";
import {UserType} from "../type/user.type";

type RefreshResponseType = {
    error: boolean,
    message: string,
    tokens: {
        refreshToken: string,
        accessToken: string
    }
}

export class Auth {
    public static accessTokenKey: string = 'accessToken';
    public static refreshTokenKey: string = 'refreshToken';
    public static userInfoKey: string = 'userInfo';

    public static async processUnautharizedResponse(): Promise<boolean> {
        const refreshToken: string | null = localStorage.getItem(this.refreshTokenKey);
        const rememberMeFlag: boolean = this.getUserInfo()!.rememberMe;
        if (refreshToken) {
            const response: Response = await fetch(config.host + '/refresh', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({refreshToken: refreshToken, rememberMe: rememberMeFlag})
            });

            if (response && response.status === 200) {
                const result: RefreshResponseType = await response.json();
                if (result && !result.error && result.tokens.accessToken && result.tokens.refreshToken) {
                    this.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
                    return true;
                }
            }
        }

        this.removeTokens();
        location.href = '#/';
        return false
    }


    public static async logout(): Promise<boolean> {
        const refreshToken: string | null = localStorage.getItem(this.refreshTokenKey);
        if (refreshToken) {
            const response: Response = await fetch(config.host + '/logout', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({refreshToken: refreshToken})
            });

            if (response && response.status === 200) {
                const result: RefreshResponseType = await response.json();
                if (result && !result.error) {
                    Auth.removeTokens();
                    localStorage.removeItem(Auth.userInfoKey);
                    localStorage.clear();
                    return true;
                }
            }
        }
        return false;
    }

    public static setTokens(accessToken: string, refreshToken: string): void {
        if (accessToken && refreshToken) {
            localStorage.setItem(this.accessTokenKey, accessToken);
            localStorage.setItem(this.refreshTokenKey, refreshToken);
        }
    }

    public static removeTokens(): void {
        localStorage.removeItem(this.accessTokenKey);
        localStorage.removeItem(this.refreshTokenKey);
    }

    public static setUserInfo(info: UserType): void {
        if (info) {
            localStorage.setItem(this.userInfoKey, JSON.stringify(info));
        }
    }

    public static getUserInfo(): UserType | undefined {
        const userInfo: string | null = localStorage.getItem(this.userInfoKey);
        if (userInfo) {
            return JSON.parse(userInfo);
        }
        return;
    }
}
