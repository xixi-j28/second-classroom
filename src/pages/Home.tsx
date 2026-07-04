import React from 'react';
import { Row, Col, Card, Statistic, Table, Typography, List, Tag } from 'antd';
import { 
  Users, 
  CalendarCheck, 
  Award, 
  TrendingUp, 
  Clock,
  Heart,
  Lightbulb,
  Dumbbell,
  Palette,
  Hammer
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { MODULE_COLORS, ModuleTag } from '../components/ModuleTag';
import { ModuleType } from '../types';

const { Title, Text } = Typography;

const Home: React.FC = () => {
  const { students, activities, scoreRecords } = useStore();

  const modules: ModuleType[] = ['德润农心', '智启农创', '体健农强', '美聚农韵', '劳铸农魂'];
  
  const moduleStats = modules.map(m => {
    const records = scoreRecords.filter(r => r.module === m);
    return {
      name: m,
      totalScore: records.reduce((acc, curr) => acc + curr.score, 0),
      count: records.length,
      color: MODULE_COLORS[m]
    };
  });

  const recentActivities = [...activities]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const moduleIcons: Record<ModuleType, React.ReactNode> = {
    '德润农心': <Heart size={20} />,
    '智启农创': <Lightbulb size={20} />,
    '体健农强': <Dumbbell size={20} />,
    '美聚农韵': <Palette size={20} />,
    '劳铸农魂': <Hammer size={20} />,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Module Stats Cards */}
      <Row gutter={[16, 16]}>
        {moduleStats.map(stat => (
          <Col key={stat.name} xs={24} sm={12} lg={4} xl={4} xxl={4} style={{ flex: '1 0 20%' }}>
            <Card bordered={false} style={{ height: '100%', borderTop: `4px solid ${stat.color}` }}>
              <Statistic 
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: stat.color }}>{moduleIcons[stat.name as ModuleType]}</span>
                    <span>{stat.name}</span>
                  </div>
                }
                value={stat.totalScore}
                suffix="分"
                valueStyle={{ color: stat.color, fontWeight: 'bold' }}
              />
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#8c8c8c' }}>
                参与人次: {stat.count}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Main Stats and Recent Activity */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card title="总览统计" bordered={false}>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic 
                  title="总学生数" 
                  value={students.length} 
                  prefix={<Users size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />} 
                />
              </Col>
              <Col span={8}>
                <Statistic 
                  title="总活动数" 
                  value={activities.length} 
                  prefix={<CalendarCheck size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />} 
                />
              </Col>
              <Col span={8}>
                <Statistic 
                  title="总积分发放" 
                  value={scoreRecords.reduce((acc, curr) => acc + curr.score, 0)} 
                  prefix={<Award size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />} 
                />
              </Col>
            </Row>
            
            <div style={{ marginTop: '32px' }}>
              <Title level={5}>模块得分分布</Title>
              <div style={{ display: 'flex', height: '40px', borderRadius: '8px', overflow: 'hidden', marginTop: '16px' }}>
                {moduleStats.map(stat => {
                  const total = moduleStats.reduce((a, b) => a + b.totalScore, 0);
                  const width = total > 0 ? (stat.totalScore / total) * 100 : 0;
                  return width > 0 ? (
                    <div 
                      key={stat.name}
                      style={{ 
                        width: `${width}%`, 
                        backgroundColor: stat.color, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '12px'
                      }}
                      title={`${stat.name}: ${stat.totalScore}分`}
                    >
                      {width > 10 ? `${stat.totalScore}分` : ''}
                    </div>
                  ) : null;
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', flexWrap: 'wrap', gap: '8px' }}>
                {moduleStats.map(stat => (
                  <div key={stat.name} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: stat.color }} />
                    <span style={{ fontSize: '12px' }}>{stat.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card title="最近活动" bordered={false} extra={<Clock size={16} />}>
            <List
              itemLayout="horizontal"
              dataSource={recentActivities}
              renderItem={(activity) => (
                <List.Item>
                  <List.Item.Meta
                    title={activity.title}
                    description={
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <ModuleTag module={activity.module} />
                          <Text type="secondary" style={{ fontSize: '12px' }}>{activity.date}</Text>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home;
