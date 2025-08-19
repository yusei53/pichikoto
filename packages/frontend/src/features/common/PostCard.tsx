import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Post } from "@/model/post";
import { Plus, SendHorizontal } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

type PostCardProps = {
  post: Post;
  formatDate: (date: Date) => string;
};

export const PostCard: React.FC<PostCardProps> = ({ post, formatDate }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-gray-300 px-4 py-2 w-1/2 relative">
      <div className="flex items-center gap-4">
        <Avatar className="w-10 h-10">
          <AvatarImage src={post.sendUser.discordAvatar} />
          <AvatarFallback>{post.sendUser.discordUserName}</AvatarFallback>
        </Avatar>
        <div>
          <div className="text-sm truncate max-w-[60px]">
            {post.sendUser.discordUserName}
          </div>
          <div className="text-sm truncate max-w-[105px]">
            {post.sendUser.discordID}
          </div>
        </div>
        <SendHorizontal className="w-4 h-4" />
        {/* MEMO:5人以上の場合は3人まで表示し、4人目以降はホバーで表示*/}
        {post.receivedUsers.length > 4 ? (
          <>
            {post.receivedUsers.slice(0, 3).map((user, index) => (
              <div className="flex items-center flex-col pt-4" key={index}>
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user.discordAvatar} />
                  <AvatarFallback>{user.discordUserName}</AvatarFallback>
                </Avatar>
                <div className="text-sm truncate max-w-[40px]">
                  {user.discordUserName}
                </div>
              </div>
            ))}
            <div className="flex items-center flex-col pt-4 relative">
              <div
                className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <span className="text-xs text-gray-600">
                  +{post.receivedUsers.length - 3}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                他{post.receivedUsers.length - 3}人
              </div>
              {/* MEMO:ホバーするとユーザーネームが見れる*/}
              {showTooltip && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-5 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg z-10 whitespace-nowrap">
                  {post.receivedUsers.slice(3).map((user, index) => (
                    <div key={index} className="text-center">
                      {user.discordUserName}
                    </div>
                  ))}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-b-4 border-l-4 border-r-4 border-transparent border-b-gray-800"></div>
                </div>
              )}
            </div>
          </>
        ) : (
          post.receivedUsers.map((user, index) => (
            <div className="flex items-center flex-col pt-4" key={index}>
              <Avatar className="w-10 h-10">
                <AvatarImage src={user.discordAvatar} />
                <AvatarFallback>{user.discordUserName}</AvatarFallback>
              </Avatar>
              <div className="text-sm truncate max-w-[40px]">
                {user.discordUserName}
              </div>
            </div>
          ))
        )}
        <div className="flex items-center pt-10">
          <Plus className="w-5 h-5 mt-2" />
          <p className="text-4xl">{post.points}</p>
          <p className="text-lg pt-2">pt</p>
        </div>
      </div>
      <div className="text-sm absolute top-3 right-8">
        {formatDate(post.createdAt)}
      </div>
      <div className="pb-10">{post.message}</div>
      <div className="flex gap-1 items-center absolute bottom-3 right-8">
        <p className="text-md text-[#A8CE8F] pt-3">{post.handsClapping}</p>
        <Image
          src="/hands-clapping.png"
          alt="hands-clapping"
          width={30}
          height={30}
        />
      </div>
    </div>
  );
};
