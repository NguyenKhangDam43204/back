export const inventoryServiceConfig = {
  name: 'inventory-service',
  port: process.env.INVENTORY_SERVICE_PORT || 3004,
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_INVENTORY || 'db_inventory',
  },
};
