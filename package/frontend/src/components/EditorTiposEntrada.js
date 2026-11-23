import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colores } from "../tema";
import Boton from "./ui/Boton";
import CampoTexto from "./ui/CampoTexto";
import Tarjeta from "./ui/Tarjeta";

export default function EditorTiposEntrada({ tiposEntrada, alCambiar, alAgregar, alQuitar }) {
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.titulo}>Tipos de entrada</Text>
      {tiposEntrada.map((tipo, indice) => (
        <Tarjeta key={indice}>
          <CampoTexto etiqueta="Nombre" placeholder="General, VIP..." valor={tipo.nombre} alCambiar={valor => alCambiar(indice, "nombre", valor)} />
          <CampoTexto etiqueta="Descripción (opcional)" valor={tipo.descripcion} alCambiar={valor => alCambiar(indice, "descripcion", valor)} />
          <View style={estilos.fila}>
            <View style={estilos.mitad}>
              <CampoTexto etiqueta="Precio" keyboardType="numeric" valor={tipo.precio} alCambiar={valor => alCambiar(indice, "precio", valor)} />
            </View>
            <View style={estilos.mitad}>
              <CampoTexto etiqueta="Cupo" keyboardType="numeric" valor={tipo.cupo} alCambiar={valor => alCambiar(indice, "cupo", valor)} />
            </View>
          </View>
          {tiposEntrada.length > 1 ? <Boton titulo="Quitar tipo" variante="peligro" compacto alPresionar={() => alQuitar(indice)} /> : null}
        </Tarjeta>
      ))}
      <Boton titulo="+ Agregar tipo de entrada" variante="contorno" alPresionar={alAgregar} />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { gap: 10 },
  titulo: { fontSize: 16, fontWeight: "700", color: colores.texto },
  fila: { flexDirection: "row", gap: 10 },
  mitad: { flex: 1 }
});
