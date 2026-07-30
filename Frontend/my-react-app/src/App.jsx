import { BrowserRouter } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
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
          <SpeedInsights />
        </BrowserRouter>
      </EngagementProvider>
    </AuthProvider>
  );
}
