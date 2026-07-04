import React, { useState, useMemo } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Space, 
  Modal, 
  Form, 
  Select, 
  message, 
  Card, 
  Typography,
  Upload,
  Divider,
  Row,
  Col,
  Popconfirm
} from 'antd';
import { 
  Search, 
  Plus, 
  Upload as UploadIcon, 
  FileText, 
  UserPlus,
  Trash2,
  Edit
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { Student } from '../types';

const { Title, Text } = Typography;
const { TextArea } = Input;

const Students: React.FC = () => {
  const { students, scoreRecords, addStudent, batchAddStudents, updateStudent, deleteStudent } = useStore();
  const [searchText, setSearchText] = useState('');
  const [filterGrade, setFilterGrade] = useState<string | null>(null);
  const [filterMajor, setFilterMajor] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [form] = Form.useForm();
  const [importText, setImportText] = useState('');

  // Calculate unique options for filters
  const grades = useMemo(() => Array.from(new Set(students.map(s => s.grade))), [students]);
  const majors = useMemo(() => Array.from(new Set(students.map(s => s.major))), [students]);

  const filteredData = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchText.toLowerCase()) || 
                           s.studentId.includes(searchText);
      const matchesGrade = filterGrade ? s.grade === filterGrade : true;
      const matchesMajor = filterMajor ? s.major === filterMajor : true;
      return matchesSearch && matchesGrade && matchesMajor;
    });
  }, [students, searchText, filterGrade, filterMajor]);

  const columns = [
    { title: '学号', dataIndex: 'studentId', key: 'studentId' },
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '年级', dataIndex: 'grade', key: 'grade' },
    { title: '专业', dataIndex: 'major', key: 'major' },
    { title: '班级', dataIndex: 'className', key: 'className' },
    { 
      title: '总积分', 
      key: 'totalScore',
      render: (_: any, record: Student) => {
        const score = scoreRecords
          .filter(r => r.studentId === record.studentId)
          .reduce((acc, curr) => acc + curr.score, 0);
        return <Text strong style={{ color: '#1677ff' }}>{score}</Text>;
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Student) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<Edit size={16} />} 
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="确定要删除这个学生吗？"
            onConfirm={() => deleteStudent(record.id)}
            okText="是"
            cancelText="否"
          >
            <Button type="text" danger icon={<Trash2 size={16} />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    form.setFieldsValue(student);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingStudent(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      if (editingStudent) {
        updateStudent(editingStudent.id, values);
        message.success('学生信息已更新');
      } else {
        addStudent(values);
        message.success('学生已添加');
      }
      setIsModalOpen(false);
    });
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    
    const lines = importText.split('\n');
    const newStudents: Omit<Student, 'id'>[] = [];
    
    lines.forEach(line => {
      const [studentId, name, grade, major, className] = line.split(',').map(s => s.trim());
      if (studentId && name) {
        newStudents.push({ studentId, name, grade, major, className });
      }
    });
    
    if (newStudents.length > 0) {
      batchAddStudents(newStudents);
      message.success(`成功导入 ${newStudents.length} 名学生`);
      setIsImportModalOpen(false);
      setImportText('');
    } else {
      message.error('未发现有效数据，请检查格式：学号,姓名,年级,专业,班级');
    }
  };

  const handleFileUpload = (info: any) => {
    const file = info.file;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setImportText(text);
    };
    reader.readAsText(file);
    return false; // Prevent upload
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Card bordered={false}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Input
              placeholder="搜索学号或姓名"
              prefix={<Search size={16} color="#bfbfbf" />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} md={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="按年级筛选"
              allowClear
              onChange={setFilterGrade}
              options={grades.map(g => ({ label: g, value: g }))}
            />
          </Col>
          <Col xs={12} md={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="按专业筛选"
              allowClear
              onChange={setFilterMajor}
              options={majors.map(m => ({ label: m, value: m }))}
            />
          </Col>
          <Col xs={24} md={8} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Space>
              <Button 
                icon={<UploadIcon size={16} />} 
                onClick={() => setIsImportModalOpen(true)}
              >
                导入
              </Button>
              <Button 
                type="primary" 
                icon={<Plus size={16} />} 
                onClick={handleAdd}
              >
                添加学生
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card bordered={false}>
        <Table 
          columns={columns} 
          dataSource={filteredData} 
          rowKey="id" 
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingStudent ? "编辑学生" : "添加学生"}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: '20px' }}>
          <Form.Item name="studentId" label="学号" rules={[{ required: true, message: '请输入学号' }]}>
            <Input placeholder="例如: 2023001" />
          </Form.Item>
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input placeholder="例如: 张三" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="grade" label="年级" rules={[{ required: true, message: '请输入年级' }]}>
                <Input placeholder="例如: 2023" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="major" label="专业" rules={[{ required: true, message: '请输入专业' }]}>
                <Input placeholder="例如: 计算机科学" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="className" label="班级" rules={[{ required: true, message: '请输入班级' }]}>
            <Input placeholder="例如: 计算机1班" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Import Modal */}
      <Modal
        title="批量导入学生"
        open={isImportModalOpen}
        onOk={handleImport}
        onCancel={() => setIsImportModalOpen(false)}
        okText="开始导入"
        cancelText="取消"
        width={600}
      >
        <div style={{ marginBottom: '16px' }}>
          <Text type="secondary">方式1：粘贴 CSV 格式文本（学号,姓名,年级,专业,班级），每行一个学生。</Text>
          <TextArea 
            rows={8} 
            value={importText} 
            onChange={e => setImportText(e.target.value)}
            placeholder="2023001,张三,2023,计算机,1班&#10;2023002,李四,2023,计算机,1班"
            style={{ marginTop: '8px' }}
          />
        </div>
        <Divider>或</Divider>
        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">方式2：直接上传 CSV 或 TXT 文件</Text>
          <div style={{ marginTop: '12px' }}>
            <Upload 
              beforeUpload={handleFileUpload} 
              showUploadList={false}
              accept=".csv,.txt"
            >
              <Button icon={<UploadIcon size={16} />}>选择文件</Button>
            </Upload>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Students;
