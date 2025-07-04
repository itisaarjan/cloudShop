import { useEffect, useState } from "react";
import { Card } from "./Card";

function Body() {
  const [products, setProducts] = useState([]);
  useEffect(()=>{
    try {
      const result = fetch("https://knnetjzvf1.execute-api.us-east-1.amazonaws.com/prod/v1/products");
    } catch (error) {
      console.log("Products could not received from the backed")
    }
  },[])
  return (
    <div className="w-full px-4 py-8 flex justify-center">
      <div className="w-full max-w-sm">
        <Card
          imageUrl="https://plus.unsplash.com/premium_photo-1675186049366-64a655f8f537?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y2xvdGhlc3xlbnwwfHwwfHx8MA%3D%3D"
          productName="Red Jacket"
          productDescription="This is a good red jacket"
          productQuantity=""
          productPrice=""
        />
      </div>
    </div>
  );
}

export default Body;
