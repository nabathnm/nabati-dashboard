"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menus = [
  {
    name: "Dashboard",
    href: "/dashboard",
  },
  {
    name: "Finance",
    href: "/dashboard/finance",
  },
  {
    name: "Tasks",
    href: "/dashboard/tasks",
  },
  {
    name: "Notes",
    href: "/dashboard/notes",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-zinc-200 p-4">
      <h1 className="text-2xl font-bold mb-8">
        Personal Dashboard
      </h1>

      <nav className="flex flex-col gap-2">
        {menus.map((menu) => {

          const isActive = pathname === menu.href;

          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition
              ${
                isActive
                  ? "bg-black text-white"
                  : "hover:bg-zinc-100"
              }`}
            >
              <span>{menu.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}