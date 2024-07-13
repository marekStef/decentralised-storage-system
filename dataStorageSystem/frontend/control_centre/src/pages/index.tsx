import { useState, useEffect } from "react";

import Link from 'next/link';

import { loadAppHolders } from '../network/networkHelpers';
import LeftMainPanel from "@/components/LeftMainPanel/LeftMainPanel";
import { showError } from "@/helpers/alerts";

const AppsPage = () => {
    const [apps, setApps] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const loadDataAboutApplications = () => {
        loadAppHolders(currentPage)
            .then((res) => {
                const newApps = res.data.data;
                setApps((prevApps) => [...prevApps, ...newApps]);
                // setHasMore(newApps.length > 0);
                setHasMore(res.data.currentPage < res.data.totalPages - 1);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Failed to fetch apps:", error);
                showError("Failed to fetch applications - check whether the storage system is running", false);
                setLoading(false);
            });
    }

    const resetCurrentPage = () => {
        setCurrentPage(0);
        setApps([]);
    }

    useEffect(() => {
        if (!hasMore) return;
        setLoading(true);

        loadDataAboutApplications();
    }, [currentPage, hasMore]);

    const loadMore = () => {
        setCurrentPage((prevPage) => prevPage + 1);
    };

    return (
        <div className="flex h-screen overflow-hidden">
            <LeftMainPanel 
                refreshDataHandler={() => {
                    resetCurrentPage();
                    loadDataAboutApplications();
                }} 
            />
            <div className="flex-grow overflow-auto p-4">
                <div className="items-start flex">
                    <h1 className="text-slate-700 text-2xl p-3 mb-8 bg-slate-50 m-bl rounded-md outline outline-slate-100 cursor-default">Control Centre</h1>
                </div>
                {apps.length == 0 && (
                    <h3 className="w-full text-center text-gray-400">No apps in the system</h3>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {apps.map((app) => (
                        <Link key={app._id} href={`/apps/${app._id}`} className="shadow p-4 hover:bg-slate-50 overflow-auto">
                            <h2 className="text-xl font-bold">
                                {app.nameDefinedByUser}
                            </h2>
                            <p className="text-xs font-semibold text-gray-600 ">
                                {app.nameDefinedByApp}
                            </p>
                            <p>
                                Registered on:{" "}
                                {new Date(
                                    app.dateOfRegistration
                                ).toLocaleDateString()}
                            </p>
                            {app.dateOfAssociationByApp ? (
                                <p>
                                    Associated On:{" "}
                                    {new Date(
                                        app.dateOfRegistration
                                    ).toLocaleString()}
                                </p>
                            ) : (
                                <p>Not associated yet</p>
                            )}
                        </Link>
                    ))}
                </div>
                {hasMore && (
                    <div className="flex justify-center mt-4">
                        <button
                            className="px-4 py-2 m-5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            onClick={loadMore}
                            disabled={loading}
                        >
                            {loading ? "Loading..." : "Load More"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AppsPage;
