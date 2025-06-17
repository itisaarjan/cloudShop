import * as api from '@aws-sdk/client-api-gateway';

const apiClient = new api.APIGatewayClient({ region: 'us-east-1' });

interface APIprop {
  restAPId: string;
  parentId: string;
  resourceId: string;
}

interface ProductCatalogAPIProps {
  name: string;
  description: string;
  version: string;
}

// Initialize empty API object
let API: Partial<APIprop> = {};

async function createProductCatalogAPI(props: ProductCatalogAPIProps) {
  const command = new api.CreateRestApiCommand({
    name: props.name,
    description: props.description,
    version: props.version,
    binaryMediaTypes: ['application/json']
  });

  try {
    const response = await apiClient.send(command);
    console.log('API created successfully:', response);

    if (!response.id || !response.rootResourceId) {
      throw new Error('API creation response is missing id or rootResourceId');
    }

    API.restAPId = response.id;
    API.parentId = response.rootResourceId;

    return {
      apiId: response.id,
      rootResourceId: response.rootResourceId
    };
  } catch (error: any) {
    console.error('Error creating API:', error);
    throw new Error(`Failed to create API: ${error.message || error}`);
  }
}

async function createProductsResource(apiId: string, rootResourceId: string) {
  const command = new api.CreateResourceCommand({
    restApiId: apiId,
    parentId: rootResourceId,
    pathPart: 'products'
  });

  try {
    const response = await apiClient.send(command);
    console.log('/products resource created:', response);
    API.resourceId = response.id!;
    return response.id!;
  } catch (error: any) {
    console.error('Error creating /products resource:', error);
    throw new Error(`Failed to create /products: ${error.message || error}`);
  }
}

async function createProductIdResource(apiId: string, parentId: string) {
  const command = new api.CreateResourceCommand({
    restApiId: apiId,
    parentId: parentId,
    pathPart: '{productId}'
  });

  try {
    const response = await apiClient.send(command);
    console.log('/products/{productId} resource created:', response);
    return response.id!;
  } catch (error: any) {
    console.error('Error creating /products/{productId} resource:', error);
    throw new Error(`Failed to create /products/{productId}: ${error.message || error}`);
  }
}

// Main function to create everything
async function setupProductCatalogAPI() {
  try {
    const { apiId, rootResourceId } = await createProductCatalogAPI({
      name: 'ProductCatalogAPI',
      description: 'API for managing product catalog',
      version: '1.0'
    });

    const productsResourceId = await createProductsResource(apiId, rootResourceId);
    const productIdResourceId = await createProductIdResource(apiId, productsResourceId);

    console.log(`Resources created under API ID: ${apiId}`);
    console.log(`/products resource ID: ${productsResourceId}`);
    console.log(`/products/{productId} resource ID: ${productIdResourceId}`);
  } catch (err) {
    console.error('Failed to setup API:', err);
  }
}

setupProductCatalogAPI();

async function getProductsAPI(){
  const command = new api.PutMethodCommand({
    restApiId: API.restAPId,
    resourceId: API.resourceId,
    httpMethod: 'GET',
    authorizationType: 'NONE',
  })
}

