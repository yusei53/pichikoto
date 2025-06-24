import { mockUserData } from "@/utils/mockdata";
import ClientUserPage from "./page.client";

const Page = () => {
  return (
    <ClientUserPage
      username={mockUserData.username}
      name={mockUserData.name}
      image={mockUserData.image}
    />
  );
};

export default Page;
