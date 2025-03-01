import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
// import Home from "../pages/Home";
import Chat from "./pages/Chat.jsx";
import "./App.css";
import RegisterLogin from "./pages/RegisterLogin";
import ProtectedRoute from "./utils/ProtectedRoute";
import { Provider } from "react-redux";
import store from "./redux/store";
import { Toaster } from "react-hot-toast";
const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <Toaster />
        <Routes>
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="/auth" element={<RegisterLogin />} />
          {/* Protected Chat Route */}
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;
