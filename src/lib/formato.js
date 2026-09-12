// Formato de valores compartido entre el panel interno y la vitrina pública.

const pesos = new Intl.NumberFormat('es-CO');

export function formatearPesos(valor) {
  const numero = Number(valor);
  if (valor === '' || valor === null || valor === undefined || !Number.isFinite(numero)) {
    return '';
  }
  return pesos.format(numero);
}
