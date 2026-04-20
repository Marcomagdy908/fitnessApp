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
import Trainers from "./pages/trainers";
import MealsTracker from "./pages/meals";
import ExerciseTracker from "./pages/exercise";
import Login from "./pages/login";
import SignUp from "./pages/signup";

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

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
      <Routes>
        {/* Auth routes without sidebar/navbar */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Main app routes with sidebar/navbar */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/exercises" element={<Exercises />} />
            <Route path="/exercises/:id" element={<ExerciseDetail />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/diet" element={<Diet />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/trainers" element={<Trainers />} />
            <Route path="/meals" element={<MealsTracker />} />
            <Route path="/exercise" element={<ExerciseTracker />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
