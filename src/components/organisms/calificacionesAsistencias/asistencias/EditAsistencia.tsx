import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "../../../../context/AuthContext";
import { Url } from "../../../../url";
import Modal from "../../../atoms/Modal";
import type { AsistenciaData } from "../../../templates/calificacionesAsistencias/AsistenciasTemplate";
import { AttendanceFields, StudentSelect, type AttendanceFormData, type StudentOption } from "./CreateAsistencia";

interface EditAsistenciaProps { isOpen: boolean; onClose: () => void; onSuccess: () => void; asistencia: AsistenciaData | null; }

export default function EditAsistenciaModal({ isOpen, onClose, onSuccess, asistencia }: EditAsistenciaProps) {
  const { persona } = useAuth();
  const [formData, setFormData] = useState<AttendanceFormData>({ fk_student_id: "", date: "", status: "presente" });
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (asistencia && isOpen) {
      setFormData({ fk_student_id: String(asistencia.fk_student_id), date: asistencia.date ? asistencia.date.split("T")[0] : "", status: asistencia.status?.toLowerCase() || "presente" });
      setErrorMsg("");
    }
  }, [asistencia, isOpen]);

  useEffect(() => {
    if (!isOpen || !persona?.fk_school_id) return;
    axios.get(`${Url}/students?idSchool=${persona.fk_school_id}`)
      .then((response) => setStudents(response.data?.data || response.data || []))
      .catch(() => setErrorMsg("No se pudieron cargar los estudiantes."));
  }, [isOpen, persona?.fk_school_id]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!persona?.fk_school_id || !asistencia || !formData.fk_student_id || !formData.date || !formData.status) { setErrorMsg("Completa todos los campos obligatorios."); return; }
    setIsLoading(true);
    try {
      await axios.put(`${Url}/attendance/${asistencia.id}`, { fk_student_id: Number(formData.fk_student_id), date: formData.date, status: formData.status, fk_school_id: persona.fk_school_id });
      onSuccess(); onClose();
      await Swal.fire({ icon: "success", title: "¡ASISTENCIA ACTUALIZADA!", text: "La asistencia fue actualizada correctamente.", confirmButtonColor: "#000000" });
    } catch (error: any) { setErrorMsg(error.response?.data?.error || "No se pudo actualizar la asistencia."); } finally { setIsLoading(false); }
  };

  if (!isOpen || !asistencia) return null;
  return <Modal onClosea={onClose} textHeader="Editar Asistencia" isLoadinga={isLoading} onSubmit={handleSubmit} submitText="Guardar Cambios"><div className="space-y-5 p-6">
    {errorMsg && <div className="border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">{errorMsg}</div>}
    <StudentSelect value={formData.fk_student_id} onChange={(value) => setFormData({ ...formData, fk_student_id: value })} students={students} />
    <AttendanceFields formData={formData} setFormData={setFormData} />
  </div></Modal>;
}