import React from "react";
import { StyleSheet, View } from "react-native";
import { colores } from "../../tema";

export default function Tarjeta({ children }) {
  return <View style={estilos.tarjeta}>{children}</View>;
}

const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: 14,
    gap: 8
  }
});
