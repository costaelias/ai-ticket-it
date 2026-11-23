import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colores } from "../tema";
import { formatearPrecio } from "../utilidades/formato";
import Tarjeta from "./ui/Tarjeta";

export default function DisponibilidadEntradas({ tiposEntrada }) {
  return (
    <Tarjeta>
      <Text style={estilos.titulo}>Entradas disponibles</Text>
      {tiposEntrada.map(tipo => (
        <View key={tipo.id} style={estilos.fila}>
          <Text style={estilos.nombre}>{tipo.nombre} · {formatearPrecio(tipo.precio)}</Text>
          <Text style={estilos.cantidad}>{tipo.disponibles} / {tipo.cupo}</Text>
        </View>
      ))}
    </Tarjeta>
  );
}

const estilos = StyleSheet.create({
  titulo: { fontSize: 16, fontWeight: "700", color: colores.texto },
  fila: { flexDirection: "row", justifyContent: "space-between" },
  nombre: { color: colores.texto, fontSize: 14 },
  cantidad: { color: colores.primario, fontWeight: "700" }
});
