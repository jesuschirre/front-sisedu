import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";
import { Url } from "../../../../url";
import Swal from "sweetalert2";
import { BookOpen } from "lucide-react";

import CreateCourse from "../../../organisms/estructuraEducativa/curses/CreateCourse";
import EditCourse from "../../../organisms/estructuraEducativa/curses/EditCourse";
import Headerpag from "../../../atoms/Headerpag";
import ButtonEd from "../../../atoms/ButtonEd";
import SearchB from "../../../atoms/SearchB";
import Tabla, { type TableColumn } from "../../../atoms/Tabla";

export interface CourseData {
  id: number;
  name: string;
  description: string;
  fk_school_id: number;
}

export default function CursesTemplate() {
  const { persona } = useAuth();
  
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Estados para modales y carga
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenEditar, setIsModalOpenEditar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectCourse, setSelectCourse] = useState<CourseData | null>(null);

  const getCourses = async () => {
    if (!persona?.fk_school_id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(`${Url}/courses?fk_school_id=${persona.fk_school_id}`);
      setCourses(response.data.data || response.data || []);
    } catch (error) {
      console.error("❌ Error al obtener los cursos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getCourses();
  }, [persona?.fk_school_id]);

  const handleDelete = async (courseId: number) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "El curso será eliminado permanentemente.",
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
        await axios.delete(`${Url}/courses/${courseId}`);
        await getCourses();
        await Swal.fire({
          icon: "success",
          title: "¡ELIMINADO!",
          text: "El curso fue eliminado con éxito.",
          confirmButtonColor: "#7c3aed",
          background: '#15151c',
          color: '#fff'
        });
      } catch (error: any) {
        console.error("❌ Error al eliminar el curso:", error);
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

  const filteredCourses = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    return courses.filter((course) =>
      [course.name, course.description].some((value) => (value || "").toLowerCase().includes(lowerSearch))
    );
  }, [search, courses]);

  // Lógica de Paginación
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCourses.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCourses, currentPage]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const columns: TableColumn<CourseData>[] = [
    {
      key: "course",
      label: "Curso",
      render: (course) => (
        <div className="flex items-center gap-2">
          <BookOpen size={16} />
          <div><div className="font-black text-black">{course.name}</div><div className="mt-1 max-w-md truncate text-xs text-black/60">{course.description || "Sin descripción"}</div></div>
        </div>
      ),
    },
    {
      key: "description",
      label: "Descripción",
      render: (course) => <span className="text-black/70">{course.description || "Sin descripción"}</span>,
    },
    {
      key: "actions",
      label: "Acciones",
      align: "right",
      render: (course) => <div className="flex justify-end gap-2">
        <button type="button" onClick={() => { setSelectCourse(course); setIsModalOpenEditar(true); }} className="border-2 border-black bg-[#ffd43b] px-3 py-1 font-black text-black shadow-[2px_2px_0_0_#111111] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none">Editar</button>
        <button type="button" onClick={() => handleDelete(course.id)} className="border-2 border-black bg-[#ff6b6b] px-3 py-1 font-black text-black shadow-[2px_2px_0_0_#111111] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none">Eliminar</button>
      </div>,
    },
  ];


  return (
    <div className="p-6 text-gray-100 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header y Acciones */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <Headerpag text1="Cursos Académicos" text2="Administra los cursos de la institución."/>     
          <ButtonEd text="+ Crear Curso" onClick={() => setIsModalOpen(true)}/>
        </div>

        {/* Barra de Búsqueda */}
         <SearchB text="BUSCAR POR NOMBRE O DESCRIPCIÓN..." search={search} handleSearch={handleSearch}/>

         <Tabla columns={columns} data={paginatedCourses} rowKey={(course) => course.id} isLoading={isLoading} 
           emptyMessage="No se encontraron cursos" currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage}/>


        {/* Modales */}
        <CreateCourse 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={getCourses} 
        />
        <EditCourse
          isOpen={isModalOpenEditar}
          onClose={() => setIsModalOpenEditar(false)}
          onSuccess={getCourses}
          course={selectCourse}
        />
      </div>
    </div>
  );
}