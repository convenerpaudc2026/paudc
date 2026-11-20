import { createRoot } from "react-dom/client";
import { HelmetProvider } from 'react-helmet-async';
import "./index.css";
import App from "./App.tsx";
import { captureUtmParams } from "./lib/metaPixel";

captureUtmParams();

createRoot(document.getElementById("root")!).render(
    <HelmetProvider>
        <App />
    </HelmetProvider>
);
