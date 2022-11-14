import { NavLink, useNavigate } from "react-router-dom";
import { 
  HiBars3CenterLeft,
  HiOutlineEllipsisHorizontal, 
} from "react-icons/hi2";
import { useAuthStore } from "../stores/auth.store";
import { Role } from "../commons/role.enum";

export default function Layout({ children }) {
  const signOut = useAuthStore((state) => state.signOut);
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.role);
  const username = useAuthStore((state) => state.username);

  // sidebar content
  const categories = [
    {
      name: "Finance",
      subItems: [
        {itemName: "Report", href: "/report", visible: [Role.MASTER, Role.ADMIN]},
        {itemName: "Purchase", href: "/purchase", visible: [Role.MASTER]},
        {itemName: "Sold", href: "/sold", visible: [Role.MASTER, Role.ADMIN, Role.OPERATOR]},
      ],
      visible: [Role.MASTER, Role.ADMIN, Role.OPERATOR],
    },
    {
      name: "Warehouse",
      subItems: [
        {itemName: "Stock", href: "/stock", visible: [Role.MASTER, Role.ADMIN, Role.OPERATOR]},
        {itemName: "Inbound", href: "/inbound", visible: [Role.MASTER, Role.ADMIN, Role.OPERATOR]},
        {itemName: "Outbound", href: "/outbound", visible: [Role.MASTER, Role.ADMIN, Role.OPERATOR]},
      ],
      visible: [Role.MASTER, Role.ADMIN, Role.OPERATOR],
    },
    {
      name: "Configure",
      subItems: [
        {itemName: "Product", href: "/products", visible: [Role.MASTER, Role.ADMIN]},
        {itemName: "Vendor", href: "/vendors", visible: [Role.MASTER, Role.ADMIN]},
        {itemName: "Customer", href: "/customers", visible: [Role.MASTER, Role.ADMIN]},
      ],
      visible: [Role.MASTER, Role.ADMIN],
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
          <nav className="w-full navbar bg-base-100 shadow-md">
            <div className="navbar-start">
              <label htmlFor="my-drawer-3" className="btn btn-square btn-ghost">
                <HiBars3CenterLeft className="inline-block w-6 h-6"></HiBars3CenterLeft>
              </label> 
            </div>
            <div className="navbar-center">
              <div className="flex-1 px-2 mx-2 font-bold text-xl">SJWH</div>
            </div>
            <div className="navbar-end">
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-square btn-ghost">
                  <HiOutlineEllipsisHorizontal className="inline-block w-6 h-6"></HiOutlineEllipsisHorizontal>
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
          <main>
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
                <>
                {category.visible.includes(role) ? (
                <>
                  <li className="menu-title">
                    <span>{category.name}</span>
                  </li>
                  {category.subItems.map((item) => {
                    return (
                    <>
                      {item.visible.includes(role) ? 
                      (<li>
                        <NavLink to={item.href} className={navData => navData.isActive ? `text-white active` : ``}>
                          {item.itemName}
                        </NavLink>
                      </li>) : <></>}
                    </>
                    )
                  })}
                  {(index !== categories.length - 1) && (categories[index + 1].visible.includes(role)) ? 
                  (<li></li>) : (<></>)}
                </>) : (<></>)}
                </>)
              })}
            </ul>
          </div> 
        </aside>
      </div>
    </div>
  </>
  )
}