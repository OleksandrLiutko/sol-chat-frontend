const Button = ({ text, disable, onClick }) => {
  return (
    <button
      className={`relative bg-[#97989f] rounded bg-cover bg-center bg-no-repeat text-white text-2xl w-full mx-2
      ${disable === "true" ? "opacity-25" : "opacity-100"
        }`}
      onClick={() => {
        if (disable === "true")
          return;
        onClick();
      }}
    >
      {text}
    </button>
  );
};

export default Button;
