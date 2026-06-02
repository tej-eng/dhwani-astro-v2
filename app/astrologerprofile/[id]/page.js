import ProfileAstro from "./ProfileAstro";

export default async function Page({ params }) {
  return (
    <ProfileAstro
    
      astrologerId={params.id}
    />
  );
}