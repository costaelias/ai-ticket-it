import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colores } from "../tema";
import SelectorOpciones from "./ui/SelectorOpciones";
import Boton from "./ui/Boton";
import CampoTexto from "./ui/CampoTexto";

const ORDENES = [
  { valor: "fecha", etiqueta: "Fecha" },
  { valor: "precio", etiqueta: "Precio" },
  { valor: "puntaje", etiqueta: "Puntaje" }
];

const DIRECCIONES = [
  { valor: "asc", etiqueta: "Ascendente" },
  { valor: "desc", etiqueta: "Descendente" }
];

export default function FiltrosEventos({ filtros, categorias, alCambiarCampo, alAplicar, alLimpiar }) {
  const opcionesCategoria = [{ valor: "", etiqueta: "Todas" }, ...categorias.map(categoria => ({ valor: categoria.nombre, etiqueta: categoria.nombre }))];

  return (
    <View style={estilos.contenedor}>
      <CampoTexto
        placeholder="Buscar eventos, lugares o categorías"
        valor={filtros.busqueda}
        alCambiar={texto => alCambiarCampo("busqueda", texto)}
        returnKeyType="search"
        onSubmitEditing={() => alAplicar()}
      />
      <SelectorOpciones opciones={opcionesCategoria} valor={filtros.categoria} alSeleccionar={categoria => alAplicar({ categoria })} />

      <Text style={estilos.etiqueta}>Ordenar por</Text>
      <SelectorOpciones opciones={ORDENES} valor={filtros.ordenar} alSeleccionar={ordenar => alAplicar({ ordenar })} />
      <SelectorOpciones opciones={DIRECCIONES} valor={filtros.direccion} alSeleccionar={direccion => alAplicar({ direccion })} />

      <View style={estilos.fila}>
        <View style={estilos.mitad}>
          <CampoTexto placeholder="Precio mín." keyboardType="numeric" valor={filtros.precioMin} alCambiar={valor => alCambiarCampo("precioMin", valor)} />
        </View>
        <View style={estilos.mitad}>
          <CampoTexto placeholder="Precio máx." keyboardType="numeric" valor={filtros.precioMax} alCambiar={valor => alCambiarCampo("precioMax", valor)} />
        </View>
      </View>
      <View style={estilos.fila}>
        <View style={estilos.mitad}><Boton titulo="Buscar" alPresionar={() => alAplicar()} /></View>
        <View style={estilos.mitad}><Boton titulo="Limpiar" variante="secundario" alPresionar={alLimpiar} /></View>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { gap: 10 },
  etiqueta: { fontSize: 13, fontWeight: "600", color: colores.textoSecundario },
  fila: { flexDirection: "row", gap: 10 },
  mitad: { flex: 1 }
});
