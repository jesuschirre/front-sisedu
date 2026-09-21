import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "../../../../context/AuthContext";
import { Url } from "../../../../url";
import Modal from "../../../atoms/Modal";

interface CreateAsistenciaProps { isOpen: boolean; onClose: () => void; onSuccess: () => void; }
export interface StudentOption { student_id: number; name: string; dni: string; }
export interface AttendanceFormData { fk_student_id: string; date: string; status: string; }

const initialState: AttendanceFormData = { fk_student_id: "", date: new Date().toISOString().split("T")[0], status: "presente" };

export default function CreateAsistenciaModal({ isOpen, onClose, onSuccess }: CreateAsistenciaProps) {
  const { persona } = useAuth();
  const [formData, setFormData] = useState(initialState);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!isOpen || !persona?.fk_school_id) return;
    axios.get(`${Url}/students?idSchool=${persona.fk_school_id}`)
      .then((response) => setStudents(response.data?.data || response.data || []))
      .catch(() => setErrorMsg("No se pudieron cargar los estudiantes."));
  }, [isOpen, persona?.fk_school_id]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!persona?.fk_school_id || !formData.fk_student_id || !formData.date || !formData.status) { setErrorMsg("Completa todos los campos obligatorios."); return; }
    setIsLoading(true);
    try {
      await axios.post(`${Url}/attendance`, { fk_student_id: Number(formData.fk_student_id), date: formData.date, status: formData.status, fk_school_id: persona.fk_school_id });
      onSuccess(); onClose(); setFormData(initialState);
      await Swal.fire({ icon: "success", title: "¡ASISTENCIA REGISTRADA!", text: "La asistencia fue registrada correctamente.", confirmButtonColor: "#000000" });
    } catch (error: any) { setErrorMsg(error.response?.data?.error || "No se pudo registrar la asistencia."); } finally { setIsLoading(false); }
  };

  if (!isOpen) return null;
  return <Modal onClosea={onClose} textHeader="Registrar Asistencia" isLoadinga={isLoading} onSubmit={handleSubmit} submitText="Registrar Asistencia"><div className="space-y-5 p-6">
    {errorMsg && <div className="border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">{errorMsg}</div>}
    <StudentSelect value={formData.fk_student_id} onChange={(value) => setFormData({ ...formData, fk_student_id: value })} students={students} />
    <AttendanceFields formData={formData} setFormData={setFormData} />
  </div></Modal>;
}

export function StudentSelect({ value, onChange, students }: { value: string; onChange: (value: string) => void; students: StudentOption[] }) { return <div><label className="mb-1.5 block text-sm font-medium text-gray-400">Estudiante *</label><select required value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-gray-800 bg-[#0a0a0c] px-4 py-2.5 text-white outline-none"><option value="">Selecciona un estudiante</option>{students.map((student) => <option key={student.student_id} value={student.student_id}>{student.name} - {student.dni}</option>)}</select></div>; }

export function AttendanceFields({ formData, setFormData }: { formData: AttendanceFormData; setFormData: (value: AttendanceFormData) => void }) { return <div className="grid grid-cols-1 gap-5 md:grid-cols-2"><div><label className="mb-1.5 block text-sm font-medium text-gray-400">Fecha *</label><input required type="date" value={formData.date} onChange={(event) => setFormData({ ...formData, date: event.target.value })} className="w-full rounded-xl border border-gray-800 bg-[#0a0a0c] px-4 py-2.5 text-white outline-none" /></div><div><label className="mb-1.5 block text-sm font-medium text-gray-400">Estado *</label><select required value={formData.status} onChange={(event) => setFormData({ ...formData, status: event.target.value })} className="w-full rounded-xl border border-gray-800 bg-[#0a0a0c] px-4 py-2.5 text-white outline-none"><option>presente</option><option>tarde</option><option>falta</option><option>justificado</option></select></div></div>; }