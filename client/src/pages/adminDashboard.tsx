import { useState, useEffect } from "react";
import { Row, Col, Card, Table, Badge, Modal, Form, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUsers, faDumbbell, faCalendarAlt, faChartBar, 
  faUserShield, faPlus, faEdit, faTrash, faEllipsisV,
  faSave, faTimes
} from "@fortawesome/free-solid-svg-icons";
import "../css/dashboard.css";
import "../css/admin.css";

type User = {
  id: number;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  avatar?: string;
  status?: string; 
  subscriptionPlan?: string;
};

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", role: "", subscriptionPlan: "" });

  const stats = [
    { label: "Total Users", value: users.length.toString(), icon: faUsers, color:"var(--accent-cyan)" },
    { label: "Active Plans", value: "856", icon: faDumbbell, color: "#7b61ff" },
    { label: "Classes Today", value: "12", icon: faCalendarAlt, color: "#ff6b6b" },
    { label: "Revenue (MTD)", value: "$4,250", icon: faChartBar, color: "#50e678" },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users", { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users.map((u: any) => ({ ...u, status: "Active" })));
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role, subscriptionPlan: user.subscriptionPlan || "" });
    setShowEditModal(true);
  };

  const handleSave = async () => {
    if (!editingUser) return;
    try {
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...formData as any } : u));
        setShowEditModal(false);
      }
    } catch (err) {
      console.error("Failed to update user", err);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <div className="admin-header d-flex justify-content-between align-items-end">
        <div>
          <div className="dash-card-title mb-1">
            <span className="title-icon"><FontAwesomeIcon icon={faUserShield} /></span>
            Administration
          </div>
          <h2 className="admin-title mb-0">System Control</h2>
        </div>
        <button className="btn btn-outline-cyan px-4 py-2" style={{ borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600 }}>
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Add Resource
        </button>
      </div>

      <Row className="g-4 mb-4">
        {stats.map((stat, idx) => (
          <Col key={idx} md={3}>
            <Card className="dash-card h-100">
              <Card.Body className="d-flex align-items-center p-2">
                <div 
                  className="admin-stat-icon" 
                  style={{ 
                    background: `var(--accent-${stat.color.includes('3dffff') ? 'cyan' : stat.color.includes('7b61ff') ? 'purple' : stat.color.includes('ff6b6b') ? 'danger' : 'success'}-dim)`, 
                    color: `var(--accent-${stat.color.includes('3dffff') ? 'cyan' : stat.color.includes('7b61ff') ? 'purple' : stat.color.includes('ff6b6b') ? 'danger' : 'success'})`,
                    border: `1px solid var(--accent-${stat.color.includes('3dffff') ? 'cyan' : stat.color.includes('7b61ff') ? 'purple' : stat.color.includes('ff6b6b') ? 'danger' : 'success'}-border)`
                  }}
                >
                  <FontAwesomeIcon icon={stat.icon} />
                </div>
                <div>
                  <div className="stat-label">{stat.label}</div>
                  <div className="stat-value" style={{ fontSize: '1.4rem' }}>{stat.value}</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="g-4">
        <Col lg={8}>
          <Card className="dash-card admin-table-card">
            <div className="dash-card-title px-3 pt-3 mb-0 d-flex justify-content-between align-items-center">
              <span>User Management</span>
              <FontAwesomeIcon icon={faEllipsisV} className="text-muted" style={{ cursor: 'pointer' }} />
            </div>
            <Card.Body className="p-0">
              {loading ? (
                <div className="p-5 text-center text-muted">Loading users...</div>
              ) : (
                <Table responsive hover variant={undefined} className="admin-table mb-0">
                  <thead>
                    <tr>
                      <th className="ps-4">User Details</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th className="text-end pe-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="ps-4">
                          <div className="d-flex align-items-center">
                            <div className="admin-avatar-sm me-3">{user.name.charAt(0)}</div>
                            <div>
                              <div className="text-primary fw-600" style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{user.name}</div>
                              <div className="text-muted small">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <Badge bg={undefined} className={`admin-badge ${user.role === 'ADMIN' ? 'admin-badge-purple' : ''}`}>
                            {user.role}
                          </Badge>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="rounded-circle bg-success" style={{ 
                              width: '6px', 
                              height: '6px',
                              backgroundColor: 'var(--success)'
                            }}></div>
                            <span style={{ 
                              fontSize: '0.8rem', 
                              fontWeight: 600,
                              color: 'var(--success)'
                            }}>
                              {user.status}
                            </span>
                          </div>
                        </td>
                        <td className="text-end pe-4">
                          <button 
                            className="admin-action-btn" 
                            title="Edit User"
                            onClick={() => handleEditClick(user)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button className="admin-action-btn btn-delete" title="Delete User">
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card className="dash-card">
            <div className="dash-card-title mb-4">System Performance</div>
            
            {[
              { name: "Server Load", value: 24, color: "var(--accent-cyan)" },
              { name: "Database Connections", value: 62, color: "var(--accent-purple)" },
              { name: "Disk Usage", value: 89, color: "var(--danger)" },
              { name: "API Latency", value: 15, color: "var(--success)" }
            ].map((item, idx) => (
              <div key={idx} className="health-bar-container">
                <div className="health-bar-label">
                  <span className="health-bar-name">{item.name}</span>
                  <span className="health-bar-value" style={{ color: item.color }}>{item.value}%</span>
                </div>
                <div className="health-progress">
                  <div 
                    className="health-progress-fill" 
                    style={{ width: `${item.value}%`, background: item.color }}
                  ></div>
                </div>
              </div>
            ))}

            <div className="mt-4 pt-3 border-top" style={{ borderColor: 'var(--border-color)' }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small">Status</span>
                <Badge bg={undefined} className="admin-badge admin-badge-success">Operational</Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted small">Uptime</span>
                <span className="fw-bold small" style={{ color: 'var(--text-primary)' }}>99.98%</span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Modal 
        show={showEditModal} 
        onHide={() => setShowEditModal(false)}
        centered
        contentClassName="dash-card border-0"
        className="admin-modal"
      >
        <Modal.Header className="bg-transparent border-bottom border-secondary px-4 py-3">
          <Modal.Title className="text-white fs-5 fw-bold">
            <FontAwesomeIcon icon={faEdit} className="text-cyan me-2" />
            Edit User Profile
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 py-4">
          <Form>
            <Form.Group className="mb-4">
              <Form.Label className="text-muted small text-uppercase fw-bold">Full Name</Form.Label>
              <Form.Control 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-secondary border-secondary text-white py-2"
                style={{ borderRadius: '10px' }}
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="text-muted small text-uppercase fw-bold">Email Address</Form.Label>
              <Form.Control 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-secondary border-secondary text-white py-2"
                style={{ borderRadius: '10px' }}
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>System Role</Form.Label>
              <Form.Select 
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              >
                <option value="USER">User (Standard)</option>
                <option value="ADMIN">Admin (Elevated)</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Subscription Plan</Form.Label>
              <Form.Select 
                value={formData.subscriptionPlan}
                onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value })}
              >
                <option value="">No Plan</option>
                <option value="BASIC">Basic</option>
                <option value="PREMIUM">Premium</option>
                <option value="VIP">VIP</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="bg-transparent border-top border-secondary px-4 py-3">
          <Button 
            variant="link" 
            className="text-muted text-decoration-none fw-bold me-auto"
            onClick={() => setShowEditModal(false)}
          >
            <FontAwesomeIcon icon={faTimes} className="me-2" />
            Cancel
          </Button>
          <Button 
            variant="cyan" 
            className="px-4 py-2 fw-bold"
            style={{ borderRadius: '10px' }}
            onClick={handleSave}
          >
            <FontAwesomeIcon icon={faSave} className="me-2" />
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
