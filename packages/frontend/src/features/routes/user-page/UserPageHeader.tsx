type UserPageHeaderProps = {
    username: string;
    name: string;
    image: string;
};

export const UserPageHeader: React.FC<UserPageHeaderProps> = ({ username, name }) => {
    return (
        <div>
            <div className="flex items-center">
                <div className="ml-3">
                    <p>{name}</p>
                    <p>{username}</p>
                </div>
            </div>
            <div className="w-1/2 border-b border-gray-300 my-4" />
        </div>
    );
};
