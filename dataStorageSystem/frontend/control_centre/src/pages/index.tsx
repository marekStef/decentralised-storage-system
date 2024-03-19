import { useState, useEffect } from "react";
import SettingsModal from "@/components/modal/modal";
import Link from 'next/link';

import {loadAppHolders} from '../network/networkHelpers';

const AppsPage = () => {
    const [apps, setApps] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    useEffect(() => {
        if (!hasMore) return;

        setLoading(true);
        loadAppHolders(currentPage)
            .then((res) => {
                const newApps = res.data.data;
                setApps((prevApps) => [...prevApps, ...newApps]);
                setHasMore(newApps.length > 0);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Failed to fetch apps:", error);
                setLoading(false);
            });
    }, [currentPage]);

    const loadMore = () => {
        setCurrentPage((prevPage) => prevPage + 1);
    };

    return (
        <div className="flex h-screen overflow-hidden">
            <SettingsModal isOpen={isModalOpen} onClose={toggleModal} />
            <div className="flex-none w-3/12 bg-slate-950 overflow-auto">
                <div className="flex flex-col items-center">
                    <div className="min-h-32 w-full p-4">
                        <h1 className="text-white text-lg">Last activity</h1>
                        <p className="text-center text-slate-500 py-5">None</p>
                    </div>
                    <div>
                        <button
                            className="px-4 py-2 bg-white text-slate-950 rounded hover:bg-slate-50 transition-colors"
                            onClick={toggleModal}
                        >
                            Open Settings
                        </button>
                    </div>
                </div>
            </div>
            <div className="flex-grow overflow-auto p-4">
                <div className="items-start flex">
                  <h1 className="text-slate-700 text-3xl p-3 mb-8 bg-slate-50 m-bl rounded-md outline outline-slate-100 cursor-default">Control Panel</h1>
                </div>
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
