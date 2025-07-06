const ErrorsUtility = { 
  getErrorMessage: (errorResponse) => { 
    // Handle HTTP 500 Internal Server Error explicitly
    if (errorResponse && errorResponse.status === 500) {
      return 'Error interno del servidor. Por favor, inténtelo de nuevo más tarde.';
    }

    // Existing error handling logic
    if (!errorResponse) return 'Ocurrió un error desconocido.';
    
    if (typeof errorResponse === 'string') return errorResponse;
    
    if (errorResponse.error) {
      // Avoid exposing potentially sensitive information
      return errorResponse.error.includes('500') 
        ? 'Error interno del servidor. Por favor, inténtelo de nuevo más tarde.'
        : errorResponse.error;
    }
    
    if (errorResponse.message) {
      // Avoid exposing potentially sensitive information
      return errorResponse.message.includes('500') 
        ? 'Error interno del servidor. Por favor, inténtelo de nuevo más tarde.'
        : errorResponse.message;
    }
    
    return 'Error inesperado en la solicitud.'; 
  }, 
}; 

export default ErrorsUtility;