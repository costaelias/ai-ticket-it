import { useCallback, useEffect, useState } from "react";
import { mensajeDeError } from "../services/api";
import { calificarCompra, cancelarCompra, enviarMensaje as enviarMensajeApi, obtenerCompra, pagarCompra, utilizarCompra } from "../services/servicioCompras";
import { useAccion } from "./useAccion";

export function useDetalleCompra(compraId) {
  const [compra, setCompra] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const accion = useAccion();

  const recargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const datos = await obtenerCompra(compraId);
      setCompra(datos.compra);
    } catch (falla) {
      setError(mensajeDeError(falla));
    } finally {
      setCargando(false);
    }
  }, [compraId]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const aplicar = operacion => accion.ejecutar(async () => {
    const datos = await operacion(compraId);
    setCompra(datos.compra);
    return datos.compra;
  });

  const enviarMensaje = texto => accion.ejecutar(async () => {
    await enviarMensajeApi(compraId, texto);
    await recargar();
    return true;
  });

  const calificar = datos => accion.ejecutar(async () => {
    await calificarCompra(compraId, datos);
    await recargar();
    return true;
  });

  return {
    compra,
    cargando,
    error,
    errorAccion: accion.error,
    procesando: accion.ejecutando,
    recargar,
    pagar: () => aplicar(pagarCompra),
    cancelar: () => aplicar(cancelarCompra),
    utilizar: () => aplicar(utilizarCompra),
    enviarMensaje,
    calificar
  };
}
