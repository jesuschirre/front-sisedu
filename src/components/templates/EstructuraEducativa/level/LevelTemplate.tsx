import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";
import { Url } from "../../../../url";
import Swal from "sweetalert2";
import { Layers } from "lucide-react";

// Importamos los modales de niveles
import CreateLevel from "../../../organisms/estructuraEducativa/levels/CreateLevel";
import EditLevel from "../../../organisms/estructuraEducativa/levels/EditLevel";
import Tabla, { type TableColumn } from "../../../atoms/Tabla";
import Headerpag from "../../../atoms/Headerpag";
import ButtonEd from "../../../atoms/ButtonEd";
import SearchB from "../../../atoms/SearchB";
// Interfaz para los datos de los niveles
export interface LevelData {
  id: number;
  name: string;
  fk_school_id: number;
}

export default function LevelTemplate() {
  const { persona } = useAuth();
  
  const [levels, setLevels] = useState<LevelData[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Estados para modales y carga
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenEditar, setIsModalOpenEditar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectLevel, setSelectLevel] = useState<LevelData | null>(null);

  // Función para obtener los niveles
  const getLevels = async () => {
    if (!persona?.fk_school_id ) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(`${Url}/level?fk_school_id=${persona.fk_school_id}`);
      setLevels(response.data.data || []);
    } catch (error) {
      console.error("❌ Error al obtener los niveles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getLevels();
  }, [persona?.fk_school_id]);

  const handleDelete = async (levelId: number) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "El nivel académico será eliminado permanentemente.",
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
        await axios.delete(`${Url}/level/${levelId}`);
        getLevels();
        await Swal.fire({
          icon: "success",
          title: "¡ELIMINADO!",
          text: "El nivel fue eliminado con éxito.",
          confirmButtonColor: "#7c3aed",
          background: '#15151c',
          color: '#fff'
        });
      } catch (error: any) {
        console.error("❌ Error al eliminar el nivel:", error);
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

  // Filtrado de la tabla (Buscador)
  const filteredLevels = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    return levels.filter((level) =>
      (level.name || "").toLowerCase().includes(lowerSearch)
    );
  }, [search, levels]);

  // Lógica de Paginación
  const totalPages = Math.ceil(filteredLevels.length / itemsPerPage);
  const paginatedLevels = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLevels.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLevels, currentPage]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const columns: TableColumn<LevelData>[] = [
    {
      key: "id",
      label: "Identificador",
      render: (level) => <span className="font-mono text-xs font-bold text-black/60">#{level.id}</span>,
    },
    {
      key: "level",
      label: "Nombre del Nivel",
      render: (level) => (
        <div className="flex items-center gap-2">
          <Layers size={16} />
          <span className="font-black text-black">{level.name}</span>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Acciones",
      align: "right",
      render: (level) => (
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => { setSelectLevel(level); setIsModalOpenEditar(true); }} className="border-2 border-black bg-[#ffd43b] px-3 py-1 font-black text-black shadow-[2px_2px_0_0_#111111] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none">Editar</button>
          <button type="button" onClick={() => handleDelete(level.id)} className="border-2 border-black bg-[#ff6b6b] px-3 py-1 font-black text-black shadow-[2px_2px_0_0_#111111] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none">Eliminar</button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 text-gray-100 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header y Acciones */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Headerpag text1="Niveles Académicos" text2="Administra los niveles de enseñanza de la institución educativa."/>
          <ButtonEd text="+ Crear Nivel" onClick={() => setIsModalOpen(true)}/>
        </div>

        {/* Barra de Búsqueda */}
        <SearchB text="Buscar nivel por nombre..." search={search} handleSearch={handleSearch}/>

        {/* Tabla */}
        <Tabla columns={columns} data={paginatedLevels} rowKey={(level) => level.id} isLoading={isLoading} 
        emptyMessage="No se encontraron niveles registrados" currentPage={currentPage} totalPages={totalPages} 
        onPageChange={setCurrentPage} />


        {/* Modales */}
        <CreateLevel 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={getLevels} 
        />
        <EditLevel
          isOpen={isModalOpenEditar}
          onClose={() => setIsModalOpenEditar(false)}
          onSuccess={getLevels}
          level={selectLevel}
        />
      </div>
    </div>
  );
}