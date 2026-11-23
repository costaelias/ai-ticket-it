import React from "react";
import TarjetaCompra from "../../components/TarjetaCompra";
import Pagina from "../../components/ui/Pagina";
import TextoVacio from "../../components/ui/TextoVacio";
import { useMisCompras } from "../../hooks/useMisCompras";

export default function PantallaMisCompras({ navegacion }) {
  const { compras, cargando, error, recargar } = useMisCompras();

  return (
    <Pagina titulo="Mis compras" subtitulo="Estado de tus entradas" cargando={cargando} error={error} alRecargar={recargar}>
      {compras.length === 0 ? <TextoVacio>Todavía no realizaste compras.</TextoVacio> : null}
      {compras.map(compra => (
        <TarjetaCompra key={compra.id} compra={compra} alAbrir={() => navegacion.abrir("detalleCompra", { compraId: compra.id })} />
      ))}
    </Pagina>
  );
}
