import { BiLoaderCircle } from "react-icons/bi";

export default function Spinner() {
  return (
    <div className="flex justify-center">
      <BiLoaderCircle className="h-8 w-8 animate-spin" />
    </div>
  );
}
