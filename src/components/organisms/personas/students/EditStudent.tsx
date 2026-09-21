import { useState, useEffect } from "react";
import axios from "axios";
import { Url } from "../../../../url";
import Swal from "sweetalert2";
import Modal from "../../../atoms/Modal.tsx";

// Interfaz para el estudiante que recibiremos desde la tabla
export interface StudentData {
  student_id: number;
  person_id: number;
  name: string;
  dni: string;
  email: string;
  address: string;
  start_date: string;
  state: string;
}

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  student: StudentData | null;
}

export default function EditStudentModal({ isOpen, onClose, onSuccess, student }: EditStudentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    dni: "",
    email: "",
    address: "",
    start_date: "",
    state: "activo",
  });

  // Efecto para llenar el formulario cuando se abre el modal y hay un estudiante seleccionado
  useEffect(() => {
    if (student && isOpen) {
      // Formateamos la fecha para asegurarnos que el input type="date" la lea correctamente (YYYY-MM-DD)
      let formattedDate = "";
      if (student.start_date) {
        try {
          formattedDate = new Date(student.start_date).toISOString().split('T')[0];
        } catch (e) {
          formattedDate = student.start_date; // Por si ya viene formateada desde el backend
        }
      }

      setFormData({
        name: student.name || "",
        dni: student.dni || "",
        email: student.email || "",
        address: student.address || "",
        start_date: formattedDate,
        state: student.state || "activo",
      });
      setErrorMsg(""); 
    }
  }, [student, isOpen]);

  if (!isOpen || !student) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación estricta del DNI
    if (!/^\d{8}$/.test(formData.dni)) {
      setErrorMsg("El DNI debe contener exactamente 8 números.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      // Usamos el ID del estudiante para la URL como requiere tu backend (router.put('/:id'))
      await axios.put(`${Url}/students/${student.student_id}`, formData);

      onSuccess();
      onClose();
      
      await Swal.fire({
        icon: "success",
        title: "¡ACTUALIZADO!",
        text: "La información del estudiante fue actualizada correctamente.",
        confirmButtonColor: "#000000"
      });
      
    } catch (error: any) {
      if (error.response?.status === 409) {
        setErrorMsg("El DNI o el correo electrónico ya se encuentran registrados por otra persona.");
      } else if (error.response?.status === 400) {
        setErrorMsg("Faltan datos obligatorios para actualizar.");
      } else if (error.response?.status === 404) {
        setErrorMsg("El estudiante no fue encontrado en el sistema.");
      } else {
        setErrorMsg(error.response?.data?.error || "Error de conexión con el servidor.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal onClosea={onClose} textHeader="Editar Estudiante" isLoadinga={isLoading} onSubmit={handleSubmit} submitText="Actualizar Estudiante">
      <div className="space-y-6 p-6">
        
        {/* Header del Modal */}
        <div className="hidden">
          <h2 className="text-xl font-bold text-white tracking-wide">Editar Estudiante</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-violet-400 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Formulario */}
        <div>
          
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* --- SECCIÓN DATOS PERSONALES --- */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-violet-400/80 uppercase tracking-widest border-b border-gray-800/60 pb-2 mb-4">
                Datos Personales
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Nombre Completo *</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} 
                  className="w-full px-4 py-2.5 bg-[#0a0a0c] border border-gray-800 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none text-white transition-all shadow-inner placeholder-gray-600" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">DNI *</label>
                <input required type="text" name="dni" value={formData.dni} onChange={handleChange} 
                  placeholder="8 dígitos" maxLength={8}
                  className="w-full px-4 py-2.5 bg-[#0a0a0c] border border-gray-800 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none text-white transition-all shadow-inner placeholder-gray-600/50" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} 
                  className="w-full px-4 py-2.5 bg-[#0a0a0c] border border-gray-800 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none text-white transition-all shadow-inner placeholder-gray-600" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Dirección</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} 
                  className="w-full px-4 py-2.5 bg-[#0a0a0c] border border-gray-800 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none text-white transition-all shadow-inner placeholder-gray-600" />
              </div>
            </div>

            {/* --- SECCIÓN DATOS ACADÉMICOS --- */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-violet-400/80 uppercase tracking-widest border-b border-gray-800/60 pb-2 mb-4">
                Datos Académicos
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Fecha de Ingreso
                </label>
                <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} 
                  className="w-full px-4 py-2.5 bg-[#0a0a0c] border border-gray-800 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none text-gray-300 transition-all shadow-inner scheme-dark" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Estado del Estudiante *</label>
                <select required name="state" value={formData.state} onChange={handleChange} 
                  className="w-full px-4 py-2.5 bg-[#0a0a0c] border border-gray-800 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none text-white transition-all shadow-inner">
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="retirado">Retirado</option>
                  <option value="graduado">Graduado</option>
                </select>
              </div>
              
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="hidden">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-400 bg-transparent border border-gray-800 rounded-xl hover:bg-gray-800/50 hover:text-white transition-all">
              Cancelar
            </button>
            <button type="submit" disabled={isLoading}
              className="px-6 py-2.5 text-sm font-medium text-white bg-violet-600 rounded-xl hover:bg-violet-500 shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:shadow-[0_0_20px_rgba(124,58,237,0.5)] transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-2">
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </>
              ) : "Actualizar Estudiante"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}