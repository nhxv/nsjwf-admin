import { NavLink, useNavigate } from "react-router-dom";
import { 
  BiMenuAltLeft,
  BiDotsHorizontalRounded, 
} from "react-icons/bi";
import { useAuthStore } from "../stores/auth.store";
import { Role } from "../commons/role.enum";
import BottomNav from "./BottomNav";

export default function Layout({ children }) {
  const signOut = useAuthStore((state) => state.signOut);
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.role);

  // sidebar content
  const categories = [
    {
      name: "Customer",
      subItems: [
        {itemName: "Draft Order", href: "/customer/draft-customer-order", visible: [Role.MASTER, Role.ADMIN]},
        {itemName: "View Order", href: "/customer/view-customer-order", visible: [Role.MASTER, Role.ADMIN, Role.OPERATOR]},
        {itemName: "Draft Backorder", href: "/customer/draft-backorder", visible: [Role.MASTER, Role.ADMIN]},
        {itemName: "View Backorder", href: "/customer/view-backorder", visible: [Role.MASTER, Role.ADMIN]},
      ],
      visible: [Role.MASTER, Role.ADMIN, Role.OPERATOR],
    },
    {
      name: "Vendor",
      subItems: [
        {itemName: "Draft Order", href: "/vendor/draft-vendor-order", visible: [Role.MASTER, Role.ADMIN]},
        {itemName: "View Order", href: "/vendor/view-vendor-order", visible: [Role.MASTER, Role.ADMIN, Role.OPERATOR]},
      ],
      visible: [Role.MASTER, Role.ADMIN, Role.OPERATOR],
    },
    {
      name: "Stock",
      subItems: [
        {itemName: "View Stock", href: "/stock/view-stock", visible: [Role.MASTER, Role.ADMIN, Role.OPERATOR]},
      ],
      visible: [Role.MASTER, Role.ADMIN, Role.OPERATOR],
    },
    {
      name: "Configure",
      subItems: [
        {itemName: "Product", href: "/configure/product", visible: [Role.MASTER, Role.ADMIN]},
        {itemName: "Customer", href: "/configure/customer", visible: [Role.MASTER, Role.ADMIN]},
        {itemName: "Vendor", href: "/configure/vendor", visible: [Role.MASTER, Role.ADMIN]},
        {itemName: "Vehicle", href: "/configure/vehicle", visible: [Role.MASTER, Role.ADMIN]},
      ],
      visible: [Role.MASTER, Role.ADMIN],
    },
    {
      name: "Test only",
      subItems: [
        {itemName: "Reset", href: "/test/reset", visible: [Role.MASTER]},
      ],
      visible: [Role.MASTER],
    }
  ];

  const onSignOut = () => {
    signOut();
    navigate("/");
  }

  const onProfile = () => {
    navigate("/profile");
  }

  return(
  <>
    <div className="bg-gray-200">
      <div className="drawer">
        <input id="my-drawer-3" type="checkbox" className="drawer-toggle" /> 
        <div className="drawer-content flex flex-col">
          
          {/* Navbar */}
          <nav className="w-full navbar bg-base-100 shadow-md top-0 sticky z-10">
            <div className="navbar-start">
              <label htmlFor="my-drawer-3" className="btn btn-square btn-ghost">
                <BiMenuAltLeft className="inline-block w-8 h-8"></BiMenuAltLeft>
              </label> 
            </div>
            <div className="navbar-center">
              <div className="flex-1 px-2 mx-2 font-bold text-xl">NSJWF</div>
            </div>
            <div className="navbar-end">
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-square btn-ghost">
                  <BiDotsHorizontalRounded className="inline-block w-8 h-8"></BiDotsHorizontalRounded>
                </label>
                <ul tabIndex={0} className="dropdown-content menu p-2 shadow-md bg-base-100 rounded-box border border-gray-300 w-52">
                  <li>
                    <a onClick={onProfile}>
                      <span>My profile</span>
                    </a>
                  </li>
                  <li onClick={onSignOut}>
                    <a>
                      <span>Sign out</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </nav>

          {/* Main content */}
          <main className="mb-20">
            {children}
          </main>
        </div>

        {/* Sidebar */}
        <aside className="drawer-side">
          <label htmlFor="my-drawer-3" className="drawer-overlay"></label>
          <div className="bg-base-100 h-screen max-h-screen w-60 overflow-y-auto">
            <ul className="menu p-4">
              {categories.map((category, index) => {
                return (
                <div key={index}>
                {category.visible.includes(role) ? (
                <>
                  <li className="menu-title">
                    <span>{category.name}</span>
                  </li>
                  {category.subItems.map((item, i) => {
                    return (
                    <div key={i}>
                      {item.visible.includes(role) ? 
                      (<li>
                        <NavLink to={item.href} className={navData => navData.isActive ? `text-white active` : ``}>
                          {item.itemName}
                        </NavLink>
                      </li>) : <></>}
                    </div>
                    )
                  })}
                  {(index !== categories.length - 1) && (categories[index + 1].visible.includes(role)) ? 
                  (<li></li>) : (<></>)}
                </>) : (<></>)}
                </div>)
              })}
            </ul>
          </div> 
        </aside>
      </div>
      <BottomNav/>
    </div>
  </>
  )
}