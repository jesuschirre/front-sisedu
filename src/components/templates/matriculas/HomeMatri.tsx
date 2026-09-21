import axios from "axios";
import { useEffect, useState } from "react";
import { GraduationCap, ClipboardList } from "lucide-react";
import StatsOverview, { type DashboardStat } from "../../atoms/StatsOverview";
import { useAuth } from "../../../context/AuthContext";
import { Url } from "../../../url";

interface EnrollmentStats { total_students: number; total_enrollments: number; }

export default function HomeMatri() {
  const { persona } = useAuth();
  const [stats, setStats] = useState<EnrollmentStats>({ total_students: 0, total_enrollments: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!persona?.fk_school_id) return;
    setIsLoading(true);
    axios.get(`${Url}/peoplesta?fk_school_id=${persona.fk_school_id}`)
      .then((response) => setStats(response.data?.data || {}))
      .catch((error) => console.error("Error al obtener estadísticas de matrículas:", error))
      .finally(() => setIsLoading(false));
  }, [persona?.fk_school_id]);

  const dashboardStats: DashboardStat[] = [
    { label: "Estudiantes", value: stats.total_students, icon: GraduationCap, color: "#60a5fa" },
    { label: "Matrículas", value: stats.total_enrollments, icon: ClipboardList, color: "#fbbf24" },
  ];

  return <StatsOverview title="Matrículas" description="Resumen de estudiantes inscritos y registros de matrícula" stats={dashboardStats} isLoading={isLoading} barTitle="Registro de matrículas" pieTitle="Proporción de matrícula" />;
}
