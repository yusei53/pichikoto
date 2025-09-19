"use client";

import { PostCard } from "@/features/common/PostCard";
import { UserPageHeader } from "@/features/routes/user-page";
import { mockPost } from "@/mock/post";
import { format } from "date-fns";

type ClientUserPageProps = {
  username: string;
  name: string;
  image: string;
};

export const formatDate = (date: Date) => {
  const formattedDate = format(new Date(date), "yyyy.MM.dd");
  const weekday = format(new Date(date), "eee").toUpperCase();
  return `${formattedDate} ${weekday}`;
};
const ClientUserPage: React.FC<ClientUserPageProps> = ({
  username,
  name,
  image
}) => {
  return (
    <div className="m-10">
      <UserPageHeader username={username} name={name} image={image} />
      <div className="flex justify-end mt-4">
        <PostCard post={mockPost} formatDate={formatDate} />
      </div>
    </div>
  );
};

export default ClientUserPage;
