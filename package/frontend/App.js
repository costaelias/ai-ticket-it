import { StatusBar } from "expo-status-bar";
import React from "react";
import { ProveedorSesion } from "./src/context/ProveedorSesion";
import { useSesion } from "./src/hooks/useSesion";
import Navegador from "./src/navigation/Navegador";
import PantallaInicioSesion from "./src/screens/PantallaInicioSesion";

function Raiz() {
  const { usuario } = useSesion();
  return usuario ? <Navegador /> : <PantallaInicioSesion />;
}

export default function App() {
  return (
    <ProveedorSesion>
      <StatusBar style="dark" />
      <Raiz />
    </ProveedorSesion>
  );
}
