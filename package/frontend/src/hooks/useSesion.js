import { useContext } from "react";
import { ContextoSesion } from "../context/ProveedorSesion";

export function useSesion() {
  const contexto = useContext(ContextoSesion);
  if (!contexto) throw new Error("useSesion debe usarse dentro de ProveedorSesion.");
  return contexto;
}
