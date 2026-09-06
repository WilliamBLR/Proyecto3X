export const signs = [
  { id: 'pare', name: 'PARE', meaning: 'Detén completamente el vehículo y cede el paso antes de continuar.', shape: 'stop' },
  { id: 'ceda', name: 'CEDA EL PASO', meaning: 'Da preferencia al tránsito que corresponde; detente si es necesario.', shape: 'yield' },
  { id: 'maxima', name: 'VELOCIDAD MÁXIMA', meaning: 'No sobrepases el máximo indicado. Reduce más si las condiciones lo requieren.', shape: 'speed' },
  { id: 'no-entrar', name: 'NO ENTRAR', meaning: 'No ingreses desde esa dirección.', shape: 'entry' },
  { id: 'no-estacionar', name: 'NO ESTACIONAR', meaning: 'Prohíbe estacionar en el sector regulado por la señal.', shape: 'parking' },
  { id: 'derecha', name: 'DIRECCIÓN OBLIGADA', meaning: 'Debes seguir la dirección indicada por la flecha.', shape: 'right' },
] as const;
