export enum ButtonType {
  Primary = "primary",
  Secondary = "secondary",
}

interface ButtonProps {
  type: ButtonType;
  value: string;
  onClick?: () => void; 
}

function Button(props: ButtonProps) {
  const bgColor =
    props.type === ButtonType.Primary
      ? "bg-black text-white hover:bg-gray-900"
      : "bg-white text-black border border-black hover:bg-gray-100";

  return (
    <button className={`${bgColor} font-bold py-2 px-4 rounded-full`}>
        {props.value}
  </button>
  );
}

export default Button;
