import React, { useState } from "react";
import Boton from "../components/ui/Boton";
import CampoTexto from "../components/ui/CampoTexto";
import Pagina from "../components/ui/Pagina";
import TextoError from "../components/ui/TextoError";
import { useAccion } from "../hooks/useAccion";
import { useSesion } from "../hooks/useSesion";

export default function PantallaInicioSesion() {
  const { iniciarSesion } = useSesion();
  const accion = useAccion();
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");

  const ingresar = () => accion.ejecutar(() => iniciarSesion(correo.trim(), clave));

  return (
    <Pagina titulo="AI Ticket It" subtitulo="Comprá y vendé entradas para tus eventos">
      <CampoTexto etiqueta="Correo" autoCapitalize="none" keyboardType="email-address" valor={correo} alCambiar={setCorreo} />
      <CampoTexto etiqueta="Clave" secureTextEntry valor={clave} alCambiar={setClave} />
      <TextoError mensaje={accion.error} />
      <Boton titulo="Ingresar" cargando={accion.ejecutando} deshabilitado={!correo || !clave} alPresionar={ingresar} />
    </Pagina>
  );
}
