import React from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { colores } from "../tema";

export default function BarraPestanas({ pestanas, activa, alSeleccionar }) {
  return (
    <SafeAreaView style={estilos.contenedor}>
      <View style={estilos.fila}>
        {pestanas.map(pestana => {
          const seleccionada = pestana.clave === activa;
          return (
            <Pressable key={pestana.clave} accessibilityRole="tab" accessibilityState={{ selected: seleccionada }} style={estilos.pestana} onPress={() => alSeleccionar(pestana.clave)}>
              <Text style={[estilos.etiqueta, seleccionada && estilos.etiquetaActiva]}>{pestana.etiqueta}</Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { backgroundColor: colores.superficie, borderTopWidth: 1, borderTopColor: colores.borde },
  fila: { flexDirection: "row" },
  pestana: { flex: 1, alignItems: "center", paddingVertical: 14 },
  etiqueta: { fontSize: 14, color: colores.textoSecundario },
  etiquetaActiva: { color: colores.primario, fontWeight: "700" }
});
