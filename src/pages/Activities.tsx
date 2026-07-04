import React, { useState, useMemo } from 'react';
import { 
  Card, 
  Button, 
  Input, 
  Select,
  Space,
  Table,
  Modal,
  Form,
  InputNumber,
  DatePicker,
  message, 
  Typography,
  Row,
  Col,
  Tag,
  Checkbox,
  Divider,
  Popconfirm
} from 'antd';
import { 
  Plus, 
  Search, 
  Users as UsersIcon, 
  Edit, 
  Trash2,
  Calendar
} from 'lucide-react';
import dayjs from 'dayjs';
import { useStore } from '../store/useStore';
import { Activity, ModuleType } from '../types';
import { ModuleTag } from '../components/ModuleTag';

const { Title, Text, Paragraph } = Typography;

const Activities: React.FC = () => {
  const { activities, students, addActivity, updateActivity, deleteActivity, updateParticipants } = useStore();
  const [filterModule, setFilterModule] = useState<ModuleType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [currentActivityId, setCurrentActivityId] = useState<string | null>(null);
  
  const [form] = Form.useForm();
  
  // Participant Management State
  const [pSearchText, setPSearchText] = useState('');
  const [pFilterClass, setPFilterClass] = useState<string | null>(null);
  const [selectedPIds, setSelectedPIds] = useState<string[]>([]);

  const filteredActivities = useMemo(() => {
    return activities.filter(a => filterModule ? a.module === filterModule : true);
  }, [activities, filterModule]);

  const classes = useMemo(() => Array.from(new Set(students.map(s => s.className))), [students]);

  const columns = [
    { title: '活动标题', dataIndex: 'title', key: 'title', width: '25%' },
    { 
      title: '模块', 
      dataIndex: 'module', 
      key: 'module',
      render: (m: ModuleType) => <ModuleTag module={m} />
    },
    { title: '积分', dataIndex: 'score', key: 'score' },
    { title: '日期', dataIndex: 'date', key: 'date' },
    { 
      title: '参与人数', 
      key: 'participants',
      render: (_: any, record: Activity) => (
        <Space>
          <Text>{record.participantIds.length} 人</Text>
          <Button 
            size="small" 
            type="link" 
            icon={<UsersIcon size={14} />} 
            onClick={() => handleManageParticipants(record)}
          >
            管理
          </Button>
        </Space>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Activity) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<Edit size={16} />} 
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="确定删除此活动吗？这也会删除相关积分记录。"
            onConfirm={() => deleteActivity(record.id)}
            okText="是"
            cancelText="否"
          >
            <Button type="text" danger icon={<Trash2 size={16} />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
    form.setFieldsValue({
      ...activity,
      date: dayjs(activity.date)
    });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingActivity(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      const data = {
        ...values,
        score: Number(values.score),
        date: values.date.format('YYYY-MM-DD')
      };
      if (editingActivity) {
        updateActivity(editingActivity.id, data);
        message.success('活动已更新');
      } else {
        addActivity(data);
        message.success('活动已发布');
      }
      setIsModalOpen(false);
    });
  };

  const handleManageParticipants = (activity: Activity) => {
    setCurrentActivityId(activity.id);
    setSelectedPIds(activity.participantIds);
    setIsParticipantModalOpen(true);
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(pSearchText.toLowerCase()) || 
                           s.studentId.includes(pSearchText);
      const matchesClass = pFilterClass ? s.className === pFilterClass : true;
      return matchesSearch && matchesClass;
    });
  }, [students, pSearchText, pFilterClass]);

  const handleToggleStudent = (id: string) => {
    setSelectedPIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBatchSelectClass = (className: string, checked: boolean) => {
    const classStudentIds = students.filter(s => s.className === className).map(s => s.id);
    if (checked) {
      setSelectedPIds(prev => Array.from(new Set([...prev, ...classStudentIds])));
    } else {
      setSelectedPIds(prev => prev.filter(id => !classStudentIds.includes(id)));
    }
  };

  const handleSaveParticipants = () => {
    if (currentActivityId) {
      updateParticipants(currentActivityId, selectedPIds);
      message.success('参与人员已更新，积分已同步');
      setIsParticipantModalOpen(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Card bordered={false}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={12}>
            <Space>
              <Select
                style={{ width: 160 }}
                placeholder="按模块筛选"
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
            </Space>
          </Col>
          <Col xs={24} md={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              type="primary" 
              icon={<Plus size={16} />} 
              onClick={handleAdd}
            >
              发布新活动
            </Button>
          </Col>
        </Row>
      </Card>

      <Card bordered={false}>
        <Table 
          columns={columns} 
          dataSource={filteredActivities} 
          rowKey="id" 
          pagination={{ pageSize: 8 }}
        />
      </Card>

      {/* Activity Add/Edit Modal */}
      <Modal
        title={editingActivity ? "编辑活动" : "发布活动"}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        okText="确认"
        cancelText="取消"
        width={500}
      >
        <Form form={form} layout="vertical" style={{ marginTop: '20px' }}>
          <Form.Item name="title" label="活动标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="输入活动名称" />
          </Form.Item>
          <Form.Item name="module" label="所属模块" rules={[{ required: true, message: '请选择模块' }]}>
            <Select placeholder="选择五个模块之一">
              <Select.Option value="德润农心">德润农心</Select.Option>
              <Select.Option value="智启农创">智启农创</Select.Option>
              <Select.Option value="体健农强">体健农强</Select.Option>
              <Select.Option value="美聚农韵">美聚农韵</Select.Option>
              <Select.Option value="劳铸农魂">劳铸农魂</Select.Option>
            </Select>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="score" label="积分分值" rules={[{ required: true, message: '请输入分数' }]}>
                <InputNumber min={0} style={{ width: '100%' }} placeholder="分数" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="date" label="活动日期" rules={[{ required: true, message: '请选择日期' }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="活动描述">
            <TextArea rows={4} placeholder="描述活动内容..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Participant Management Modal */}
      <Modal
        title="管理参与学生"
        open={isParticipantModalOpen}
        onOk={handleSaveParticipants}
        onCancel={() => setIsParticipantModalOpen(false)}
        width={800}
        okText="保存更改"
        cancelText="取消"
      >
        <div style={{ marginBottom: '16px' }}>
          <Row gutter={16}>
            <Col span={12}>
              <Input
                placeholder="搜索学号或姓名"
                prefix={<Search size={14} />}
                value={pSearchText}
                onChange={e => setPSearchText(e.target.value)}
              />
            </Col>
            <Col span={12}>
              <Select
                placeholder="按班级筛选"
                style={{ width: '100%' }}
                allowClear
                onChange={setPFilterClass}
                options={classes.map(c => ({ label: c, value: c }))}
              />
            </Col>
          </Row>
        </div>

        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text strong>已选人数: <span style={{ color: '#1677ff' }}>{selectedPIds.length}</span></Text>
          <Space>
             <Text type="secondary">按班级全选/反选:</Text>
             <Select
               placeholder="选择班级"
               size="small"
               style={{ width: 140 }}
               onChange={(val) => {
                 if (val) handleBatchSelectClass(val, true);
               }}
               options={classes.map(c => ({ label: c, value: c }))}
             />
             <Button size="small" onClick={() => setSelectedPIds([])}>清除全部</Button>
          </Space>
        </div>

        <Divider style={{ margin: '12px 0' }} />

        <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '8px' }}>
          <Row gutter={[8, 8]}>
            {filteredStudents.map(student => (
              <Col span={8} key={student.id}>
                <Card 
                  size="small" 
                  hoverable 
                  style={{ 
                    cursor: 'pointer', 
                    border: selectedPIds.includes(student.id) ? '1px solid #1677ff' : '1px solid #f0f0f0',
                    backgroundColor: selectedPIds.includes(student.id) ? '#e6f4ff' : '#fff'
                  }}
                  onClick={() => handleToggleStudent(student.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Checkbox checked={selectedPIds.includes(student.id)} />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 500 }}>{student.name}</div>
                      <div style={{ fontSize: '11px', color: '#8c8c8c' }}>{student.studentId} | {student.className}</div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </Modal>
    </div>
  );
};

const { TextArea } = Input;

export default Activities;
