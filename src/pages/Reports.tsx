import React, { useState, useMemo } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Select, 
  DatePicker, 
  Row, 
  Col, 
  Statistic, 
  Typography, 
  Space,
  message
} from 'antd';
import { 
  Download, 
  Filter, 
  Users, 
  Award, 
  BarChart,
} from 'lucide-react';
import dayjs from 'dayjs';
import { useStore } from '../store/useStore';
import { ModuleType } from '../types';

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface ReportDataItem {
  id: string;
  studentId: string;
  name: string;
  grade: string;
  major: string;
  className: string;
  '德润农心': number;
  '智启农创': number;
  '体健农强': number;
  '美聚农韵': number;
  '劳铸农魂': number;
  total: number;
}

const Reports: React.FC = () => {
  const { students, scoreRecords } = useStore();
  
  const [filterGrade, setFilterGrade] = useState<string | null>(null);
  const [filterMajor, setFilterMajor] = useState<string | null>(null);
  const [filterClass, setFilterClass] = useState<string | null>(null);
  const [filterModule, setFilterModule] = useState<ModuleType | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  const grades = useMemo(() => Array.from(new Set(students.map(s => s.grade))), [students]);
  const majors = useMemo(() => Array.from(new Set(students.map(s => s.major))), [students]);
  const classes = useMemo(() => Array.from(new Set(students.map(s => s.className))), [students]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesGrade = filterGrade ? s.grade === filterGrade : true;
      const matchesMajor = filterMajor ? s.major === filterMajor : true;
      const matchesClass = filterClass ? s.className === filterClass : true;
      return matchesGrade && matchesMajor && matchesClass;
    });
  }, [students, filterGrade, filterMajor, filterClass]);

  const reportData = useMemo<ReportDataItem[]>(() => {
    return filteredStudents.map(student => {
      const studentRecords = scoreRecords.filter(r => {
        const matchesStudent = r.studentId === student.studentId;
        const matchesModule = filterModule ? r.module === filterModule : true;
        const matchesDate = dateRange ? 
          (dayjs(r.date).isAfter(dateRange[0].subtract(1, 'day')) && 
           dayjs(r.date).isBefore(dateRange[1].add(1, 'day'))) : true;
        return matchesStudent && matchesModule && matchesDate;
      });

      const moduleScores: Record<string, number> = {
        '德润农心': 0,
        '智启农创': 0,
        '体健农强': 0,
        '美聚农韵': 0,
        '劳铸农魂': 0
      };

      studentRecords.forEach(r => {
        if (moduleScores[r.module] !== undefined) {
          moduleScores[r.module] += r.score;
        }
      });

      const total = studentRecords.reduce((acc, curr) => acc + curr.score, 0);

      return {
        ...student,
        '德润农心': moduleScores['德润农心'],
        '智启农创': moduleScores['智启农创'],
        '体健农强': moduleScores['体健农强'],
        '美聚农韵': moduleScores['美聚农韵'],
        '劳铸农魂': moduleScores['劳铸农魂'],
        total
      };
    });
  }, [filteredStudents, scoreRecords, filterModule, dateRange]);

  const stats = useMemo(() => {
    const totalPeople = reportData.length;
    const totalScore = reportData.reduce((acc, curr) => acc + curr.total, 0);
    const avgScore = totalPeople > 0 ? (totalScore / totalPeople).toFixed(2) : 0;
    return { totalPeople, totalScore, avgScore };
  }, [reportData]);

  const columns = [
    { title: '学号', dataIndex: 'studentId', key: 'studentId', width: 120, fixed: 'left' as const },
    { title: '姓名', dataIndex: 'name', key: 'name', width: 100, fixed: 'left' as const },
    { title: '年级', dataIndex: 'grade', key: 'grade', width: 80 },
    { title: '专业', dataIndex: 'major', key: 'major', width: 150 },
    { title: '班级', dataIndex: 'className', key: 'className', width: 120 },
    { title: '德润农心', dataIndex: '德润农心', key: '德润农心', width: 100, align: 'right' as const },
    { title: '智启农创', dataIndex: '智启农创', key: '智启农创', width: 100, align: 'right' as const },
    { title: '体健农强', dataIndex: '体健农强', key: '体健农强', width: 100, align: 'right' as const },
    { title: '美聚农韵', dataIndex: '美聚农韵', key: '美聚农韵', width: 100, align: 'right' as const },
    { title: '劳铸农魂', dataIndex: '劳铸农魂', key: '劳铸农魂', width: 100, align: 'right' as const },
    { 
      title: '总积分', 
      dataIndex: 'total', 
      key: 'total', 
      width: 100, 
      align: 'right' as const,
      render: (val: number) => <Text strong style={{ color: '#1677ff' }}>{val}</Text>
    },
  ];

  const handleExport = () => {
    const headers = ['学号', '姓名', '年级', '专业', '班级', '德润农心', '智启农创', '体健农强', '美聚农韵', '劳铸农魂', '总积分'];
    const rows = reportData.map(d => [
      d.studentId,
      d.name,
      d.grade,
      d.major,
      d.className,
      d['德润农心'],
      d['智启农创'],
      d['体健农强'],
      d['美聚农韵'],
      d['劳铸农魂'],
      d.total
    ]);

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; 
    csvContent += headers.join(",") + "\r\n";
    rows.forEach(row => {
      csvContent += row.join(",") + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `第二课堂成绩单报表_${dayjs().format('YYYYMMDD')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    message.success('报表已生成并导出');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Card bordered={false}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={18} />
            <Text strong>报表筛选</Text>
          </div>
          
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={8} lg={4}>
              <Select
                placeholder="年级"
                style={{ width: '100%' }}
                allowClear
                onChange={setFilterGrade}
                options={grades.map(g => ({ label: g, value: g }))}
              />
            </Col>
            <Col xs={12} sm={8} lg={4}>
              <Select
                placeholder="专业"
                style={{ width: '100%' }}
                allowClear
                onChange={setFilterMajor}
                options={majors.map(m => ({ label: m, value: m }))}
              />
            </Col>
            <Col xs={12} sm={8} lg={4}>
              <Select
                placeholder="班级"
                style={{ width: '100%' }}
                allowClear
                onChange={setFilterClass}
                options={classes.map(c => ({ label: c, value: c }))}
              />
            </Col>
            <Col xs={12} sm={8} lg={4}>
              <Select
                placeholder="积分模块"
                style={{ width: '100%' }}
                allowClear
                onChange={setFilterModule}
                options={[
                  { label: '德润农心', value: '德润农心' },
                  { label: '智启农创', value: '智启农创' },
                  { label: '体健农强', value: '体健农强' },
                  { label: '美聚农韵', value: '美聚农韵' },
                  { label: '劳铸农魂', value: '劳铸农魂' },
                ]}
              />
            </Col>
            <Col xs={24} sm={16} lg={8}>
              <RangePicker 
                style={{ width: '100%' }} 
                onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
              />
            </Col>
          </Row>
        </Space>
      </Card>

      <Row gutter={16}>
        <Col span={8}>
          <Card bordered={false}>
            <Statistic title="符合条件总人数" value={stats.totalPeople} prefix={<Users size={18} style={{ marginRight: 8 }} />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false}>
            <Statistic title="所选范围总积分" value={stats.totalScore} prefix={<Award size={18} style={{ marginRight: 8 }} />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false}>
            <Statistic title="人均积分" value={stats.avgScore} prefix={<BarChart size={18} style={{ marginRight: 8 }} />} />
          </Card>
        </Col>
      </Row>

      <Card 
        title="统计结果表格" 
        bordered={false} 
        extra={
          <Button 
            type="primary" 
            icon={<Download size={16} />} 
            onClick={handleExport}
            disabled={reportData.length === 0}
          >
            导出为 CSV
          </Button>
        }
      >
        <Table 
          columns={columns} 
          dataSource={reportData} 
          rowKey="id" 
          scroll={{ x: 1200 }}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default Reports;
