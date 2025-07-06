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
      ? "bg-black text-white hover:bg-white hover:text-black"
      : "bg-white text-black border border-black hover:text-white hover:bg-black";

  return (
    <button className={`${bgColor} font-bold py-2 px-4 rounded-full w-[40vw] md:w-[8vw]`} onClick={props.onClick}>
        {props.value}

  </button>
  );
}

export default Button;
