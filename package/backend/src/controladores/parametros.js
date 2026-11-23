export function textoDeConsulta(valor) {
  return typeof valor === "string" && valor.trim() !== "" ? valor : undefined;
}

export function numeroDeConsulta(valor) {
  const texto = textoDeConsulta(valor);
  return texto === undefined ? undefined : Number(texto);
}
