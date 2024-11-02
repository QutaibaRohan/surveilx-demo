import Link from "next/link";
import { FC } from "react";

const Sidebar: FC = () => {
  return (
    <div className="w-64 h-screen bg-gray-100 p-4 fixed left-0 top-0">
      <div className="mb-8">
        <h1 className="text-xl font-bold">Logo</h1>
      </div>

      <nav className="space-y-4">
        <Link
          href="/videos"
          className="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded"
        >
          <span>Videos</span>
        </Link>

        <Link
          href="/library"
          className="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded"
        >
          <span>Library</span>
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
