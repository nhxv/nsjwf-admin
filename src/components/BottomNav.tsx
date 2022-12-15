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
      <NavLink to="/finance/customer-order" className={
        navData => navData.isActive ? `bg-blue-100 text-blue-600 rounded-btn mx-1 md:flex hidden` : `rounded-btn mx-1 hover:bg-gray-100 md:flex hidden`
      }>
        <BiShoppingBag className="w-6 h-6"></BiShoppingBag>
        <span className="btm-nav-label font-medium">Customer Order</span>
      </NavLink>
    </>
    ) : (<div className="hidden md:flex"></div>)}


    <NavLink to="/logistics/outbound" className={
      navData => navData.isActive ? `bg-blue-100 text-blue-600 rounded-btn mx-1` : `rounded-btn mx-1 hover:bg-gray-100`
    }>
      <BiLogOutCircle className="w-6 h-6"></BiLogOutCircle>
      <span className="btm-nav-label font-medium">Outbound</span>
    </NavLink>

    <NavLink to="/logistics/stock" className={
      navData => navData.isActive ? `bg-blue-100 text-blue-600 rounded-btn mx-1` : `rounded-btn mx-1 hover:bg-gray-100`
    }>
      <BiHomeAlt className="w-6 h-6" />
      <span className="btm-nav-label font-medium">Stock</span>
    </NavLink>

    <NavLink to="/logistics/inbound" className={
      navData => navData.isActive ? `bg-blue-100 text-blue-600 rounded-btn mx-1` : `rounded-btn mx-1 hover:bg-gray-100`
    }>
      <BiLogInCircle className="w-6 h-6" />
      <span className="btm-nav-label font-medium">Inbound</span>
    </NavLink>

    {role === Role.MASTER || role === Role.ADMIN ? (
    <>
      <NavLink to="/finance/vendor-order" className={
        navData => navData.isActive ? `bg-blue-100 text-blue-600 rounded-btn mx-1 md:flex hidden` : `rounded-btn mx-1 hover:bg-gray-100 md:flex hidden`
      }>
        <BiSpreadsheet className="w-6 h-6"></BiSpreadsheet>
        <span className="btm-nav-label font-medium">Vendor Order</span>
      </NavLink>
    </>
    ) : (<div className="hidden md:flex"></div>)} 
  </div>
 
  );
}
