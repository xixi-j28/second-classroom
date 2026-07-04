
export type ModuleType = '德润农心' | '智启农创' | '体健农强' | '美聚农韵' | '劳铸农魂';

export interface Student {
  id: string;
  studentId: string;
  name: string;
  grade: string;
  major: string;
  className: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  module: ModuleType;
  score: number;
  date: string;
  participantIds: string[];
}

export interface ScoreRecord {
  id: string;
  studentId: string;
  studentName: string;
  activityId: string;
  activityTitle: string;
  module: ModuleType;
  score: number;
  date: string;
}
