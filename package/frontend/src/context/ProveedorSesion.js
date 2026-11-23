import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { establecerAlExpirarSesion, establecerToken } from "../services/api";
import * as servicioSesion from "../services/servicioSesion";

export const ContextoSesion = createContext(null);

export function ProveedorSesion({ children }) {
  const [usuario, setUsuario] = useState(null);

  const cerrarLocalmente = useCallback(() => {
    establecerToken(null);
    setUsuario(null);
  }, []);

  useEffect(() => {
    establecerAlExpirarSesion(cerrarLocalmente);
    return () => establecerAlExpirarSesion(null);
  }, [cerrarLocalmente]);

  const iniciarSesion = useCallback(async (correo, clave) => {
    const { token, usuario: usuarioAutenticado } = await servicioSesion.iniciarSesion(correo, clave);
    establecerToken(token);
    setUsuario(usuarioAutenticado);
  }, []);

  const cerrarSesion = useCallback(async () => {
    try {
      await servicioSesion.cerrarSesion();
    } finally {
      cerrarLocalmente();
    }
  }, [cerrarLocalmente]);

  const valor = useMemo(() => ({ usuario, iniciarSesion, cerrarSesion }), [usuario, iniciarSesion, cerrarSesion]);
  return <ContextoSesion.Provider value={valor}>{children}</ContextoSesion.Provider>;
}
