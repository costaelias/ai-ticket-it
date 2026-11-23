import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colores } from "../tema";
import { describirDiasRestantes, formatearFecha, formatearPrecio, nombreCompleto } from "../utilidades/formato";
import InsigniaEstado from "./ui/InsigniaEstado";
import Tarjeta from "./ui/Tarjeta";

// `mostrarComprador` se activa en la vista del organizador, donde importa quién compró.
export default function TarjetaCompra({ compra, alAbrir, mostrarComprador = false }) {
  const dias = describirDiasRestantes(compra.diasRestantes);
  const titulo = mostrarComprador ? nombreCompleto(compra.comprador) : compra.evento.nombre;
  const descripcion = [titulo, mostrarComprador ? null : compra.evento.ubicacion, `estado ${compra.estado}`, `${compra.cantidad} ${compra.tipoEntrada.nombre}`, dias].filter(Boolean).join(", ");
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={descripcion} onPress={() => alAbrir(compra)}>
      <Tarjeta>
        <View style={estilos.fila}>
          <Text style={estilos.nombre}>{mostrarComprador ? nombreCompleto(compra.comprador) : compra.evento.nombre}</Text>
          <InsigniaEstado estado={compra.estado} />
        </View>
        {mostrarComprador ? null : <Text style={estilos.detalle}>{formatearFecha(compra.evento.fecha)}</Text>}
        {mostrarComprador ? null : <Text style={estilos.detalle}>{compra.evento.ubicacion}</Text>}
        <Text style={estilos.detalle}>
          {compra.cantidad} × {compra.tipoEntrada.nombre} · {formatearPrecio(compra.total)}
        </Text>
        {dias ? <Text style={estilos.dias}>{dias}</Text> : null}
      </Tarjeta>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  nombre: { flex: 1, fontSize: 16, fontWeight: "700", color: colores.texto },
  detalle: { fontSize: 13, color: colores.textoSecundario },
  dias: { fontSize: 13, fontWeight: "600", color: colores.exito }
});
