export const envConfig = () => ({
  port: Number(process.env.PORT ?? 3000),
  connectionString: process.env.CONNECTION_STRING ?? '',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
    apiKey: process.env.CLOUDINARY_API_KEY ?? '',
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'super_clave_secreta_utn_programacion4',
    expirationTime: process.env.JWT_EXPIRATION_TIME ?? '15m',
  },
});

