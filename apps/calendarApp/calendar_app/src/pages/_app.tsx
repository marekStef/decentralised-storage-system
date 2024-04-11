import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import persistenceManager from "../data/PersistenceManager";

function MyApp({ Component, pageProps }) {
    const [isAppPrepared, setIsAppPrepared] = useState(false);

    useEffect(() => {
        persistenceManager.loadDataFromLocalStorage();
        setIsAppPrepared(true);
    }, []);

    if (!isAppPrepared) return null;

    return (
        <>
            <Component {...pageProps} />
            <ToastContainer />
        </>
    );
}

export default MyApp;
