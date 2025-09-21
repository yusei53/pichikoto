"use client";

import { TopPage } from "~/features/routes/top-page";

type ClientTopPageProps = {
    sendPoint: number;
    receivedPoint: number;
};

const ClientTopPage: React.FC<ClientTopPageProps> = () => {
    return <TopPage sendPoint={0} receivedPoint={0} />;
};

export default ClientTopPage;
