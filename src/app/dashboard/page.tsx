'use client';

import { useAuth } from '@/contexts/AuthContext';
import { ROLES } from '@/config/env';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { 
  AcademicCapIcon, 
  ChartBarIcon, 
  DocumentTextIcon, 
  UserGroupIcon, 
  UsersIcon, 
  XMarkIcon 
} from '@heroicons/react/24/outline';

// Define interfaces for TypeScript types
interface ClassStats {
  id: string;
  name: string;
  teacher: string;
  studentCount: number;
  averageScore: number;
}

interface SchoolStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalAssignments: number;
  averageScore: number;
  classAverages: ClassStats[];
  performanceTrend: Array<{
    month: string;
    averageScore: number;
  }>;
}

interface ClassDetails {
  id: string;
  name: string;
  teacher: {
    id: string;
    name: string;
    email: string;
  };
  students: Array<{
    id: string;
    name: string;
    email: string;
    assignmentsCompleted: number;
    averageScore: number;
  }>;
  assignments: Array<{
    id: string;
    title: string;
    due_date: string;
  }>;
  studentCount: number;
  assignmentCount: number;
  averageScore: number;
}

export default function DashboardPage() {
  const { user, role, signOut } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role) {
      setLoading(false);
    }
  }, [role]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const renderDashboardContent = () => {
    switch (role) {
      case ROLES.STUDENT:
        return <StudentDashboard />;
      case ROLES.TEACHER:
        return <TeacherDashboard />;
      case ROLES.HEAD_TEACHER:
        return <HeadTeacherDashboard />;
      default:
        return <div>Unauthorized</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Classroom Tracker</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link href="/dashboard" className="border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Dashboard
                </Link>
                {role === ROLES.TEACHER || role === ROLES.HEAD_TEACHER ? (
                  <Link href="/classes" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    My Classes
                  </Link>
                ) : null}
                {role === ROLES.HEAD_TEACHER && (
                  <Link href="/admin" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Admin
                  </Link>
                )}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <button
                onClick={signOut}
                className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <span className="sr-only">Sign out</span>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {renderDashboardContent()}
        </div>
      </main>
    </div>
  );
}

type AssignmentStatus = 'submitted' | 'pending' | 'graded';

interface StudentProgress {
  id: string;
  title: string;
  score: number | null;
  max_score: number;
  submitted_at: string | null;
  status: AssignmentStatus;
}

function StudentDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<StudentProgress[]>([]);
  const [classInfo, setClassInfo] = useState<any>(null);
  const [averageScore, setAverageScore] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        // Fetch class information
        const { data: classData, error: classError } = await supabase
          .from('classes')
          .select('*')
          .eq('id', user.class_id)
          .single();
          
        if (classError) throw classError;
        setClassInfo(classData);
        
        // Fetch assignments and scores
        const { data: assignments, error: assignmentsError } = await supabase
          .from('assignments')
          .select('*')
          .eq('class_id', user.class_id);
          
        if (assignmentsError) throw assignmentsError;
        
        // Fetch scores for the student
        const { data: scores, error: scoresError } = await supabase
          .from('scores')
          .select('*')
          .eq('student_id', user.id);
          
        if (scoresError) throw scoresError;
        
        // Combine assignments with scores
        const studentProgress = assignments.map(assignment => {
          const score = scores.find(s => s.assignment_id === assignment.id);
          let status: AssignmentStatus = 'pending';
          
          if (score) {
            status = score.score !== null ? 'graded' : 'submitted';
          }
          
          return {
            id: assignment.id,
            title: assignment.title,
            score: score?.score || null,
            max_score: assignment.max_score || 100,
            submitted_at: score?.submitted_at || null,
            status
          } as StudentProgress;
        });
        
        setProgress(studentProgress);
        
        // Calculate average score
        const gradedAssignments = studentProgress.filter(a => a.status === 'graded');
        if (gradedAssignments.length > 0) {
          const total = gradedAssignments.reduce((sum, a) => sum + (a.score || 0), 0);
          setAverageScore(parseFloat((total / gradedAssignments.length).toFixed(2)));
        }
        
      } catch (error) {
        console.error('Error fetching student data:', error);
        toast.error('Failed to load your data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.name || 'Student'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {classInfo?.name ? `Class: ${classInfo.name}` : 'Loading class information...'}
            </p>
          </div>
          {averageScore !== null && (
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <div className="bg-white shadow rounded-lg p-4">
                <p className="text-sm font-medium text-gray-500">Average Score</p>
                <p className="text-3xl font-bold text-blue-600">{averageScore}%</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">Your Assignments</h2>
          
          {progress.length === 0 ? (
            <div className="mt-4 bg-white shadow rounded-lg p-6">
              <p className="text-gray-500">No assignments found for your class.</p>
            </div>
          ) : (
            <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {progress.map((item) => (
                  <li key={item.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {item.title}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          {item.status === 'graded' ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Graded: {item.score}/{item.max_score}
                            </span>
                          ) : item.status === 'submitted' ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Submitted, awaiting grade
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              Not submitted
                            </span>
                          )}
                        </div>
                      </div>
                      {item.submitted_at && (
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              Submitted on {new Date(item.submitted_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ClassStats {
  id: string;
  name: string;
  teacher: string;
  studentCount: number;
  averageScore: number;
}

interface SchoolStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalAssignments: number;
  averageScore: number;
  classAverages: ClassStats[];
  performanceTrend: Array<{
    month: string;
    averageScore: number;
  }>;
}

interface ClassDetails {
  id: string;
  name: string;
  teacher: {
    id: string;
    name: string;
    email: string;
  };
  students: Array<{
    id: string;
    name: string;
    email: string;
    assignmentsCompleted: number;
    averageScore: number;
  }>;
  assignments: Array<{
    id: string;
    title: string;
    due_date: string;
  }>;
  studentCount: number;
  assignmentCount: number;
  averageScore: number;
}

function TeacherDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<ClassStats[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        // Fetch classes
        const { data: classesData, error: classesError } = await supabase
          .from('classes')
          .select('*')
          .eq('teacher_id', user.id);
          
        if (classesError) throw classesError;
        setClasses(classesData);
        
      } catch (error) {
        console.error('Error fetching teacher data:', error);
        toast.error('Failed to load your data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.name || 'Teacher'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              You are teaching {classes.length} classes.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">Your Classes</h2>
          
          {classes.length === 0 ? (
            <div className="mt-4 bg-white shadow rounded-lg p-6">
              <p className="text-gray-500">No classes found for you.</p>
            </div>
          ) : (
            <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {classes.map((cls) => (
                  <li key={cls.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {cls.name}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {cls.studentCount} students
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Remove the duplicate HeadTeacherDashboard function and keep only one implementation
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SchoolStats | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);

  useEffect(() => {
    const fetchSchoolStats = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        // Fetch users data
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, name, email, role, class_id');
          
        if (usersError) throw usersError;
        
        // Fetch classes data
        const { data: classesData, error: classesError } = await supabase
          .from('classes')
          .select('*');
          
        if (classesError) throw classesError;
        
        // Fetch assignments data
        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from('assignments')
          .select('*');
          
        if (assignmentsError) throw assignmentsError;
        
        // Calculate statistics
        const totalStudents = usersData.filter(u => u.role === 'student').length;
        const totalTeachers = usersData.filter(u => u.role === 'teacher').length;
        const totalClasses = classesData.length;
        const totalAssignments = assignmentsData.length;
        
        // Calculate class averages
        const classAverages = classesData.map(cls => {
          const teacher = usersData.find(u => u.id === cls.teacher_id)?.name || 'Unknown';
          const classStudents = usersData.filter(u => u.class_id === cls.id);
          
          return {
            id: cls.id,
            name: cls.name,
            teacher,
            studentCount: classStudents.length,
            averageScore: Math.floor(Math.random() * 40) + 60 // Placeholder for actual score calculation
          };
        });
        
        // Generate performance trend (last 6 months)
        const months = [];
        const currentDate = new Date();
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(currentDate.getMonth() - i);
          months.push({
            month: date.toLocaleString('default', { month: 'short' }),
            averageScore: Math.floor(Math.random() * 20) + 70 // Placeholder
          });
        }
        
        setStats({
          totalStudents,
          totalTeachers,
          totalClasses,
          totalAssignments,
          averageScore: 75, // Placeholder
          classAverages,
          performanceTrend: months
        });
        
      } catch (error) {
        console.error('Error fetching school data:', error);
        toast.error('Failed to load school data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSchoolStats();
  }, [user]);

  const handleViewClass = async (classId: string) => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setSelectedClass(classId);
      
      // Fetch class details
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .single();
        
      if (classError) throw classError;
      
      // Fetch teacher details
      const { data: teacherData, error: teacherError } = await supabase
        .from('users')
        .select('*')
        .eq('id', classData.teacher_id)
        .single();
        
      if (teacherError) throw teacherError;
      
      // Fetch students in class
      const { data: studentsData, error: studentsError } = await supabase
        .from('users')
        .select('*')
        .eq('class_id', classId)
        .eq('role', 'student');
        
      if (studentsError) throw studentsError;
      
      // Fetch assignments for class
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('assignments')
        .select('*')
        .eq('class_id', classId);
        
      if (assignmentsError) throw assignmentsError;
      
      // Prepare class details
      const details: ClassDetails = {
        id: classData.id,
        name: classData.name,
        teacher: {
          id: teacherData.id,
          name: teacherData.name || 'Unknown',
          email: teacherData.email
        },
        students: studentsData.map(student => ({
          id: student.id,
          name: student.name || 'Unknown',
          email: student.email,
          assignmentsCompleted: Math.floor(Math.random() * assignmentsData.length), // Placeholder
          averageScore: Math.floor(Math.random() * 40) + 60 // Placeholder
        })),
        assignments: assignmentsData.map(assignment => ({
          id: assignment.id,
          title: assignment.title,
          due_date: assignment.due_date
        })),
        studentCount: studentsData.length,
        assignmentCount: assignmentsData.length,
        averageScore: Math.floor(Math.random() * 40) + 60 // Placeholder
      };
      
      setClassDetails(details);
      
    } catch (error) {
      console.error('Error fetching class details:', error);
      toast.error('Failed to load class details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-gray-500">No school data available.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">
              School Analytics Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Comprehensive overview of school performance and metrics
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-5 mt-6 sm:grid-cols-2 lg:grid-cols-5">
          {/* Total Students */}
          <div className="px-4 py-5 bg-white rounded-lg overflow-hidden shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <UsersIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Students
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.totalStudents}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          {/* Total Teachers */}
          <div className="px-4 py-5 bg-white rounded-lg overflow-hidden shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <UserGroupIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Teachers
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.totalTeachers}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          {/* Total Classes */}
          <div className="px-4 py-5 bg-white rounded-lg overflow-hidden shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <AcademicCapIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Classes
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.totalClasses}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          {/* Total Assignments */}
          <div className="px-4 py-5 bg-white rounded-lg overflow-hidden shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <DocumentTextIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Assignments
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.totalAssignments}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          {/* School Average */}
          <div className="px-4 py-5 bg-white rounded-lg overflow-hidden shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    School Average
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.averageScore}%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Trend */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Performance Trend</h2>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="h-64">
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Performance chart will be displayed here</p>
              </div>
            </div>
          </div>
        </div>

        {/* Class Performance */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Class Performance</h2>
          </div>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Teacher
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Students
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Average Score
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.classAverages.map((cls) => (
                    <tr key={cls.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {cls.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cls.teacher}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cls.studentCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                            <div 
                              className="h-2.5 rounded-full" 
                              style={{
                                width: `${cls.averageScore}%`,
                                backgroundColor: cls.averageScore >= 80 ? '#10B981' : 
                                              cls.averageScore >= 60 ? '#F59E0B' : '#EF4444'
                              }}
                            ></div>
                          </div>
                          <span>{cls.averageScore}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewClass(cls.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Class Details Modal */}
        {classDetails && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center pb-3">
                <h3 className="text-xl font-medium text-gray-900">{classDetails.name} - Class Details</h3>
                <button 
                  onClick={() => setClassDetails(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-4">
                <h4 className="text-lg font-medium text-gray-900 mb-2">Teacher Information</h4>
                <div className="bg-gray-50 p-4 rounded-md mb-6">
                  <p><span className="font-medium">Name:</span> {classDetails.teacher.name}</p>
                  <p><span className="font-medium">Email:</span> {classDetails.teacher.email}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Class Statistics</h4>
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-4">
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Total Students</dt>
                            <dd className="mt-1 text-sm text-gray-900">{classDetails.studentCount}</dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Total Assignments</dt>
                            <dd className="mt-1 text-sm text-gray-900">{classDetails.assignmentCount}</dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Class Average</dt>
                            <dd className="mt-1 text-sm text-gray-900">{classDetails.averageScore}%</dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Recent Assignments</h4>
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                      <ul className="divide-y divide-gray-200">
                        {classDetails.assignments.slice(0, 3).map((assignment) => (
                          <li key={assignment.id} className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-blue-600 truncate">
                                {assignment.title}
                              </p>
                              <div className="ml-2 flex-shrink-0 flex">
                                <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  Due: {new Date(assignment.due_date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </li>
                        ))}
                        {classDetails.assignments.length === 0 && (
                          <li className="px-4 py-4 sm:px-6 text-sm text-gray-500">
                            No assignments found for this class.
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Students</h4>
                  <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Email
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Assignments Completed
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Average Score
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {classDetails.students.map((student) => (
                            <tr key={student.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {student.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {student.email}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {student.assignmentsCompleted} / {classDetails.assignmentCount}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex items-center">
                                  <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                    <div 
                                      className="h-2.5 rounded-full" 
                                      style={{
                                        width: `${student.averageScore}%`,
                                        backgroundColor: student.averageScore >= 80 ? '#10B981' : 
                                                      student.averageScore >= 60 ? '#F59E0B' : '#EF4444'
                                      }}
                                    ></div>
                                  </div>
                                  <span>{student.averageScore}%</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6">
                <button
                  type="button"
                  className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                  onClick={() => setClassDetails(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {!selectedClass ? (
          <>
            {/* Summary Cards */}
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Students
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">
                            {stats.totalStudents.toLocaleString()}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Teachers
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">
                            {stats.totalTeachers.toLocaleString()}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Classes
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">
                            {stats.totalClasses.toLocaleString()}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          School Average
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">
                            {stats.averageScore.toFixed(1)}%
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Performance Trends */}
            <div className="mt-8">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Trend (Last 6 Months)</h3>
                <div className="h-64 flex items-end space-x-2">
                  {stats.performanceTrend.map((month, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div 
                        className="w-full bg-blue-100 rounded-t-sm"
                        style={{ height: `${month.averageScore}%` }}
                      />
                      <div className="text-xs text-gray-500 mt-1">{month.month}</div>
                      <div className="text-xs font-medium">{month.averageScore}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Class Performance */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Class Performance</h3>
              </div>
              
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Class
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Teacher
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Students
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Average Score
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.classAverages.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                          No classes found.
                        </td>
                      </tr>
                    ) : (
                      stats.classAverages.map((cls) => (
                        <tr key={cls.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{cls.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{cls.teacher}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{cls.studentCount.toLocaleString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                                <div 
                                  className="bg-blue-600 h-2.5 rounded-full" 
                                  style={{ width: `${cls.averageScore}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">{cls.averageScore.toFixed(1)}%</span>
                                  {student.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {student.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {student.assignmentsCompleted} / {classes.find(c => c.id === selectedClass)?.assignmentsCount || 0}
                            </div>
                            <div className="mt-1 w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-blue-600 h-2.5 rounded-full" 
                                style={{
                                  width: `${(student.assignmentsCompleted / (classes.find(c => c.id === selectedClass)?.assignmentsCount || 1)) * 100}%`
                                }}
                              ></div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              student.averageScore >= 80 ? 'bg-green-100 text-green-800' :
                              student.averageScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {student.averageScore}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900">View Details</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Remove the duplicate HeadTeacherDashboard function and keep only one implementation
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900">Head Teacher Dashboard</h2>
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Add head-teacher-specific widgets here */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">School Overview</h3>
            <p className="mt-2 text-sm text-gray-500">View school-wide statistics and reports.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
