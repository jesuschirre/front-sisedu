import { 
  LayoutDashboard, 
  UserCheck 
} from "lucide-react";
import DashBoard from "../../molecules/DashBoard";

export default function DashboardLayoutPermi() {
  // Lista de rutas 
  const navItems = [
    { name: "Inicio", path: "/permissions", icon: LayoutDashboard },
    { name: "Roles", path: "/permissions/rol", icon: UserCheck }
  ];

  return <DashBoard navItems={navItems} ruta="/permissions"/>
}