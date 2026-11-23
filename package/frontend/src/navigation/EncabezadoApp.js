import React from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { colores } from "../tema";
import { nombreCompleto } from "../utilidades/formato";

export default function EncabezadoApp({ usuario, alSalir, alVolver }) {
  return (
    <SafeAreaView style={estilos.contenedor}>
      <View style={estilos.fila}>
        {alVolver ? (
          <Pressable accessibilityRole="button" onPress={alVolver} hitSlop={10}>
            <Text style={estilos.volver}>← Volver</Text>
          </Pressable>
        ) : (
          <Text style={estilos.marca}>AI Ticket It</Text>
        )}
        <View style={estilos.usuario}>
          <Text style={estilos.nombre}>{nombreCompleto(usuario)} · {usuario.rol}</Text>
          <Pressable accessibilityRole="button" onPress={alSalir} hitSlop={10}>
            <Text style={estilos.salir}>Salir</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { backgroundColor: colores.superficie, borderBottomWidth: 1, borderBottomColor: colores.borde, paddingTop: 28 },
  fila: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 10 },
  marca: { fontSize: 18, fontWeight: "800", color: colores.primario },
  volver: { fontSize: 15, fontWeight: "600", color: colores.primario },
  usuario: { alignItems: "flex-end", gap: 2 },
  nombre: { fontSize: 12, color: colores.textoSecundario },
  salir: { fontSize: 13, fontWeight: "700", color: colores.error }
});
