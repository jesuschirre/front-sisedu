import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { useAuth } from "../../../context/AuthContext";
import { Url } from "../../../url";
import ButtonEd from "../../atoms/ButtonEd";
import Headerpag from "../../atoms/Headerpag";
import SearchB from "../../atoms/SearchB";
import Tabla, { type TableColumn } from "../../atoms/Tabla";
import CreateMatriculaModal from "../../organisms/matriculas/CreateMatricula";
import EditMatriculaModal from "../../organisms/matriculas/EditMatricula";

export interface MatriculaData {
  id: number;
  date: string;
  status: string;
  fk_school_id: number;
  fk_student_id: number;
  fk_academic_periods: number;
  student_name?: string;
  student_dni?: string;
  period_name?: string;
}

export default function MatriculaTemplate() {
    
  const { persona } = useAuth();
  const [matriculas, setMatriculas] = useState<MatriculaData[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedMatricula, setSelectedMatricula] = useState<MatriculaData | null>(null);
  const itemsPerPage = 10;
    console.log(matriculas)
  const getMatriculas = useCallback(async () => {
    if (!persona?.fk_school_id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(`${Url}/enrollment?fk_school_id=${persona.fk_school_id}`);
      setMatriculas(response.data?.data || response.data || []);
    } catch (error) {
      console.error("Error al obtener las matrículas:", error);
    } finally {
      setIsLoading(false);
    }
  }, [persona?.fk_school_id]);

  useEffect(() => {
    getMatriculas();
  }, [getMatriculas]);

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará la matrícula permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${Url}/enrollment/${id}`);
      await getMatriculas();
      await Swal.fire({ icon: "success", title: "¡ELIMINADA!", text: "La matrícula fue eliminada correctamente.", confirmButtonColor: "#000000" });
    } catch (error: any) {
      await Swal.fire({ icon: "error", title: "Error al eliminar", text: error.response?.data?.error || "No se pudo eliminar la matrícula." });
    }
  };

  const filteredMatriculas = useMemo(() => {
    const query = search.toLowerCase();
    return matriculas.filter((matricula) => [
      matricula.student_name,
      matricula.student_dni,
      matricula.period_name,
      matricula.status,
      matricula.date,
    ].some((value) => String(value || "").toLowerCase().includes(query)));
  }, [matriculas, search]);

  const totalPages = Math.ceil(filteredMatriculas.length / itemsPerPage);
  const paginatedMatriculas = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMatriculas.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, filteredMatriculas]);

  const columns: TableColumn<MatriculaData>[] = [
    {
      key: "student",
      label: "Estudiante",
      render: (matricula) => <div><div className="font-black text-black">{matricula.student_name || `Estudiante #${matricula.fk_student_id}`}</div><div className="mt-1 text-xs text-black/60">DNI: {matricula.student_dni || "-"}</div></div>,
    },
    {
      key: "period",
      label: "Periodo académico",
      render: (matricula) => <span className="font-bold text-black">{matricula.period_name || `Periodo #${matricula.fk_academic_periods}`}</span>,
    },
    {
      key: "date",
      label: "Fecha",
      render: (matricula) => <span className="font-bold text-black">{matricula.date ? new Date(matricula.date).toLocaleDateString("es-PE") : "-"}</span>,
    },
    {
      key: "status",
      label: "Estado",
      render: (matricula) => <span className="inline-block border-2 border-black bg-[#a7e8bd] px-2 py-1 text-xs font-black text-black">{matricula.status || "Activo"}</span>,
    },
    {
      key: "actions",
      label: "Acciones",
      align: "right",
      render: (matricula) => <div className="flex justify-end gap-2"><button type="button" onClick={() => { setSelectedMatricula(matricula); setIsEditOpen(true); }} className="border-2 border-black bg-[#ffd43b] px-3 py-1 font-black text-black shadow-[2px_2px_0_0_#111111] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none">Editar</button><button type="button" onClick={() => handleDelete(matricula.id)} className="border-2 border-black bg-[#ff6b6b] px-3 py-1 font-black text-black shadow-[2px_2px_0_0_#111111] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none">Eliminar</button></div>,
    },
  ];

  return (
    <div className="p-6 text-gray-100 font-sans">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <Headerpag text1="Gestión de Matrículas" text2="Registra y administra la matrícula de los estudiantes por periodo académico." />
          <ButtonEd onClick={() => setIsCreateOpen(true)} text="+ Crear Matrícula" />
        </div>
        <SearchB text="BUSCAR POR ESTUDIANTE, DNI, PERIODO O ESTADO..." search={search} handleSearch={(event) => { setSearch(event.target.value); setCurrentPage(1); }} />
        <Tabla columns={columns} data={paginatedMatriculas} rowKey={(matricula) => matricula.id} isLoading={isLoading} emptyMessage="No se encontraron matrículas" currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        <CreateMatriculaModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSuccess={getMatriculas} />
        <EditMatriculaModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} onSuccess={getMatriculas} matricula={selectedMatricula} />
      </div>
    </div>
  );
}
