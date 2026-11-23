import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colores } from "../tema";
import { describirPuntaje, formatearFecha, formatearPrecio } from "../utilidades/formato";
import Tarjeta from "./ui/Tarjeta";

export default function TarjetaEvento({ evento, alAbrir, alAlternarFavorito }) {
  return (
    <Pressable accessibilityRole="button" onPress={() => alAbrir(evento)}>
      <Tarjeta>
        <View style={estilos.fila}>
          <Text style={estilos.categoria}>{evento.categoria.nombre}</Text>
          {alAlternarFavorito ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={evento.esFavorito ? "Quitar de favoritos" : "Marcar como favorito"}
              accessibilityState={{ selected: Boolean(evento.esFavorito) }}
              onPress={() => alAlternarFavorito(evento)}
              hitSlop={10}
            >
              <Text style={[estilos.corazon, evento.esFavorito && estilos.corazonActivo]}>{evento.esFavorito ? "♥" : "♡"}</Text>
            </Pressable>
          ) : null}
        </View>
        <Text style={estilos.nombre}>{evento.nombre}</Text>
        <Text style={estilos.detalle}>{formatearFecha(evento.fecha)}</Text>
        <Text style={estilos.detalle}>{evento.ubicacion}</Text>
        <View style={estilos.fila}>
          <Text style={estilos.precio}>Desde {formatearPrecio(evento.precioDesde)}</Text>
          <Text style={estilos.detalle}>{describirPuntaje(evento.organizador)}</Text>
        </View>
      </Tarjeta>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  categoria: { fontSize: 12, fontWeight: "700", color: colores.primario, textTransform: "uppercase" },
  corazon: { fontSize: 22, color: colores.textoSecundario },
  corazonActivo: { color: colores.error },
  nombre: { fontSize: 18, fontWeight: "700", color: colores.texto },
  detalle: { fontSize: 13, color: colores.textoSecundario },
  precio: { fontSize: 15, fontWeight: "700", color: colores.texto }
});
