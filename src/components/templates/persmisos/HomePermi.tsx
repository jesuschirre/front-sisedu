import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { Url } from '../../../url.ts';
import { ShieldCheck, KeyRound, LayoutGrid } from 'lucide-react';
import StatsOverview, { type DashboardStat } from '../../atoms/StatsOverview';

export default function HomePermi() {
  const { persona } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [apiStats, setApiStats] = useState({
    total_roles: 0,
    total_permissions: 0,
    total_modules: 0
  });

  useEffect(() => {
    const fetchSecurityStats = async () => {
      if (!persona?.fk_school_id) return;
      
      setIsLoading(true);
      try {
        const res = await axios.get(`${Url}/rolsta?fk_school_id=${persona.fk_school_id}`);
        setApiStats(res.data.data);
      } catch (error) {
        console.error("❌ Error al obtener las estadísticas de seguridad:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSecurityStats();
  }, [persona?.fk_school_id]);

  const stats: DashboardStat[] = [
    { label: "Roles de Sistema", value: apiStats.total_roles, icon: ShieldCheck, color: "#a855f7" },
    { label: "Permisos Definidos", value: apiStats.total_permissions, icon: KeyRound, color: "#34d399" },
    { label: "Módulos Activos", value: apiStats.total_modules, icon: LayoutGrid, color: "#60a5fa" }
  ];

  return <StatsOverview title="Panel General" description="Resumen estadístico y métricas de permisos en la institución" stats={stats} isLoading={isLoading} barTitle="Estructura del sistema" pieTitle="Proporción interna" />;
}