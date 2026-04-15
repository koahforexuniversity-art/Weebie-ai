import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="grid min-h-screen place-items-center px-6 py-20">
      <div className="aurora" aria-hidden />
      <SignIn appearance={{ elements: { card: "glass scanlines" } }} />
    </div>
  );
}
