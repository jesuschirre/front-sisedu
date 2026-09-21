import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";
import { Url } from "../../../../url.ts";
import Swal from "sweetalert2";
import { type ParentData } from "../../../templates/personas/parents/parentTemplate.tsx";
import Modal from "../../../atoms/Modal.tsx";

interface StudentMiniData {
  student_id: number;
  person_id: number;
  name: string;
  dni: string;
}

interface EditParentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  parent: ParentData | null;
}

export default function EditParentModal({ isOpen, onClose, onSuccess, parent }: EditParentModalProps) {
  const { persona } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [students, setStudents] = useState<StudentMiniData[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Estado local limpio, sin IDs de relación innecesarios
  const [formData, setFormData] = useState({
    name: "",
    dni: "",
    email: "",
    address: "",
    occupation: "",
    idStudent: "",
    ParentStudentId: "", 
  });

  useEffect(() => {
    const fetchStudents = async () => {
      if (!persona?.fk_school_id || !isOpen) return;
      try {
        const res = await axios.get(`${Url}/students?idSchool=${persona.fk_school_id}`);
        setStudents(res.data.data || res.data);
      } catch (error) {
        console.error("❌ Error al cargar estudiantes:", error);
      }
    };
    fetchStudents();
  }, [persona?.fk_school_id, isOpen]);

  useEffect(() => {
    if (parent && isOpen) {
      setFormData({
        name: parent.name || "",
        dni: parent.dni || "",
        email: parent.email || "",
        address: parent.address || "",
        occupation: parent.occupation || "",
        idStudent:  parent.student_id ? parent.student_id.toString() : "",
        ParentStudentId: parent.parent_id ? parent.parent_id.toString() : "",
      });
      setStudentSearch(`${parent.student_name} - ${parent.student_dni}`);
      setErrorMsg("");
    }
  }, [parent, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredStudents = useMemo(() => {
    const lowerSearch = studentSearch.toLowerCase();
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(lowerSearch) ||
        student.dni.includes(lowerSearch)
    );
  }, [studentSearch, students]);

  if (!isOpen || !parent) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg("");
  };

  const handleSelectStudent = (student: StudentMiniData) => {
    setFormData((prev) => ({ ...prev, idStudent: student.student_id.toString() }));
    setStudentSearch(`${student.name} - ${student.dni}`);
    setIsDropdownOpen(false);
    setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!/^\d{8}$/.test(formData.dni)) {
      setErrorMsg("El DNI del apoderado debe contener exactamente 8 números.");
      return;
    }
    
    if (!formData.ParentStudentId) {
      setErrorMsg("Debes seleccionar un estudiante para la vinculación.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      // Enviamos los datos limpios al backend usando el parent_id en la URL
      await axios.put(`${Url}/parents/${parent.parent_id}`, formData);

      onSuccess();
      onClose();
      
      await Swal.fire({
        icon: "success",
        title: "¡ACTUALIZADO!",
        text: "La información del apoderado fue actualizada correctamente.",
        confirmButtonColor: "#7c3aed",
        background: '#15151c',
        color: '#fff'
      });
      
    } catch (error: any) {
      setErrorMsg(error.response?.data?.error || "Error al actualizar.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal onClosea={onClose} textHeader="Editar Apoderado" isLoadinga={isLoading} onSubmit={handleSubmit} submitText="Actualizar Apoderado">
      <div className="space-y-6 p-6">
        
        <div className="hidden">
          <h2 className="text-xl font-bold text-white tracking-wide">Editar Apoderado</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-violet-400 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div>
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg flex items-center gap-2">
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-violet-400/80 uppercase tracking-widest border-b border-gray-800/60 pb-2 mb-4">
                Datos del Apoderado
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Nombre Completo *</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} 
                  className="w-full px-4 py-2.5 bg-[#0a0a0c] border border-gray-800 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none text-white transition-all shadow-inner placeholder-gray-600" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">DNI *</label>
                <input required type="text" name="dni" value={formData.dni} onChange={handleChange} 
                  maxLength={8}
                  className="w-full px-4 py-2.5 bg-[#0a0a0c] border border-gray-800 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none text-white transition-all shadow-inner placeholder-gray-600/50" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} 
                  className="w-full px-4 py-2.5 bg-[#0a0a0c] border border-gray-800 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none text-white transition-all shadow-inner placeholder-gray-600" />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-violet-400/80 uppercase tracking-widest border-b border-gray-800/60 pb-2 mb-4">
                Detalles y Vinculación
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Dirección</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} 
                  className="w-full px-4 py-2.5 bg-[#0a0a0c] border border-gray-800 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none text-white transition-all shadow-inner placeholder-gray-600" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Ocupación</label>
                <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} 
                  className="w-full px-4 py-2.5 bg-[#0a0a0c] border border-gray-800 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none text-white transition-all shadow-inner placeholder-gray-600/50" />
              </div>

              {/* BUSCADOR DE ESTUDIANTES */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Modificar Estudiante *</label>
                <input
                  type="text"
                  placeholder="Buscar estudiante..."
                  value={studentSearch}
                  onChange={(e) => {
                    setStudentSearch(e.target.value);
                    setFormData(prev => ({ ...prev, idStudent: "" }));
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  className="w-full px-4 py-2.5 bg-[#0a0a0c] border border-gray-800 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none text-white transition-all shadow-inner placeholder-gray-600/50"
                />
                
                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-2 bg-[#1a1a24] border border-gray-700 rounded-xl shadow-2xl max-h-40 overflow-y-auto">
                    {filteredStudents.map((student) => (
                      <div 
                        key={student.student_id}
                        onClick={() => handleSelectStudent(student)}
                        className="px-4 py-2 hover:bg-violet-600/20 cursor-pointer text-sm"
                      >
                        {student.name} ({student.dni})
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="hidden">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-400 border border-gray-800 rounded-xl hover:bg-gray-800/50">Cancelar</button>
            <button type="submit" disabled={isLoading} className="px-6 py-2.5 text-sm font-medium text-white bg-violet-600 rounded-xl hover:bg-violet-500 transition-all">
              {isLoading ? "Guardando..." : "Actualizar Apoderado"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}