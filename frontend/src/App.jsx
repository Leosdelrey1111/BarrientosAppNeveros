import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { Sidebar, Topbar } from "./components/shared/Layout";

import LoginPage     from "./pages/LoginPage";
import POSPage       from "./pages/POSPage";
import InventoryPage from "./pages/InventoryPage";
import ReportsPage   from "./pages/ReportsPage";
import AdminPage     from "./pages/AdminPage";

const PAGE_TITLES = {
  "/pos":       "Punto de Venta",
  "/inventory": "Inventario",
  "/reports":   "Reportes",
  "/admin":     "Administración",
};

const ROLE_LANDING = {
  admin:     "/reports",
  cajero:    "/pos",
  consultor: "/reports",
};

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={ROLE_LANDING[user.role]} replace />;
  return children;
}

function AppShell() {
  const { user, loading } = useAuth();
  const location = useLocation();

  const [collapsed,  setCollapsed]  = useState(false);
  const [isMobile,   setIsMobile]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setCollapsed(false);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (loading) return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FDFAF6" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🍦</div>
        <p style={{ color: "#64748B", fontFamily: "DM Sans,sans-serif" }}>Cargando NeveriaPOS…</p>
      </div>
    </div>
  );

  const isLogin = location.pathname === "/login";
  if (isLogin || !user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*"      element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const title = PAGE_TITLES[location.pathname] || "NeveriaPOS";

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar
        collapsed={collapsed}  onToggle={() => setCollapsed(v => !v)}
        isMobile={isMobile}    mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <Topbar
          title={title}
          isMobile={isMobile}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main style={{ flex: 1, overflow: "hidden" }}>
          <Routes>
            <Route path="/pos"       element={<ProtectedRoute roles={["admin","cajero"]}             ><POSPage /></ProtectedRoute>} />
            <Route path="/inventory" element={<ProtectedRoute roles={["admin","cajero","consultor"]} ><InventoryPage /></ProtectedRoute>} />
            <Route path="/reports"   element={<ProtectedRoute roles={["admin","consultor"]}          ><ReportsPage /></ProtectedRoute>} />
            <Route path="/admin"     element={<ProtectedRoute roles={["admin"]}                      ><AdminPage /></ProtectedRoute>} />
            <Route path="*"          element={<Navigate to={ROLE_LANDING[user.role]} replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppShell />
      </CartProvider>
    </AuthProvider>
  );
}
