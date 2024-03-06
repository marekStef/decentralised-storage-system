import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import persistenceManager from "../data/PersistenceManager";

function MyApp({ Component, pageProps }) {
    useEffect(() => {
        persistenceManager.loadDataFromLocalStorage();
    }, []);

    return (
        <>
            <Component {...pageProps} />
            <ToastContainer />
        </>
    );
}

export default MyApp;
