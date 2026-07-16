import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { EngagementProvider } from "./hooks/useEngagements";
import AppRoutes from "./routes/AppRoutes";
import "./styles/global.css";

export default function App() {
  return (
    <AuthProvider>
      <EngagementProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </EngagementProvider>
    </AuthProvider>
  );
}
