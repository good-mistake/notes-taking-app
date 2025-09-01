import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import { setAuth } from "../redux/authSlice";

export default function SessionBridge() {
  const { data: session } = useSession();
  const dispatch = useDispatch();

  useEffect(() => {
    if (session?.user?.id) {
      dispatch(setAuth({ token: session.user.id, userId: session.user.id }));
      localStorage.setItem("token", session.user.id);
    }
  }, [session, dispatch]);

  return null;
}
