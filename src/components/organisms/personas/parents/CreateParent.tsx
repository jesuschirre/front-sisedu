import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";
import { Url } from "../../../../url.ts";
import Swal from "sweetalert2";
import Modal from "../../../atoms/Modal.tsx";
import PeopleFields from "../../../atoms/PeopleFields.tsx";

interface CreateParentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Interfaz para mapear los datos de los estudiantes que vienen del backend
interface StudentMiniData {
  student_id: number;
  person_id: number;
  name: string;
  dni: string;
}

export default function CreateParentModal({ isOpen, onClose, onSuccess }: CreateParentModalProps) {
  const { persona } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Estados para el buscador de estudiantes
  const [students, setStudents] = useState<StudentMiniData[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const initialState = {
    name: "",
    dni: "",
    email: "",
    address: "",
    occupation: "",
    studentId: "", // El ID del estudiante a vincular
  };
  
  const [formData, setFormData] = useState(initialState);

  const handleClose = () => {
    setFormData(initialState);
    setStudentSearch("");
    setIsDropdownOpen(false);
    setErrorMsg("");
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialState);
      setStudentSearch("");
      setIsDropdownOpen(false);
      setErrorMsg("");
    }
  }, [isOpen]);

  // Cargar la lista de estudiantes al abrir el modal
  useEffect(() => {
    const fetchStudents = async () => {
      if (!persona?.fk_school_id || !isOpen) return;
      try {
        // Asegúrate de que la ruta coincida con tu router de estudiantes (usa idSchool como pide tu backend)
        const res = await axios.get(`${Url}/students?idSchool=${persona.fk_school_id}`);
        setStudents(res.data.data || res.data);
      } catch (error) {
        console.error("Error al cargar estudiantes:", error);
      }
    };
    fetchStudents();
  }, [persona?.fk_school_id, isOpen]);

  // Cerrar el dropdown si se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtrado de estudiantes en tiempo real
  const filteredStudents = useMemo(() => {
    const lowerSearch = studentSearch.toLowerCase();
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(lowerSearch) ||
        student.dni.includes(lowerSearch)
    );
  }, [studentSearch, students]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg("");
  };

  const handleSelectStudent = (student: StudentMiniData) => {
    setFormData((prev) => ({ ...prev, studentId: student.student_id.toString() }));
    setStudentSearch(`${student.name} - ${student.dni}`); // Muestra el nombre en el input
    setIsDropdownOpen(false);
    setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!persona?.fk_school_id) {
      setErrorMsg("Error de sesión: No se identificó la escuela.");
      return;
    } 
    
    // Validaciones
    if (!/^\d{8}$/.test(formData.dni)) {
      setErrorMsg("El DNI del apoderado debe contener exactamente 8 números.");
      return;
    }
    if (!formData.studentId) {
      setErrorMsg("Debes buscar y seleccionar un estudiante para vincularlo.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      await axios.post(`${Url}/parents`, {
        name: formData.name,
        dni: formData.dni,
        email: formData.email,
        address: formData.address,
        fk_school_id: persona.fk_school_id,
        occupation: formData.occupation,
        studentId: formData.studentId,
      });
      
      setFormData(initialState);
      setStudentSearch("");
      onSuccess();
      handleClose();
      
      await Swal.fire({
        icon: "success",
        title: "¡APODERADO REGISTRADO!",
        text: "El pariente fue creado y vinculado al estudiante satisfactoriamente.",
        confirmButtonColor: "#7c3aed",
        background: '#15151c',
        color: '#fff'
      });
      
    } catch (error: any) {
      if (error.response?.status === 409) {
        setErrorMsg("El DNI o el correo electrónico ya se encuentran registrados.");
      } else if (error.response?.status === 400) {
        setErrorMsg("Faltan datos obligatorios (Nombre, DNI o Estudiante).");
      } else {
        setErrorMsg(error.response?.data?.error || "Error de conexión con el servidor.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal onClosea={handleClose} textHeader="Registrar Nuevo Apoderado" isLoadinga={isLoading} onSubmit={handleSubmit} submitText="Registrar Apoderado">
        
        <div className="space-y-6 p-6">
          
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <PeopleFields value={formData} onChange={handleChange} />

            {/* --- SECCIÓN VINCULACIÓN (Student) --- */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-violet-400/80 uppercase tracking-widest border-b border-gray-800/60 pb-2 mb-4">
                Detalles y Vinculación
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Ocupación</label>
                <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} 
                  placeholder="Ej: Ingeniero, Comerciante..."
                  className="w-full px-4 py-2.5 bg-[#0a0a0c] border border-gray-800 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none text-white transition-all shadow-inner placeholder-gray-600/50" />
              </div>

              {/* BUSCADOR DE ESTUDIANTES */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Vincular Estudiante *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar por nombre o DNI..."
                    value={studentSearch}
                    onChange={(e) => {
                      setStudentSearch(e.target.value);
                      setFormData(prev => ({ ...prev, studentId: "" })); // Borrar selección si edita el texto
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    className="w-full pl-9 pr-4 py-2.5 bg-[#0a0a0c] border border-gray-800 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none text-white transition-all shadow-inner placeholder-gray-600/50"
                  />
                </div>
                
                {/* Lista Desplegable del Buscador */}
                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-2 bg-[#1a1a24] border border-gray-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto custom-scrollbar">
                    {filteredStudents.length > 0 ? (
                      <ul className="py-1 text-sm text-gray-300">
                        {filteredStudents.map((student) => (
                          <li 
                            key={student.student_id}
                            onClick={() => handleSelectStudent(student)}
                            className="px-4 py-2 hover:bg-violet-600/20 hover:text-white cursor-pointer transition-colors border-b border-gray-800/50 last:border-0"
                          >
                            <div className="font-medium">{student.name}</div>
                            <div className="text-xs text-gray-500">DNI: {student.dni}</div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">
                        No se encontraron estudiantes.
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
    </Modal>
  );
}