import ProfileAstro from "./ProfileAstro";

export default function Page({ params }) {
  return (
    <ProfileAstro
      astrologerId={params.id}
    />
  );
}