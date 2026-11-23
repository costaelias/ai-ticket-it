import React from "react";
import TarjetaEvento from "../../components/TarjetaEvento";
import Pagina from "../../components/ui/Pagina";
import TextoVacio from "../../components/ui/TextoVacio";
import { useFavoritos } from "../../hooks/useFavoritos";

export default function PantallaFavoritos({ navegacion }) {
  const { eventos, cargando, error, recargar, quitar } = useFavoritos();

  return (
    <Pagina titulo="Favoritos" cargando={cargando} error={error} alRecargar={recargar}>
      {eventos.length === 0 ? <TextoVacio>No marcaste eventos como favoritos.</TextoVacio> : null}
      {eventos.map(evento => (
        <TarjetaEvento
          key={evento.id}
          evento={evento}
          alAbrir={() => navegacion.abrir("detalleEvento", { eventoId: evento.id })}
          alAlternarFavorito={quitar}
        />
      ))}
    </Pagina>
  );
}
