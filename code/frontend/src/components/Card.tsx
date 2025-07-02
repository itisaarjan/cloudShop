import type { ReactElement } from "react";
import Button, { ButtonType } from "./Button";

interface CardType {
  imageUrl: string;
  productName: string;
  productDescription: string;
  productQuantity: string;
  productPrice: string;
}

function Card(props: CardType):ReactElement {
  return (
    <div className="w-72 h-[30rem] bg-white rounded-xl shadow-md overflow-hidden flex flex-col">
      <img
        src={props.imageUrl}
        alt={props.productName || "Product image"}
        className="w-full h-60 object-cover"
      />
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">{props.productName}</h2>
          <p className="text-sm text-gray-600">{props.productDescription}</p>
        </div>
        <div className="mt-4 text-sm text-gray-700 space-y-1">
          <p>Quantity: {props.productQuantity}</p>
          <p>Price: ${props.productPrice}</p>
        </div>
        <Button type={ButtonType.Secondary} value="Add to cart" />
      </div>
    </div>
  );
}

export { Card };
