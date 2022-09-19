
import React from "react";
import {createRoot} from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./app/App";
import store from "./app/redux/store";


const container = document.getElementById("app");
const root = createRoot(container as HTMLElement);
root.render(
    <Provider store={store}>
        <Router>
            <App />
        </Router>
    </Provider>
)