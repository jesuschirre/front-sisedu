import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "../../../../context/AuthContext";
import { Url } from "../../../../url";
import Modal from "../../../atoms/Modal";

interface CreateCourseProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateCourse({ isOpen, onClose, onSuccess }: CreateCourseProps) {
  const { persona } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName("");
      setDescription("");
      setErrorMsg("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!persona?.fk_school_id) {
      setErrorMsg("Error de sesión: No se identificó la escuela.");
      return;
    }
    if (!name.trim()) {
      setErrorMsg("El nombre del curso es obligatorio.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    try {
      await axios.post(`${Url}/courses`, {
        name: name.trim(),
        description: description.trim(),
        fk_school_id: persona.fk_school_id,
      });
      onSuccess();
      onClose();
      await Swal.fire({ icon: "success", title: "¡CURSO CREADO!", text: "El curso fue registrado correctamente.", confirmButtonColor: "#7c3aed", background: "#15151c", color: "#fff" });
    } catch (error: any) {
      setErrorMsg(error.response?.data?.error || "Error de conexión con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal onClosea={onClose} textHeader="Crear Curso" isLoadinga={isLoading} onSubmit={handleSubmit} submitText="Guardar Curso">
      <div className="space-y-5 p-6">
          {errorMsg && <p className="border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">{errorMsg}</p>}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-400">Nombre del curso *</label>
            <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej: Matemática" className="w-full border border-gray-800 bg-[#0a0a0c] px-4 py-2.5 text-white outline-none focus:border-violet-500" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-400">Descripción</label>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} placeholder="Describe brevemente el curso" className="w-full resize-none border border-gray-800 bg-[#0a0a0c] px-4 py-2.5 text-white outline-none focus:border-violet-500" />
          </div>
      </div>
    </Modal>
  );
}
