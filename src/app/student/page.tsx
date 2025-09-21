import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, BookOpen, Award, BarChart3 } from "lucide-react";

export default function StudentDashboard() {
  const subjects = [
    { name: "Mathematics", progress: 78, grade: "A-", teacher: "Dr. Smith" },
    { name: "Physics", progress: 85, grade: "A", teacher: "Prof. Johnson" },
    { name: "Chemistry", progress: 65, grade: "B", teacher: "Dr. Williams" },
    { name: "Biology", progress: 72, grade: "B+", teacher: "Dr. Brown" },
  ];

  const upcomingAssignments = [
    { subject: "Mathematics", title: "Algebra Test", due: "Tomorrow", priority: "high" },
    { subject: "Physics", title: "Lab Report", due: "In 3 days", priority: "medium" },
    { subject: "Chemistry", title: "Chapter 5 Exercises", due: "Next week", priority: "low" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-950 via-black to-orange-900 text-white">
      <header className="bg-orange-900/50 backdrop-blur-md border-b border-orange-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
            My Dashboard
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card className="bg-orange-900/20 border-orange-800/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-300">
                Overall Progress
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-200">75%</div>
              <p className="text-xs text-orange-400">+5% from last month</p>
            </CardContent>
          </Card>
          <Card className="bg-orange-900/20 border-orange-800/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-300">
                Current GPA
              </CardTitle>
              <Award className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-200">3.4</div>
              <p className="text-xs text-orange-400">Good standing</p>
            </CardContent>
          </Card>
          <Card className="bg-orange-900/20 border-orange-800/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-300">
                Upcoming Assignments
              </CardTitle>
              <Calendar className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-200">3</div>
              <p className="text-xs text-orange-400">Due this week</p>
            </CardContent>
          </Card>
          <Card className="bg-orange-900/20 border-orange-800/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-300">
                Active Subjects
              </CardTitle>
              <BookOpen className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-200">4</div>
              <p className="text-xs text-orange-400">This semester</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card className="bg-orange-900/10 border-orange-800/50">
              <CardHeader>
                <CardTitle className="text-xl text-orange-200">My Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {subjects.map((subject) => (
                    <div key={subject.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-orange-100">{subject.name}</h3>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-orange-300">{subject.teacher}</span>
                          <Badge 
                            variant="outline" 
                            className={`border-opacity-50 ${
                              subject.grade.startsWith('A') ? 'border-green-500 text-green-400' :
                              subject.grade.startsWith('B') ? 'border-blue-500 text-blue-400' :
                              'border-yellow-500 text-yellow-400'
                            }`}
                          >
                            {subject.grade}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Progress 
                          value={subject.progress} 
                          className="h-2 bg-orange-900/30 flex-1"
                          indicatorClassName={`${
                            subject.progress > 80 ? 'bg-green-500' : 
                            subject.progress > 60 ? 'bg-blue-500' : 'bg-yellow-500'
                          }`}
                        />
                        <span className="text-sm text-orange-300 w-12 text-right">
                          {subject.progress}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-orange-900/10 border-orange-800/50">
              <CardHeader>
                <CardTitle className="text-xl text-orange-200">Upcoming</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingAssignments.map((item, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-orange-900/20 transition-colors">
                      <div className={`h-2 w-2 mt-2 rounded-full ${
                        item.priority === 'high' ? 'bg-red-500' :
                        item.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1">
                        <h4 className="font-medium text-orange-100">{item.title}</h4>
                        <div className="flex justify-between text-sm text-orange-400">
                          <span>{item.subject}</span>
                          <span>{item.due}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-orange-900/10 border-orange-800/50">
              <CardHeader>
                <CardTitle className="text-xl text-orange-200">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="flex-col h-20 border-orange-700/50 hover:bg-orange-800/30">
                    <BookOpen className="h-5 w-5 mb-1 text-orange-400" />
                    <span className="text-xs text-orange-200">View Assignments</span>
                  </Button>
                  <Button variant="outline" className="flex-col h-20 border-orange-700/50 hover:bg-orange-800/30">
                    <Calendar className="h-5 w-5 mb-1 text-orange-400" />
                    <span className="text-xs text-orange-200">View Schedule</span>
                  </Button>
                  <Button variant="outline" className="flex-col h-20 border-orange-700/50 hover:bg-orange-800/30">
                    <BarChart3 className="h-5 w-5 mb-1 text-orange-400" />
                    <span className="text-xs text-orange-200">View Progress</span>
                  </Button>
                  <Button variant="outline" className="flex-col h-20 border-orange-700/50 hover:bg-orange-800/30">
                    <Award className="h-5 w-5 mb-1 text-orange-400" />
                    <span className="text-xs text-orange-200">View Grades</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
