import axios from "axios";
import { useState, useMemo, useEffect } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { Url } from "../../../../url.ts";
import Swal from "sweetalert2";
import ButtonEd from "../../../atoms/ButtonEd.tsx";
import SearchB from "../../../atoms/SearchB.tsx";
import Headerpag from "../../../atoms/Headerpag.tsx";
import Tabla, { type TableColumn } from "../../../atoms/Tabla.tsx";

// Se importa los modales del docente
import CreateTeacherModal from "../../../organisms/personas/teachers/CreateTeacher.tsx"; 
import EditTeacherModal from "../../../organisms/personas/teachers/EditTeacher.tsx";

interface TeacherData {
  teacher_id: number;
  person_id: number;
  name: string;
  dni: string;
  email: string;
  address: string;
  hiring_date: string;
  specialty: string;
  state:string
}

export default function TeacherTemplate() {
  const { persona } = useAuth();
  
  const [teachers, setTeachers] = useState<TeacherData[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Estados para los modales y la carga
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenEditar, setIsModalOpenEditar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectTeacher, setSelectTeacher] = useState<TeacherData | null>(null);

  // Función para obtener los docentes
  const GetTeachers = async () => {
    if (!persona?.fk_school_id) return; 

    setIsLoading(true);
    
    try {
      // Usamos el parámetro fk_school_id tal como lo espera el req.query de tu backend
      const response = await axios.get(`${Url}/teachers?fk_school_id=${persona.fk_school_id}`);
      await new Promise((resolve) => setTimeout(resolve, 200)); 
      setTeachers(response.data.data || response.data); 
    } catch (error) {
       console.error("❌ Error al obtener los docentes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    GetTeachers();
  }, [persona?.fk_school_id]);

  const handleDelete = async (personId: number) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Se eliminará toda la información personal y profesional de este docente permanentemente.",
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
        await axios.delete(`${Url}/teachers/${personId}`);
        GetTeachers();
        await Swal.fire({
          icon: "success",
          title: "¡ELIMINADO!",
          text: "El docente fue eliminado correctamente.",
          confirmButtonColor: "#7c3aed",
          background: '#15151c',
          color: '#fff'
        });
      } catch (error: any) {
        console.error("❌ Error al eliminar el docente:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.error || "Error al intentar eliminar el docente",
          background: '#15151c',
          color: '#fff'
        });
      }
    }
  };

  // Filtrado Multicampo
  const filteredTeachers = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    
    return (teachers || []).filter((teacher) => {
      const matchName = (teacher.name || "").toLowerCase().includes(lowerSearch);
      const matchDni = (teacher.dni || "").toLowerCase().includes(lowerSearch);
      const matchEmail = (teacher.email || "").toLowerCase().includes(lowerSearch);
      const matchSpecialty = (teacher.specialty || "").toLowerCase().includes(lowerSearch);
      const matchState = (teacher.state || "").toLowerCase().includes(lowerSearch);

      return matchName || matchDni || matchEmail || matchSpecialty || matchState; 
    });
  }, [search, teachers]);

  // Paginación
  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);
  const paginatedTeachers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTeachers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTeachers, currentPage]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const columns: TableColumn<TeacherData>[] = [
    { key: "teacher", label: "Docente", render: (teacher) => <div><div className="font-black text-black">{teacher.name}</div><div className="mt-1 text-xs text-black/60">DNI: {teacher.dni}</div></div> },
    { key: "contact", label: "Contacto", render: (teacher) => <div><div className="font-bold text-black">{teacher.email || "Sin correo"}</div><div className="mt-1 max-w-50 truncate text-xs text-black/60">{teacher.address || "Sin dirección"}</div></div> },
    { key: "professional", label: "Profesional", render: (teacher) => <div><div className="font-bold text-black">{teacher.specialty || "Sin especialidad"}</div><div className="mt-1 text-xs text-black/60">Ingreso: {teacher.hiring_date ? new Date(teacher.hiring_date).toLocaleDateString("es-PE") : "-"}</div></div> },
    { key: "state", label: "Estado", render: (teacher) => <span className="inline-block border-2 border-black bg-[#b8d8ff] px-2 py-1 text-xs font-black text-black">{teacher.state}</span> },
    { key: "actions", label: "Acciones", align: "right", render: (teacher) => <div className="flex justify-end gap-2"><button type="button" onClick={() => { setSelectTeacher(teacher); setIsModalOpenEditar(true); }} className="border-2 border-black bg-[#ffd43b] px-3 py-1 font-black text-black shadow-[2px_2px_0_0_#111111] hover:shadow-none">Editar</button><button type="button" onClick={() => handleDelete(teacher.person_id)} className="border-2 border-black bg-[#ff6b6b] px-3 py-1 font-black text-black shadow-[2px_2px_0_0_#111111] hover:shadow-none">Eliminar</button></div> },
  ];

  return (
    <div className="p-6 text-gray-100 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header y Acciones */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <Headerpag text1="Gestión de Docentes" text2="Administra la plantilla de profesores y sus especialidades." />
          <ButtonEd onClick={() => setIsModalOpen(true)} text="+ Registrar Docente" />
        </div>

        {/* Barra de Búsqueda */}
        <SearchB text="BUSCAR POR NOMBRE, DNI, ESPECIALIDAD O ESTADO..." search={search} handleSearch={handleSearch} />
        {false && (<>
        <div className="relative w-full md:w-2/3 lg:w-1/2">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Busca por nombre, DNI, especialidad, estado..."
            value={search}
            onChange={handleSearch}
            className="w-full pl-12 pr-4 py-3 bg-[#15151c] border border-gray-800 rounded-full focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all text-white placeholder-gray-500 shadow-inner"
          />
        </div>
        </>)}
        <Tabla columns={columns} data={paginatedTeachers} rowKey={(teacher) => teacher.teacher_id} isLoading={isLoading} emptyMessage="No se encontraron docentes registrados" currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

        {/* Modales */}
        <CreateTeacherModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={GetTeachers} 
        />
        <EditTeacherModal
          isOpen={isModalOpenEditar}
          onClose={() => setIsModalOpenEditar(false)}
          onSuccess={GetTeachers}
          teacher={selectTeacher}
        />
      </div>
    </div>
  );
}