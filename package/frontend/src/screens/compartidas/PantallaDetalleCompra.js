import React from "react";
import { StyleSheet, Text, View } from "react-native";
import ChatCompra from "../../components/ChatCompra";
import FormularioResena from "../../components/FormularioResena";
import HistorialCompra from "../../components/HistorialCompra";
import ListaResenas from "../../components/ListaResenas";
import Boton from "../../components/ui/Boton";
import InsigniaEstado from "../../components/ui/InsigniaEstado";
import Pagina from "../../components/ui/Pagina";
import Tarjeta from "../../components/ui/Tarjeta";
import TextoError from "../../components/ui/TextoError";
import { useDetalleCompra } from "../../hooks/useDetalleCompra";
import { useSesion } from "../../hooks/useSesion";
import { colores } from "../../tema";
import { describirDiasRestantes, formatearFecha, formatearPrecio, nombreCompleto } from "../../utilidades/formato";

export default function PantallaDetalleCompra({ compraId }) {
  const { usuario } = useSesion();
  const detalle = useDetalleCompra(compraId);
  const compra = detalle.compra;
  const dias = compra ? describirDiasRestantes(compra.diasRestantes) : null;

  return (
    <Pagina titulo="Detalle de la compra" cargando={detalle.cargando} error={detalle.error} alRecargar={detalle.recargar}>
      {compra ? (
        <>
          <Tarjeta>
            <View style={estilos.fila}>
              <Text style={estilos.nombre}>{compra.evento.nombre}</Text>
              <InsigniaEstado estado={compra.estado} />
            </View>
            <Text style={estilos.detalle}>{formatearFecha(compra.evento.fecha)} · {compra.evento.ubicacion}</Text>
            <Text style={estilos.detalle}>Comprador: {nombreCompleto(compra.comprador)}</Text>
            <Text style={estilos.detalle}>{compra.cantidad} × {compra.tipoEntrada.nombre} · Total {formatearPrecio(compra.total)}</Text>
            {dias ? <Text style={estilos.dias}>{dias}</Text> : null}
            <TextoError mensaje={detalle.errorAccion} />
            {compra.acciones.pagar ? <Boton titulo="Pagar" cargando={detalle.procesando} alPresionar={detalle.pagar} /> : null}
            {compra.acciones.utilizar ? <Boton titulo="Marcar entrada como utilizada" cargando={detalle.procesando} alPresionar={detalle.utilizar} /> : null}
            {compra.acciones.cancelar ? (
              <Boton
                titulo={compra.estado === "confirmada" ? "Cancelar y reembolsar" : "Cancelar compra"}
                variante="peligro"
                cargando={detalle.procesando}
                alPresionar={detalle.cancelar}
              />
            ) : null}
          </Tarjeta>

          {compra.acciones.calificar ? <FormularioResena enviando={detalle.procesando} alEnviar={detalle.calificar} /> : null}
          {compra.resena ? <ListaResenas titulo="Tu reseña" resenas={[compra.resena]} /> : null}

          <ChatCompra mensajes={compra.mensajes} usuarioId={usuario.id} enviando={detalle.procesando} alEnviar={detalle.enviarMensaje} />
          <HistorialCompra historial={compra.historial} />
        </>
      ) : null}
    </Pagina>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  nombre: { flex: 1, fontSize: 18, fontWeight: "700", color: colores.texto },
  detalle: { fontSize: 13, color: colores.textoSecundario },
  dias: { fontSize: 14, fontWeight: "700", color: colores.exito }
});
