import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { useAuth } from "../../../context/AuthContext";
import { Url } from "../../../url";
import ButtonEd from "../../atoms/ButtonEd";
import Headerpag from "../../atoms/Headerpag";
import SearchB from "../../atoms/SearchB";
import Tabla, { type TableColumn } from "../../atoms/Tabla";
import CreateCalificacionModal from "../../organisms/calificacionesAsistencias/calificaciones/CreateCalificacion";
import EditCalificacionModal from "../../organisms/calificacionesAsistencias/calificaciones/EditCalificacion";

export interface CalificacionesData {
  id: number;
  nota: number;
  tipo_evaluacion: number;
  fk_student_id: number;
  fk_course_id: number;
  fk_academic_periods: number;
  fk_school_id: number;
  student_name: string;
  student_dni: string;
  curso_name: string;
  periodo_evaluacion_name: string;
}

export default function CalificacionesTemplate() {
  const { persona } = useAuth();
  const [calificaciones, setCalificaciones] = useState<CalificacionesData[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCalificacion, setSelectedCalificacion] = useState<CalificacionesData | null>(null);
  const itemsPerPage = 10;

  console.log(selectedCalificacion)
  const getCalificaciones = useCallback(async () => {
    if (!persona?.fk_school_id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.get(`${Url}/grades?fk_school_id=${persona.fk_school_id}`);
      setCalificaciones(response.data?.data || response.data || []);
    } catch (error) {
      console.error("Error al obtener las calificaciones:", error);
    } finally {
      setIsLoading(false);
    }
  }, [persona?.fk_school_id]);

  useEffect(() => {
    getCalificaciones();
  }, [getCalificaciones]);

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará la calificación permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${Url}/grades/${id}`);
      await getCalificaciones();
      await Swal.fire({ icon: "success", title: "¡ELIMINADA!", text: "La calificación fue eliminada correctamente.", confirmButtonColor: "#000000" });
    } catch (error: any) {
      await Swal.fire({ icon: "error", title: "Error al eliminar", text: error.response?.data?.error || "No se pudo eliminar la calificación." });
    }
  };

  const filteredCalificaciones = useMemo(() => {
    const query = search.toLowerCase();
    return calificaciones.filter((calificacion) => [
      calificacion.student_name,
      calificacion.student_dni,
      calificacion.curso_name,
      calificacion.periodo_evaluacion_name,
      String(calificacion.nota),
    ].some((value) => String(value || "").toLowerCase().includes(query)));
  }, [calificaciones, search]);

  const totalPages = Math.ceil(filteredCalificaciones.length / itemsPerPage);
  const paginatedCalificaciones = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCalificaciones.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, filteredCalificaciones]);

  const columns: TableColumn<CalificacionesData>[] = [
    { key: "student", label: "Estudiante", render: (item) => <div><div className="font-black text-black">{item.student_name || `Estudiante #${item.fk_student_id}`}</div><div className="mt-1 text-xs text-black/60">DNI: {item.student_dni || "-"}</div></div> },
    { key: "course", label: "Curso", render: (item) => <span className="font-bold text-black">{item.curso_name || `Curso #${item.fk_course_id}`}</span> },
    { key: "period", label: "Periodo", render: (item) => <span className="text-black">{item.periodo_evaluacion_name || item.fk_academic_periods || "-"}</span> },
    { key: "evaluation", label: "Evaluación", render: (item) => <span className="text-black">Tipo {item.tipo_evaluacion}</span> },
    { key: "grade", label: "Nota", render: (item) => <span className="inline-block border-2 border-black bg-[#a7e8bd] px-2 py-1 font-black text-black">{item.nota}</span> },
    { key: "actions", label: "Acciones", align: "right", render: (item) => <div className="flex justify-end gap-2"><button type="button" onClick={() => { setSelectedCalificacion(item); setIsEditOpen(true); }} className="border-2 border-black bg-[#ffd43b] px-3 py-1 font-black text-black shadow-[2px_2px_0_0_#111111] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none">Editar</button><button type="button" onClick={() => handleDelete(item.id)} className="border-2 border-black bg-[#ff6b6b] px-3 py-1 font-black text-black shadow-[2px_2px_0_0_#111111] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none">Eliminar</button></div> },
  ];

  return <div className="p-6 font-sans text-gray-100"><div className="mx-auto max-w-7xl space-y-8">
    <div className="flex flex-col items-center justify-between gap-4 md:flex-row"><Headerpag text1="Gestión de Calificaciones" text2="Registra y administra las notas de los estudiantes por curso y periodo." /><ButtonEd onClick={() => setIsCreateOpen(true)} text="+ Crear Calificación" /></div>
    <SearchB text="BUSCAR POR ESTUDIANTE, DNI, CURSO, PERIODO O NOTA..." search={search} handleSearch={(event) => { setSearch(event.target.value); setCurrentPage(1); }} />
    <Tabla columns={columns} data={paginatedCalificaciones} rowKey={(item) => item.id} isLoading={isLoading} emptyMessage="No se encontraron calificaciones" currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    <CreateCalificacionModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSuccess={getCalificaciones} />
    <EditCalificacionModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} onSuccess={getCalificaciones} calificacion={selectedCalificacion} />
  </div></div>;
}
