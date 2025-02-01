import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import ProductCategory from "./components/ProductCategory";
import UserHome from "./components/UserHome";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <ProductCategory />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<UserHome />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;