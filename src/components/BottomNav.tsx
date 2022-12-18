import { BiLogInCircle, BiLogOutCircle, BiHomeAlt, BiShoppingBag, BiSpreadsheet } from "react-icons/bi";
import { NavLink } from "react-router-dom";
import { Role } from "../commons/role.enum";
import { useAuthStore } from "../stores/auth.store";

export default function BottomNav() {
  const role = useAuthStore(state => state.role);

  return (
  <div className="btm-nav h-20 py-2 border border-t-gray-300 border-l-0 border-r-0 border-b-0">
    {role === Role.MASTER || role === Role.ADMIN ? (
    <>
      <NavLink to="/customer/draft-customer-order" className={
        navData => navData.isActive ? `bg-emerald-100 text-emerald-600 rounded-btn mx-1 md:flex hidden` : `rounded-btn mx-1 hover:bg-gray-100 md:flex hidden`
      }>
        <BiShoppingBag className="w-6 h-6"></BiShoppingBag>
        <span className="btm-nav-label font-medium">Draft CO</span>
      </NavLink>
    </>
    ) : (<div className="hidden md:flex"></div>)}


    <NavLink to="/customer/view-customer-order" className={
      navData => navData.isActive ? `bg-emerald-100 text-emerald-600 rounded-btn mx-1` : `rounded-btn mx-1 hover:bg-gray-100`
    }>
      <BiLogOutCircle className="w-6 h-6"></BiLogOutCircle>
      <span className="btm-nav-label font-medium">View CO</span>
    </NavLink>

    <NavLink to="/stock/view-stock" className={
      navData => navData.isActive ? `bg-emerald-100 text-emerald-600 rounded-btn mx-1` : `rounded-btn mx-1 hover:bg-gray-100`
    }>
      <BiHomeAlt className="w-6 h-6" />
      <span className="btm-nav-label font-medium">Stock</span>
    </NavLink>

    <NavLink to="/vendor/view-vendor-order" className={
      navData => navData.isActive ? `bg-emerald-100 text-emerald-600 rounded-btn mx-1` : `rounded-btn mx-1 hover:bg-gray-100`
    }>
      <BiLogInCircle className="w-6 h-6" />
      <span className="btm-nav-label font-medium">View VO</span>
    </NavLink>

    {role === Role.MASTER || role === Role.ADMIN ? (
    <>
      <NavLink to="/vendor/draft-vendor-order" className={
        navData => navData.isActive ? `bg-emerald-100 text-emerald-600 rounded-btn mx-1 md:flex hidden` : `rounded-btn mx-1 hover:bg-gray-100 md:flex hidden`
      }>
        <BiSpreadsheet className="w-6 h-6"></BiSpreadsheet>
        <span className="btm-nav-label font-medium">Draft VO</span>
      </NavLink>
    </>
    ) : (<div className="hidden md:flex"></div>)} 
  </div>
 
  );
}
