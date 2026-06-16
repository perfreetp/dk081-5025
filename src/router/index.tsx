import { Navigate, createBrowserRouter } from "react-router-dom";
import MainLayout from "@/components/Layout/MainLayout";
import Dashboard from "@/pages/Home";
import Queue from "@/pages/Queue";
import Compare from "@/pages/Compare";
import Punishment from "@/pages/Punishment";
import Review from "@/pages/Review";
import Inspection from "@/pages/Inspection";
import Announcements from "@/pages/Announcements";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    element: <MainLayout />,
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "queue",
        element: <Queue />,
      },
      {
        path: "compare",
        element: <Compare />,
      },
      {
        path: "punishment",
        element: <Punishment />,
      },
      {
        path: "review",
        element: <Review />,
      },
      {
        path: "review/inspection",
        element: <Inspection />,
      },
      {
        path: "review/announcements",
        element: <Announcements />,
      },
    ],
  },
]);

export default router;
