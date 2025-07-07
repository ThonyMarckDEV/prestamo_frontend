export function isValidEmail(email) {
    return /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(email);
}

// Transforma datos iniciales
export function transformInitialData(data) {
  console.log('Datos iniciales recibidos:', data);

  const datos = data.datos || {};
  const direcciones = datos.direcciones || [];
  const contactos = datos.contactos || [];
  const cuentasBancarias = datos.cuentas_bancarias || [];
  const actividadesEconomicas = datos.actividades_economicas || [];

  console.log('actividadesEconomicas iniciales:', actividadesEconomicas);

  const direccionFiscal = direcciones.find((dir) => dir.tipo === 'FISCAL') || {};
  const direccionCorrespondencia = direcciones.find((dir) => dir.tipo === 'CORRESPONDENCIA') || {};
  const contactoPrincipal = contactos.find((cont) => cont.tipo === 'PRINCIPAL') || {};
  const cuentaPrincipal = cuentasBancarias[0] || {};

  const actividadNoSensible = actividadesEconomicas.find((act) => act.idNoSensible && act.no_sensible) || null;
  const actividadCIIU = actividadesEconomicas.find((act) => act.idCiiu && act.ciiu) || null;

  // Normalizar claves para que coincidan con peruData
  const normalizeKey = (key) => (key ? key.replace(/ /g, '_').toUpperCase() : '');

  const transformedData = {
    idUsuario: data.idUsuario,
    datos: {
      nombre: datos.nombre || '',
      apellidoPaterno: datos.apellidoPaterno || '',
      apellidoMaterno: datos.apellidoMaterno || '',
      apellidoConyuge: datos.apellidoConyuge || '',
      estadoCivil: datos.estadoCivil || '',
      dni: datos.dni || '',
      fechaCaducidadDni: datos.fechaCaducidadDni || '',
      ruc: datos.ruc || '',
    },
    direcciones: [
      {
        tipo: 'FISCAL',
        tipoVia: direccionFiscal.tipoVia || '',
        nombreVia: direccionFiscal.nombreVia || '',
        numeroMz: direccionFiscal.numeroMz || '',
        urbanizacion: direccionFiscal.urbanizacion || '',
        departamento: normalizeKey(direccionFiscal.departamento),
        provincia: normalizeKey(direccionFiscal.provincia),
        distrito: direccionFiscal.distrito || '',
      },
      {
        tipo: 'CORRESPONDENCIA',
        tipoVia: direccionCorrespondencia.tipoVia || '',
        nombreVia: direccionCorrespondencia.nombreVia || '',
        numeroMz: direccionCorrespondencia.numeroMz || '',
        urbanizacion: direccionCorrespondencia.urbanizacion || '',
        departamento: normalizeKey(direccionCorrespondencia.departamento),
        provincia: normalizeKey(direccionCorrespondencia.provincia),
        distrito: direccionCorrespondencia.distrito || '',
      },
    ],
    contactos: [
      {
        tipo: 'PRINCIPAL',
        telefono: contactoPrincipal.telefono || '',
        email: contactoPrincipal.email || '',
      },
    ],
    cuentasBancarias: [
      {
        numeroCuenta: cuentaPrincipal.numeroCuenta || '',
        cci: cuentaPrincipal.cci || '',
        entidadFinanciera: cuentaPrincipal.entidadFinanciera || '',
      },
    ],
    actividadesEconomicas: {
      noSensibles: actividadNoSensible ? actividadNoSensible.no_sensible : null,
      ciiu: actividadCIIU ? actividadCIIU.ciiu : null,
    },
    expuesta: datos.expuesta === true || datos.expuesta === 1 ? 1 : 0,
    aval: datos.aval === true || datos.aval === 1 ? 1 : 0,
  };

  console.log('Datos transformados:', transformedData);
  return transformedData;
}

// Valida los campos del formulario
export function validateFields(formData) {
    const localErrors = {};

    if (!formData.datos.nombre?.trim()) localErrors['datos.nombre'] = 'El nombre es obligatorio';
    if (!formData.datos.apellidoPaterno?.trim()) localErrors['datos.apellidoPaterno'] = 'El apellido paterno es obligatorio';
    if (!formData.datos.apellidoMaterno?.trim()) localErrors['datos.apellidoMaterno'] = 'El apellido materno es obligatorio';
    if (!formData.datos.estadoCivil?.trim()) localErrors['datos.estadoCivil'] = 'Seleccione el estado civil del cliente';
    if (!formData.datos.fechaCaducidadDni?.trim()) localErrors['datos.fechaCaducidadDni'] = 'La fecha de caducidad del DNI es obligatoria';

    if (!formData.datos.dni?.trim()) {
        localErrors['datos.dni'] = 'El DNI es obligatorio';
    } else if (!/^\d{8,9}$/.test(formData.datos.dni)) {
        localErrors['datos.dni'] = 'El DNI debe tener exactamente 8 dígitos, el carnet 9 dígitos.';
    }

    if (formData.datos.ruc?.trim()) {
        if (!/^\d+$/.test(formData.datos.ruc)) {
            localErrors['datos.ruc'] = 'El RUC debe contener solo números.';
        } else if (formData.datos.ruc.length !== 11) {
            localErrors['datos.ruc'] = 'El RUC debe tener exactamente 11 dígitos.';
        }
    }

    formData.direcciones.forEach((dir) => {
        const tipo = dir.tipo === 'FISCAL' ? 'direccionFiscal' : 'direccionCorrespondencia';
        if (!dir.urbanizacion?.trim()) localErrors[`${tipo}.urbanizacion`] = 'La urbanización/caserío es obligatorio';
        if (!dir.departamento?.trim()) localErrors[`${tipo}.departamento`] = 'El departamento es obligatorio';
        if (!dir.provincia?.trim()) localErrors[`${tipo}.provincia`] = 'La provincia es obligatoria';
        if (!dir.distrito?.trim()) localErrors[`${tipo}.distrito`] = 'El distrito es obligatorio';
    });

    const cuenta = formData.cuentasBancarias[0];
    if (!cuenta?.numeroCuenta?.trim()) {
        localErrors['financiera.numeroCuenta'] = 'El número de cuenta del cliente es obligatorio';
    } else if (!/^\d{10,20}$/.test(cuenta.numeroCuenta)) {
        localErrors['financiera.numeroCuenta'] = 'El número de cuenta debe tener entre 10 y 20 dígitos';
    }
    if (cuenta?.cci?.trim()) {
        if (!/^\d{20}$/.test(cuenta.cci)) {
            localErrors['financiera.cci'] = 'El CCI debe tener exactamente 20 dígitos';
        }
    }
    if (!cuenta?.entidadFinanciera?.trim()) localErrors['financiera.entidadFinanciera'] = 'Debe seleccionar una entidad financiera';

    const contacto = formData.contactos[0];
    if (!contacto?.telefono?.trim()) {
        localErrors['contacto.telefono'] = 'El teléfono del cliente es obligatorio';
    } else if (!/^\d{6,9}$/.test(contacto.telefono)) {
        localErrors['contacto.telefono'] = 'El teléfono debe tener entre 6 y 9 dígitos';
    }
    if (!contacto?.email?.trim()) {
        localErrors['contacto.email'] = 'El correo electrónico es obligatorio';
    } else if (!isValidEmail(contacto.email)) {
        localErrors['contacto.email'] = 'Ingrese un correo electrónico válido';
    }

    if (!formData.actividadesEconomicas.noSensibles) {
        localErrors['actividadesEconomicas.noSensibles'] = 'Debe ingresar la actividad no sensible del cliente';
    }
    if (!formData.actividadesEconomicas.ciiu) {
        localErrors['actividadesEconomicas.ciiu'] = 'Debe ingresar la actividad CIIU del cliente';
    }

    if (formData.expuesta === undefined || formData.expuesta === null) {
        localErrors['expuesta'] = 'Seleccione una opción';
    }
    if (formData.aval === undefined || formData.aval === null) {
        localErrors['aval'] = 'Seleccione una opción';
    }

    return localErrors;
}

export function flattenErrors(errorsObj) {
    return Object.entries(errorsObj || {}).reduce((acc, [k, v]) => {
        acc[k] = Array.isArray(v) ? v.join(', ') : v;
        return acc;
    }, {});
}