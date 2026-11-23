import { useCallback, useEffect, useState } from "react";
import { mensajeDeError } from "../services/api";
import { listarFavoritos, quitarFavorito } from "../services/servicioFavoritos";
import { useAccion } from "./useAccion";

export function useFavoritos() {
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const accion = useAccion();

  const recargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const datos = await listarFavoritos();
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

  const quitar = evento => accion.ejecutar(async () => {
    await quitarFavorito(evento.id);
    setEventos(anteriores => anteriores.filter(candidato => candidato.id !== evento.id));
  });

  return { eventos, cargando, error: error ?? accion.error, recargar, quitar };
}
