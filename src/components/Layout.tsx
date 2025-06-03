// import { ReactNode } from "react";
// import NavBar from "./NavBar";

// export default function Layout({ children }: { children: ReactNode }) {
//   return (
//     <div>
//       <NavBar />
//       <main className="max-w-4xl mx-auto mt-8">{children}</main>
//     </div>
//   );
// }

import { ReactNode } from "react";
import NavBar from "./NavBar";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <NavBar />
      <main className="max-w-4xl mx-auto mt-8 px-4">{children}</main>
    </div>
  );
}
