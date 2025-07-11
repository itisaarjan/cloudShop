import { useEffect} from "react";
import { Card } from "./Card";
import { useSelector } from "react-redux";
import type { RootState } from "../store/Store";
import { useDispatch } from "react-redux";
import { setProducts } from "../store/slices/productSlice";

interface ProductType {
  id: string;
  name: string;
  imageUrl: string;
  category: string;
  description: string;
  price: number;
  stock: number;
}


function Body() {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          "https://knnetjzvf1.execute-api.us-east-1.amazonaws.com/prod/v1/products"
        );
        const data = await response.json();

        const parsed: ProductType[] = data.items.map((item: any) => ({
          id: item.id.S,
          name: item.name.S,
          imageUrl: item.imageUrl.S,
          category: item.category.S,
          description: item.description.S,
          price: parseFloat(item.price.N),
          stock: parseInt(item.stock.N),
        }));

        dispatch(setProducts(parsed));

      } catch (error) {
        console.error("Products could not be received from the backend:", error);
      }
    };

    fetchProducts();
  }, []);

  const products = useSelector((state:RootState)=>state.products.value)

  return (
  <div className="w-full px-4 py-8 flex justify-center">
    <div className="w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {products.map((product) => (
      <Card
        key={product.id}
        productId = {product.id}
        productCategory={product.category}
        imageUrl={product.imageUrl}
        productName={product.name}
        productDescription={product.description}
        productQuantity={product.stock.toString()}
        productPrice={Number(product.price.toFixed(2))}
      />
    ))}
  </div>
</div>
  );
}

export default Body;
