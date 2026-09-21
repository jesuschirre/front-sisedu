import { 
  BarChart4,
  BookMarked,
  ChartNoAxesGantt,
  GraduationCap,
  LayoutDashboard, 
} from "lucide-react";

import DashBoard from "../../molecules/DashBoard";

export default function DashboardEstructuraEdu() {
  // Lista de rutas para renderizar el menú de forma dinámica
  const navItems = [
    { name: "Inicio", path: "/academic", icon: LayoutDashboard },
    { name: "Nivel", path: "/academic/level", icon: BarChart4  },
    { name: "Grado", path: "/academic/degrees", icon: GraduationCap },
    { name: "Periodo", path: "/academic/academicperiod", icon: ChartNoAxesGantt },
    { name: "Cursos", path: "/academic/curses", icon: BookMarked } 
  ];

  return <DashBoard navItems={navItems} ruta="/academic" /> 
}