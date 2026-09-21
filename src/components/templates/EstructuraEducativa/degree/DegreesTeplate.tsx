import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";
import { Url } from "../../../../url";
import Swal from "sweetalert2";
import { BookOpen, Layers } from "lucide-react";

import CreateDegrees from "../../../organisms/estructuraEducativa/degrees/CreateDegrees";
import EditDegrees from "../../../organisms/estructuraEducativa/degrees/EditDegrees";
import Tabla, { type TableColumn } from "../../../atoms/Tabla";
import Headerpag from "../../../atoms/Headerpag";
import ButtonEd from "../../../atoms/ButtonEd";
import SearchB from "../../../atoms/SearchB";

export interface DegreeData {
  id: number;
  name: string;
  fk_levels: number;
  level_name: string;
}

export default function DegreesTemplate() {
  const { persona } = useAuth();
  
  const [degrees, setDegrees] = useState<DegreeData[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Estados para modales y carga
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenEditar, setIsModalOpenEditar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectDegree, setSelectDegree] = useState<DegreeData | null>(null);

  // Función para obtener los grados
  const getDegrees = async () => {
    if (!persona?.fk_school_id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Ajusta la ruta base según tu index.js (asumimos /degrees)
      const response = await axios.get(`${Url}/degrees?fk_school_id=${persona.fk_school_id}`);
      setDegrees(response.data.data || []);
    } catch (error) {
      console.error("❌ Error al obtener los grados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getDegrees();
  }, [persona?.fk_school_id]);

  // Función para eliminar un Grado
  const handleDelete = async (degreeId: number) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "El grado será eliminado permanentemente del sistema.",
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
        await axios.delete(`${Url}/degrees/${degreeId}`);
        getDegrees(); // Recargamos la tabla
        await Swal.fire({
          icon: "success",
          title: "¡ELIMINADO!",
          text: "El grado fue eliminado con éxito.",
          confirmButtonColor: "#7c3aed",
          background: '#15151c',
          color: '#fff'
        });
      } catch (error: any) {
        console.error("❌ Error al eliminar el grado:", error);
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

  // Filtrado de la tabla (Buscador por nombre de grado o nombre de nivel)
  const filteredDegrees = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    return degrees.filter((degree) =>
      (degree.name || "").toLowerCase().includes(lowerSearch) ||
      (degree.level_name || "").toLowerCase().includes(lowerSearch)
    );
  }, [search, degrees]);

  // Lógica de Paginación
  const totalPages = Math.ceil(filteredDegrees.length / itemsPerPage);
  const paginatedDegrees = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredDegrees.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredDegrees, currentPage]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reiniciar a la página 1 al buscar
  };

  const columns: TableColumn<DegreeData>[] = [
    {
      key: "id",
      label: "Identificador",
      render: (degree) => <span className="font-mono text-xs font-bold text-black/60">#{degree.id}</span>,
    },
    {
      key: "degree",
      label: "Grado Académico",
      render: (degree) => (
        <div className="flex items-center gap-2">
          <BookOpen size={16} />
          <span className="font-black text-black">{degree.name}</span>
        </div>
      ),
    },
    {
      key: "level",
      label: "Nivel Asociado",
      render: (degree) => (
        <span className="inline-flex items-center gap-1.5 border-2 border-black bg-[#a7e8bd] px-2 py-1 text-xs font-black text-black">
          <Layers size={12} />
          {degree.level_name}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Acciones",
      align: "right",
      render: (degree) => (
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => { setSelectDegree(degree); setIsModalOpenEditar(true); }} className="border-2 border-black bg-[#ffd43b] px-3 py-1 font-black text-black shadow-[2px_2px_0_0_#111111] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none">Editar</button>
          <button type="button" onClick={() => handleDelete(degree.id)} className="border-2 border-black bg-[#ff6b6b] px-3 py-1 font-black text-black shadow-[2px_2px_0_0_#111111] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none">Eliminar</button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 text-gray-100 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header y Acciones */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Headerpag text1="Gestión de Grados" text2="Administra los grados académicos y asígnalos a sus respectivos niveles."/>
          <ButtonEd text="+ Crear Grado" onClick={() => setIsModalOpen(true)}/>
        </div>

        {/* Barra de Búsqueda */}
        <SearchB text="Buscar por nombre de grado o nivel..." search={search} handleSearch={handleSearch}/>

        <Tabla columns={columns} data={paginatedDegrees} rowKey={(degree) => degree.id} isLoading={isLoading} emptyMessage="No se encontraron grados registrados" currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />


        {/* Modales */}
        <CreateDegrees 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={getDegrees} 
        />
        <EditDegrees
          isOpen={isModalOpenEditar}
          onClose={() => setIsModalOpenEditar(false)}
          onSuccess={getDegrees}
          degree={selectDegree}
        />
      </div>
    </div>
  );
}