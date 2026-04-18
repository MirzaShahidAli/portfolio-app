import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("admin_token");
  return token ? children : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin routes only — portfolio is served as plain HTML by Express */}
        <Route path="/admin/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
