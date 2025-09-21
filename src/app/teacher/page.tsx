import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClassList } from "./_components/class-list";
import { ProgressOverview } from "./_components/progress-overview";

export default function TeacherDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-950 via-black to-orange-900 text-white">
      <header className="bg-orange-900/50 backdrop-blur-md border-b border-orange-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
            Classroom Progress Tracker
          </h1>
          <nav className="flex items-center space-x-4">
            <Button variant="ghost" className="text-orange-200 hover:bg-orange-800/50">
              Profile
            </Button>
            <Button variant="outline" className="border-orange-600 text-orange-200 hover:bg-orange-800/50">
              Sign Out
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-4">
          <div className="flex justify-between items-center">
            <TabsList className="bg-orange-900/30 border border-orange-800">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-orange-800/50 data-[state=active]:text-orange-200"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="classes" 
                className="data-[state=active]:bg-orange-800/50 data-[state=active]:text-orange-200"
              >
                My Classes
              </TabsTrigger>
              <TabsTrigger 
                value="progress" 
                className="data-[state=active]:bg-orange-800/50 data-[state=active]:text-orange-200"
              >
                Student Progress
              </TabsTrigger>
            </TabsList>
            <Button className="bg-orange-600 hover:bg-orange-700">
              + Add New Class
            </Button>
          </div>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-orange-900/20 border-orange-800/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-300">
                    Total Students
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-orange-500"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-200">247</div>
                  <p className="text-xs text-orange-400">+20.1% from last month</p>
                </CardContent>
              </Card>
              {/* Add more stat cards */}
            </div>
            <ProgressOverview />
          </TabsContent>

          <TabsContent value="classes">
            <ClassList />
          </TabsContent>

          <TabsContent value="progress">
            <div className="rounded-lg border border-orange-800/50 p-6 bg-orange-900/10">
              <h2 className="text-xl font-semibold mb-4 text-orange-200">Student Progress</h2>
              <p className="text-orange-300">Progress tracking will be displayed here</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
