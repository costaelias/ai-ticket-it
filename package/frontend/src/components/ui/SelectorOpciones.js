import React from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { colores } from "../../tema";

// Lista horizontal de opciones seleccionables. `opciones`: [{ valor, etiqueta }].
export default function SelectorOpciones({ opciones, valor, alSeleccionar }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.fila}>
      {opciones.map(opcion => {
        const activa = opcion.valor === valor;
        return (
          <Pressable
            key={String(opcion.valor)}
            accessibilityRole="button"
            accessibilityState={{ selected: activa }}
            onPress={() => alSeleccionar(opcion.valor)}
            style={[estilos.opcion, activa && estilos.activa]}
          >
            <Text style={[estilos.texto, activa && estilos.textoActivo]}>{opcion.etiqueta}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  fila: { gap: 8, paddingVertical: 2 },
  opcion: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: colores.borde, backgroundColor: colores.superficie },
  activa: { backgroundColor: colores.primario, borderColor: colores.primario },
  texto: { color: colores.texto, fontSize: 14 },
  textoActivo: { color: "#fff", fontWeight: "600" }
});
