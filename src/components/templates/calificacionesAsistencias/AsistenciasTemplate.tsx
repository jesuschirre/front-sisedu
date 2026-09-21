import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { useAuth } from "../../../context/AuthContext";
import { Url } from "../../../url";
import ButtonEd from "../../atoms/ButtonEd";
import Headerpag from "../../atoms/Headerpag";
import SearchB from "../../atoms/SearchB";
import Tabla, { type TableColumn } from "../../atoms/Tabla";
import CreateAsistenciaModal from "../../organisms/calificacionesAsistencias/asistencias/CreateAsistencia";
import EditAsistenciaModal from "../../organisms/calificacionesAsistencias/asistencias/EditAsistencia";

export interface AsistenciaData {
  id: number;
  fk_student_id: number;
  date: string;
  status: string;
  fk_school_id: number;
  student_name: string;
  student_dni: string;
}

export default function AsistenciasTemplate() {
  const { persona } = useAuth();
  const [asistencias, setAsistencias] = useState<AsistenciaData[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedAsistencia, setSelectedAsistencia] = useState<AsistenciaData | null>(null);
  const itemsPerPage = 10;

  const getAsistencias = useCallback(async () => {
    if (!persona?.fk_school_id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.get(`${Url}/attendance?fk_school_id=${persona.fk_school_id}`);
      setAsistencias(response.data?.data || response.data || []);
    } catch (error) {
      console.error("Error al obtener las asistencias:", error);
    } finally {
      setIsLoading(false);
    }
  }, [persona?.fk_school_id]);

  useEffect(() => {
    getAsistencias();
  }, [getAsistencias]);

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({ title: "¿Estás seguro?", text: "Esta acción eliminará la asistencia permanentemente.", icon: "warning", showCancelButton: true, confirmButtonColor: "#d33", cancelButtonColor: "#3085d6", confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar" });
    if (!result.isConfirmed) return;
    try {
      await axios.delete(`${Url}/attendance/${id}`);
      await getAsistencias();
      await Swal.fire({ icon: "success", title: "¡ELIMINADA!", text: "La asistencia fue eliminada correctamente.", confirmButtonColor: "#000000" });
    } catch (error: any) {
      await Swal.fire({ icon: "error", title: "Error al eliminar", text: error.response?.data?.error || "No se pudo eliminar la asistencia." });
    }
  };

  const filteredAsistencias = useMemo(() => {
    const query = search.toLowerCase();
    return asistencias.filter((asistencia) => [asistencia.student_name, asistencia.student_dni, asistencia.status, asistencia.date].some((value) => String(value || "").toLowerCase().includes(query)));
  }, [asistencias, search]);

  const totalPages = Math.ceil(filteredAsistencias.length / itemsPerPage);
  const paginatedAsistencias = useMemo(() => filteredAsistencias.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [currentPage, filteredAsistencias]);

  const columns: TableColumn<AsistenciaData>[] = [
    { key: "student", label: "Estudiante", render: (item) => <div><div className="font-black text-black">{item.student_name || `Estudiante #${item.fk_student_id}`}</div><div className="mt-1 text-xs text-black/60">DNI: {item.student_dni || "-"}</div></div> },
    { key: "date", label: "Fecha", render: (item) => <span className="font-bold text-black">{item.date ? new Date(item.date).toLocaleDateString("es-PE") : "-"}</span> },
    { key: "status", label: "Estado", render: (item) => <span className={`inline-block border-2 border-black px-2 py-1 text-xs font-black text-black ${item.status.toLowerCase() === "presente" ? "bg-[#a7e8bd]" : item.status.toLowerCase() === "tarde" ? "bg-[#ffd43b]" : "bg-[#ffb4b4]"}`}>{item.status || "-"}</span> },
    { key: "actions", label: "Acciones", align: "right", render: (item) => <div className="flex justify-end gap-2"><button type="button" onClick={() => { setSelectedAsistencia(item); setIsEditOpen(true); }} className="border-2 border-black bg-[#ffd43b] px-3 py-1 font-black text-black shadow-[2px_2px_0_0_#111111] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none">Editar</button><button type="button" onClick={() => handleDelete(item.id)} className="border-2 border-black bg-[#ff6b6b] px-3 py-1 font-black text-black shadow-[2px_2px_0_0_#111111] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none">Eliminar</button></div> },
  ];

  return <div className="p-6 font-sans text-gray-100"><div className="mx-auto max-w-7xl space-y-8">
    <div className="flex flex-col items-center justify-between gap-4 md:flex-row"><Headerpag text1="Gestión de Asistencias" text2="Registra y administra la asistencia de los estudiantes." /><ButtonEd onClick={() => setIsCreateOpen(true)} text="+ Registrar Asistencia" /></div>
    <SearchB text="BUSCAR POR ESTUDIANTE, DNI, FECHA O ESTADO..." search={search} handleSearch={(event) => { setSearch(event.target.value); setCurrentPage(1); }} />
    <Tabla columns={columns} data={paginatedAsistencias} rowKey={(item) => item.id} isLoading={isLoading} emptyMessage="No se encontraron asistencias" currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    <CreateAsistenciaModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSuccess={getAsistencias} />
    <EditAsistenciaModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} onSuccess={getAsistencias} asistencia={selectedAsistencia} />
  </div></div>;
}
