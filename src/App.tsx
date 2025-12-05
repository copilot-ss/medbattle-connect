import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Auth />} />
      <Route path="/auth" element={<Auth />} />
    </Routes>
  </BrowserRouter>
);

export default App;
