import axios from "axios";
import { useEffect, useState } from "react";
import { BookOpen, GraduationCap, HeartHandshake, Users } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { Url } from "../../../url.ts";
import StatsOverview, { type DashboardStat } from "../../atoms/StatsOverview";

interface PeopleStats {
  total_students: number;
  total_teachers: number;
  total_parents: number;
  total_staff: number;
  total_users: number;
  total_people: number;
}

export default function HomePer() {
  const { persona } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [apiStats, setApiStats] = useState<PeopleStats>({
    total_students: 0,
    total_teachers: 0,
    total_parents: 0,
    total_staff: 0,
    total_users: 0,
    total_people: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!persona?.fk_school_id) return;

      setIsLoading(true);
      try {
        const response = await axios.get(`${Url}/peoplesta?fk_school_id=${persona.fk_school_id}`);
        setApiStats(response.data?.data || {});
      } catch (error) {
        console.error("Error al obtener las estadísticas:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [persona?.fk_school_id]);

  const stats: DashboardStat[] = [
    { label: "Total de personas", value: apiStats.total_people, icon: Users, color: "#60a5fa" },
    { label: "Total de usuarios", value: apiStats.total_users, icon: Users, color: "#fbbf24" },
    { label: "Estudiantes", value: apiStats.total_students, icon: GraduationCap, color: "#34d399" },
    { label: "Docentes activos", value: apiStats.total_teachers, icon: BookOpen, color: "#fb7185" },
    { label: "Padres de familia", value: apiStats.total_parents, icon: HeartHandshake, color: "#c084fc" },
    { label: "Personal administrativo", value: apiStats.total_staff, icon: Users, color: "#fb923c" },
  ];

  return (
    <StatsOverview
      title="Panel General"
      description="Resumen estadístico y métricas poblacionales de la institución"
      stats={stats}
      isLoading={isLoading}
      barTitle="Distribución poblacional"
      pieTitle="Proporción de personas"
    />
  );
}
