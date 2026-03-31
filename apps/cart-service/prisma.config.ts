export const cartServiceConfig = {
  name: 'cart-service',
  port: process.env.CART_SERVICE_PORT || 3005,
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_CARTS || 'db_carts',
  },
};
