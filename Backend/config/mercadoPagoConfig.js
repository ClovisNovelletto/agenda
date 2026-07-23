import { MercadoPagoConfig } from 'mercadopago';

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN_PROD
});

export default client;