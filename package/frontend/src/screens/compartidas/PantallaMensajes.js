import React from "react";
import TarjetaConversacion from "../../components/TarjetaConversacion";
import Pagina from "../../components/ui/Pagina";
import TextoVacio from "../../components/ui/TextoVacio";
import { useConversaciones } from "../../hooks/useConversaciones";

export default function PantallaMensajes({ navegacion }) {
  const { conversaciones, cargando, error, recargar } = useConversaciones();

  return (
    <Pagina titulo="Mensajes" subtitulo="Tus conversaciones por compra" cargando={cargando} error={error} alRecargar={recargar}>
      {conversaciones.length === 0 ? <TextoVacio>Todavía no tenés conversaciones. Escribí desde el detalle de una compra.</TextoVacio> : null}
      {conversaciones.map(conversacion => (
        <TarjetaConversacion
          key={conversacion.compraId}
          conversacion={conversacion}
          alAbrir={() => navegacion.abrir("detalleCompra", { compraId: conversacion.compraId })}
        />
      ))}
    </Pagina>
  );
}
