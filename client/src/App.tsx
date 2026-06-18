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
import TrainerProfile from "./pages/trainer/trainerProfile";
import { useAuth, AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { SubscriptionProvider } from "./context/SubscriptionContext";
import { SearchProvider } from "./context/SearchContext";
import { Navigate } from "react-router-dom";
import TrainerDashboard from "./pages/trainer/TrainerDashboard";
import TrainerPlans from "./pages/trainer/TrainerPlans";
import TrainerDiet from "./pages/trainer/TrainerDiet";
import TrainerClasses from "./pages/trainer/TrainerClasses";

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

function RootRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-dark text-cyan">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (user) {
    if (user.role === "ADMIN") return <Navigate to="/admin" replace />;
    if (user.role === "TRAINER") return <Navigate to="/trainer" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <Landing />;
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <SubscriptionProvider>
          <SearchProvider>
            <BrowserRouter>
              <Routes>
              {/* Auth routes without sidebar/navbar */}
              {/* Root logic: landing if guest, dashboard if logged in */}
              <Route path="/" element={<RootRoute />} />
              {/* Public routes */}
              <Route path="/landing" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />

              {/* Main app routes with sidebar/navbar */}
              <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                  {/* <Route path="/" element={<Dashboard />} /> */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/diet" element={<Diet />} />
                  <Route path="/exercises" element={<Exercises />} />
                  <Route path="/exercises/:id" element={<ExerciseDetail />} />
                  <Route path="/bookings" element={<MyBookings />} />
                  <Route path="/progress" element={<Progress />} />
                  <Route path="/plans" element={<Plans />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/subscription" element={<Subscription />} />
                  <Route path="/trainer/:id" element={<TrainerProfile />} />
                  <Route path="/trainer" element={<TrainerDashboard />} />
                  <Route path="/trainer/diet" element={<TrainerDiet />} />
                  <Route path="/trainer/plans" element={<TrainerPlans />} />
                  <Route path="/trainer/classes" element={<TrainerClasses />} />
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
          </SearchProvider>
        </SubscriptionProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
