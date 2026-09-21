import { CalendarCheck, LayoutDashboard, Star } from "lucide-react"
import DashBoard from "../../molecules/DashBoard"

export default function DashCalAsis() {
    const navItems = [
        {name: "Inicio", path: "/grades", icon: LayoutDashboard },
        {name: "Calicaciones", path: "/grades/calificacion", icon:Star },
        {name: "Asistencia", path: "/grades/asistencia", icon:CalendarCheck },
    ]
  return (
    <DashBoard navItems={navItems} ruta="/grades"/>
  )
}
