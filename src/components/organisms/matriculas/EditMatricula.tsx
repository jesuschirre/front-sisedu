import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "../../../context/AuthContext";
import { Url } from "../../../url";
import Modal from "../../atoms/Modal";
import type { MatriculaData } from "../../templates/matriculas/MatriculaTemplate";

interface EditMatriculaProps { isOpen: boolean; onClose: () => void; onSuccess: () => void; matricula: MatriculaData | null; }
interface StudentOption { student_id: number; name: string; dni: string; }
interface PeriodOption { id: number; name: string; year: number; }

export default function EditMatriculaModal({ isOpen, onClose, onSuccess, matricula }: EditMatriculaProps) {
  const { persona } = useAuth();
  const [formData, setFormData] = useState({ fk_student_id: "", fk_academic_periods: "", date: "", status: "Activo" });
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [periods, setPeriods] = useState<PeriodOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (matricula && isOpen) {
      setFormData({ fk_student_id: String(matricula.fk_student_id), fk_academic_periods: String(matricula.fk_academic_periods), date: matricula.date ? matricula.date.split("T")[0] : "", status: matricula.status || "Activo" });
      setErrorMsg("");
    }
  }, [isOpen, matricula]);

  useEffect(() => {
    if (!isOpen || !persona?.fk_school_id) return;
    Promise.all([axios.get(`${Url}/students?idSchool=${persona.fk_school_id}`), axios.get(`${Url}/periodos?fk_school_id=${persona.fk_school_id}`)])
      .then(([studentsResponse, periodsResponse]) => { setStudents(studentsResponse.data?.data || studentsResponse.data || []); setPeriods(periodsResponse.data?.data || periodsResponse.data || []); })
      .catch(() => setErrorMsg("No se pudieron cargar los estudiantes y periodos académicos."));
  }, [isOpen, persona?.fk_school_id]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!matricula || !formData.fk_student_id || !formData.fk_academic_periods) { setErrorMsg("Selecciona un estudiante y un periodo académico."); return; }
    setIsLoading(true);
    try {
      await axios.put(`${Url}/enrollment/${matricula.id}`, { ...formData, fk_student_id: Number(formData.fk_student_id), fk_academic_periods: Number(formData.fk_academic_periods) });
      onSuccess(); onClose();
      await Swal.fire({ icon: "success", title: "¡MATRÍCULA ACTUALIZADA!", text: "La matrícula fue actualizada correctamente.", confirmButtonColor: "#000000" });
    } catch (error: any) { setErrorMsg(error.response?.data?.error || "No se pudo actualizar la matrícula."); } finally { setIsLoading(false); }
  };

  if (!isOpen || !matricula) return null;
  return <Modal onClosea={onClose} textHeader="Editar Matrícula" isLoadinga={isLoading} onSubmit={handleSubmit} submitText="Guardar Cambios">
            <div className="space-y-5 p-6">
            {errorMsg && <div className="border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">{errorMsg}</div>}
            <div><label className="mb-1.5 block text-sm font-medium text-gray-400">Estudiante *</label><select required value={formData.fk_student_id} onChange={(event) => setFormData({ ...formData, fk_student_id: event.target.value })} className="w-full rounded-xl border border-gray-800 bg-[#0a0a0c] px-4 py-2.5 text-white outline-none"><option value="">Selecciona un estudiante</option>{students.map((student) => <option key={student.student_id} value={student.student_id}>{student.name} - {student.dni}</option>)}</select></div>
            <div><label className="mb-1.5 block text-sm font-medium text-gray-400">Periodo académico *</label><select required value={formData.fk_academic_periods} onChange={(event) => setFormData({ ...formData, fk_academic_periods: event.target.value })} className="w-full rounded-xl border border-gray-800 bg-[#0a0a0c] px-4 py-2.5 text-white outline-none"><option value="">Selecciona un periodo</option>{periods.map((period) => <option key={period.id} value={period.id}>{period.name} {period.year ? `(${period.year})` : ""}</option>)}</select></div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2"><div><label className="mb-1.5 block text-sm font-medium text-gray-400">Fecha *</label><input required type="date" value={formData.date} onChange={(event) => setFormData({ ...formData, date: event.target.value })} className="w-full rounded-xl border border-gray-800 bg-[#0a0a0c] px-4 py-2.5 text-white outline-none" /></div><div><label className="mb-1.5 block text-sm font-medium text-gray-400">Estado *</label><select value={formData.status} onChange={(event) => setFormData({ ...formData, status: event.target.value })} className="w-full rounded-xl border border-gray-800 bg-[#0a0a0c] px-4 py-2.5 text-white outline-none"><option>Activo</option><option>Inactivo</option><option>Retirado</option><option>Finalizado</option></select></div></div>
            </div>
        </Modal>;
}