import { BrowserRouter } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { AuthProvider } from "./hooks/useAuth";
import { EngagementProvider } from "./hooks/useEngagements";
import { TiersProvider } from "./hooks/useTiers";
import AppRoutes from "./routes/AppRoutes";
import "./styles/global.css";

export default function App() {
  return (
    <AuthProvider>
      <TiersProvider>
        <EngagementProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </EngagementProvider>
      </TiersProvider>
    </AuthProvider>
  );
}
