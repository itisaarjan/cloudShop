export interface ProductType {
    id: string;
    name: string;
    imageUrl: string;
    category: string;
    description: string;
    price: number;
    stock: number;
};

export interface CustomerCartProduct {
    id: string,
    name: string, 
    imageUrl: string,
    category: string,
    quantity: number,
    price: number,
};

export interface CustomerCartProductState{
    value: CustomerCartProduct[],
}

