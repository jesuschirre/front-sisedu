import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  HeartHandshake,
  UserCog,
} from "lucide-react";
import DashBoard from "../../molecules/DashBoard";

export default function DashboardLayout() {
  const navItems = [
    { name: "Inicio", path: "/people", icon: LayoutDashboard },
    { name: "Usuarios", path: "/people/user", icon: Users },
    { name: "Estudiantes", path: "/people/student", icon: GraduationCap },
    { name: "Docentes", path: "/people/teacher", icon: BookOpen },
    { name: "Padres", path: "/people/parents", icon: HeartHandshake },
    { name: "Personal", path: "/people/staff", icon: UserCog },
  ];

  return <DashBoard navItems={navItems} ruta="/people" />;
}
