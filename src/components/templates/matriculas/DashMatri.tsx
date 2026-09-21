import { LayoutDashboard, UserCheck } from "lucide-react";
import DashBoard from "../../molecules/DashBoard";

export default function DashMatri() {
  // Lista de rutas 
  const navItems = [
    { name: "Inicio", path: "/enrollment", icon: LayoutDashboard },
    { name: "Matriculas", path: "/enrollment/matricula", icon: UserCheck }
  ];
  return <DashBoard navItems={navItems} ruta="/enrollment" />;
}
