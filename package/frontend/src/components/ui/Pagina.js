import React from "react";
import { ActivityIndicator, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { colores } from "../../tema";
import TextoError from "./TextoError";

// Contenedor de pantalla: título, estado de carga/error y desplazamiento opcional con "tirar para recargar".
export default function Pagina({ titulo, subtitulo, cargando = false, error = null, alRecargar, children, acciones }) {
  return (
    <SafeAreaView style={estilos.pantalla}>
      <ScrollView
        contentContainerStyle={estilos.contenido}
        keyboardShouldPersistTaps="handled"
        refreshControl={alRecargar ? <RefreshControl refreshing={false} onRefresh={alRecargar} /> : undefined}
      >
        {titulo ? (
          <View style={estilos.encabezado}>
            <View style={estilos.textos}>
              <Text accessibilityRole="header" style={estilos.titulo}>{titulo}</Text>
              {subtitulo ? <Text style={estilos.subtitulo}>{subtitulo}</Text> : null}
            </View>
            {acciones}
          </View>
        ) : null}
        <TextoError mensaje={error} />
        {cargando ? <ActivityIndicator size="large" color={colores.primario} style={estilos.cargando} /> : children}
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  contenido: { padding: 16, gap: 12, paddingBottom: 32 },
  encabezado: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  textos: { flex: 1, gap: 2 },
  titulo: { fontSize: 24, fontWeight: "700", color: colores.texto },
  subtitulo: { fontSize: 14, color: colores.textoSecundario },
  cargando: { marginTop: 32 }
});
