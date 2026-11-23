import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colores } from "../tema";
import { formatearFecha, nombreCompleto } from "../utilidades/formato";
import InsigniaEstado from "./ui/InsigniaEstado";
import Tarjeta from "./ui/Tarjeta";

export default function HistorialCompra({ historial }) {
  return (
    <Tarjeta>
      <Text style={estilos.titulo}>Historial de estados</Text>
      {historial.map((cambio, indice) => (
        <View key={`${cambio.estado}-${indice}`} style={estilos.fila}>
          <InsigniaEstado estado={cambio.estado} />
          <Text style={estilos.detalle}>{formatearFecha(cambio.fechaHora)} · {nombreCompleto(cambio.quien)}</Text>
        </View>
      ))}
    </Tarjeta>
  );
}

const estilos = StyleSheet.create({
  titulo: { fontSize: 16, fontWeight: "700", color: colores.texto },
  fila: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  detalle: { fontSize: 12, color: colores.textoSecundario }
});
