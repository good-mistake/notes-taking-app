"use client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./redux/store";
import UiWrapper from "./components/UiWrapper";
import { SessionProvider } from "next-auth/react";
import SessionBridge from "./components/SessionBridge";
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <SessionBridge />
          <UiWrapper>{children}</UiWrapper>
        </PersistGate>
      </Provider>
    </SessionProvider>
  );
}
