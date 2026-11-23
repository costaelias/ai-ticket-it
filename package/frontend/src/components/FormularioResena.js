import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colores } from "../tema";
import Boton from "./ui/Boton";
import CampoTexto from "./ui/CampoTexto";
import Tarjeta from "./ui/Tarjeta";

export default function FormularioResena({ alEnviar, enviando }) {
  const [puntuacion, setPuntuacion] = useState(5);
  const [detalle, setDetalle] = useState("");

  return (
    <Tarjeta>
      <Text style={estilos.titulo}>Calificá el evento</Text>
      <View style={estilos.estrellas}>
        {[1, 2, 3, 4, 5].map(valor => (
          <Pressable
            key={valor}
            accessibilityRole="button"
            accessibilityLabel={`${valor} ${valor === 1 ? "estrella" : "estrellas"}`}
            accessibilityState={{ selected: valor === puntuacion }}
            onPress={() => setPuntuacion(valor)}
          >
            <Text style={[estilos.estrella, valor <= puntuacion && estilos.estrellaActiva]}>★</Text>
          </Pressable>
        ))}
      </View>
      <CampoTexto placeholder="Contanos cómo fue tu experiencia" multilinea valor={detalle} alCambiar={setDetalle} />
      <Boton titulo="Enviar reseña" cargando={enviando} deshabilitado={!detalle.trim()} alPresionar={() => alEnviar({ puntuacion, detalle })} />
    </Tarjeta>
  );
}

const estilos = StyleSheet.create({
  titulo: { fontSize: 16, fontWeight: "700", color: colores.texto },
  estrellas: { flexDirection: "row", gap: 6 },
  estrella: { fontSize: 32, color: colores.borde },
  estrellaActiva: { color: colores.advertencia }
});
