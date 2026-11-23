import { useCallback, useEffect, useState } from "react";
import { mensajeDeError } from "../services/api";
import { listarMisCompras } from "../services/servicioCompras";

export function useMisCompras() {
  const [compras, setCompras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const recargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const datos = await listarMisCompras();
      setCompras(datos.compras);
    } catch (falla) {
      setError(mensajeDeError(falla));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  return { compras, cargando, error, recargar };
}
