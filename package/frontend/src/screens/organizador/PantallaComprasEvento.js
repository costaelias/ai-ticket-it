import React from "react";
import DisponibilidadEntradas from "../../components/DisponibilidadEntradas";
import TarjetaCompra from "../../components/TarjetaCompra";
import Pagina from "../../components/ui/Pagina";
import TextoVacio from "../../components/ui/TextoVacio";
import { useComprasDeEvento } from "../../hooks/useComprasDeEvento";
import { formatearFecha } from "../../utilidades/formato";

export default function PantallaComprasEvento({ eventoId, navegacion }) {
  const { evento, compras, cargando, error, recargar } = useComprasDeEvento(eventoId);

  return (
    <Pagina
      titulo={evento?.nombre ?? "Compras del evento"}
      subtitulo={evento ? formatearFecha(evento.fecha) : undefined}
      cargando={cargando}
      error={error}
      alRecargar={recargar}
    >
      {evento ? <DisponibilidadEntradas tiposEntrada={evento.tiposEntrada} /> : null}
      {compras.length === 0 && evento ? <TextoVacio>Este evento todavía no tiene compras.</TextoVacio> : null}
      {compras.map(compra => (
        <TarjetaCompra key={compra.id} compra={compra} mostrarComprador alAbrir={() => navegacion.abrir("detalleCompra", { compraId: compra.id })} />
      ))}
    </Pagina>
  );
}
