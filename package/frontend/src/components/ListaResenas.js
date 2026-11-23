import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colores } from "../tema";
import { formatearFecha, nombreCompleto } from "../utilidades/formato";
import Tarjeta from "./ui/Tarjeta";

export default function ListaResenas({ resenas, titulo = "Reseñas del organizador" }) {
  return (
    <Tarjeta>
      <Text style={estilos.titulo}>{titulo}</Text>
      {resenas.length === 0 ? <Text style={estilos.detalle}>Todavía no tiene reseñas.</Text> : null}
      {resenas.map(resena => (
        <View key={resena.id} style={estilos.resena}>
          <Text style={estilos.puntuacion}>{"★".repeat(resena.puntuacion)}{"☆".repeat(5 - resena.puntuacion)}</Text>
          <Text style={estilos.texto}>{resena.detalle}</Text>
          <Text style={estilos.detalle}>{nombreCompleto(resena.comprador)} · {resena.evento.nombre} · {formatearFecha(resena.fecha)}</Text>
        </View>
      ))}
    </Tarjeta>
  );
}

const estilos = StyleSheet.create({
  titulo: { fontSize: 16, fontWeight: "700", color: colores.texto },
  resena: { gap: 2, paddingTop: 8, borderTopWidth: 1, borderTopColor: colores.borde },
  puntuacion: { color: colores.advertencia, fontSize: 16 },
  texto: { color: colores.texto, fontSize: 14 },
  detalle: { fontSize: 12, color: colores.textoSecundario }
});
