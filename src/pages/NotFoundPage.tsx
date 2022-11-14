import { useNavigate } from "react-router-dom";
import { HiArrowRight } from "react-icons/hi2";

export default function NotFoundPage() {
  const navigate = useNavigate();

  const onBack = () => {
    navigate("/sign-in");
  }

  return (
  <>
  <div className="flex flex-col justify-center items-center min-h-screen p-6 bg-base-200">
    <h1 className="font-bold text-7xl">404</h1>
    <p className="text-xl">This page does not exist.</p>
    <button className="btn btn-primary text-white mt-3" onClick={onBack}>
      <span className="mr-2">Go to sign in</span> 
      <HiArrowRight strokeWidth={1}/>
    </button>
  </div>
  </>
  )
}