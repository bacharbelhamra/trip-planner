import Header from "./custom/Header";
import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <>
      <Header />
      <div className="p-6">
        <Outlet />
      </div>
    </>
  );
}

export default Layout;