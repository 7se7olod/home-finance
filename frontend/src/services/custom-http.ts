import {Auth} from "./auth";

export class CustomHttp {
    public static async request(url: string, method: string = 'GET', body: any = null): Promise<any> {
        const params: any = {
            method: method,
            headers: {
                'Content-type': 'application/json',
                'Accept': 'application/json',
            },
        };

        const token: string | null = localStorage.getItem(Auth.accessTokenKey);
        if (token) {
            params.headers['x-auth-token'] = token;
        }

        if (body) {
            params.body = JSON.stringify(body);
        }

        const response: Response = await fetch(url, params);

        if (response.status < 200 || response.status >= 300) {
            if (response.status === 401) {
                const result: boolean = await Auth.processUnautharizedResponse();
                if (result) {
                    return await this.request(url, method, body);
                } else {
                    return null;
                }
            }
            throw new Error(response.statusText);
        }
        return await response.json();
    }
}
