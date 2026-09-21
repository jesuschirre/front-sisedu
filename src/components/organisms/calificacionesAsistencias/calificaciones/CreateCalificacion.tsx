import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "../../../../context/AuthContext";
import { Url } from "../../../../url";
import Modal from "../../../atoms/Modal";

interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void; }
interface StudentOption { student_id: number; name: string; dni: string; }
interface CourseOption { id: number; name: string; }
interface PeriodOption { id: number; name: string; year?: number; }
const initialState = { nota: "", tipo_evaluacion: "1", fk_student_id: "", fk_course_id: "", fk_academic_periods: "" };

export default function CreateCalificacionModal({ isOpen, onClose, onSuccess }: Props) {
  const { persona } = useAuth();
  const [formData, setFormData] = useState(initialState);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [periods, setPeriods] = useState<PeriodOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!isOpen || !persona?.fk_school_id) return;
    Promise.all([axios.get(`${Url}/students?idSchool=${persona.fk_school_id}`), axios.get(`${Url}/courses?fk_school_id=${persona.fk_school_id}`), axios.get(`${Url}/periodos?fk_school_id=${persona.fk_school_id}`)])
      .then(([studentsResponse, coursesResponse, periodsResponse]) => { setStudents(studentsResponse.data?.data || studentsResponse.data || []); setCourses(coursesResponse.data?.data || coursesResponse.data || []); setPeriods(periodsResponse.data?.data || periodsResponse.data || []); })
      .catch(() => setErrorMsg("No se pudieron cargar estudiantes, cursos y periodos."));
  }, [isOpen, persona?.fk_school_id]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!persona?.fk_school_id || !formData.nota || !formData.fk_student_id || !formData.fk_course_id || !formData.fk_academic_periods) { setErrorMsg("Completa todos los campos obligatorios."); return; }
    setIsLoading(true);
    try {
      await axios.post(`${Url}/grades`, { ...formData,fk_academic_periods: Number(formData.fk_academic_periods), nota: Number(formData.nota), tipo_evaluacion: Number(formData.tipo_evaluacion), fk_student_id: Number(formData.fk_student_id), fk_course_id: Number(formData.fk_course_id), fk_school_id: persona.fk_school_id });
      onSuccess(); onClose(); setFormData(initialState);
      await Swal.fire({ icon: "success", title: "¡CALIFICACIÓN CREADA!", text: "La calificación fue registrada correctamente.", confirmButtonColor: "#000000" });
    } catch (error: any) { setErrorMsg(error.response?.data?.error || "No se pudo registrar la calificación."); } finally { setIsLoading(false); }
  };

  if (!isOpen) return null;
  return <Modal onClosea={onClose} textHeader="Crear Calificación" isLoadinga={isLoading} onSubmit={handleSubmit} submitText="Crear Calificación"><div className="space-y-5 p-6">
    {errorMsg && <div className="border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">{errorMsg}</div>}
    <Select label="Estudiante *" value={formData.fk_student_id} onChange={(value) => setFormData({ ...formData, fk_student_id: value })} options={students.map((item) => ({ value: String(item.student_id), label: `${item.name} - ${item.dni}` }))} />
    <Select label="Curso *" value={formData.fk_course_id} onChange={(value) => setFormData({ ...formData, fk_course_id: value })} options={courses.map((item) => ({ value: String(item.id), label: item.name }))} />
    <Select label="Periodo académico *" value={formData.fk_academic_periods} onChange={(value) => setFormData({ ...formData, fk_academic_periods: value })} options={periods.map((item) => ({ value: String(item.id), label: `${item.name}${item.year ? ` (${item.year})` : ""}` }))} />
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2"><NumberField label="Nota *" value={formData.nota} min="0" max="20" onChange={(value) => setFormData({ ...formData, nota: value })} /><Select label="Tipo de evaluación *" value={formData.tipo_evaluacion} onChange={(value) => setFormData({ ...formData, tipo_evaluacion: value })} options={[{ value: "1", label: "Examen" }, { value: "2", label: "Tarea" }, { value: "3", label: "Práctica" }, { value: "4", label: "Participación" }]} /></div>
  </div></Modal>;
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[] }) { return <div><label className="mb-1.5 block text-sm font-medium text-gray-400">{label}</label><select required value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-gray-800 bg-[#0a0a0c] px-4 py-2.5 text-white outline-none"><option value="">Selecciona una opción</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>; }
function NumberField({ label, value, min, max, onChange }: { label: string; value: string; min: string; max: string; onChange: (value: string) => void }) { return <div><label className="mb-1.5 block text-sm font-medium text-gray-400">{label}</label><input required type="number" step="0.01" min={min} max={max} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-gray-800 bg-[#0a0a0c] px-4 py-2.5 text-white outline-none" /></div>; }