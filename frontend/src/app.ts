import {Collapse} from 'bootstrap';
import {Modal} from "bootstrap";
import {Router} from "./router";
import './scss/style.scss'

class App {
    private router: Router;
    constructor() {
        this.router = new Router();
        window.addEventListener('DOMContentLoaded', this.handleRouteChanging.bind(this));
        window.addEventListener('popstate', this.handleRouteChanging.bind(this))
        new Collapse('#main');
        new Modal('#userModal');
    }

    private handleRouteChanging(): void {
        this.router.openRoute();
    }
}

(new App());
