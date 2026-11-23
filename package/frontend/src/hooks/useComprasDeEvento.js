import { useCallback, useEffect, useState } from "react";
import { mensajeDeError } from "../services/api";
import { listarComprasDeEvento } from "../services/servicioEventos";

export function useComprasDeEvento(eventoId) {
  const [evento, setEvento] = useState(null);
  const [compras, setCompras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const recargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const datos = await listarComprasDeEvento(eventoId);
      setEvento(datos.evento);
      setCompras(datos.compras);
    } catch (falla) {
      setError(mensajeDeError(falla));
    } finally {
      setCargando(false);
    }
  }, [eventoId]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  return { evento, compras, cargando, error, recargar };
}
