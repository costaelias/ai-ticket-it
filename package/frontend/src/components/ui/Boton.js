import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { colores } from "../../tema";

const VARIANTES = {
  primario: { fondo: colores.primario, texto: "#fff", borde: colores.primario },
  secundario: { fondo: colores.primarioSuave, texto: colores.primario, borde: colores.primarioSuave },
  contorno: { fondo: "transparent", texto: colores.primario, borde: colores.primario },
  peligro: { fondo: colores.errorSuave, texto: colores.error, borde: colores.errorSuave }
};

export default function Boton({ titulo, alPresionar, variante = "primario", cargando = false, deshabilitado = false, compacto = false }) {
  const estilo = VARIANTES[variante];
  const inactivo = deshabilitado || cargando;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={titulo}
      accessibilityState={{ disabled: inactivo, busy: cargando }}
      disabled={inactivo}
      onPress={alPresionar}
      style={({ pressed }) => [
        estilos.base,
        compacto && estilos.compacto,
        { backgroundColor: estilo.fondo, borderColor: estilo.borde },
        (pressed || inactivo) && estilos.atenuado
      ]}
    >
      {cargando ? <ActivityIndicator color={estilo.texto} /> : <Text style={[estilos.texto, { color: estilo.texto }]}>{titulo}</Text>}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: { minHeight: 46, borderRadius: 10, borderWidth: 1, paddingHorizontal: 16, alignItems: "center", justifyContent: "center" },
  compacto: { minHeight: 36, paddingHorizontal: 12 },
  atenuado: { opacity: 0.6 },
  texto: { fontSize: 15, fontWeight: "600" }
});
