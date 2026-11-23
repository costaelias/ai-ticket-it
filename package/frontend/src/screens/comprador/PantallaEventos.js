import React from "react";
import FiltrosEventos from "../../components/FiltrosEventos";
import TarjetaEvento from "../../components/TarjetaEvento";
import Pagina from "../../components/ui/Pagina";
import TextoVacio from "../../components/ui/TextoVacio";
import { useBusquedaEventos } from "../../hooks/useBusquedaEventos";

export default function PantallaEventos({ navegacion }) {
  const busqueda = useBusquedaEventos();

  return (
    <Pagina titulo="Eventos" subtitulo="Buscá, filtrá y ordená" error={busqueda.error} alRecargar={busqueda.recargar}>
      <FiltrosEventos
        filtros={busqueda.filtros}
        categorias={busqueda.categorias}
        alCambiarCampo={busqueda.cambiarFiltro}
        alAplicar={busqueda.aplicar}
        alLimpiar={busqueda.limpiar}
      />
      {busqueda.cargando ? <TextoVacio>Buscando...</TextoVacio> : null}
      {!busqueda.cargando && busqueda.eventos.length === 0 ? <TextoVacio>No se encontraron eventos.</TextoVacio> : null}
      {busqueda.eventos.map(evento => (
        <TarjetaEvento
          key={evento.id}
          evento={evento}
          alAbrir={() => navegacion.abrir("detalleEvento", { eventoId: evento.id })}
          alAlternarFavorito={busqueda.alternarFavorito}
        />
      ))}
    </Pagina>
  );
}
