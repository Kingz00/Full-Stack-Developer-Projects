import { createBrowserRouter } from "react-router-dom";
import SignIn from "./components/SignIn";
import App from "./App";
import SignUp from "./components/SignUp";
import RootRedirect from "./routes/RootRedirect";
import ProtectedRoute from "./components/ProtectedRoute";


export const router = createBrowserRouter([
    {
        path: "/",
        element: <RootRedirect />
    },
    {
        path: "/dashboard",
        element: (
            <ProtectedRoute>
                <App />
            </ProtectedRoute>
        )
    },
    {
        path: "/signin",
        element: <SignIn />
    },
    {
        path: "/signup",
        element: <SignUp />
    }
])