export const installmentServiceConfig = {
  name: 'installment-service',
  port: process.env.INSTALLMENT_SERVICE_PORT || 3006,
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_INSTALLMENTS || 'db_installments',
  },
};
