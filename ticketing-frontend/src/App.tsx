import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { Toaster } from "sonner";
import Layout from "./components/Layout";
import DashboardLayout from "./components/DashboardLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";

// Public Pages
import Home from "./pages/Home";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Login from "./pages/Login";
import Register from "./pages/customer/CustomerRegister";
import OrganizerRegister from "./pages/organizer/OrganizerRegister";
import Checkout from "./pages/customer/CustomerCheckout";
import PaymentSuccess from "./pages/customer/CustomerPaymentSuccess";
import PaymentFailed from "./pages/customer/CustomerPaymentFailed";
import TicketSelection from "./pages/customer/CustomerTicketSelection";
import Forbidden from "./pages/Forbidden";
import NotFound from "./pages/NotFound";

// User Private Pages
import Orders from "./pages/customer/CustomerOrders";
import MyTickets from "./pages/customer/CustomerTickets";
import Profile from "./pages/Profile";

// Admin Sub-pages
import AdminOverview from "./pages/admin/AdminOverview";
import AdminEvents from "./pages/admin/AdminEvents";
import UserManagement from "./pages/admin/AdminUsers";
import AdminTickets from "./pages/admin/AdminTickets";
import AdminOrders from "./pages/admin/AdminOrders";

// Organizer Sub-pages
import OrganizerOverview from "./pages/organizer/OrganizerOverview";
import OrganizerEvents from "./pages/organizer/OrganizerEvents";
import OrganizerCreateEvent from "./pages/organizer/OrganizerCreateEvent";
import OrganizerCheckIn from "./pages/organizer/OrganizerCheckin";

// Guard Component: bao gồm cả dashboard layout và xác thực, dành cho admin/org
const PrivateRoute = ({ allowedRole }: { allowedRole: string }) => {
  return (
    <ProtectedRoute allowedRoles={[allowedRole.toUpperCase()]}>
      <DashboardLayout role={allowedRole as "admin" | "organizer"} />
    </ProtectedRoute>
  );
};

function App() {
  const { hasRole } = useAuth();

  return (
    <Router>
      <Toaster position="top-right" richColors />
      <Routes>
        {/* --- PUBLIC ROUTES (Giữ nguyên Layout chính) --- */}
        <Route
          element={
            <Layout>
              <Outlet />
            </Layout>
          }
        >
          <Route
            index
            element={
              hasRole(["organizer"]) ? (
                <Navigate to="/organizer/overview" />
              ) : hasRole(["admin"]) ? (
                <Navigate to="/admin/overview" />
              ) : (
                <Navigate to="/home" />
              )
            }
          />
          <Route path="/home" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/category/:categoryId" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-organizer" element={<OrganizerRegister />} />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route path="/forbidden" element={<Forbidden />} />
        </Route>

        {/* --- CUSTOMER ROUTES --- */}
        <Route
          element={
            <Layout>
              <Outlet />
            </Layout>
          }
        >
          <Route
            path="/events/:id/book"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <TicketSelection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment/success"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <PaymentSuccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment/failed"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <PaymentFailed />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <MyTickets />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* --- ORGANIZER ROUTES --- */}
        <Route
          path="/organizer"
          element={<PrivateRoute allowedRole="organizer" />}
        >
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<OrganizerOverview />} />
          <Route path="events" element={<OrganizerEvents />} />
          <Route path="create-event" element={<OrganizerCreateEvent />} />
          <Route path="checkin" element={<OrganizerCheckIn />} />
        </Route>

        {/* --- ADMIN ROUTES --- */}
        <Route path="/admin" element={<PrivateRoute allowedRole="admin" />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<AdminOverview />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="events/:status" element={<AdminEvents />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="tickets" element={<AdminTickets />} />
          <Route path="orders" element={<AdminOrders />} />
        </Route>

        {/* --- CATCH ALL --- */}
        <Route
          path="*"
          element={
            <Layout>
              <NotFound />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
