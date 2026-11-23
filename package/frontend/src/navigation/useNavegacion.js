import { useCallback, useEffect, useState } from "react";
import { BackHandler } from "react-native";

// Navegación por estado: una pestaña activa y una pila de pantallas encima de ella.
// El botón físico de retroceso de Android vuelve atrás y nunca cierra la app por accidente.
export function useNavegacion(pestanaInicial) {
  const [pestana, setPestana] = useState(pestanaInicial);
  const [pila, setPila] = useState([]);

  const abrir = useCallback((nombre, parametros = {}) => setPila(anterior => [...anterior, { nombre, parametros }]), []);
  const reemplazar = useCallback((nombre, parametros = {}) => setPila(anterior => [...anterior.slice(0, -1), { nombre, parametros }]), []);
  const volver = useCallback(() => setPila(anterior => anterior.slice(0, -1)), []);
  const cambiarPestana = useCallback(nueva => {
    setPila([]);
    setPestana(nueva);
  }, []);

  useEffect(() => {
    const suscripcion = BackHandler.addEventListener("hardwareBackPress", () => {
      if (pila.length > 0) {
        volver();
      } else if (pestana !== pestanaInicial) {
        cambiarPestana(pestanaInicial);
      }
      return true;
    });
    return () => suscripcion.remove();
  }, [pila.length, pestana, pestanaInicial, volver, cambiarPestana]);

  return {
    pestana,
    pantallaApilada: pila.length > 0 ? pila[pila.length - 1] : null,
    navegacion: { abrir, reemplazar, volver, cambiarPestana }
  };
}
