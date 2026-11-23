import { useCallback, useEffect, useRef, useState } from "react";
import { mensajeDeError } from "../services/api";
import { buscarEventos, listarCategorias } from "../services/servicioEventos";
import { agregarFavorito, quitarFavorito } from "../services/servicioFavoritos";

const FILTROS_INICIALES = { busqueda: "", categoria: "", precioMin: "", precioMax: "", ordenar: "fecha", direccion: "asc" };

export function useBusquedaEventos() {
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [filtrosAplicados, setFiltrosAplicados] = useState(FILTROS_INICIALES);
  const [categorias, setCategorias] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const ultimaBusqueda = useRef(0);

  useEffect(() => {
    listarCategorias().then(datos => setCategorias(datos.categorias)).catch(() => setCategorias([]));
  }, []);

  const recargar = useCallback(async () => {
    const numero = ++ultimaBusqueda.current;
    setCargando(true);
    setError(null);
    try {
      const datos = await buscarEventos(filtrosAplicados);
      if (numero === ultimaBusqueda.current) setEventos(datos.eventos);
    } catch (falla) {
      if (numero === ultimaBusqueda.current) setError(mensajeDeError(falla));
    } finally {
      if (numero === ultimaBusqueda.current) setCargando(false);
    }
  }, [filtrosAplicados]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const cambiarFiltro = (campo, valor) => setFiltros(anterior => ({ ...anterior, [campo]: valor }));
  const aplicar = (cambios = {}) => {
    const siguientes = { ...filtros, ...cambios };
    setFiltros(siguientes);
    setFiltrosAplicados(siguientes);
  };
  const limpiar = () => {
    setFiltros(FILTROS_INICIALES);
    setFiltrosAplicados(FILTROS_INICIALES);
  };

  const alternarFavorito = async evento => {
    const operacion = evento.esFavorito ? quitarFavorito : agregarFavorito;
    const { evento: actualizado } = await operacion(evento.id);
    setEventos(anteriores => anteriores.map(candidato => (candidato.id === evento.id ? { ...candidato, esFavorito: actualizado.esFavorito } : candidato)));
  };

  return { filtros, cambiarFiltro, aplicar, limpiar, categorias, eventos, cargando, error, recargar, alternarFavorito };
}
