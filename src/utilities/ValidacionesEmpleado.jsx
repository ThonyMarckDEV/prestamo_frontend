// utilities/ValidacionesEmpleado.js
export function isValidEmail(email) {
  return /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(email);
}

export const transformInitialData = (data = {}) => {
  console.log('transformInitialData: Input data:', data); // Debug log

  // Try cuentas_bancarias (snake_case) first, then fall back to cuentasBancarias (camelCase)
  const cuentasBancarias = data.datos?.cuentas_bancarias || data.datos?.cuentasBancarias || [];
  const financieraData = Array.isArray(cuentasBancarias) && cuentasBancarias.length > 0
    ? {
        numeroCuenta: cuentasBancarias[0].numeroCuenta || '',
        cci: cuentasBancarias[0].cci || '',
        entidadFinanciera: cuentasBancarias[0].entidadFinanciera || ''
      }
    : { numeroCuenta: '', cci: '', entidadFinanciera: '' };

  if (!Array.isArray(cuentasBancarias)) {
    console.warn('transformInitialData: cuentas_bancarias/cuentasBancarias is missing or not an array', data.datos);
  }

  return {
    idUsuario: data.idUsuario || '',
    username: data.username || '',
    password: '',
    password_confirmation: '',
    idRol: data.idRol || '',
    datos: {
      nombre: data.datos?.nombre || '',
      apellidoPaterno: data.datos?.apellidoPaterno || '',
      apellidoMaterno: data.datos?.apellidoMaterno || '',
      apellidoConyuge: data.datos?.apellidoConyuge || '',
      estadoCivil: data.datos?.estadoCivil || '',
      dni: data.datos?.dni || '',
      fechaCaducidadDni: data.datos?.fechaCaducidadDni || '',
      ruc: data.datos?.ruc || '',
    },
    direcciones: Array.isArray(data.datos?.direcciones) && data.datos.direcciones.length
      ? data.datos.direcciones
      : [
          { tipo: 'FISCAL', tipoVia: '', nombreVia: '', numeroMz: '', urbanizacion: '', departamento: '', provincia: '', distrito: '' },
          { tipo: 'CORRESPONDENCIA', tipoVia: '', nombreVia: '', numeroMz: '', urbanizacion: '', departamento: '', provincia: '', distrito: '' }
        ],
    contactos: Array.isArray(data.datos?.contactos) && data.datos.contactos.length
      ? data.datos.contactos
      : [{ tipo: 'PRINCIPAL', telefono: '', email: '' }],
    financiera: financieraData
  };
};

// ValidacionesEmpleado.js
export const validateFields = (formData, isEditing, editPassword) => {
  const errors = {};

  // Ensure formData is defined
  if (!formData) {
    console.error('validateFields: formData is undefined');
    return { general: 'Datos del formulario no disponibles' };
  }

  // Validate user access data
  if (!formData.username) {
    errors.username = ['El nombre de usuario es obligatorio.'];
  }
  if (!isEditing || editPassword) {
    if (!formData.password) {
      errors.password = ['La contraseña es obligatoria.'];
    } else if (formData.password.length < 5) {
      errors.password = ['La contraseña debe tener al menos 5 caracteres.'];
    }
    if (formData.password !== formData.password_confirmation) {
      errors.password_confirmation = ['Las contraseñas no coinciden.'];
    }
  }
  if (!formData.idRol) {
    errors.idRol = ['El rol es obligatorio.'];
  }

  // Validate personal data
  if (!formData.datos) {
    errors.datos = { general: ['Los datos personales son obligatorios.'] };
  } else {
    const datosErrors = {};
    if (!formData.datos.nombre) {
      datosErrors.nombre = ['El nombre es obligatorio.'];
    } else if (formData.datos.nombre.length > 100) {
      datosErrors.nombre = ['El nombre no puede exceder los 100 caracteres.'];
    }
    if (!formData.datos.apellidoPaterno) {
      datosErrors.apellidoPaterno = ['El apellido paterno es obligatorio.'];
    } else if (formData.datos.apellidoPaterno.length > 50) {
      datosErrors.apellidoPaterno = ['El apellido paterno no puede exceder los 50 caracteres.'];
    }
    if (!formData.datos.apellidoMaterno) {
      datosErrors.apellidoMaterno = ['El apellido materno es obligatorio.'];
    } else if (formData.datos.apellidoMaterno.length > 50) {
      datosErrors.apellidoMaterno = ['El apellido materno no puede exceder los 50 caracteres.'];
    }
    if (formData.datos.apellidoConyuge && formData.datos.apellidoConyuge.length > 50) {
      datosErrors.apellidoConyuge = ['El apellido de cónyuge no puede exceder los 50 caracteres.'];
    }
    if (!formData.datos.estadoCivil) {
      datosErrors.estadoCivil = ['El estado civil es obligatorio.'];
    } else if (formData.datos.estadoCivil.length > 50) {
      datosErrors.estadoCivil = ['El estado civil no puede exceder los 50 caracteres.'];
    }
    if (!formData.datos.dni) {
      datosErrors.dni = ['El DNI es obligatorio.'];
    } else if (formData.datos.dni.length > 9) {
      datosErrors.dni = ['El DNI no puede exceder los 9 caracteres.'];
    }
    if (!formData.datos.fechaCaducidadDni) {
      datosErrors.fechaCaducidadDni = ['La fecha de caducidad del DNI es obligatoria.'];
    } else if (isNaN(Date.parse(formData.datos.fechaCaducidadDni))) {
      datosErrors.fechaCaducidadDni = ['La fecha de caducidad del DNI debe ser una fecha válida.'];
    }
    if (formData.datos.ruc && formData.datos.ruc.length !== 11) {
      datosErrors.ruc = ['El RUC debe tener exactamente 11 caracteres.'];
    }
    if (Object.keys(datosErrors).length) {
      errors.datos = datosErrors;
    }
  }

  // Validate contactos
  if (!Array.isArray(formData.contactos) || !formData.contactos.length) {
    errors.contactos = ['Debe proporcionar al menos un contacto.'];
  } else {
    formData.contactos.forEach((contacto, index) => {
      const contactoErrors = {};
      if (!contacto.tipo) {
        contactoErrors.tipo = ['El tipo de contacto es obligatorio.'];
      } else if (!['PRINCIPAL', 'SECUNDARIO'].includes(contacto.tipo)) {
        contactoErrors.tipo = ['El tipo de contacto debe ser PRINCIPAL o SECUNDARIO.'];
      }
      if (!contacto.telefono) {
        contactoErrors.telefono = ['El teléfono del contacto es obligatorio.'];
      } else if (contacto.telefono.length > 9) {
        contactoErrors.telefono = ['El teléfono del contacto no puede exceder los 9 caracteres.'];
      }
      if (contacto.telefonoDos && contacto.telefonoDos.length > 9) {
        contactoErrors.telefonoDos = ['El segundo teléfono del contacto no puede exceder los 9 caracteres.'];
      }
      if (!contacto.email) {
        contactoErrors.email = ['El correo electrónico del contacto es obligatorio.'];
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contacto.email)) {
        contactoErrors.email = ['El correo electrónico del contacto debe ser válido.'];
      }
      if (Object.keys(contactoErrors).length) {
        errors[`contactos.${index}`] = contactoErrors;
      }
    });
  }

  // Validate direcciones
  if (!Array.isArray(formData.direcciones) || !formData.direcciones.length) {
    errors.direcciones = ['Debe proporcionar al menos una dirección.'];
  } else {
    formData.direcciones.forEach((direccion, index) => {
      const direccionErrors = {};
      if (direccion.tipo && !['FISCAL', 'CORRESPONDENCIA'].includes(direccion.tipo)) {
        direccionErrors.tipo = ['El tipo de dirección debe ser FISCAL o CORRESPONDENCIA.'];
      }
      if (direccion.tipoVia && direccion.tipoVia.length > 100) {
        direccionErrors.tipoVia = ['El tipo de vía no puede exceder los 100 caracteres.'];
      }
      if (direccion.nombreVia && direccion.nombreVia.length > 100) {
        direccionErrors.nombreVia = ['El nombre de la vía no puede exceder los 100 caracteres.'];
      }
      if (direccion.numeroMz && direccion.numeroMz.length > 50) {
        direccionErrors.numeroMz = ['El número o manzana no puede exceder los 50 caracteres.'];
      }
      if (!direccion.urbanizacion) {
        direccionErrors.urbanizacion = ['La urbanización es obligatoria.'];
      } else if (direccion.urbanizacion.length > 100) {
        direccionErrors.urbanizacion = ['La urbanización no puede exceder los 100 caracteres.'];
      }
      if (!direccion.departamento) {
        direccionErrors.departamento = ['El departamento es obligatorio.'];
      } else if (direccion.departamento.length > 50) {
        direccionErrors.departamento = ['El departamento no puede exceder los 50 caracteres.'];
      }
      if (!direccion.provincia) {
        direccionErrors.provincia = ['La provincia es obligatoria.'];
      } else if (direccion.provincia.length > 50) {
        direccionErrors.provincia = ['La provincia no puede exceder los 50 caracteres.'];
      }
      if (!direccion.distrito) {
        direccionErrors.distrito = ['El distrito es obligatorio.'];
      } else if (direccion.distrito.length > 50) {
        direccionErrors.distrito = ['El distrito no puede exceder los 50 caracteres.'];
      }
      if (Object.keys(direccionErrors).length) {
        errors[`direcciones.${index}`] = direccionErrors;
      }
    });
  }

  // Validate financiera
  if (!formData.financiera) {
    errors.financiera = { general: ['Los datos financieros son obligatorios.'] };
  } else {
    const financieraErrors = {};
    if (!formData.financiera.numeroCuenta) {
      financieraErrors.numeroCuenta = ['El número de cuenta es obligatorio.'];
    } else if (formData.financiera.numeroCuenta.length > 20) {
      financieraErrors.numeroCuenta = ['El número de cuenta no puede exceder los 20 caracteres.'];
    }
    if (formData.financiera.cci && formData.financiera.cci.length !== 20) {
      financieraErrors.cci = ['El CCI debe tener exactamente 20 caracteres.'];
    }
    if (!formData.financiera.entidadFinanciera) {
      financieraErrors.entidadFinanciera = ['La entidad financiera es obligatoria.'];
    } else if (formData.financiera.entidadFinanciera.length > 50) {
      financieraErrors.entidadFinanciera = ['La entidad financiera no puede exceder los 50 caracteres.'];
    }
    if (Object.keys(financieraErrors).length) {
      errors.financiera = financieraErrors;
    }
  }

  return errors;
};

// utilities/ValidacionesEmpleado.js
export const flattenErrors = (errors) => {
  if (!errors || typeof errors !== 'object') {
    console.error('flattenErrors: Invalid errors object', errors);
    return [];
  }

  return Object.values(errors)
    .flat()
    .filter((error) => typeof error === 'string' && error.trim());
};