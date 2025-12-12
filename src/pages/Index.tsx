import { MadeWithDyad } from "@/components/made-with-dyad";
import { Link } from "react-router-dom"; // Import Link for navigation
import { Button } from "@/components/ui/button"; // Import Button component

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">Welcome to Your Blank App</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
          Start building your amazing project here!
        </p>
        <Link to="/dashboard">
          <Button className="px-6 py-3 text-lg">Go to Dashboard</Button>
        </Link>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;