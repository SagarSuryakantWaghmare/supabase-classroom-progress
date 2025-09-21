'use client';

import { useEffect, useState } from 'react';
import { useClassAverages, type ClassAverage } from '@/hooks/useClassAverages';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, Users, Award, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type User = {
  id: string;
  name: string;
};

type ProgressData = {
  student_id: string;
  average_score: number;
  total_assignments: number;
};

type StudentData = {
  student_id: string;
  name: string;
  average_score: number;
  total_assignments: number;
};

type ClassStatisticsProps = {
  classId: string;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function ClassStatistics({ classId }: ClassStatisticsProps) {
  const [students, setStudents] = useState<StudentData[]>([]);
  const { fetchClassAverages, loading, error } = useClassAverages();
  
  useEffect(() => {
    async function loadData() {
      try {
        const averages = await fetchClassAverages(classId);
        if (!averages || averages.length === 0) return;
        
        const { data: studentsData, error: studentsError } = await supabase
          .from('users')
          .select('id, name')
          .in('id', averages.map(avg => avg.student_id));
        
        if (studentsError) throw studentsError;
        
        const studentMap = new Map(
          (studentsData as User[]).map(student => [student.id, student.name])
        );
        
        const combinedData: StudentData[] = averages.map(avg => ({
          ...avg,
          name: studentMap.get(avg.student_id) || 'Unknown Student',
        }));
        
        setStudents(combinedData);
      } catch (err) {
        console.error('Error loading class statistics:', err);
      }
    }
    
    if (classId) {
      loadData();
    }
  }, [classId, fetchClassAverages]);

  // Calculate class average
  const classAverage = students.length > 0
    ? students.reduce((sum, student) => sum + student.average_score, 0) / students.length
    : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <div>
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Error loading class statistics: {error.message}</AlertDescription>
        </div>
      </Alert>
    );
  }

  if (students.length === 0) {
    return (
      <Card className="text-center p-8 bg-orange-50/50 border-orange-200">
        <FileText className="mx-auto h-12 w-12 text-orange-400 mb-4" />
        <h3 className="text-lg font-medium text-orange-900">No data available</h3>
        <p className="mt-2 text-sm text-orange-700">
          No statistics available for this class yet.
        </p>
      </Card>
    );
  }

  // Prepare chart data for Recharts
  const chartData = students.map(student => ({
    name: student.name,
    score: student.average_score,
    assignments: student.total_assignments,
  }));

  // Sort students by average score (descending)
  const sortedStudents = [...students].sort((a, b) => b.average_score - a.average_score);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-orange-800">Class Average</CardDescription>
            <CardTitle className="text-3xl font-bold text-orange-900">
              {classAverage.toFixed(1)}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-orange-200">
              <div 
                className="h-full bg-orange-600 transition-all"
                style={{ width: `${classAverage}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-blue-800">Total Students</CardDescription>
            <div className="flex items-center justify-between">
              <CardTitle className="text-3xl font-bold text-blue-900">
                {students.length}
              </CardTitle>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-green-800">Top Performer</CardDescription>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-green-900">
                  {sortedStudents[0]?.name || 'N/A'}
                </CardTitle>
                <p className="text-sm text-green-700">
                  {sortedStudents[0]?.average_score.toFixed(1)}% average
                </p>
              </div>
              <Award className="h-8 w-8 text-amber-400" />
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="text-orange-900">Class Performance</CardTitle>
          <CardDescription>Average scores across all students</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-orange-100" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#9a3412' }}
                tickLine={{ stroke: '#9a3412' }}
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fill: '#9a3412' }}
                tickLine={{ stroke: '#9a3412' }}
                tickFormatter={(value) => `${value}%`}
              />
              <RechartsTooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderColor: '#fb923c',
                  borderRadius: '0.5rem',
                  color: '#431407',
                }}
                formatter={(value: number) => [`${value}%`, 'Average Score']}
              />
              <Bar dataKey="score" name="Average Score">
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    className="opacity-80 hover:opacity-100 transition-opacity"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Student Performance Table */}
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="text-orange-900">Student Performance</CardTitle>
          <CardDescription>Detailed view of each student's progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-orange-100">
            <Table>
              <TableHeader className="bg-orange-50">
                <TableRow className="hover:bg-orange-50">
                  <TableHead className="text-orange-900">Student</TableHead>
                  <TableHead className="text-orange-900">Average Score</TableHead>
                  <TableHead className="text-orange-900">Assignments</TableHead>
                  <TableHead className="text-orange-900">Progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedStudents.map((student) => (
                  <TableRow key={student.student_id} className="hover:bg-orange-50/50">
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={student.average_score >= 70 ? 'default' : 
                                student.average_score >= 50 ? 'secondary' : 'destructive'}
                        className="w-16 justify-center"
                      >
                        {student.average_score.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell>{student.total_assignments}</TableCell>
                    <TableCell className="w-1/3">
                      <div className="flex items-center gap-2">
                        <div className="relative h-2 w-full overflow-hidden rounded-full bg-orange-100">
                          <div 
                            className={cn(
                              "h-full transition-all",
                              student.average_score >= 70 ? 'bg-green-500' :
                              student.average_score >= 50 ? 'bg-blue-500' : 'bg-red-500'
                            )}
                            style={{ width: `${student.average_score}%` }}
                          />
                        </div>
                        <span className="text-xs text-orange-700 w-12">
                          {student.average_score.toFixed(0)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
