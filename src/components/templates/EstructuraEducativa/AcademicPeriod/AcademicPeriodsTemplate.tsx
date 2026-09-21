import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";
import { Url } from "../../../../url";
import Swal from "sweetalert2";
import { CalendarRange, Calendar, Clock } from "lucide-react";

import CreateAcademicPeriods from "../../../organisms/estructuraEducativa/AcademicPeriod/CreateAcademicPeriods";
import EditAcademicPeriods from "../../../organisms/estructuraEducativa/AcademicPeriod/EditAcademicPeriods";
import Headerpag from "../../../atoms/Headerpag";
import ButtonEd from "../../../atoms/ButtonEd";
import SearchB from "../../../atoms/SearchB";
import Tabla, { type TableColumn } from "../../../atoms/Tabla";

export interface AcademicPeriodData {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  status: string;
  year: number;
  fk_school_id: number;
}

export default function AcademicPeriodsTemplate() {
  const { persona } = useAuth();
  
  const [periods, setPeriods] = useState<AcademicPeriodData[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Estados para modales y carga
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenEditar, setIsModalOpenEditar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectPeriod, setSelectPeriod] = useState<AcademicPeriodData | null>(null);

  // Función para obtener los periodos académicos por escuela
  const getPeriods = async () => {
    if (!persona?.fk_school_id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(`${Url}/periodos?fk_school_id=${persona.fk_school_id}`);
      setPeriods(response.data.data || []);
    } catch (error) {
      console.error("❌ Error al obtener los periodos académicos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getPeriods();
  }, [persona?.fk_school_id]);

  // Función para eliminar un Periodo Académico
  const handleDelete = async (periodId: number) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "El periodo académico será eliminado permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      background: '#15151c',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${Url}/periodos/${periodId}`);
        getPeriods();
        await Swal.fire({
          icon: "success",
          title: "¡ELIMINADO!",
          text: "El periodo académico fue eliminado con éxito.",
          confirmButtonColor: "#7c3aed",
          background: '#15151c',
          color: '#fff'
        });
      } catch (error: any) {
        console.error("❌ Error al eliminar el periodo:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.error || "Error interno del servidor",
          background: '#15151c',
          color: '#fff'
        });
      }
    }
  };

  // Filtrado de la tabla
  const filteredPeriods = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    return periods.filter((p) =>
      (p.name || "").toLowerCase().includes(lowerSearch) ||
      (p.status || "").toLowerCase().includes(lowerSearch) ||
      String(p.year || "").includes(lowerSearch)
    );
  }, [search, periods]);

  // Lógica de Paginación
  const totalPages = Math.ceil(filteredPeriods.length / itemsPerPage);
  const paginatedPeriods = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPeriods.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPeriods, currentPage]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  // Función auxiliar para formatear fechas visualmente
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const [year, month, day] = dateString.split("T")[0].split("-");
    return `${day}/${month}/${year}`;
  };

  const columns: TableColumn<AcademicPeriodData>[] = [
    {
      key: "period",
      label: "Periodo",
      render: (period) => (
        <div className="flex items-center gap-2">
          <CalendarRange size={16} />
          <span className="font-black text-black">{period.name}</span>
        </div>
      ),
    },
    {
      key: "year",
      label: "Año",
      render: (period) => <span className="font-bold text-black">{period.year}</span>,
    },
    {
      key: "dates",
      label: "Fechas (Inicio - Fin)",
      render: (period) => (
        <div className="flex items-center gap-1.5 text-black/70">
          <Calendar size={14} />
          <span>{formatDate(period.start_date)} al {formatDate(period.end_date)}</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Estado",
      render: (period) => (
        <span className={`inline-flex items-center gap-1.5 border-2 border-black px-2 py-1 text-xs font-black text-black ${
          period.status === "Activo" ? "bg-[#a7e8bd]" : "bg-[#d9d9d9]"
        }`}>
          <Clock size={12} />
          {period.status || "Inactivo"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Acciones",
      align: "right",
      render: (period) => <div className="flex justify-end gap-2">
        <button type="button" onClick={() => { setSelectPeriod(period); setIsModalOpenEditar(true); }} className="border-2 border-black bg-[#ffd43b] px-3 py-1 font-black text-black shadow-[2px_2px_0_0_#111111] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none">Editar</button>
        <button type="button" onClick={() => handleDelete(period.id)} className="border-2 border-black bg-[#ff6b6b] px-3 py-1 font-black text-black shadow-[2px_2px_0_0_#111111] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none">Eliminar</button>
      </div>,
    },
  ];


  return (
    <div className="p-6 text-gray-100 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header y Acciones */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <Headerpag text1="Periodos Académicos" text2="Administra los años lectivos, trimestres o semestres de la institución."/>     
          <ButtonEd text="+ Crear Periodo" onClick={() => setIsModalOpen(true)}/>
        </div>

        {/* Barra de Búsqueda */}
        <SearchB text="Buscar por nombre, año o estado..." search={search} handleSearch={handleSearch}/>

        <Tabla columns={columns} data={paginatedPeriods} rowKey={(period => period.id)} isLoading={isLoading} 
               emptyMessage="No se encontraron periodos" currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage}/>


        {/* Modales */}
        <CreateAcademicPeriods 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={getPeriods} 
        />
        <EditAcademicPeriods
          isOpen={isModalOpenEditar}
          onClose={() => setIsModalOpenEditar(false)}
          onSuccess={getPeriods}
          period={selectPeriod}
        />
      </div>
    </div>
  );
}