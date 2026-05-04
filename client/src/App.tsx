import SidebarNavigation from "./components/sidebarNavigation";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import ProtectedRoute from "./components/protectedRoute";
import Dashboard from "./pages/dashboard";
import Navbar from "./components/navbar";
import Exercises from "./pages/exercises";
import ExerciseDetail from "./pages/exerciseDetails";
import Progress from "./pages/progress";
import Plans from "./pages/plans";
import Settings from "./pages/settings";
import Diet from "./pages/diet";
import Subscription from "./pages/subscription";
import Login from "./pages/login";
import SignUp from "./pages/signup";
import Landing from "./pages/landing";
import MyBookings from "./pages/myBookings";
import AdminDashboard from "./pages/adminDashboard";
import { AuthProvider } from "./context/AuthContext";

function MainLayout() {
  return (
    <>
      <div className="fixed-content d-flex">
        <SidebarNavigation />
        <Navbar />
      </div>
      <div className="main-content" style={{ overflow: "hidden" }}>
        <Outlet />
      </div>
    </>
  );
}

import { ThemeProvider } from "./context/ThemeContext";
import { SubscriptionProvider } from "./context/SubscriptionContext";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <SubscriptionProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/landing" element={<Landing />} />
            <Route path="/" element={<Landing />} />
            {/* Auth routes without sidebar/navbar */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Main app routes with sidebar/navbar */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/diet" element={<Diet />} />
                <Route path="/exercises" element={<Exercises />} />
                <Route path="/exercises/:id" element={<ExerciseDetail />} />
                <Route path="/bookings" element={<MyBookings />} />
                <Route path="/progress" element={<Progress />} />
                <Route path="/plans" element={<Plans />} />
                <Route path="/settings" element={<Settings />} />
                  <Route path="/subscription" element={<Subscription />} />
                </Route>

                {/* Admin routes */}
                <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
                  <Route element={<MainLayout />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                  </Route>
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </SubscriptionProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
