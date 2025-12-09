import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { UploadPage } from "../pages/UploadPage/UploadPage";
import { PreviewPage } from "../pages/PreviewPage/PreviewPage";
import { DownloadPage } from "../pages/DownloadPage/DownloadPage";

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<UploadPage />} />
      <Route path="/preview/:fileId" element={<PreviewPage />} />
      <Route path="/download/:fileId" element={<DownloadPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

