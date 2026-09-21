import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Url } from "../../../../url";
import type { CourseData } from "../../../templates/EstructuraEducativa/curses/CursesTemplate";
import Modal from "../../../atoms/Modal";

interface EditCourseProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  course: CourseData | null;
}

export default function EditCourse({ isOpen, onClose, onSuccess, course }: EditCourseProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen && course) {
      setName(course.name || "");
      setDescription(course.description || "");
      setErrorMsg("");
    }
  }, [isOpen, course]);

  if (!isOpen || !course) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setErrorMsg("El nombre del curso es obligatorio.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    try {
      await axios.put(`${Url}/courses/${course.id}`, {
        name: name.trim(),
        description: description.trim(),
      });
      onSuccess();
      onClose();
      await Swal.fire({ icon: "success", title: "¡CURSO ACTUALIZADO!", text: "El curso fue actualizado correctamente.", confirmButtonColor: "#7c3aed", background: "#15151c", color: "#fff" });
    } catch (error: any) {
      setErrorMsg(error.response?.data?.error || "Error de conexión con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal onClosea={onClose} textHeader="Editar Curso" isLoadinga={isLoading} onSubmit={handleSubmit} submitText="Actualizar Curso">
      <div className="space-y-5 p-6">
          {errorMsg && <p className="border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">{errorMsg}</p>}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-400">Nombre del curso *</label>
            <input required value={name} onChange={(event) => setName(event.target.value)} className="w-full border border-gray-800 bg-[#0a0a0c] px-4 py-2.5 text-white outline-none focus:border-violet-500" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-400">Descripción</label>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} className="w-full resize-none border border-gray-800 bg-[#0a0a0c] px-4 py-2.5 text-white outline-none focus:border-violet-500" />
          </div>
      </div>
    </Modal>
  );
}
