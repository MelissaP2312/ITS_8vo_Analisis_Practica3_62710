import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { ScrollToTop } from "./ui/components/common/ScrollToTop";
import AppLayout from "./ui/layout/AppLayout";
import SignIn from "./ui/pages/AuthPages/SignIn";
import SignUp from "./ui/pages/AuthPages/SignUp";
import Home from "./ui/pages/Dashboard/Home";
import ProtectedRoute from "./ui/components/common/ProtectedRoute";

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Rutas protegidas con layout */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index path="/" element={<Home />} />
          {/* Aquí puedes agregar más rutas hijas si las necesitas */}
          {/* <Route path="profile" element={<Profile />} /> */}
        </Route>

        {/* Rutas públicas de autenticación */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </Router>
  );
}