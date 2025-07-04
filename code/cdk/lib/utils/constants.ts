export const productCatalogtable: string= 'productCatalogTable';

export function withCors(statusCode: number, body: any) {
    return {
      statusCode,
      headers: {
        "Access-Control-Allow-Origin": "*", // Or use a specific origin in prod
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
      },
      body: JSON.stringify(body)
    };
  }
  