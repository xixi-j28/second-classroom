import React, { useState, useMemo } from 'react';
import { 
  Card, 
  Input, 
  Row, 
  Col, 
  Typography, 
  Empty, 
  Table, 
  Statistic, 
  Divider, 
  Progress,
  Space,
  Select
} from 'antd';
import { 
  Search, 
  User, 
  PieChart
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { Student, ModuleType } from '../types';
import { ModuleTag, MODULE_COLORS } from '../components/ModuleTag';

const { Title, Text } = Typography;

const Transcript: React.FC = () => {
  const { students, scoreRecords } = useStore();
  const [searchText, setSearchText] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [filterModule, setFilterModule] = useState<string>('全部');

  const handleSearch = (value: string) => {
    const student = students.find(s => s.studentId === value || s.name === value);
    if (student) {
      setSelectedStudent(student);
      setSearchText('');
    } else {
      setSelectedStudent(null);
    }
  };

  const studentRecords = useMemo(() => {
    if (!selectedStudent) return [];
    return scoreRecords
      .filter(r => r.studentId === selectedStudent.studentId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedStudent, scoreRecords]);

  const filteredRecords = useMemo(() => {
    if (filterModule === '全部') return studentRecords;
    return studentRecords.filter(r => r.module === filterModule);
  }, [studentRecords, filterModule]);

  const moduleStats = useMemo(() => {
    const modules: ModuleType[] = ['德润农心', '智启农创', '体健农强', '美聚农韵', '劳铸农魂'];
    return modules.map(m => {
      const score = studentRecords
        .filter(r => r.module === m)
        .reduce((acc, curr) => acc + curr.score, 0);
      return { name: m, score };
    });
  }, [studentRecords]);

  const totalScore = studentRecords.reduce((acc, curr) => acc + curr.score, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Card bordered={false}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <Title level={4} style={{ textAlign: 'center', marginBottom: '24px' }}>成绩单查询</Title>
          <Input.Search
            placeholder="输入学生姓名或学号"
            enterButton="查询"
            size="large"
            onSearch={handleSearch}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            prefix={<Search size={18} color="#bfbfbf" />}
          />
        </div>
      </Card>

      {selectedStudent ? (
        <>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <Card bordered={false} style={{ height: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{ 
                    width: '80px', 
                    height: '80px', 
                    borderRadius: '50%', 
                    backgroundColor: '#e6f4ff', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}>
                    <User size={40} color="#1677ff" />
                  </div>
                  <Title level={3} style={{ margin: 0 }}>{selectedStudent.name}</Title>
                  <Text type="secondary">{selectedStudent.studentId}</Text>
                </div>
                
                <Divider />
                
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">年级</Text>
                    <Text strong>{selectedStudent.grade}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">专业</Text>
                    <Text strong>{selectedStudent.major}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">班级</Text>
                    <Text strong>{selectedStudent.className}</Text>
                  </div>
                </Space>
                
                <div style={{ marginTop: '32px', textAlign: 'center', padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                  <Statistic 
                    title="累计积分" 
                    value={totalScore} 
                    suffix="分" 
                    valueStyle={{ color: '#1677ff', fontSize: '32px', fontWeight: 'bold' }} 
                  />
                </div>
              </Card>
            </Col>

            <Col xs={24} md={16}>
              <Card 
                title={
                  <Space>
                    <PieChart size={18} />
                    <span>五育模块概览</span>
                  </Space>
                } 
                bordered={false}
              >
                <Row gutter={[16, 24]}>
                  {moduleStats.map(stat => (
                    <Col span={4} key={stat.name} style={{ textAlign: 'center', flex: '1' }}>
                      <Progress 
                        type="circle" 
                        percent={Math.min((stat.score / 20) * 100, 100)} 
                        format={() => `${stat.score}`}
                        strokeColor={MODULE_COLORS[stat.name as ModuleType]}
                        size={80}
                      />
                      <div style={{ marginTop: '12px', fontSize: '13px' }}>{stat.name}</div>
                    </Col>
                  ))}
                </Row>
              </Card>

              <Card 
                title="积分明细" 
                bordered={false} 
                style={{ marginTop: '24px' }}
                extra={
                  <Select 
                    defaultValue="全部" 
                    style={{ width: 120 }} 
                    onChange={setFilterModule}
                    options={[
                      { label: '全部模块', value: '全部' },
                      { label: '德润农心', value: '德润农心' },
                      { label: '智启农创', value: '智启农创' },
                      { label: '体健农强', value: '体健农强' },
                      { label: '美聚农韵', value: '美聚农韵' },
                      { label: '劳铸农魂', value: '劳铸农魂' },
                    ]}
                  />
                }
              >
                <Table 
                  dataSource={filteredRecords} 
                  rowKey="id" 
                  pagination={{ pageSize: 5 }}
                  columns={[
                    { 
                      title: '日期', 
                      dataIndex: 'date', 
                      key: 'date',
                      width: '120px'
                    },
                    { 
                      title: '活动名称', 
                      dataIndex: 'activityTitle', 
                      key: 'activityTitle' 
                    },
                    { 
                      title: '所属模块', 
                      dataIndex: 'module', 
                      key: 'module',
                      render: (m: ModuleType) => <ModuleTag module={m} />
                    },
                    { 
                      title: '分数', 
                      dataIndex: 'score', 
                      key: 'score',
                      render: (s: number) => <Text strong style={{ color: '#52c41a' }}>+{s}</Text>
                    }
                  ]}
                />
              </Card>
            </Col>
          </Row>
        </>
      ) : (
        <Card bordered={false}>
          <Empty description="请输入学生姓名或学号进行查询" />
        </Card>
      )}
    </div>
  );
};

export default Transcript;
