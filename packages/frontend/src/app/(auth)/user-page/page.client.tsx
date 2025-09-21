"use client";

import { UserPageHeader } from "~/features/routes/user-page";

type ClientUserPageProps = {
    username: string;
    name: string;
    image: string;
};

const ClientUserPage: React.FC<ClientUserPageProps> = ({ username, name, image }) => {
    return (
        <div className="m-10">
            <UserPageHeader username={username} name={name} image={image} />
            {/* <div className="flex justify-end mt-4">
        <PostCard post={mockPost} />
      </div> */}
        </div>
    );
};

export default ClientUserPage;
