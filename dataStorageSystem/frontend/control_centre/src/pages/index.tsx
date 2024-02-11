import axios from "axios";
import { useState, useEffect } from "react";
import SettingsModal from "@/components/modal/modal";

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
        axios
            .get(`http://localhost:3000/admin/api/apps?page=${currentPage}`)
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
            <div className="flex-none w-3/12 bg-blue-500 overflow-auto">
              <div className="flex flex-col content-end">
                <div className="">

                </div>
                <button className="" onClick={toggleModal}>Open Settings</button>
              </div>
            </div>
            <div className="flex-grow overflow-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                    {apps.map((app) => (
                        <div key={app._id} className="shadow p-4">
                            <h2 className="text-xl font-bold">
                                {app.nameDefinedByUser}
                            </h2>
                            <p>
                                Registered on:{" "}
                                {new Date(
                                    app.dateOfRegistration
                                ).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>
                {hasMore && (
                    <div className="flex justify-center mt-4">
                        <button
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
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
