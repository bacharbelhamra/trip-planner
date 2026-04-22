import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App.jsx";
import CreateTrip from "./create-trip/index";
import ViewTrip from "./view-trip/index";
import Auth from "./pages/Auth";
import MyTrips from "./pages/MyTrips";

import "leaflet/dist/leaflet.css";
import "./utils/leafletFix";

import { ThemeProvider } from "@/components/theme-provider";

import Layout from "@/components/Layout";

const router = createBrowserRouter([
  {
    element: <Layout />, // ✅ HEADER WRAPPER
    children: [
      { path: "/", element: <App /> },
      { path: "/create-trip", element: <CreateTrip /> },
      { path: "/view-trip", element: <ViewTrip /> },
      { path: "/my-trips", element: <MyTrips /> },

      // ✅ FIX → move auth here
      { path: "/auth", element: <Auth /> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>
);