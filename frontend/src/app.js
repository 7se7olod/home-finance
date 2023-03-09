import Collapse from 'bootstrap/dist/js/bootstrap.min';
import {Router} from "./router.js";
import './scss/style.scss'

class App {
    constructor() {
        this.router = new Router();
        window.addEventListener('DOMContentLoaded', this.handleRouteChanging.bind(this));
        window.addEventListener('popstate', this.handleRouteChanging.bind(this))
    }

    handleRouteChanging() {
        this.router.openRoute();
    }
}

(new App());
