import React from "react";
import { StyleSheet, Text } from "react-native";
import ListaResenas from "../../components/ListaResenas";
import SelectorEntradas from "../../components/SelectorEntradas";
import Boton from "../../components/ui/Boton";
import Pagina from "../../components/ui/Pagina";
import Tarjeta from "../../components/ui/Tarjeta";
import TextoError from "../../components/ui/TextoError";
import { useDetalleEvento } from "../../hooks/useDetalleEvento";
import { colores } from "../../tema";
import { describirPuntaje, formatearFecha, nombreCompleto } from "../../utilidades/formato";

export default function PantallaDetalleEvento({ eventoId, navegacion }) {
  const detalle = useDetalleEvento(eventoId);
  const evento = detalle.evento;

  const comprar = async (tipoEntradaId, cantidad) => {
    const compra = await detalle.comprar(tipoEntradaId, cantidad);
    if (compra) navegacion.reemplazar("detalleCompra", { compraId: compra.id });
  };

  return (
    <Pagina titulo={evento?.nombre ?? "Evento"} cargando={detalle.cargando} error={detalle.error}>
      {evento ? (
        <>
          <Tarjeta>
            <Text style={estilos.categoria}>{evento.categoria.nombre}</Text>
            <Text style={estilos.texto}>{evento.descripcion}</Text>
            <Text style={estilos.detalle}>{formatearFecha(evento.fecha)}</Text>
            <Text style={estilos.detalle}>{evento.ubicacion}</Text>
            <Text style={estilos.detalle}>Organiza {nombreCompleto(evento.organizador)} · {describirPuntaje(evento.organizador)}</Text>
            {evento.multimedia.map(enlace => <Text key={enlace} style={estilos.enlace}>{enlace}</Text>)}
            <Boton
              titulo={evento.esFavorito ? "Quitar de favoritos" : "Agregar a favoritos"}
              variante="contorno"
              compacto
              alPresionar={detalle.alternarFavorito}
            />
          </Tarjeta>
          <TextoError mensaje={detalle.errorAccion} />
          <SelectorEntradas tiposEntrada={evento.tiposEntrada} procesando={detalle.procesando} alComprar={comprar} />
          <ListaResenas resenas={evento.resenasOrganizador} />
        </>
      ) : null}
    </Pagina>
  );
}

const estilos = StyleSheet.create({
  categoria: { fontSize: 12, fontWeight: "700", color: colores.primario, textTransform: "uppercase" },
  texto: { fontSize: 15, color: colores.texto },
  detalle: { fontSize: 13, color: colores.textoSecundario },
  enlace: { fontSize: 12, color: colores.primario }
});
