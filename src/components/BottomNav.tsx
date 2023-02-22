import {
  BiLogInCircle,
  BiLogOutCircle,
  BiHomeAlt,
  BiShoppingBag,
  BiSpreadsheet,
  BiClipboard,
  BiBarChartAlt2,
} from "react-icons/bi";
import { NavLink } from "react-router-dom";
import { Role } from "../commons/enums/role.enum";
import { useAuthStore } from "../stores/auth.store";

export default function BottomNav() {
  const role = useAuthStore((state) => state.role);

  if (role === Role.OPERATOR) {
    return (
      <div className="btm-nav sticky h-20 border border-l-0 border-r-0 border-b-0 border-t-base-300 py-2 dark:bg-base-200">
        <div className="hidden md:flex"></div>
        <NavLink
          to="/task/view-task"
          className={(navData) =>
            navData.isActive
              ? `rounded-btn mx-1 bg-info text-info-content`
              : `rounded-btn mx-1 hover:bg-base-200 dark:hover:bg-base-300`
          }
        >
          <BiClipboard className="h-6 w-6"></BiClipboard>
          <span className="btm-nav-label font-medium">Task</span>
        </NavLink>

        <NavLink
          to="/stock/view-stock"
          className={(navData) =>
            navData.isActive
              ? `rounded-btn mx-1 bg-info text-info-content`
              : `rounded-btn mx-1 hover:bg-base-200 dark:hover:bg-base-300`
          }
        >
          <BiHomeAlt className="h-6 w-6" />
          <span className="btm-nav-label font-medium">Stock</span>
        </NavLink>

        <NavLink
          to="/task/report-task"
          className={(navData) =>
            navData.isActive
              ? `rounded-btn mx-1 bg-info text-info-content`
              : `rounded-btn mx-1 hover:bg-base-200 dark:hover:bg-base-300`
          }
        >
          <BiBarChartAlt2 className="h-6 w-6" />
          <span className="btm-nav-label font-medium">Report</span>
        </NavLink>
        <div className="hidden md:flex"></div>
      </div>
    );
  }

  if (role === Role.MASTER || role === Role.ADMIN) {
    return (
      <div className="btm-nav sticky h-20 border border-l-0 border-r-0 border-b-0 border-t-base-300 py-2 dark:bg-base-200">
        <NavLink
          to="/customer/draft-customer-order"
          className={(navData) =>
            navData.isActive
              ? `rounded-btn mx-1 hidden bg-info text-info-content md:flex`
              : `rounded-btn  mx-1 hidden hover:bg-base-200 dark:hover:bg-base-300 md:flex`
          }
        >
          <BiShoppingBag className="h-6 w-6"></BiShoppingBag>
          <span className="btm-nav-label font-medium">Draft CO</span>
        </NavLink>

        <NavLink
          to="/customer/view-customer-order"
          className={(navData) =>
            navData.isActive
              ? `rounded-btn mx-1 bg-info text-info-content`
              : `rounded-btn mx-1 hover:bg-base-200 dark:hover:bg-base-300`
          }
        >
          <BiLogOutCircle className="h-6 w-6"></BiLogOutCircle>
          <span className="btm-nav-label font-medium">View CO</span>
        </NavLink>

        <NavLink
          to="/stock/view-stock"
          className={(navData) =>
            navData.isActive
              ? `rounded-btn mx-1 bg-info text-info-content`
              : `rounded-btn mx-1 hover:bg-base-200 dark:hover:bg-base-300`
          }
        >
          <BiHomeAlt className="h-6 w-6" />
          <span className="btm-nav-label font-medium">Stock</span>
        </NavLink>

        <NavLink
          to="/vendor/view-vendor-order"
          className={(navData) =>
            navData.isActive
              ? `rounded-btn mx-1 bg-info text-info-content`
              : `rounded-btn mx-1 hover:bg-base-200 dark:hover:bg-base-300`
          }
        >
          <BiLogInCircle className="h-6 w-6" />
          <span className="btm-nav-label font-medium">View VO</span>
        </NavLink>

        <NavLink
          to="/vendor/draft-vendor-order"
          className={(navData) =>
            navData.isActive
              ? `rounded-btn mx-1 hidden bg-info text-info-content md:flex`
              : `rounded-btn mx-1 hidden hover:bg-base-200 dark:hover:bg-base-300 md:flex`
          }
        >
          <BiSpreadsheet className="h-6 w-6"></BiSpreadsheet>
          <span className="btm-nav-label font-medium">Draft VO</span>
        </NavLink>
      </div>
    );
  }

  return null;
}
