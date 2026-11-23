import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colores } from "../../tema";

export default function TextoError({ mensaje }) {
  if (!mensaje) return null;
  return (
    <View style={estilos.contenedor} accessibilityRole="alert">
      <Text style={estilos.texto}>{mensaje}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { backgroundColor: colores.errorSuave, borderRadius: 10, padding: 12 },
  texto: { color: colores.error, fontSize: 14 }
});
