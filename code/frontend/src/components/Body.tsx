// import { useEffect, useState } from "react";
// import { Card } from "./Card";

// interface productTye{

// };

// function Body() {
//   const [products, setProducts] = useState([]);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const response = await fetch("https://knnetjzvf1.execute-api.us-east-1.amazonaws.com/prod/v1/products");
//         const data = await response.json();
//         setProducts(data);
//       } catch (error) {
//         console.error("Products could not be received from the backend:", error);
//       }
//     };

//     fetchProducts();
//   }, []);

//   return (
//     <div className="w-full px-4 py-8 flex justify-center">
//       <div className="w-full max-w-sm">
//         {products.map((product, index) => (
//           <Card
//             key={index}
//             imageUrl="https://plus.unsplash.com/premium_photo-1675186049366-64a655f8f537?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y2xvdGhlc3xlbnwwfHwwfHx8MA%3D%3D"
//             productName={product.name?.S}
//             productDescription={product.description?.S}
//             productQuantity={product.quantity?.N}
//             productPrice={product.price?.N}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }

// export default Body;
