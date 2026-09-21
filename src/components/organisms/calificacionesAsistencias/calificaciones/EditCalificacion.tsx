import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Url } from "../../../../url";
import Modal from "../../../atoms/Modal";
import type { CalificacionesData } from "../../../templates/calificacionesAsistencias/CalificacionesTemplate";

interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void; calificacion: CalificacionesData | null; }
interface Option { id: number; name: string; dni?: string; year?: number; student_id?: number; }

export default function EditCalificacionModal({ isOpen, onClose, onSuccess, calificacion }: Props) {
  const [formData, setFormData] = useState({ nota: "", tipo_evaluacion: "1", fk_student_id: "", fk_course_id: "", fk_academic_periods: "" , fk_school_id: ""});
  const [students, setStudents] = useState<Option[]>([]);
  const [courses, setCourses] = useState<Option[]>([]);
  const [periods, setPeriods] = useState<Option[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
    console.log(formData)
  useEffect(() => { if (calificacion && isOpen) { setFormData({ nota: String(calificacion.nota), tipo_evaluacion: String(calificacion.tipo_evaluacion),fk_school_id: String(calificacion.fk_school_id), fk_student_id: String(calificacion.fk_student_id), fk_course_id: String(calificacion.fk_course_id), fk_academic_periods: String(calificacion.fk_academic_periods) }); setErrorMsg(""); } }, [calificacion, isOpen]);
  useEffect(() => { if (!isOpen || !calificacion?.fk_school_id) return; Promise.all([axios.get(`${Url}/students?idSchool=${calificacion.fk_school_id}`), axios.get(`${Url}/courses?fk_school_id=${calificacion.fk_school_id}`), axios.get(`${Url}/periodos?fk_school_id=${calificacion.fk_school_id}`)]).then(([studentsResponse, coursesResponse, periodsResponse]) => { setStudents(studentsResponse.data?.data || studentsResponse.data || []); setCourses(coursesResponse.data?.data || coursesResponse.data || []); setPeriods(periodsResponse.data?.data || periodsResponse.data || []); }).catch(() => setErrorMsg("No se pudieron cargar estudiantes, cursos y periodos.")); }, [calificacion?.fk_school_id, isOpen]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); if (!calificacion || !formData.nota || !formData.fk_student_id || !formData.fk_course_id || !formData.fk_academic_periods) { setErrorMsg("Completa todos los campos obligatorios."); return; } setIsLoading(true); try { await axios.put(`${Url}/grades/${calificacion.id}`, { ...formData,fk_school_id: Number(formData.fk_school_id), nota: Number(formData.nota), tipo_evaluacion: Number(formData.tipo_evaluacion), fk_student_id: Number(formData.fk_student_id), fk_course_id: Number(formData.fk_course_id) }); onSuccess(); onClose(); await Swal.fire({ icon: "success", title: "¡CALIFICACIÓN ACTUALIZADA!", text: "La calificación fue actualizada correctamente.", confirmButtonColor: "#000000" }); } catch (error: any) { setErrorMsg(error.response?.data?.error || "No se pudo actualizar la calificación."); } finally { setIsLoading(false); } };

  if (!isOpen || !calificacion) return null;
  return <Modal onClosea={onClose} textHeader="Editar Calificación" isLoadinga={isLoading} onSubmit={handleSubmit} submitText="Guardar Cambios">
            <div className="space-y-5 p-6">{errorMsg && 
                <div className="border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">{errorMsg}</div>}
                <Select label="Estudiante *" value={formData.fk_student_id} onChange={(value) => setFormData({ ...formData, fk_student_id: value })} options={students.map((item) => ({ value: String(item.student_id || item.id), label: `${item.name} - ${item.dni || ""}` }))} />
                <Select label="Curso *" value={formData.fk_course_id} onChange={(value) => setFormData({ ...formData, fk_course_id: value })} options={courses.map((item) => ({ value: String(item.id), label: item.name }))} />
                <Select label="Periodo académico *" value={formData.fk_academic_periods} onChange={(value) => setFormData({ ...formData, fk_academic_periods: value })} options={periods.map((item) => ({ value: String(item.id), label: `${item.name}${item.year ? ` (${item.year})` : ""}` }))} />
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2"><NumberField label="Nota *" value={formData.nota} onChange={(value) => setFormData({ ...formData, nota: value })} /><Select label="Tipo de evaluación *" value={formData.tipo_evaluacion} onChange={(value) => setFormData({ ...formData, tipo_evaluacion: value })} options={[{ value: "1", label: "Examen" }, { value: "2", label: "Tarea" }, { value: "3", label: "Práctica" }, { value: "4", label: "Participación" }]} />
                </div>
            </div>
          </Modal>;
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[] }) { return <div><label className="mb-1.5 block text-sm font-medium text-gray-400">{label}</label><select required value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-gray-800 bg-[#0a0a0c] px-4 py-2.5 text-white outline-none"><option value="">Selecciona una opción</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>; }
function NumberField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <div><label className="mb-1.5 block text-sm font-medium text-gray-400">{label}</label><input required type="number" step="0.01" min="0" max="20" value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-gray-800 bg-[#0a0a0c] px-4 py-2.5 text-white outline-none" /></div>; }