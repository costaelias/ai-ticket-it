import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colores } from "../../tema";

const ESTILOS_POR_ESTADO = {
  pendiente: { etiqueta: "Pendiente", fondo: colores.advertenciaSuave, texto: colores.advertencia },
  confirmada: { etiqueta: "Confirmada", fondo: colores.exitoSuave, texto: colores.exito },
  utilizada: { etiqueta: "Utilizada", fondo: colores.primarioSuave, texto: colores.primario },
  cancelada: { etiqueta: "Cancelada", fondo: colores.neutroSuave, texto: colores.neutro },
  reembolsada: { etiqueta: "Reembolsada", fondo: colores.errorSuave, texto: colores.error }
};

export default function InsigniaEstado({ estado }) {
  const estilo = ESTILOS_POR_ESTADO[estado] ?? { etiqueta: estado, fondo: colores.neutroSuave, texto: colores.neutro };
  return (
    <View style={[estilos.insignia, { backgroundColor: estilo.fondo }]}>
      <Text style={[estilos.texto, { color: estilo.texto }]}>{estilo.etiqueta}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  insignia: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  texto: { fontSize: 12, fontWeight: "700" }
});
