import Link from 'next/link';

export default function Notifications() {
  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <header className="bg-white shadow-md p-4">
        <Link href="/dashboard" className="text-blue-500 hover:underline">← Back to Dashboard</Link>
        <h1 className="text-black text-2xl font-semibold mt-2">Notifications</h1>
      </header>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-white shadow-md p-4 rounded-md">
          <h2 className="text-lg font-semibold">Unread</h2>
          <ul className="mt-2">
            <li className="p-2 border-b">New task assigned</li>
            <li className="p-2 border-b">Project deadline extended</li>
          </ul>
        </div>
        <div className="bg-white shadow-md p-4 rounded-md">
          <h2 className="text-lg font-semibold">Read</h2>
          <ul className="mt-2">
            <li className="p-2 border-b">Meeting scheduled</li>
            <li className="p-2 border-b">Feedback received</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
