import { useCallback, useEffect, useState } from "react";
import { mensajeDeError } from "../services/api";
import { listarConversaciones } from "../services/servicioCompras";

export function useConversaciones() {
  const [conversaciones, setConversaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const recargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const datos = await listarConversaciones();
      setConversaciones(datos.conversaciones);
    } catch (falla) {
      setError(mensajeDeError(falla));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  return { conversaciones, cargando, error, recargar };
}
