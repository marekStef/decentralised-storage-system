import { useRouter } from 'next/router';

function AppPage() {
    const router = useRouter();
    const { appId } = router.query;

    return (
        <div>
            <h1>App Details</h1>
            { appId }
        </div>
    );
}

export default AppPage;
