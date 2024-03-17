import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function MyApp({ Component, pageProps }) {
    const [isAppPrepared, setIsAppPrepared] = useState(false);

    useEffect(() => {
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
