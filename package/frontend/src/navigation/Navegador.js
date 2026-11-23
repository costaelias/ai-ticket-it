import React from "react";
import { View } from "react-native";
import { useSesion } from "../hooks/useSesion";
import PantallaDetalleCompra from "../screens/compartidas/PantallaDetalleCompra";
import PantallaMensajes from "../screens/compartidas/PantallaMensajes";
import PantallaDetalleEvento from "../screens/comprador/PantallaDetalleEvento";
import PantallaEventos from "../screens/comprador/PantallaEventos";
import PantallaFavoritos from "../screens/comprador/PantallaFavoritos";
import PantallaMisCompras from "../screens/comprador/PantallaMisCompras";
import PantallaComprasEvento from "../screens/organizador/PantallaComprasEvento";
import PantallaCrearEvento from "../screens/organizador/PantallaCrearEvento";
import PantallaMisEventos from "../screens/organizador/PantallaMisEventos";
import BarraPestanas from "./BarraPestanas";
import EncabezadoApp from "./EncabezadoApp";
import { useNavegacion } from "./useNavegacion";

const CONFIGURACION_POR_ROL = {
  comprador: {
    inicial: "eventos",
    pestanas: [
      { clave: "eventos", etiqueta: "Eventos", Pantalla: PantallaEventos },
      { clave: "compras", etiqueta: "Mis compras", Pantalla: PantallaMisCompras },
      { clave: "favoritos", etiqueta: "Favoritos", Pantalla: PantallaFavoritos },
      { clave: "mensajes", etiqueta: "Mensajes", Pantalla: PantallaMensajes }
    ]
  },
  organizador: {
    inicial: "misEventos",
    pestanas: [
      { clave: "misEventos", etiqueta: "Mis eventos", Pantalla: PantallaMisEventos },
      { clave: "crearEvento", etiqueta: "Crear evento", Pantalla: PantallaCrearEvento },
      { clave: "mensajes", etiqueta: "Mensajes", Pantalla: PantallaMensajes }
    ]
  }
};

const PANTALLAS_APILADAS = {
  detalleEvento: PantallaDetalleEvento,
  detalleCompra: PantallaDetalleCompra,
  comprasEvento: PantallaComprasEvento
};

export default function Navegador() {
  const { usuario, cerrarSesion } = useSesion();
  const configuracion = CONFIGURACION_POR_ROL[usuario.rol];
  const { pestana, pantallaApilada, navegacion } = useNavegacion(configuracion.inicial);

  const PantallaActual = pantallaApilada
    ? PANTALLAS_APILADAS[pantallaApilada.nombre]
    : configuracion.pestanas.find(candidata => candidata.clave === pestana).Pantalla;

  return (
    <View style={{ flex: 1 }}>
      <EncabezadoApp usuario={usuario} alSalir={cerrarSesion} alVolver={pantallaApilada ? navegacion.volver : undefined} />
      <View style={{ flex: 1 }}>
        <PantallaActual navegacion={navegacion} {...(pantallaApilada?.parametros ?? {})} />
      </View>
      {pantallaApilada ? null : <BarraPestanas pestanas={configuracion.pestanas} activa={pestana} alSeleccionar={navegacion.cambiarPestana} />}
    </View>
  );
}
