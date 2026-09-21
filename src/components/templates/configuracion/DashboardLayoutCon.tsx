import axios from "axios";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useAuth } from "../../../context/AuthContext";
import { Url } from "../../../url";

interface FormData {
  name: string;
  dni: string;
  email: string;
  address: string;
  username: string;
  state: string;
  password: string;
  confirmPassword: string;
}

const initialFormData: FormData = {
  name: "",
  dni: "",
  email: "",
  address: "",
  username: "",
  state: "activo",
  password: "",
  confirmPassword: "",
};

export default function DashboardLayoutCon() {
  const { usuario, persona, token, login } = useAuth();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setFormData({
      name: persona?.name || "",
      dni: persona?.dni || "",
      email: persona?.email || "",
      address: persona?.address || "",
      username: usuario?.username || "",
      state: usuario?.state || "activo",
      password: "",
      confirmPassword: "",
    });
  }, [persona, usuario]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setErrorMsg("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!usuario?.id || !persona || !token) {
      setErrorMsg("No se encontró el usuario de la sesión.");
      return;
    }
    if (!/^\d{8}$/.test(formData.dni)) {
      setErrorMsg("El DNI debe contener exactamente 8 números.");
      return;
    }
    if (formData.password && formData.password !== formData.confirmPassword) {
      setErrorMsg("Las contraseñas no coinciden.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    try {
      const payload: Record<string, string> = {
        name: formData.name.trim(),
        dni: formData.dni,
        email: formData.email.trim(),
        address: formData.address.trim(),
        username: formData.username.trim(),
        state: formData.state,
      };

      if (formData.password) payload.password = formData.password;

      await axios.put(`${Url}/users/${usuario.id}`, payload);
      // sirve para sincronizar el contexto
      login(
        { ...usuario, username: formData.username.trim(), state: formData.state },
        { ...persona, name: formData.name.trim(), dni: formData.dni, email: formData.email.trim(), address: formData.address.trim() },
        token,
      );

      setFormData((current) => ({ ...current, password: "", confirmPassword: "" }));
      await Swal.fire({ icon: "success", title: "¡ACTUALIZADO!", text: "Tus datos fueron actualizados correctamente.", confirmButtonColor: "#000000" });
    } catch (error: any) {
      if (error.response?.status === 409) setErrorMsg("El DNI o el nombre de usuario ya se encuentran registrados.");
      else if (error.response?.status === 400) setErrorMsg("Completa los campos obligatorios.");
      else setErrorMsg(error.response?.data?.error || "No se pudieron actualizar tus datos.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#d6d2c4] p-6 font-mono text-black md:p-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 border-4 border-black bg-[#f4f1e8] p-6 shadow-[8px_8px_0_0_#111111]">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <p className="mb-2 text-sm font-black uppercase tracking-[0.2em]">Configuración de cuenta</p>
              <h1 className="text-3xl font-black uppercase md:text-5xl">Edita tus datos</h1>
            </div>
            <Link to="/" className="inline-flex items-center justify-center gap-2 border-2 border-black bg-[#b8d8ff] px-4 py-3 text-sm font-black uppercase shadow-[4px_4px_0_0_#111111] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
              <ArrowLeft size={18} strokeWidth={3} />
              Página principal
            </Link>
          </div>
          <p className="mt-3 max-w-2xl font-sans text-base font-bold">Actualiza tu información personal y tus credenciales de acceso.</p>
        </header>

        <form onSubmit={handleSubmit} className="border-4 border-black bg-[#f4f1e8] shadow-[8px_8px_0_0_#111111]">
          {errorMsg && <div className="border-b-4 border-black bg-[#ff6b6b] p-4 font-black">{errorMsg}</div>}

          <div className="grid gap-0 md:grid-cols-2">
            <section className="border-b-4 border-black p-6 md:border-r-4">
              <h2 className="mb-6 inline-block border-2 border-black bg-[#a7e8bd] px-3 py-2 text-lg font-black uppercase shadow-[3px_3px_0_0_#111111]">Datos personales</h2>
              <div className="space-y-5">
                <Field label="Nombre completo *" name="name" value={formData.name} onChange={handleChange} required />
                <Field label="DNI *" name="dni" value={formData.dni} onChange={handleChange} required maxLength={8} />
                <Field label="Correo electrónico" name="email" type="email" value={formData.email} onChange={handleChange} />
                <Field label="Dirección" name="address" value={formData.address} onChange={handleChange} />
              </div>
            </section>

            <section className="p-6">
              <h2 className="mb-6 inline-block border-2 border-black bg-[#b8d8ff] px-3 py-2 text-lg font-black uppercase shadow-[3px_3px_0_0_#111111]">Datos de acceso</h2>
              <div className="space-y-5">
                <Field label="Nombre de usuario *" name="username" value={formData.username} onChange={handleChange} required />
                <div>
                  <label className="mb-2 block text-sm font-black uppercase">Estado</label>
                  <select name="state" value={formData.state} onChange={handleChange} className="w-full border-2 border-black bg-white px-3 py-3 font-sans font-bold outline-none focus:bg-[#fff0a8]">
                    <option value="activo">Activo</option><option value="inactivo">Inactivo</option><option value="bloqueado">Bloqueado</option>
                  </select>
                </div>
                <Field label="Nueva contraseña (opcional)" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Dejar vacío para mantener" />
                <Field label="Confirmar contraseña" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="Repite la nueva contraseña" />
              </div>
            </section>
          </div>

          <div className="flex justify-end border-t-4 border-black bg-[#ffde59] p-6">
            <button type="submit" disabled={isLoading} className="border-2 border-black bg-[#d4ff00] px-6 py-3 text-base font-black uppercase shadow-[5px_5px_0_0_#111111] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-none disabled:cursor-not-allowed disabled:opacity-50">
              {isLoading ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function Field({ label, name, value, onChange, type = "text", required = false, maxLength, placeholder }: { label: string; name: string; value: string; onChange: (event: React.ChangeEvent<HTMLInputElement>) => void; type?: string; required?: boolean; maxLength?: number; placeholder?: string }) {
  return <div><label className="mb-2 block text-sm font-black uppercase">{label}</label><input required={required} name={name} type={type} value={value} onChange={onChange} maxLength={maxLength} placeholder={placeholder} className="w-full border-2 border-black bg-white px-3 py-3 font-sans font-bold outline-none placeholder:text-gray-500 focus:bg-[#fff0a8]" /></div>;
}
