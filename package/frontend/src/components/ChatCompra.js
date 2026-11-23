import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colores } from "../tema";
import { formatearFecha, nombreCompleto } from "../utilidades/formato";
import Boton from "./ui/Boton";
import CampoTexto from "./ui/CampoTexto";
import Tarjeta from "./ui/Tarjeta";

export default function ChatCompra({ mensajes, usuarioId, alEnviar, enviando }) {
  const [texto, setTexto] = useState("");

  const enviar = async () => {
    const enviado = await alEnviar(texto);
    if (enviado) setTexto("");
  };

  return (
    <Tarjeta>
      <Text style={estilos.titulo}>Chat de la compra</Text>
      {mensajes.length === 0 ? <Text style={estilos.detalle}>Todavía no hay mensajes.</Text> : null}
      {mensajes.map(mensaje => {
        const propio = mensaje.usuario.id === usuarioId;
        return (
          <View key={mensaje.id} style={[estilos.burbuja, propio ? estilos.propia : estilos.ajena]}>
            <Text style={estilos.autor}>{propio ? "Vos" : nombreCompleto(mensaje.usuario)}</Text>
            <Text style={estilos.texto}>{mensaje.mensaje}</Text>
            <Text style={estilos.detalle}>{formatearFecha(mensaje.enviado)}</Text>
          </View>
        );
      })}
      <CampoTexto placeholder="Escribí un mensaje" valor={texto} alCambiar={setTexto} />
      <Boton titulo="Enviar" variante="secundario" cargando={enviando} deshabilitado={!texto.trim()} alPresionar={enviar} />
    </Tarjeta>
  );
}

const estilos = StyleSheet.create({
  titulo: { fontSize: 16, fontWeight: "700", color: colores.texto },
  burbuja: { padding: 10, borderRadius: 12, gap: 2, maxWidth: "88%" },
  propia: { alignSelf: "flex-end", backgroundColor: colores.primarioSuave },
  ajena: { alignSelf: "flex-start", backgroundColor: colores.neutroSuave },
  autor: { fontSize: 12, fontWeight: "700", color: colores.texto },
  texto: { fontSize: 14, color: colores.texto },
  detalle: { fontSize: 11, color: colores.textoSecundario }
});
