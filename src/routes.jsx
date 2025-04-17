import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
} from "@heroicons/react/24/solid";
import { Home, Profile, Tables, Notifications } from "@/pages/dashboard";
import { SignIn, SignUp } from "@/pages/auth";
import FatigueDetection from "./pages/dashboard/fatigue-detection";
import PhoneDetection from "./pages/dashboard/phonedetection";
import SmokeDetection from "./pages/dashboard/smoke-detection";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        // icon: <HomeIcon {...icon} />,
        name: "Fatigue-Detection",
        path: "/Fatigue-Detection",
        element: <FatigueDetection />,
      },
      {
        // icon: <UserCircleIcon {...icon} />,
        name: "Smoke-Detection ",
        path: "/Smoke-Detection",
        // element: <PhoneDetection />,
        element: <SmokeDetection />,
      },
      {
        // icon: <TableCellsIcon {...icon} />,
        name: "Phone-Detection",
        path: "/Phone-Detection",
        element: <PhoneDetection />,
      },
      // {
      //  // icon: <InformationCircleIcon {...icon} />,
      //   name: "notifications",
      //   path: "/notifications",
      //   element: <Notifications />,
      // }, 
    ],
  },
  {
    title: "auth pages",
    layout: "auth",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "sign in",
        path: "/sign-in",
        element: <SignIn />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "sign up",
        path: "/sign-up",
        element: <SignUp />,
      },
    ],
  },
];

export default routes;
