import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";

const Dashboard = lazy(() =>
  import("@/pages/Dashboard").then((m) => ({ default: m.Dashboard }))
);
const Transactions = lazy(() =>
  import("@/pages/Transactions").then((m) => ({ default: m.Transactions }))
);
const Goals = lazy(() =>
  import("@/pages/Goals").then((m) => ({ default: m.Goals }))
);
const SettingsPage = lazy(() =>
  import("@/pages/Settings").then((m) => ({ default: m.SettingsPage }))
);

function PageFallback() {
  return (
    <div className="flex items-center justify-center py-32">
      <div className="h-8 w-8 rounded-full border-2 border-ink-200 border-t-brand-600 animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route
          index
          element={
            <Suspense fallback={<PageFallback />}>
              <Dashboard />
            </Suspense>
          }
        />
        <Route
          path="lancamentos"
          element={
            <Suspense fallback={<PageFallback />}>
              <Transactions />
            </Suspense>
          }
        />
        <Route
          path="metas"
          element={
            <Suspense fallback={<PageFallback />}>
              <Goals />
            </Suspense>
          }
        />
        <Route
          path="configuracoes"
          element={
            <Suspense fallback={<PageFallback />}>
              <SettingsPage />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}
