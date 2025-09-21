import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Users, BookOpen } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Class = {
  id: string;
  name: string;
  subject: string;
  studentCount: number;
  progress: number;
};

const classes: Class[] = [
  {
    id: "1",
    name: "Mathematics 101",
    subject: "Mathematics",
    studentCount: 24,
    progress: 78,
  },
  {
    id: "2",
    name: "Physics Advanced",
    subject: "Physics",
    studentCount: 18,
    progress: 85,
  },
  {
    id: "3",
    name: "Chemistry Fundamentals",
    subject: "Chemistry",
    studentCount: 22,
    progress: 65,
  },
];

export function ClassList() {
  return (
    <div className="rounded-lg border border-orange-800/50 overflow-hidden">
      <div className="p-4 bg-orange-900/20 border-b border-orange-800/50 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-orange-200">My Classes</h2>
        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
          <BookOpen className="mr-2 h-4 w-4" /> New Class
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-orange-900/10 hover:bg-orange-900/10">
            <TableHead className="text-orange-300">Class Name</TableHead>
            <TableHead className="text-orange-300">Subject</TableHead>
            <TableHead className="text-orange-300">Students</TableHead>
            <TableHead className="text-orange-300">Average Progress</TableHead>
            <TableHead className="text-right text-orange-300">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {classes.map((cls) => (
            <TableRow key={cls.id} className="border-orange-800/30 hover:bg-orange-900/20">
              <TableCell className="font-medium text-orange-100">
                {cls.name}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="border-orange-600 text-orange-300">
                  {cls.subject}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center text-orange-200">
                  <Users className="mr-2 h-4 w-4 text-orange-400" />
                  {cls.studentCount} students
                </div>
              </TableCell>
              <TableCell>
                <div className="w-full bg-orange-900/30 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      cls.progress > 70 ? 'bg-green-500' : cls.progress > 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`} 
                    style={{ width: `${cls.progress}%` }}
                  />
                </div>
                <span className="text-sm text-orange-300">{cls.progress}%</span>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4 text-orange-300" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-slate-900 border-orange-800/50">
                    <DropdownMenuItem className="text-orange-200 hover:bg-orange-800/50 cursor-pointer">
                      View Class
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-orange-200 hover:bg-orange-800/50 cursor-pointer">
                      Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-400 hover:bg-red-900/50 cursor-pointer">
                      Delete Class
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
