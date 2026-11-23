import { useEffect, useState } from "react";
import { listarCategorias, publicarEvento } from "../services/servicioEventos";
import { useAccion } from "./useAccion";

const tipoVacio = () => ({ nombre: "", descripcion: "", precio: "", cupo: "" });

const FORMULARIO_INICIAL = {
  nombre: "",
  descripcion: "",
  categoria: "",
  ubicacion: "",
  fecha: "",
  hora: "20:00",
  multimedia: ""
};

function construirFecha(fecha, hora) {
  const resultado = new Date(`${fecha.trim()}T${hora.trim() || "00:00"}:00`);
  return Number.isNaN(resultado.getTime()) ? null : resultado.toISOString();
}

export function useCrearEvento() {
  const [categorias, setCategorias] = useState([]);
  const accion = useAccion();
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [tiposEntrada, setTiposEntrada] = useState([tipoVacio()]);
  const [errorLocal, setErrorLocal] = useState(null);

  useEffect(() => {
    listarCategorias().then(datos => setCategorias(datos.categorias)).catch(() => setCategorias([]));
  }, []);

  const cambiarCampo = (campo, valor) => setFormulario(anterior => ({ ...anterior, [campo]: valor }));
  const cambiarTipo = (indice, campo, valor) =>
    setTiposEntrada(anterior => anterior.map((tipo, posicion) => (posicion === indice ? { ...tipo, [campo]: valor } : tipo)));
  const agregarTipo = () => setTiposEntrada(anterior => [...anterior, tipoVacio()]);
  const quitarTipo = indice => setTiposEntrada(anterior => anterior.filter((_, posicion) => posicion !== indice));

  const publicar = async () => {
    const fecha = construirFecha(formulario.fecha, formulario.hora);
    if (!fecha) {
      setErrorLocal("Ingresá la fecha como AAAA-MM-DD y la hora como HH:mm.");
      return undefined;
    }
    setErrorLocal(null);
    const datos = {
      nombre: formulario.nombre,
      descripcion: formulario.descripcion,
      categoria: formulario.categoria,
      ubicacion: formulario.ubicacion,
      fecha,
      multimedia: formulario.multimedia.split(/[\n,]/).map(enlace => enlace.trim()).filter(Boolean),
      tiposEntrada: tiposEntrada.map(tipo => ({
        nombre: tipo.nombre,
        descripcion: tipo.descripcion,
        precio: tipo.precio === "" ? undefined : Number(tipo.precio),
        cupo: tipo.cupo === "" ? undefined : Number(tipo.cupo)
      }))
    };
    const respuesta = await accion.ejecutar(() => publicarEvento(datos));
    return respuesta?.evento;
  };

  return {
    categorias,
    formulario,
    tiposEntrada,
    cambiarCampo,
    cambiarTipo,
    agregarTipo,
    quitarTipo,
    publicar,
    publicando: accion.ejecutando,
    error: errorLocal ?? accion.error
  };
}
