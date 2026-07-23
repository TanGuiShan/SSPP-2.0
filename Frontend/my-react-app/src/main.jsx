import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Register the <sgds-spinner> custom element used by the route loading
// fallback. Other SGDS components register themselves via their React wrapper
// imports; the spinner is the one we use as a bare tag, so register it here.
import "@govtechsg/sgds-web-component/components/Spinner/sgds-spinner.js";

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
