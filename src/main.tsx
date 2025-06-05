import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";

import "./i18n";
import "./styles/index.css";
import "./styles/fonts.css";
import { HashRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </HelmetProvider>
  </React.StrictMode>
);
