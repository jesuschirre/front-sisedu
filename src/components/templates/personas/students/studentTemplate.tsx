import axios from "axios";
import { useState, useMemo, useEffect } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { Url } from "../../../../url.ts";
import Swal from "sweetalert2";
import ButtonEd from "../../../atoms/ButtonEd.tsx";
import SearchB from "../../../atoms/SearchB.tsx";
import Headerpag from "../../../atoms/Headerpag.tsx";
import Tabla, { type TableColumn } from "../../../atoms/Tabla.tsx";

// Se importa los modales
import CreateStudentModal from "../../../organisms/personas/students/CreateStudent.tsx";
import EditStudentModal from "../../../organisms/personas/students/EditStudent.tsx";

interface StudentData {
  student_id: number;
  person_id: number;
  name: string;
  dni: string;
  email: string;
  address: string;
  start_date: string;
  state: string
}

export default function StudentTemplate() {
  const { persona } = useAuth();
  
  const [students, setStudents] = useState<StudentData[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Estados para los modales y carga
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenEditar, setIsModalOpenEditar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectStudent, setSelectStudent] = useState<StudentData | null>(null);

  // Función para obtener los estudiantes
  const GetStudents = async () => {
    if (!persona?.fk_school_id) return; 

    setIsLoading(true);
    
    try {
      // Ajusta este endpoint según cómo lo hayas definido en tu backend
      const response = await axios.get(`${Url}/students?idSchool=${persona.fk_school_id}`);
      await new Promise((resolve) => setTimeout(resolve, 200)); // Pequeño delay para UX (opcional)
      setStudents(response.data.data); 
    } catch (error) {
       console.error("❌ Error al obtener los estudiantes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Efecto inicial
  useEffect(() => {
    GetStudents();
  }, [persona?.fk_school_id]);

  // Función para eliminar Estudiante
  const handleDelete = async (studentId: number) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará el registro del estudiante de forma permanente",
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
        await axios.delete(`${Url}/students/${studentId}`);
        GetStudents();
        await Swal.fire({
          icon: "success",
          title: "¡ELIMINADO!",
          text: "El estudiante fue eliminado correctamente.",
          confirmButtonColor: "#7c3aed",
          background: '#15151c',
          color: '#fff'
        });
      } catch (error: any) {
        console.error("❌ Error al eliminar el estudiante:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.error || "Error al intentar eliminar el estudiante",
          background: '#15151c',
          color: '#fff'
        });
      }
    }
  };

  // Filtrado Multicampo
  const filteredStudents = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    
    return (students || []).filter((student) => {
      const matchName = (student.name || "").toLowerCase().includes(lowerSearch);
      const matchDni = (student.dni || "").toLowerCase().includes(lowerSearch);
      const matchEmail = (student.email || "").toLowerCase().includes(lowerSearch);
      const matchState = (student.state || "").toLowerCase().includes(lowerSearch);

      return matchName || matchDni || matchEmail || matchState; 
    });
  }, [search, students]);

  // Paginación
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredStudents, currentPage]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };


  const columns: TableColumn<StudentData>[] = [
    { key: "student", label: "Estudiante", render: (student) => <div><div className="font-black text-black">{student.name}</div><div className="mt-1 text-xs text-black/60">DNI: {student.dni}</div></div> },
    { key: "contact", label: "Contacto", render: (student) => <div><div className="font-bold text-black">{student.email || "Sin correo"}</div><div className="mt-1 max-w-50 truncate text-xs text-black/60">{student.address || "Sin dirección"}</div></div> },
    { key: "start-date", label: "Ingreso", render: (student) => <span className="font-bold text-black">{student.start_date ? new Date(student.start_date).toLocaleDateString("es-PE") : "-"}</span> },
    { key: "state", label: "Estado", render: (student) => <span className="inline-block border-2 border-black bg-[#b8d8ff] px-2 py-1 text-xs font-black text-black">{student.state}</span> },
    { key: "actions", label: "Acciones", align: "right", render: (student) => <div className="flex justify-end gap-2"><button type="button" onClick={() => { setSelectStudent(student); setIsModalOpenEditar(true); }} className="border-2 border-black bg-[#ffd43b] px-3 py-1 font-black text-black shadow-[2px_2px_0_0_#111111] hover:shadow-none">Editar</button><button type="button" onClick={() => handleDelete(student.person_id)} className="border-2 border-black bg-[#ff6b6b] px-3 py-1 font-black text-black shadow-[2px_2px_0_0_#111111] hover:shadow-none">Eliminar</button></div> },
  ];

  return (
    <div className="p-6 text-gray-100 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header y Acciones */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <Headerpag text1="Gestión de Estudiantes" text2="Administra a los estudiantes y la información del alumnado." />
          <ButtonEd onClick={() => setIsModalOpen(true)} text="+ Registrar Estudiante" />
        </div>

        {/* Barra de Búsqueda */}
        <SearchB text="BUSCAR POR NOMBRE, DNI, EMAIL O ESTADO..." search={search} handleSearch={handleSearch} />
        {false && (<>
        <div className="relative w-full md:w-2/3 lg:w-1/2">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Busca por nombre, DNI, email o estado..."
            value={search}
            onChange={handleSearch}
            className="w-full pl-12 pr-4 py-3 bg-[#15151c] border border-gray-800 rounded-full focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all text-white placeholder-gray-500 shadow-inner"
          />
        </div>
        </>)}
        <Tabla columns={columns} data={paginatedStudents} rowKey={(student) => student.student_id} isLoading={isLoading} emptyMessage="No se encontraron estudiantes registrados" currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

        {/* Modales */}
        <CreateStudentModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={GetStudents} 
        />
        <EditStudentModal
          isOpen={isModalOpenEditar}
          onClose={() => setIsModalOpenEditar(false)}
          onSuccess={GetStudents}
          student={selectStudent}
        />
      </div>
    </div>
  );
}