import React from "react";
import { StyleSheet, Text } from "react-native";
import { colores } from "../../tema";

export default function TextoVacio({ children }) {
  return <Text style={estilos.texto}>{children}</Text>;
}

const estilos = StyleSheet.create({
  texto: { textAlign: "center", color: colores.textoSecundario, marginTop: 24, fontSize: 15 }
});
