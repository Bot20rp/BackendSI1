export function obtenerHoraActual() {
    const now = new Date();

    const hora = now.toLocaleTimeString('es-BO');
    return `${hora}`;
  }

export function obtenerFechaactual() {
    const now = new Date();
    const fecha = now.toLocaleDateString('en-EN');
   
    return `${fecha}`;
  }
  console.log(obtenerFechaactual())