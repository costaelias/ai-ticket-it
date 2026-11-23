import { useCallback, useEffect, useState } from "react";
import { mensajeDeError } from "../services/api";
import { comprar as comprarEntradas } from "../services/servicioCompras";
import { obtenerEvento } from "../services/servicioEventos";
import { agregarFavorito, quitarFavorito } from "../services/servicioFavoritos";
import { useAccion } from "./useAccion";

export function useDetalleEvento(eventoId) {
  const [evento, setEvento] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const accion = useAccion();

  const recargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const datos = await obtenerEvento(eventoId);
      setEvento(datos.evento);
    } catch (falla) {
      setError(mensajeDeError(falla));
    } finally {
      setCargando(false);
    }
  }, [eventoId]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const comprar = (tipoEntradaId, cantidad) => accion.ejecutar(async () => {
    const { compra } = await comprarEntradas({ eventoId, tipoEntradaId, cantidad });
    await recargar();
    return compra;
  });

  const alternarFavorito = () => accion.ejecutar(async () => {
    const operacion = evento.esFavorito ? quitarFavorito : agregarFavorito;
    const datos = await operacion(eventoId);
    setEvento(anterior => ({ ...anterior, esFavorito: datos.evento.esFavorito }));
  });

  return { evento, cargando, error, errorAccion: accion.error, procesando: accion.ejecutando, comprar, alternarFavorito };
}
