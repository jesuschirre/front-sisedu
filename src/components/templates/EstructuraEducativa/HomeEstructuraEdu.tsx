import axios from "axios";
import { useEffect, useState } from "react";
import { BookOpen, CalendarDays, Layers3, School } from "lucide-react";
import StatsOverview, { type DashboardStat } from "../../atoms/StatsOverview";
import { useAuth } from "../../../context/AuthContext";
import { Url } from "../../../url";

interface AcademicStats { total_levels: number; total_degrees: number; total_academic_periods: number; total_courses: number; }

export default function HomeEstructuraEdu() {
  const { persona } = useAuth();
  const [stats, setStats] = useState<AcademicStats>({ total_levels: 0, total_degrees: 0, total_academic_periods: 0, total_courses: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!persona?.fk_school_id) return;
    setIsLoading(true);
    axios.get(`${Url}/peoplesta?fk_school_id=${persona.fk_school_id}`)
      .then((response) => setStats(response.data?.data || {}))
      .catch((error) => console.error("Error al obtener estadísticas académicas:", error))
      .finally(() => setIsLoading(false));
  }, [persona?.fk_school_id]);
  console.log(stats)

  const dashboardStats: DashboardStat[] = [
    { label: "Niveles", value: stats.total_levels, icon: Layers3, color: "#60a5fa" },
    { label: "Grados", value: stats.total_degrees, icon: School, color: "#fbbf24" },
    { label: "Periodos", value: stats.total_academic_periods, icon: CalendarDays, color: "#34d399" },
    { label: "Cursos", value: stats.total_courses, icon: BookOpen, color: "#fb7185" },
  ];

  return <StatsOverview title="Estructura académica" description="Resumen de la organización educativa de la institución" stats={dashboardStats} isLoading={isLoading} barTitle="Componentes académicos" pieTitle="Distribución académica" />;
}
