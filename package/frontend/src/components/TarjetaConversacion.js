import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { colores } from "../tema";
import { formatearFecha, nombreCompleto } from "../utilidades/formato";
import Tarjeta from "./ui/Tarjeta";

export default function TarjetaConversacion({ conversacion, alAbrir }) {
  const { interlocutor, evento, ultimoMensaje } = conversacion;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Conversación con ${nombreCompleto(interlocutor)} sobre ${evento.nombre}. Último mensaje: ${ultimoMensaje.mensaje}`}
      onPress={() => alAbrir(conversacion)}
    >
      <Tarjeta>
        <Text style={estilos.nombre}>{nombreCompleto(interlocutor)}</Text>
        <Text style={estilos.evento}>{evento.nombre}</Text>
        <Text style={estilos.mensaje} numberOfLines={2}>
          {ultimoMensaje.usuario.id === interlocutor.id ? "" : "Vos: "}
          {ultimoMensaje.mensaje}
        </Text>
        <Text style={estilos.fecha}>{formatearFecha(ultimoMensaje.enviado)}</Text>
      </Tarjeta>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  nombre: { fontSize: 16, fontWeight: "700", color: colores.texto },
  evento: { fontSize: 13, color: colores.textoSecundario },
  mensaje: { fontSize: 14, color: colores.texto },
  fecha: { fontSize: 12, color: colores.textoSecundario }
});
