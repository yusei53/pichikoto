import { mockUserData } from "@/utils/mockdata";
import ClientUserPage from "./page.client";

export default function Page() {
  return (
    <ClientUserPage
      username={mockUserData.username}
      name={mockUserData.name}
      image={mockUserData.image}
    />
  );
}
