import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Home from "./pages/Home";
import Expenses from "./pages/Expenses";
import Incomes from "./pages/Incomes";
import Settings from "./pages/Settings";
import Cards from "./pages/Cards";
import FixedExpenses from "./pages/FixedExpenses";
import Login from "./pages/Login";
import Register from "./pages/Register";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rutas privadas */}
          <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/expenses" element={<PrivateRoute><Expenses /></PrivateRoute>} />
          <Route path="/incomes" element={<PrivateRoute><Incomes /></PrivateRoute>} />
          <Route path="/cards" element={<PrivateRoute><Cards /></PrivateRoute>} />
          <Route path="/fixed-expenses" element={<PrivateRoute><FixedExpenses /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
