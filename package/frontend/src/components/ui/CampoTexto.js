import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { colores } from "../../tema";

export default function CampoTexto({ etiqueta, valor, alCambiar, multilinea = false, ...resto }) {
  return (
    <View style={estilos.contenedor}>
      {etiqueta ? <Text style={estilos.etiqueta}>{etiqueta}</Text> : null}
      <TextInput
        value={valor}
        onChangeText={alCambiar}
        multiline={multilinea}
        accessibilityLabel={etiqueta ?? resto.placeholder}
        placeholderTextColor={colores.textoSecundario}
        style={[estilos.campo, multilinea && estilos.multilinea]}
        {...resto}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { gap: 6 },
  etiqueta: { fontSize: 13, fontWeight: "600", color: colores.texto },
  campo: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: colores.superficie,
    color: colores.texto,
    fontSize: 15
  },
  multilinea: { minHeight: 90, paddingTop: 10, textAlignVertical: "top" }
});
