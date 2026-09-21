import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext.tsx";
import { Url } from "../../../../url.ts";
import Swal from "sweetalert2";
import Modal from "../../../atoms/Modal.tsx";
import PeopleFields from "../../../atoms/PeopleFields.tsx";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void
}
interface Role {
  id: number;
  name: string;
  description?: string;
  fk_school_id?: number;
}

const initialState = {
  name: "",
  dni: "",
  email: "",
  address: "",
  username: "",
  password: "",
  state: "activo",
  fk_rol: "",
};

export default function CreateUserModal({ isOpen, onClose, onSuccess }: CreateUserModalProps) {
  const { persona } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [roles, setRoles] = useState<Role[]>([]); 
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

  // Si el modal está cerrado
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg("");
  };

  // Obtener los roles
  const rolesGet = async () => {
    if (!persona?.fk_school_id) return;

    try {
        const res = await axios.get(`${Url}/rol?fk_school_id=${persona.fk_school_id}`);
        setRoles(res.data.data); 
    } catch (error: any) {
        console.error("Error al cargar los roles:", error);
        setErrorMsg("Error al cargar los roles");
    }
  };
  
  // Cargar los datos de los roles
  useEffect(() => {
      rolesGet();
  }, [persona?.fk_school_id]);
  
  if (!isOpen) return null;

  // Función para crear un nuevo usuario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!persona?.fk_school_id) {
      setErrorMsg("Error de sesión: No se identificó la escuela.");
      return;
    } else if (formData.dni.length != 8) {
      setErrorMsg("El DNI debe ser de 8 caracteres");
      return;
    }else if (!/^\d{8}$/.test(formData.dni)) {
      setErrorMsg("El DNI debe contener exactamente 8 números.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      await axios.post(`${Url}/users`, {
        name: formData.name,
        dni: formData.dni,
        email: formData.email,
        address: formData.address,
        fk_school_id: persona.fk_school_id,
        username: formData.username,
        password: formData.password,
        state: formData.state,
        fk_rol: Number(formData.fk_rol),
      });
      setFormData(initialState);
      onSuccess();
      handleClose();
      await Swal.fire({
        icon: "success",
        title: "INSERTADO",
        text: "El usuario fue introducido Satisfactoriamente",
        confirmButtonColor: "#000000"
      })
    } catch (error: any) {
      if (error.response?.status === 409) {
        setErrorMsg("El DNI o el nombre de usuario ya se encuentran registrados.");
      } else if (error.response?.status === 400) {
        setErrorMsg("Faltan datos obligatorios para crear el usuario.");
      } else {
        setErrorMsg(error.response?.data?.error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (

    <> 
      <Modal onClosea={handleClose} textHeader="Registrar Nuevo Usuario" isLoadinga={isLoading} onSubmit={handleSubmit}>


        {/* Formulario */}
        <div className="p-6 space-y-6">
          
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

            {/* --- SECCIÓN DATOS DE USUARIO --- */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-violet-400/80 uppercase tracking-widest border-b border-gray-800/60 pb-2 mb-4">
                Datos de Acceso
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Usuario *</label>
                <input required type="text" name="username" value={formData.username} onChange={handleChange} 
                  className="w-full px-4 py-2.5 bg-[#0a0a0c] border border-gray-800 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none text-white transition-all shadow-inner placeholder-gray-600" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Contraseña *</label>
                <input required type="password" name="password" value={formData.password} onChange={handleChange} 
                  className="w-full px-4 py-2.5 bg-[#0a0a0c] border border-gray-800 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none text-white transition-all shadow-inner placeholder-gray-600" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Rol *</label>
                <select required name="fk_rol" value={formData.fk_rol} onChange={handleChange} 
                  className="w-full px-4 py-2.5 bg-[#0a0a0c] border border-gray-800 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none text-white transition-all shadow-inner">
                  <option value="" disabled className="text-gray-500">Seleccione un rol...</option>
                  {roles.map((rol) => (
                    <option key={rol.id} value={rol.id}>
                      {rol.name}
                    </option>
                  ))}
                </select>
              </div>
              
            </div>
          </div>

        </div>
      </Modal>
    </>
  );
}