import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type UserPageHeaderProps = {
  username: string;
  name: string;
  image: string;
};

export const UserPageHeader: React.FC<UserPageHeaderProps> = ({
  username,
  name,
  image
}) => {
  return (
    <div>
      <div className="flex items-center">
        <Avatar className="w-20 h-20">
          <AvatarImage src={image} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="ml-3">
          <p>{name}</p>
          <p>{username}</p>
        </div>
      </div>
      <div className="w-1/2 border-b border-gray-300 my-4" />
    </div>
  );
};
