import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";
import { Url } from "../../../../url.ts";
import Swal from "sweetalert2";
import Modal from "../../../atoms/Modal.tsx";
import PeopleFields from "../../../atoms/PeopleFields.tsx";

interface CreateStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateStaffModal({ isOpen, onClose, onSuccess }: CreateStaffModalProps) {
  const { persona } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Formulario inicial adaptado a las tablas 'people' y 'staff'
  const initialState = {
    name: "",
    dni: "",
    email: "",
    address: "",
    position: "", // Campo obligatorio según tu backend
  };
  
  const [formData, setFormData] = useState(initialState);

  const handleClose = () => {
    setFormData(initialState);
    setErrorMsg("");
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialState);
      setErrorMsg("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!persona?.fk_school_id) {
      setErrorMsg("Error de sesión: No se identificó la escuela.");
      return;
    } 
    
    // Validación estricta: Solo 8 números exactos para el DNI
    if (!/^\d{8}$/.test(formData.dni)) {
      setErrorMsg("El DNI debe contener exactamente 8 números.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      await axios.post(`${Url}/staff`, {
        name: formData.name,
        dni: formData.dni,
        email: formData.email,
        address: formData.address,
        fk_school_id: persona.fk_school_id,
        position: formData.position,
      });
      
      setFormData(initialState);
      onSuccess();
      handleClose();
      
      await Swal.fire({
        icon: "success",
        title: "¡PERSONAL REGISTRADO!",
        text: "El miembro del personal fue registrado satisfactoriamente.",
        confirmButtonColor: "#7c3aed",
        background: '#15151c',
        color: '#fff'
      });
      
    } catch (error: any) {
      if (error.response?.status === 409) {
        setErrorMsg("El DNI o el correo electrónico ya se encuentran registrados.");
      } else if (error.response?.status === 400) {
        setErrorMsg("Faltan datos obligatorios (Nombre, DNI o Cargo).");
      } else {
        setErrorMsg(error.response?.data?.error || "Error de conexión con el servidor.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal onClosea={handleClose} textHeader="Registrar Nuevo Personal" isLoadinga={isLoading} onSubmit={handleSubmit} submitText="Registrar Personal">
        
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

            {/* --- SECCIÓN DATOS LABORALES --- */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-violet-400/80 uppercase tracking-widest border-b border-gray-800/60 pb-2 mb-4">
                Datos Laborales
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Cargo / Puesto *</label>
                <input required type="text" name="position" value={formData.position} onChange={handleChange} 
                  placeholder="Ej: Conserje, Administrativo, Director..."
                  className="w-full px-4 py-2.5 bg-[#0a0a0c] border border-gray-800 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none text-white transition-all shadow-inner placeholder-gray-600/50" />
              </div>
            </div>
          </div>

        </div>
    </Modal>
  );
}