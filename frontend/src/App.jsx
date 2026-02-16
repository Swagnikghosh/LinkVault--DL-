import { Routes, Route } from "react-router-dom";
import UploadPage from "./pages/UploadPage";
import ItemPage from "./pages/ItemPage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/"
        element={(
          <ProtectedRoute>
            <UploadPage />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/dashboard"
        element={(
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        )}
      />
      <Route path="/item/:id" element={<ItemPage />} />
      <Route path="/file/:id" element={<ItemPage />} />
    </Routes>
  );
}
