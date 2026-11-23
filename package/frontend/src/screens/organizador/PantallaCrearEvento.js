import React from "react";
import { StyleSheet, Text } from "react-native";
import EditorTiposEntrada from "../../components/EditorTiposEntrada";
import Boton from "../../components/ui/Boton";
import CampoTexto from "../../components/ui/CampoTexto";
import Pagina from "../../components/ui/Pagina";
import SelectorOpciones from "../../components/ui/SelectorOpciones";
import { useCrearEvento } from "../../hooks/useCrearEvento";
import { colores } from "../../tema";

export default function PantallaCrearEvento({ navegacion }) {
  const creacion = useCrearEvento();
  const { formulario } = creacion;
  const opcionesCategoria = creacion.categorias.map(categoria => ({ valor: categoria.nombre, etiqueta: categoria.nombre }));

  const publicar = async () => {
    const evento = await creacion.publicar();
    if (evento) navegacion.cambiarPestana("misEventos");
  };

  return (
    <Pagina titulo="Crear evento" error={creacion.error}>
      <CampoTexto etiqueta="Nombre" valor={formulario.nombre} alCambiar={valor => creacion.cambiarCampo("nombre", valor)} />
      <CampoTexto etiqueta="Descripción" multilinea valor={formulario.descripcion} alCambiar={valor => creacion.cambiarCampo("descripcion", valor)} />
      <Text style={estilos.etiqueta}>Categoría</Text>
      <SelectorOpciones opciones={opcionesCategoria} valor={formulario.categoria} alSeleccionar={valor => creacion.cambiarCampo("categoria", valor)} />
      <CampoTexto etiqueta="Ubicación" valor={formulario.ubicacion} alCambiar={valor => creacion.cambiarCampo("ubicacion", valor)} />
      <CampoTexto etiqueta="Fecha (AAAA-MM-DD)" placeholder="2026-12-31" valor={formulario.fecha} alCambiar={valor => creacion.cambiarCampo("fecha", valor)} />
      <CampoTexto etiqueta="Hora (HH:mm)" placeholder="20:00" valor={formulario.hora} alCambiar={valor => creacion.cambiarCampo("hora", valor)} />
      <CampoTexto
        etiqueta="Imágenes o videos (enlaces separados por coma)"
        autoCapitalize="none"
        valor={formulario.multimedia}
        alCambiar={valor => creacion.cambiarCampo("multimedia", valor)}
      />
      <EditorTiposEntrada
        tiposEntrada={creacion.tiposEntrada}
        alCambiar={creacion.cambiarTipo}
        alAgregar={creacion.agregarTipo}
        alQuitar={creacion.quitarTipo}
      />
      <Boton titulo="Publicar evento" cargando={creacion.publicando} alPresionar={publicar} />
    </Pagina>
  );
}

const estilos = StyleSheet.create({
  etiqueta: { fontSize: 13, fontWeight: "600", color: colores.texto }
});
