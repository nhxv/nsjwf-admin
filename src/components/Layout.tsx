import { NavLink, useNavigate } from "react-router-dom";
import {
  BiMenuAltLeft,
  BiDotsHorizontalRounded,
  BiUser,
  BiExit,
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
        {
          itemName: "Draft Order",
          href: "/customer/draft-customer-order",
          visible: [Role.MASTER, Role.ADMIN],
        },
        {
          itemName: "Update Priority",
          href: "/customer/update-order-priority",
          visible: [Role.MASTER, Role.ADMIN],
        },
        {
          itemName: "View Order",
          href: "/customer/view-customer-order",
          visible: [Role.MASTER, Role.ADMIN],
        },
        {
          itemName: "Overview Order",
          href: "/customer/overview-customer-order",
          visible: [Role.MASTER, Role.ADMIN],
        },
        {
          itemName: "Draft Backorder",
          href: "/customer/draft-backorder",
          visible: [Role.MASTER, Role.ADMIN],
        },
        {
          itemName: "View Backorder",
          href: "/customer/view-backorder",
          visible: [Role.MASTER, Role.ADMIN],
        },
        {
          itemName: "Search Sale",
          href: "/customer/search-customer-sale",
          visible: [Role.MASTER, Role.ADMIN],
        },
        {
          itemName: "View Return",
          href: "/customer/view-customer-return",
          visible: [Role.MASTER, Role.ADMIN],
        },
        {
          itemName: "Report Sale",
          href: "/customer/report-sale",
          visible: [Role.MASTER, Role.ADMIN],
        },
      ],
      visible: [Role.MASTER, Role.ADMIN],
    },
    {
      name: "Vendor",
      subItems: [
        {
          itemName: "Draft Order",
          href: "/vendor/draft-vendor-order",
          visible: [Role.MASTER, Role.ADMIN],
        },
        {
          itemName: "View Order",
          href: "/vendor/view-vendor-order",
          visible: [Role.MASTER, Role.ADMIN],
        },
        {
          itemName: "Search sale",
          href: "/vendor/search-vendor-sale",
          visible: [Role.MASTER, Role.ADMIN],
        },
        {
          itemName: "View Return",
          href: "/vendor/view-vendor-return",
          visible: [Role.MASTER, Role.ADMIN],
        },
      ],
      visible: [Role.MASTER, Role.ADMIN],
    },
    {
      name: "Stock",
      subItems: [
        {
          itemName: "View",
          href: "/stock/view-stock",
          visible: [Role.MASTER, Role.ADMIN, Role.OPERATOR],
        },
        {
          itemName: "Change",
          href: "/stock/change-stock",
          visible: [Role.MASTER, Role.ADMIN],
        },
      ],
      visible: [Role.MASTER, Role.ADMIN, Role.OPERATOR],
    },
    {
      name: "Task",
      subItems: [
        {
          itemName: "View",
          href: "/task/view-task",
          visible: [Role.MASTER, Role.ADMIN, Role.OPERATOR],
        },
        {
          itemName: "Report",
          href: "/task/report-task",
          visible: [Role.MASTER, Role.ADMIN, Role.OPERATOR],
        },
      ],
      visible: [Role.MASTER, Role.ADMIN, Role.OPERATOR],
    },
    {
      name: "Configure",
      subItems: [
        {
          itemName: "Product",
          href: "/configure/product",
          visible: [Role.MASTER, Role.ADMIN],
        },
        {
          itemName: "Customer",
          href: "/configure/view-customer",
          visible: [Role.MASTER, Role.ADMIN],
        },
        {
          itemName: "Vendor",
          href: "/configure/view-vendor",
          visible: [Role.MASTER, Role.ADMIN],
        },
        // {itemName: "Vehicle", href: "/configure/vehicle", visible: [Role.MASTER, Role.ADMIN]},
        {
          itemName: "Employee",
          href: "/configure/employee",
          visible: [Role.MASTER, Role.ADMIN],
        },
      ],
      visible: [Role.MASTER, Role.ADMIN],
    },
    {
      name: "Test only",
      subItems: [
        { itemName: "Reset", href: "/test/reset", visible: [Role.MASTER] },
      ],
      visible: [Role.MASTER],
    },
  ];

  const onSignOut = () => {
    signOut();
    navigate("/");
  };

  const onProfile = () => {
    navigate("/profile");
  };

  return (
    <div className="bg-base-200 dark:bg-base-100">
      <div className="drawer">
        <input id="mobile-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col">
          {/* Navbar */}
          <nav className="w-full navbar bg-base-100 dark:bg-base-200 shadow-md top-0 sticky z-20">
            <div className="navbar-start">
              <label
                htmlFor="mobile-drawer"
                className="btn btn-square btn-ghost hover:bg-base-300"
              >
                <BiMenuAltLeft className="inline-block w-8 h-8"></BiMenuAltLeft>
              </label>
            </div>
            <div className="navbar-center">
              <div className="flex-1 px-2 mx-2 font-bold text-xl">NSJWF</div>
            </div>
            <div className="navbar-end">
              <div className="dropdown dropdown-end">
                <label
                  tabIndex={0}
                  className="btn btn-square btn-ghost hover:bg-base-300"
                >
                  <BiDotsHorizontalRounded className="inline-block w-8 h-8"></BiDotsHorizontalRounded>
                </label>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu p-2 shadow-md bg-base-100 dark:bg-base-200 rounded-box border border-base-300 w-52"
                >
                  <li>
                    <a
                      className="hover:bg-base-200 focus:bg-base-200 dark:hover:bg-base-300 dark:focus:bg-base-300"
                      onClick={onProfile}
                    >
                      <span>
                        <BiUser className="w-6 h-6 mr-1"></BiUser>
                      </span>
                      <span>My profile</span>
                    </a>
                  </li>
                  <li>
                    <a
                      className="hover:bg-base-200 focus:bg-base-200 dark:hover:bg-base-300 dark:focus:bg-base-300"
                      onClick={onSignOut}
                    >
                      <span>
                        <BiExit className="w-6 h-6 mr-1"></BiExit>
                      </span>
                      <span>Sign out</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </nav>

          {/* Main content */}
          <main>
            <div className="container mb-5">{children}</div>
            <BottomNav />
          </main>
        </div>

        {/* Sidebar */}
        <aside className="drawer-side">
          <label htmlFor="mobile-drawer" className="drawer-overlay"></label>
          <div className="bg-base-100 dark:bg-base-200 min-h-screen w-60 overflow-y-auto shadow-md">
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
                              {item.visible.includes(role) ? (
                                <li>
                                  <NavLink
                                    to={item.href}
                                    className={(navData) =>
                                      navData.isActive
                                        ? `text-primary-content active`
                                        : ``
                                    }
                                  >
                                    {item.itemName}
                                  </NavLink>
                                </li>
                              ) : null}
                            </div>
                          );
                        })}
                        {index !== categories.length - 1 &&
                        categories[index + 1].visible.includes(role) ? (
                          <li></li>
                        ) : null}
                      </>
                    ) : null}
                  </div>
                );
              })}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
