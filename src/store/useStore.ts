import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Student, Activity, ScoreRecord, ModuleType } from '../types';

interface State {
  students: Student[];
  activities: Activity[];
  scoreRecords: ScoreRecord[];
  
  // Actions
  addStudent: (student: Omit<Student, 'id'>) => void;
  batchAddStudents: (students: Omit<Student, 'id'>[]) => void;
  updateStudent: (id: string, data: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  
  addActivity: (activity: Omit<Activity, 'id' | 'participantIds'>) => void;
  updateActivity: (id: string, data: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;
  
  updateParticipants: (activityId: string, studentIds: string[]) => void;
}

// Initial Data
const initialStudents: Student[] = [
  { id: '1', studentId: '2023001', name: '张三', grade: '2023', major: '计算机科学', className: '计算机1班' },
  { id: '2', studentId: '2023002', name: '李四', grade: '2023', major: '计算机科学', className: '计算机1班' },
  { id: '3', studentId: '2023003', name: '王五', grade: '2023', major: '电子信息', className: '电子1班' },
  { id: '4', studentId: '2022001', name: '赵六', grade: '2022', major: '软件工程', className: '软件2班' },
  { id: '5', studentId: '2022002', name: '钱七', grade: '2022', major: '软件工程', className: '软件2班' },
  { id: '6', studentId: '2023004', name: '孙八', grade: '2023', major: '人工智能', className: 'AI1班' },
  { id: '7', studentId: '2023005', name: '周九', grade: '2023', major: '人工智能', className: 'AI1班' },
  { id: '8', studentId: '2022003', name: '吴十', grade: '2022', major: '网络安全', className: '网安1班' },
  { id: '9', studentId: '2024001', name: '陈十一', grade: '2024', major: '数据科学', className: '数科1班' },
  { id: '10', studentId: '2024002', name: '林十二', grade: '2024', major: '数据科学', className: '数科1班' },
];

const initialActivities: Activity[] = [
  { id: 'a1', title: '志愿者服务', description: '校园环境美化志愿者', module: '德润农心', score: 2, date: '2024-03-15', participantIds: ['1', '2', '3'] },
  { id: 'a2', title: '大学生创新大赛', description: '校级初赛', module: '智启农创', score: 5, date: '2024-04-10', participantIds: ['1', '4', '6'] },
  { id: 'a3', title: '校运会100米', description: '男子组决赛', module: '体健农强', score: 3, date: '2024-05-20', participantIds: ['2', '5', '8'] },
  { id: 'a4', title: '合唱比赛', description: '建团周年合唱', module: '美聚农韵', score: 2, date: '2024-06-01', participantIds: ['3', '7', '9'] },
  { id: 'a5', title: '农场实践', description: '校外教学实践基地劳动', module: '劳铸农魂', score: 4, date: '2024-06-15', participantIds: ['1', '5', '10'] },
];

const generateInitialRecords = (students: Student[], activities: Activity[]): ScoreRecord[] => {
  const records: ScoreRecord[] = [];
  activities.forEach(activity => {
    activity.participantIds.forEach(sid => {
      const student = students.find(s => s.id === sid);
      if (student) {
        records.push({
          id: `${activity.id}-${student.id}`,
          studentId: student.studentId,
          studentName: student.name,
          activityId: activity.id,
          activityTitle: activity.title,
          module: activity.module,
          score: activity.score,
          date: activity.date,
        });
      }
    });
  });
  return records;
};

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      students: initialStudents,
      activities: initialActivities,
      scoreRecords: generateInitialRecords(initialStudents, initialActivities),
      
      addStudent: (data) => set((state) => ({
        students: [...state.students, { ...data, id: Math.random().toString(36).substr(2, 9) }]
      })),
      
      batchAddStudents: (newStudents) => set((state) => ({
        students: [...state.students, ...newStudents.map(s => ({ ...s, id: Math.random().toString(36).substr(2, 9) }))]
      })),
      
      updateStudent: (id, data) => set((state) => ({
        students: state.students.map(s => s.id === id ? { ...s, ...data } : s)
      })),
      
      deleteStudent: (id) => set((state) => ({
        students: state.students.filter(s => s.id !== id),
        activities: state.activities.map(a => ({
          ...a,
          participantIds: a.participantIds.filter(pid => pid !== id)
        })),
        scoreRecords: state.scoreRecords.filter(r => {
          const student = state.students.find(s => s.id === id);
          return student ? r.studentId !== student.studentId : true;
        })
      })),
      
      addActivity: (data) => set((state) => ({
        activities: [...state.activities, { ...data, score: Number(data.score) || 0, id: Math.random().toString(36).substr(2, 9), participantIds: [] }]
      })),

      updateActivity: (id, data) => set((state) => {
        const normalizedData = data.score !== undefined ? { ...data, score: Number(data.score) || 0 } : data;
        const updatedActivities = state.activities.map(a => a.id === id ? { ...a, ...normalizedData } : a);
        // If score or title or module or date changed, update records
        const newRecords = state.scoreRecords.map(r => {
          if (r.activityId === id) {
            const activity = updatedActivities.find(a => a.id === id)!;
            return {
              ...r,
              activityTitle: activity.title,
              module: activity.module,
              score: activity.score,
              date: activity.date,
            };
          }
          return r;
        });
        return { activities: updatedActivities, scoreRecords: newRecords };
      }),
      
      deleteActivity: (id) => set((state) => ({
        activities: state.activities.filter(a => a.id !== id),
        scoreRecords: state.scoreRecords.filter(r => r.activityId !== id)
      })),
      
      updateParticipants: (activityId, studentIds) => set((state) => {
        const activity = state.activities.find(a => a.id === activityId);
        if (!activity) return state;
        
        const updatedActivities = state.activities.map(a => 
          a.id === activityId ? { ...a, participantIds: studentIds } : a
        );
        
        // Remove old records for this activity and add new ones
        const otherRecords = state.scoreRecords.filter(r => r.activityId !== activityId);
        const newRecords = studentIds.map(sid => {
          const student = state.students.find(s => s.id === sid);
          if (!student) return null;
          return {
            id: `${activityId}-${sid}`,
            studentId: student.studentId,
            studentName: student.name,
            activityId: activity.id,
            activityTitle: activity.title,
            module: activity.module,
            score: activity.score,
            date: activity.date,
          } as ScoreRecord;
        }).filter(Boolean) as ScoreRecord[];
        
        return {
          activities: updatedActivities,
          scoreRecords: [...otherRecords, ...newRecords]
        };
      })
    }),
    {
      name: 'second-classroom-storage',
      // Heal data persisted by earlier versions that stored scores as strings,
      // which caused string concatenation ("5"+"3"="53") instead of addition.
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.activities = state.activities.map(a => ({ ...a, score: Number(a.score) || 0 }));
        state.scoreRecords = state.scoreRecords.map(r => ({ ...r, score: Number(r.score) || 0 }));
      },
    }
  )
);
