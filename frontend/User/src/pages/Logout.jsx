import { useEffect } from "react";

const Logout = () => {
  useEffect(() => {
    // remove all user session
    localStorage.clear();
    sessionStorage.clear();

    // force redirect to public home
    window.location.replace("/");
  }, []);

  return <p style={{ padding: "20px" }}>Logging out...</p>;
};

export default Logout;
