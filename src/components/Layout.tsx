import {
  BiBarChartAlt2,
  BiClipboard,
  BiDollar,
  BiDotsHorizontalRounded,
  BiEdit,
  BiExit,
  BiFingerprint,
  BiGroup,
  BiHome,
  BiLogInCircle,
  BiLogOutCircle,
  BiMenuAltLeft,
  BiPackage,
  BiReset,
  BiShoppingBag,
  BiDollarCircle,
  BiSpreadsheet,
  BiSupport,
  BiTask,
  BiUser,
  BiLineChart,
} from "react-icons/bi";
import { PiCarrotBold } from "react-icons/pi";
import { NavLink, matchPath, useLocation, useNavigate } from "react-router-dom";
import { Role } from "../commons/enums/role.enum";
import { useAuthStore } from "../stores/auth.store";
import BottomNav from "./BottomNav";

export default function Layout({ children }) {
  const signOut = useAuthStore((state) => state.signOut);
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.role);

  const location = useLocation();
  // title content
  const titleBar = {
    "/profile": "Profile",

    "/customer/draft-customer-order": "Draft Order",
    "/customer/update-order-priority": "Update Priority",
    "/customer/report-sale": "Report Sale",
    "/customer/view-customer-order": "Customer Orders",
    "/customer/view-customer-order-detail/:code": "Customer Order",

    "/vendor/draft-vendor-order": "Draft Order",
    "/vendor/find-purchase": "Find Purchase",
    "/vendor/view-vendor-order": "Vendor Orders",
    "/vendor/view-vendor-order-detail/:code": "Vendor Order",

    "/stock/change-stock": "Update Stock",
    "/stock/view-stock": "View Stock",

    "/analysis": "Analysis",

    "/task/view-task": "View Task",
    "/task/report-task": "Report Task",

    "/configure/draft-product": "Create Product",
    "/configure/draft-product/:id": "Update Product",
    "/configure/view-product": "View Products",
    "/configure/draft-customer": "Create Customer",
    "/configure/draft-customer/:id": "Update Customer",
    "/configure/view-customer": "View Customers",
    "/configure/draft-vendor": "Create Vendor",
    "/configure/draft-vendor/:id": "Update Vendor",
    "/configure/view-vendor": "View Vendors",
    "/configure/employee": "View Employees",

    "/test/reset": "Reset Database",
  };

  const getTitle = (pathname: string) => {
    if (titleBar[pathname]) {
      return titleBar[pathname];
    }

    for (const key of Object.keys(titleBar)) {
      if (matchPath(key, pathname)) {
        return titleBar[key];
      }
    }

    return "NSJWF";
  };

  // sidebar content
  const categories = [
    {
      name: "Customer",
      subItems: [
        {
          itemName: "Draft Order",
          href: "/customer/draft-customer-order",
          visible: [Role.MASTER, Role.ADMIN],
          icon: <BiShoppingBag className="h-6 w-6" />,
        },
        {
          itemName: "Update Priority",
          href: "/customer/update-order-priority",
          visible: [Role.MASTER, Role.ADMIN],
          icon: <BiClipboard className="h-6 w-6" />,
        },
        {
          itemName: "View Order",
          href: "/customer/view-customer-order",
          visible: [Role.MASTER, Role.ADMIN],
          icon: <BiLogOutCircle className="h-6 w-6" />,
        },
        {
          itemName: "Report Sale",
          href: "/customer/report-sale",
          visible: [Role.MASTER, Role.ADMIN],
          icon: <BiDollar className="h-6 w-6" />,
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
          icon: <BiSpreadsheet className="h-6 w-6" />,
        },
        {
          itemName: "View Order",
          href: "/vendor/view-vendor-order",
          visible: [Role.MASTER, Role.ADMIN],
          icon: <BiLogInCircle className="h-6 w-6" />,
        },
        {
          itemName: "Find Purchase",
          href: "/vendor/find-purchase",
          visible: [Role.MASTER, Role.ADMIN],
          icon: <BiDollarCircle className="h-6 w-6" />,
        },
      ],
      visible: [Role.MASTER, Role.ADMIN],
    },
    {
      name: "Analysis",
      subItems: [
        {
          itemName: "Customer Sale",
          href: "/analysis/customer-sale",
          visible: [Role.MASTER, Role.ADMIN],
          icon: <BiLineChart className="h-6 w-6" />,
        },
        {
          itemName: "Product Sale",
          href: "/analysis/product-sale",
          visible: [Role.MASTER, Role.ADMIN],
          icon: <BiPackage className="h-6 w-6" />,
        }
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
          icon: <BiHome className="h-6 w-6" />,
        },
        {
          itemName: "Change",
          href: "/stock/change-stock",
          visible: [Role.MASTER, Role.ADMIN],
          icon: <BiEdit className="h-6 w-6" />,
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
          icon: <BiTask className="h-6 w-6" />,
        },
        {
          itemName: "Report",
          href: "/task/report-task",
          visible: [Role.MASTER, Role.ADMIN, Role.OPERATOR],
          icon: <BiBarChartAlt2 className="h-6 w-6" />,
        },
      ],
      visible: [Role.MASTER, Role.ADMIN, Role.OPERATOR],
    },
    {
      name: "Configure",
      subItems: [
        {
          itemName: "Product",
          href: "/configure/view-product",
          visible: [Role.MASTER, Role.ADMIN],
          icon: <PiCarrotBold className="h-6 w-6" />
        },
        {
          itemName: "Customer",
          href: "/configure/view-customer",
          visible: [Role.MASTER, Role.ADMIN],
          icon: <BiGroup className="h-6 w-6" />,
        },
        {
          itemName: "Vendor",
          href: "/configure/view-vendor",
          visible: [Role.MASTER, Role.ADMIN],
          icon: <BiSupport className="h-6 w-6" />,
        },
        {
          itemName: "Employee",
          href: "/configure/employee",
          visible: [Role.MASTER, Role.ADMIN],
          icon: <BiFingerprint className="h-6 w-6" />,
        },
      ],
      visible: [Role.MASTER, Role.ADMIN],
    },
    {
      name: "Test only",
      subItems: [
        {
          itemName: "Reset",
          href: "/test/reset",
          visible: [Role.MASTER],
          icon: <BiReset className="h-6 w-6" />,
        },
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
          <nav className="navbar sticky top-0 z-20 w-full bg-base-100 shadow-md dark:bg-base-200">
            <div className="navbar-start">
              <label
                htmlFor="mobile-drawer"
                className="btn btn-square btn-ghost hover:bg-base-300"
              >
                <BiMenuAltLeft className="inline-block h-8 w-8"></BiMenuAltLeft>
              </label>
            </div>
            <div className="navbar-center">
              <div className="mx-2 flex-1 px-2 text-xl font-bold">
                {getTitle(location.pathname)}
              </div>
            </div>
            <div className="navbar-end">
              <div className="dropdown dropdown-end">
                <label
                  tabIndex={0}
                  className="btn btn-square btn-ghost hover:bg-base-300"
                >
                  <BiDotsHorizontalRounded className="inline-block h-8 w-8"></BiDotsHorizontalRounded>
                </label>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu rounded-box w-52 border border-base-300 bg-base-100 p-2 shadow-md dark:bg-base-200"
                >
                  <li>
                    <a
                      className="text-base-content hover:bg-base-200 focus:bg-base-200 dark:hover:bg-base-300 dark:focus:bg-base-300"
                      onClick={onProfile}
                    >
                      <span>
                        <BiUser className="mr-1 h-6 w-6"></BiUser>
                      </span>
                      <span>My profile</span>
                    </a>
                  </li>
                  <li>
                    <a
                      className="text-base-content hover:bg-base-200 focus:bg-base-200 dark:hover:bg-base-300 dark:focus:bg-base-300"
                      onClick={onSignOut}
                    >
                      <span>
                        <BiExit className="mr-1 h-6 w-6"></BiExit>
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
            <div className="container my-5">{children}</div>
            <BottomNav />
          </main>
        </div>

        {/* Sidebar */}
        <aside className="drawer-side">
          <label htmlFor="mobile-drawer" className="drawer-overlay"></label>
          <div className="min-h-screen w-56 overflow-y-auto bg-base-100 shadow-md dark:bg-base-200">
            <ul className="menu p-2">
              {categories.map((category, index) => {
                return (
                  <div key={index}>
                    {category.visible.includes(role) && (
                      <>
                        <li className="menu-title">
                          <span>{category.name}</span>
                        </li>
                        {category.subItems.map((item, i) => {
                          return (
                            <div key={i}>
                              {item.visible.includes(role) && (
                                <li>
                                  <NavLink
                                    to={item.href}
                                    className={(navData) =>
                                      navData.isActive
                                        ? `active text-primary-content`
                                        : ``
                                    }
                                  >
                                    {item.icon} {item.itemName}
                                  </NavLink>
                                </li>
                              )}
                            </div>
                          );
                        })}
                        {index !== categories.length - 1 &&
                          categories[index + 1].visible.includes(role) && (
                            <li></li>
                          )}
                      </>
                    )}
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
