import axios from "axios";
import { useState, useMemo, useEffect } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { Url } from "../../../../url.ts";
import Swal from "sweetalert2";
import ButtonEd from "../../../atoms/ButtonEd.tsx";
import SearchB from "../../../atoms/SearchB.tsx";
import Headerpag from "../../../atoms/Headerpag.tsx";
import Tabla, { type TableColumn } from "../../../atoms/Tabla.tsx";

// Importa tus modales de Apoderados
import CreateParentModal from "../../../organisms/personas/parents/CreateParent.tsx";
import EditParentModal from "../../../organisms/personas/parents/EditParent.tsx";

export interface ParentData {
  parent_id: number;
  person_id: number;
  name: string;
  dni: string;
  email: string;
  address: string;
  occupation: string;
  student_id: number;
  student_name: string;
  student_dni: string;
  relation_id: number; 
}

export default function ParentTemplate() {
  const { persona } = useAuth();
  
  const [parents, setParents] = useState<ParentData[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Estados para modales y carga
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenEditar, setIsModalOpenEditar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectParent, setSelectParent] = useState<ParentData | null>(null);

  // Función optimizada para obtener los apoderados (con la consulta unificada del backend)
  const GetParents = async () => {
    if (!persona?.fk_school_id) return; 

    setIsLoading(true);
    
    try {
      const response = await axios.get(`${Url}/parents?fk_school_id=${persona.fk_school_id}`);
      const data = response.data.data || response.data;
      
      // Como el backend ya hace el JOIN completo, guardamos directo el arreglo
      setParents(data);
    } catch (error) {
       console.error("❌ Error al obtener los apoderados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    GetParents();
  }, [persona?.fk_school_id]);

  // Función para eliminar Apoderado
  const handleDelete = async (personId: number) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará al apoderado y sus vínculos de forma permanente.",
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
        await axios.delete(`${Url}/parents/${personId}`);
        GetParents();
        await Swal.fire({
          icon: "success",
          title: "¡ELIMINADO!",
          text: "El apoderado fue eliminado correctamente.",
          confirmButtonColor: "#7c3aed",
          background: '#15151c',
          color: '#fff'
        });
      } catch (error: any) {
        console.error("❌ Error al eliminar el apoderado:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.error || "Error al intentar eliminar el apoderado",
          background: '#15151c',
          color: '#fff'
        });
      }
    }
  };

  // Filtrado Multicampo
  const filteredParents = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    
    return (parents || []).filter((parent) => {
      const matchName = (parent.name || "").toLowerCase().includes(lowerSearch);
      const matchDni = (parent.dni || "").toLowerCase().includes(lowerSearch);
      const matchEmail = (parent.email || "").toLowerCase().includes(lowerSearch);
      const matchOccupation = (parent.occupation || "").toLowerCase().includes(lowerSearch);
      const matchStudent = (parent.student_name || "").toLowerCase().includes(lowerSearch);

      return matchName || matchDni || matchEmail || matchOccupation || matchStudent; 
    });
  }, [search, parents]);

  // Paginación
  const totalPages = Math.ceil(filteredParents.length / itemsPerPage);
  const paginatedParents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredParents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredParents, currentPage]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const columns: TableColumn<ParentData>[] = [
    { key: "parent", label: "Apoderado", render: (parent) => <div><div className="font-black text-black">{parent.name}</div><div className="mt-1 text-xs text-black/60">DNI: {parent.dni}</div></div> },
    { key: "contact", label: "Contacto", render: (parent) => <div><div className="font-bold text-black">{parent.email || "Sin correo"}</div><div className="mt-1 max-w-50 truncate text-xs text-black/60">{parent.address || "Sin dirección"}</div></div> },
    { key: "occupation", label: "Ocupación", render: (parent) => <span className="font-bold text-black">{parent.occupation || "No especificada"}</span> },
    { key: "student", label: "Estudiante vinculado", render: (parent) => <span className="inline-block border-2 border-black bg-[#a7e8bd] px-2 py-1 text-xs font-black text-black">{parent.student_name || "Sin estudiante"}</span> },
    { key: "actions", label: "Acciones", align: "right", render: (parent) => <div className="flex justify-end gap-2"><button type="button" onClick={() => { setSelectParent(parent); setIsModalOpenEditar(true); }} className="border-2 border-black bg-[#ffd43b] px-3 py-1 font-black text-black shadow-[2px_2px_0_0_#111111] hover:shadow-none">Editar</button><button type="button" onClick={() => handleDelete(parent.person_id)} className="border-2 border-black bg-[#ff6b6b] px-3 py-1 font-black text-black shadow-[2px_2px_0_0_#111111] hover:shadow-none">Eliminar</button></div> },
  ];

  return (
    <div className="p-6 text-gray-100 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header y Acciones */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <Headerpag text1="Gestión de Apoderados" text2="Administra los parientes y su vinculación con los estudiantes." />
          <ButtonEd onClick={() => setIsModalOpen(true)} text="+ Registrar Apoderado" />
        </div>

        {/* Barra de Búsqueda */}
        <SearchB text="BUSCAR POR APODERADO, DNI, OCUPACIÓN O ESTUDIANTE..." search={search} handleSearch={handleSearch} />

        <Tabla columns={columns} data={paginatedParents} rowKey={(parent) => parent.parent_id} isLoading={isLoading} emptyMessage="No se encontraron apoderados registrados" currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />


        {/* Modales */}
        <CreateParentModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={GetParents} 
        />
        <EditParentModal
          isOpen={isModalOpenEditar}
          onClose={() => setIsModalOpenEditar(false)}
          onSuccess={GetParents}
          parent={selectParent}
        />
      </div>
    </div>
  );
}