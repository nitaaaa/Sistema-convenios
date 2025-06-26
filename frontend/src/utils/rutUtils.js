const formatRut = (rut) => {
    // Si hay menos de 2 caracteres, devolver el valor sin formato
    if (rut.length < 2) {
        return rut;
    }
    
    rut = rut.replace(/[^0-9kK]/g, '');
    rut = rut.toLowerCase();
    let rutBody = rut.slice(0, -1);
    let rutDv = rut.slice(-1);
    
    // Asegurar que solo números estén en el cuerpo del RUT
    rutBody = rutBody.replace(/[^0-9]/g, '');
    rutBody = rutBody.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    return `${rutBody}-${rutDv}`;
};

const validarRut = (rut) => {
    // Limpiar el RUT de puntos y guión
    const rutLimpio = rut.replace(/[.-]/g, '');
    
    // Verificar que tenga al menos 2 caracteres
    if (rutLimpio.length < 2) {
        return false;
    }
    
    // Separar cuerpo y dígito verificador
    const cuerpo = rutLimpio.slice(0, -1);
    const dv = rutLimpio.slice(-1).toLowerCase();
    
    // Verificar que el cuerpo sea solo números
    if (!/^\d+$/.test(cuerpo)) {
        return false;
    }
    
    // Verificar que el dígito verificador sea número o 'k'
    if (!/^[0-9k]$/.test(dv)) {
        return false;
    }
    
    // Calcular dígito verificador esperado
    let suma = 0;
    let multiplicador = 2;
    
    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += parseInt(cuerpo[i]) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
    
    const resto = suma % 11;
    let dvEsperado = 11 - resto;
    
    // Casos especiales
    if (dvEsperado === 11) {
        dvEsperado = '0';
    } else if (dvEsperado === 10) {
        dvEsperado = 'k';
    } else {
        dvEsperado = dvEsperado.toString();
    }
    
    // Comparar dígito verificador calculado con el proporcionado
    return dv === dvEsperado;
};

export { formatRut, validarRut };