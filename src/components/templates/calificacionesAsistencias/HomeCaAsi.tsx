import axios from "axios";
import { useEffect, useState } from "react";
import { ClipboardCheck, GraduationCap, NotebookPen } from "lucide-react";
import StatsOverview, { type DashboardStat } from "../../atoms/StatsOverview";
import { useAuth } from "../../../context/AuthContext";
import { Url } from "../../../url";

interface GradesStats { total_students: number; total_grades: number; total_attendance: number; }

export default function HomeCaAsi() {
  const { persona } = useAuth();
  const [stats, setStats] = useState<GradesStats>({ total_students: 0, total_grades: 0, total_attendance: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!persona?.fk_school_id) return;
    setIsLoading(true);
    axios.get(`${Url}/peoplesta?fk_school_id=${persona.fk_school_id}`)
      .then((response) => setStats(response.data?.data || {}))
      .catch((error) => console.error("Error al obtener estadísticas de calificaciones:", error))
      .finally(() => setIsLoading(false));
  }, [persona?.fk_school_id]);

  const dashboardStats: DashboardStat[] = [
    { label: "Estudiantes", value: stats.total_students, icon: GraduationCap, color: "#60a5fa" },
    { label: "Calificaciones", value: stats.total_grades, icon: NotebookPen, color: "#34d399" },
    { label: "Asistencias", value: stats.total_attendance, icon: ClipboardCheck, color: "#fb7185" },
  ];

  return <StatsOverview title="Calificaciones y asistencia" description="Resumen del seguimiento académico de los estudiantes" stats={dashboardStats} isLoading={isLoading} barTitle="Actividad académica" pieTitle="Distribución de registros" />;
}
