import { mockUser } from "~/mock/user";
import ClientUserPage from "./page.client";

const Page = () => {
    return (
        <ClientUserPage
            username={mockUser.discordID}
            name={mockUser.discordUserName}
            image={mockUser.discordAvatar}
        />
    );
};

export default Page;
