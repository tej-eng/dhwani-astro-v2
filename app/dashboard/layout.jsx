import Link from "next/link";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-145 w-full">
      {/* SIDEBAR */}
      <div className="w-50 p-5 rounded-r-4xl text-white bg-purple-900">
        <h2 className="mb-6 text-xl bg-purple-500 rounded-xl  font-semibold px-3 py-1">Dashboard</h2>

        <div className="flex  flex-col space-y-2">
          <Link href="/dashboard/profile" className="border-b border-gray-400 rounded-xl py-2 text-center">Profile</Link>
          <Link href="/dashboard/chat-history" className="border-b border-gray-400 rounded-xl py-2 text-center">Chat History</Link>
          <Link href="/dashboard/call-history" className="border-b border-gray-400 rounded-xl py-2 text-center">Call History</Link>
          <Link href="/dashboard/transaction" className="border-b border-gray-400 rounded-xl py-2 text-center">Transaction</Link>
                    <Link href="/dashboard/settings" className="border-b border-gray-400 rounded-xl py-2 text-center">Settings</Link>

        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-100">{children}</div>
    </div>
  );
}
