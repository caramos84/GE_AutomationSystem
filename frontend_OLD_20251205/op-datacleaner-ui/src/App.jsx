import React from "react";
import { Routes, Route } from "react-router-dom";
import { UploadPage } from "./pages/UploadPage/UploadPage.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<UploadPage />} />
    </Routes>
  );
}

export default App;

