import UserPageHeader from "@/features/routes/user-page/user-page-header";

type ClientUserPageProps = {
  username: string;
  name: string;
  image: string;
};

const ClientUserPage: React.FC<ClientUserPageProps> = ({
  username,
  name,
  image
}) => {
  return (
    <div className="m-10">
      <UserPageHeader username={username} name={name} image={image} />
    </div>
  );
};

export default ClientUserPage;
