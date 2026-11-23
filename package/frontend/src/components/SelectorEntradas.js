import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colores } from "../tema";
import { formatearPrecio } from "../utilidades/formato";
import Boton from "./ui/Boton";
import Tarjeta from "./ui/Tarjeta";

const MAXIMO_POR_COMPRA = 10;

export default function SelectorEntradas({ tiposEntrada, alComprar, procesando }) {
  const [tipoId, setTipoId] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const tipo = tiposEntrada.find(candidato => candidato.id === tipoId);
  const maximo = tipo ? Math.min(MAXIMO_POR_COMPRA, tipo.disponibles) : MAXIMO_POR_COMPRA;

  const seleccionar = nuevo => {
    setTipoId(nuevo.id);
    setCantidad(1);
  };

  return (
    <Tarjeta>
      <Text style={estilos.titulo}>Entradas</Text>
      {tiposEntrada.map(candidato => {
        const agotada = candidato.disponibles === 0;
        const activa = candidato.id === tipoId;
        return (
          <Pressable
            key={candidato.id}
            disabled={agotada}
            onPress={() => seleccionar(candidato)}
            style={[estilos.tipo, activa && estilos.tipoActivo, agotada && estilos.agotada]}
          >
            <View style={estilos.tipoTexto}>
              <Text style={estilos.nombre}>{candidato.nombre}</Text>
              {candidato.descripcion ? <Text style={estilos.detalle}>{candidato.descripcion}</Text> : null}
              <Text style={estilos.detalle}>{agotada ? "Agotada" : `${candidato.disponibles} disponibles`}</Text>
            </View>
            <Text style={estilos.precio}>{formatearPrecio(candidato.precio)}</Text>
          </Pressable>
        );
      })}

      {tipo ? (
        <View style={estilos.cantidad}>
          <Boton titulo="−" variante="secundario" compacto alPresionar={() => setCantidad(actual => Math.max(1, actual - 1))} />
          <Text style={estilos.valorCantidad}>{cantidad}</Text>
          <Boton titulo="+" variante="secundario" compacto alPresionar={() => setCantidad(actual => Math.min(maximo, actual + 1))} />
          <Text style={estilos.total}>Total: {formatearPrecio(tipo.precio * cantidad)}</Text>
        </View>
      ) : null}
      <Boton titulo="Comprar" deshabilitado={!tipo} cargando={procesando} alPresionar={() => alComprar(tipo.id, cantidad)} />
    </Tarjeta>
  );
}

const estilos = StyleSheet.create({
  titulo: { fontSize: 16, fontWeight: "700", color: colores.texto },
  tipo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8, borderWidth: 1, borderColor: colores.borde, borderRadius: 10, padding: 10 },
  tipoActivo: { borderColor: colores.primario, backgroundColor: colores.primarioSuave },
  agotada: { opacity: 0.5 },
  tipoTexto: { flex: 1, gap: 2 },
  nombre: { fontSize: 15, fontWeight: "600", color: colores.texto },
  detalle: { fontSize: 12, color: colores.textoSecundario },
  precio: { fontSize: 15, fontWeight: "700", color: colores.texto },
  cantidad: { flexDirection: "row", alignItems: "center", gap: 12 },
  valorCantidad: { fontSize: 18, fontWeight: "700", minWidth: 24, textAlign: "center" },
  total: { marginLeft: "auto", fontWeight: "700", color: colores.texto }
});
