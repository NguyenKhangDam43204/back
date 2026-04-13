import { registerAs } from '@nestjs/config';

export const bcryptConfig = registerAs('bcrypt', () => ({
  rounds: parseInt(process.env.BCRYPT_ROUNDS ?? '12', 10),
}));
