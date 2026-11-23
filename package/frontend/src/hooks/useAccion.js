import { useCallback, useState } from "react";
import { mensajeDeError } from "../services/api";

// Ejecuta una operación que modifica datos y expone su estado de envío y error.
export function useAccion() {
  const [ejecutando, setEjecutando] = useState(false);
  const [error, setError] = useState(null);

  const ejecutar = useCallback(async operacion => {
    setEjecutando(true);
    setError(null);
    try {
      return await operacion();
    } catch (falla) {
      setError(mensajeDeError(falla));
      return undefined;
    } finally {
      setEjecutando(false);
    }
  }, []);

  return { ejecutar, ejecutando, error, limpiarError: () => setError(null) };
}
