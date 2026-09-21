import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
	const { token, usuario, cargando } = useAuth();

	if (cargando) {
		return null;
	}

	if (!token || !usuario) {
		return <Navigate to="/login" replace />;
	}

	return <Outlet />;
}
