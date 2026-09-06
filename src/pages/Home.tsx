import React from 'react';

interface Service {
  id: string;
  name: string;
  status: string;
}

export const Home = (): React.JSX.Element => {
  const services: Service[] = [
    { id: 'ms1', name: 'MS1 - Transaccional SQL 1', status: 'Pendiente Integración' },
    { id: 'ms2', name: 'MS2 - Transaccional SQL 2', status: 'Pendiente Integración' },
    { id: 'ms3', name: 'MS3 - Transaccional NoSQL', status: 'Pendiente Integración' },
    { id: 'ms4', name: 'MS4 - Orquestador', status: 'Pendiente Integración' },
    { id: 'ms5', name: 'MS5 - Dashboard Analítico (Athena)', status: 'Pendiente Integración' },
  ];

  return (
    <>
      <h2>Panel de Control del Sistema</h2>
      <p>Estado de los microservicios conectados a través de AWS API Gateway:</p>

      <ul>
        {services.map((service) => (
          <li key={service.id}>
            <strong>{service.name}</strong> - {service.status}
          </li>
        ))}
      </ul>
    </>
  );
};
