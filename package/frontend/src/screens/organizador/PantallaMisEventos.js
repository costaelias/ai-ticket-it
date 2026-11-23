import React from "react";
import { StyleSheet, View } from "react-native";
import TarjetaEvento from "../../components/TarjetaEvento";
import Boton from "../../components/ui/Boton";
import Pagina from "../../components/ui/Pagina";
import TextoVacio from "../../components/ui/TextoVacio";
import { useMisEventos } from "../../hooks/useMisEventos";

export default function PantallaMisEventos({ navegacion }) {
  const { eventos, cargando, error, recargar } = useMisEventos();
  const verCompras = evento => navegacion.abrir("comprasEvento", { eventoId: evento.id });

  return (
    <Pagina titulo="Mis eventos" subtitulo="Tocá un evento para ver sus compras" cargando={cargando} error={error} alRecargar={recargar}>
      {eventos.length === 0 ? <TextoVacio>Todavía no publicaste eventos.</TextoVacio> : null}
      {eventos.map(evento => (
        <View key={evento.id} style={estilos.bloque}>
          <TarjetaEvento evento={evento} alAbrir={verCompras} />
          <Boton titulo="Ver compras" variante="secundario" compacto alPresionar={() => verCompras(evento)} />
        </View>
      ))}
    </Pagina>
  );
}

const estilos = StyleSheet.create({
  bloque: { gap: 6 }
});
