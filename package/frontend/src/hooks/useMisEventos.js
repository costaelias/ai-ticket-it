import { useCallback, useEffect, useState } from "react";
import { mensajeDeError } from "../services/api";
import { listarMisEventos } from "../services/servicioEventos";

export function useMisEventos() {
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const recargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const datos = await listarMisEventos();
      setEventos(datos.eventos);
    } catch (falla) {
      setError(mensajeDeError(falla));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  return { eventos, cargando, error, recargar };
}
