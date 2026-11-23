export class ErrorAplicacion extends Error {
  constructor(mensaje, estado = 500) {
    super(mensaje);
    this.name = this.constructor.name;
    this.estado = estado;
  }
}

export class BadRequest extends ErrorAplicacion {
  constructor(mensaje) {
    super(mensaje, 400);
  }
}

export class Unauthorized extends ErrorAplicacion {
  constructor(mensaje = "Necesitás iniciar sesión.") {
    super(mensaje, 401);
  }
}

export class Forbidden extends ErrorAplicacion {
  constructor(mensaje = "No tenés permiso para realizar esta acción.") {
    super(mensaje, 403);
  }
}

export class NotFound extends ErrorAplicacion {
  constructor(mensaje = "No se encontró el recurso solicitado.") {
    super(mensaje, 404);
  }
}

export class Conflict extends ErrorAplicacion {
  constructor(mensaje) {
    super(mensaje, 409);
  }
}
