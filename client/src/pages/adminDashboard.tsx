import { useState, useEffect } from "react";
import { Row, Col, Card, Table, Badge, Modal, Form, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers, faDumbbell, faCalendarAlt, faChartBar,
  faUserShield, faPlus, faEdit, faTrash, 
  faSave, faTimes, faCrown, faSearch
} from "@fortawesome/free-solid-svg-icons";
import { Tabs, Tab } from "react-bootstrap";
import "../css/dashboard.css";
import "../css/admin.css";
import { fetchApi } from "../utils/api";

type User = {
  id: number;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  avatar?: string;
  status?: string;
  subscriptionPlan?: string;
  theme?: "light" | "dark";
};

type UserBenefit = {
  benefitId: number;
  benefitText: string;
  planId: string;
  userBenefitId: number | null;
  usedCount: number;
  maxCount: number;
  expiresAt: string | null;
};

type Benefit = {
  id: number;
  planId: string;
  benefitText: string;
  isIncluded: boolean;
};

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    role: "USER" | "ADMIN";
    subscriptionPlan: string;
    theme: "light" | "dark";
  }>({
    name: "",
    email: "",
    role: "USER",
    subscriptionPlan: "",
    theme: "dark"
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [userBenefits, setUserBenefits] = useState<UserBenefit[]>([]);
  const [loadingBenefits, setLoadingBenefits] = useState(false);

  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [activeTab, setActiveTab] = useState("users");
  const [showBenefitModal, setShowBenefitModal] = useState(false);
  const [editingBenefit, setEditingBenefit] = useState<Benefit | null>(null);
  const [benefitFormData, setBenefitFormData] = useState<Omit<Benefit, 'id'>>({
    planId: 'basic',
    benefitText: '',
    isIncluded: true
  });

  const stats = [
    { label: "Total Users", value: users.length.toString(), icon: faUsers, color: "var(--accent-cyan)" },
    { label: "Active Plans", value: "856", icon: faDumbbell, color: "#7b61ff" },
    { label: "Classes Today", value: "12", icon: faCalendarAlt, color: "#ff6b6b" },
    { label: "Revenue (MTD)", value: "$4,250", icon: faChartBar, color: "#50e678" },
  ];

  useEffect(() => {
    fetchUsers();
    fetchBenefits();
  }, []);

  const fetchBenefits = async () => {
    try {
      const res = await fetchApi("/api/benefits");
      const data = await res.json();
      if (data.success) {
        setBenefits(data.benefits);
      }
    } catch (err) {
      console.error("Failed to fetch benefits", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetchApi("/api/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.users.map((u: User) => ({ ...u, status: "Active" })));
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      subscriptionPlan: user.subscriptionPlan || "",
      theme: user.theme || "dark"
    });
    fetchUserBenefits(user.id);
    setShowEditModal(true);
  };

  const fetchUserBenefits = async (userId: number) => {
    setLoadingBenefits(true);
    try {
      const res = await fetchApi(`/api/users/${userId}/benefits`);
      const data = await res.json();
      if (data.success) {
        setUserBenefits(data.benefits);
      }
    } catch (err) {
      console.error("Failed to fetch user benefits", err);
    } finally {
      setLoadingBenefits(false);
    }
  };

  const handleUpdateUserBenefit = async (benefit: UserBenefit) => {
    if (!editingUser) return;
    try {
      const res = await fetchApi(`/api/users/${editingUser.id}/benefits`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(benefit),
      });
      const data = await res.json();
      if (data.success) {
        // Refresh local state if needed or just show success
        console.log("Benefit updated");
      }
    } catch (err) {
      console.error("Failed to update user benefit", err);
    }
  };

  const handleSave = async () => {
    if (!editingUser) return;
    try {
      const res = await fetchApi(`/api/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...formData } : u));
        setShowEditModal(false);
      }
    } catch (err) {
      console.error("Failed to update user", err);
    }
  };

  const handleBenefitEdit = (benefit: Benefit) => {
    setEditingBenefit(benefit);
    setBenefitFormData({
      planId: benefit.planId,
      benefitText: benefit.benefitText,
      isIncluded: benefit.isIncluded
    });
    setShowBenefitModal(true);
  };

  const handleAddBenefit = () => {
    setEditingBenefit(null);
    setBenefitFormData({ planId: 'basic', benefitText: '', isIncluded: true });
    setShowBenefitModal(true);
  };

  const handleSaveBenefit = async () => {
    try {
      const url = editingBenefit ? `/api/benefits/${editingBenefit.id}` : "/api/benefits";
      const method = editingBenefit ? "PUT" : "POST";

      const res = await fetchApi(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(benefitFormData),
      });
      const data = await res.json();

      if (data.success) {
        if (editingBenefit) {
          setBenefits(benefits.map(b => b.id === editingBenefit.id ? { ...b, ...benefitFormData } : b));
        } else {
          setBenefits([...benefits, data.benefit]);
        }
        setShowBenefitModal(false);
      }
    } catch (err) {
      console.error("Failed to save benefit", err);
    }
  };

  const handleDeleteBenefit = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this benefit?")) return;
    try {
      const res = await fetchApi(`/api/benefits/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setBenefits(benefits.filter(b => b.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete benefit", err);
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
        <div className="d-flex gap-3 align-items-center">
          <div className="search-wrapper position-relative">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search users..." 
              className="admin-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
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
            <Card.Body className="p-0">
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k || "users")}
                className="admin-tabs px-3 pt-2"
              >
                <Tab eventKey="users" title={<span><FontAwesomeIcon icon={faUsers} className="me-2" />Users</span>}>
                  <Table responsive hover className="admin-table mb-0">
                    <thead>
                      <tr>
                        <th className="ps-4">User Details</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Theme</th>
                        <th className="text-end pe-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users
                        .filter(u => 
                          u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((user) => (
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
                          <td>
                            <Badge bg={undefined} className={`admin-badge ${user.theme === 'light' ? 'admin-badge-cyan' : 'admin-badge-purple'}`}>
                              {user.theme || 'dark'}
                            </Badge>
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
                </Tab>

                <Tab eventKey="benefits" title={<span><FontAwesomeIcon icon={faCrown} className="me-2" />Plan Benefits</span>}>
                  <div className="px-4 py-3 d-flex justify-content-end border-bottom" style={{ borderColor: 'var(--border-color)' }}>
                    <Button 
                      variant="cyan" 
                      size="sm" 
                      onClick={handleAddBenefit}
                      style={{ borderRadius: '8px', fontWeight: 700, fontSize: '0.75rem' }}
                    >
                      <FontAwesomeIcon icon={faPlus} className="me-2" />
                      ADD NEW BENEFIT
                    </Button>
                  </div>
                  <Table responsive hover className="admin-table mb-0">
                    <thead>
                      <tr>
                        <th className="ps-4">Benefit</th>
                        <th>Plan</th>
                        <th>Status</th>
                        <th className="text-end pe-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {benefits.map((b) => (
                        <tr key={b.id}>
                          <td className="ps-4">
                            <div className="fw-600" style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>{b.benefitText}</div>
                          </td>
                          <td>
                            <Badge className={`admin-badge admin-badge-${b.planId}`}>
                              {b.planId.toUpperCase()}
                            </Badge>
                          </td>
                          <td>
                            <Badge className={`admin-badge ${b.isIncluded ? 'admin-badge-success' : 'admin-badge-danger'}`}>
                              {b.isIncluded ? 'Included' : 'Excluded'}
                            </Badge>
                          </td>
                          <td className="text-end pe-4">
                            <button className="admin-action-btn" onClick={() => handleBenefitEdit(b)}>
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button className="admin-action-btn btn-delete" onClick={() => handleDeleteBenefit(b.id)}>
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Tab>
              </Tabs>
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
          <Tabs defaultActiveKey="details" className="admin-tabs mb-4">
            <Tab eventKey="details" title="User Details">
              <Form className="mt-3">
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
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as "USER" | "ADMIN" })}
                  >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label className="text-muted small text-uppercase fw-bold">Subscription Plan</Form.Label>
                  <Form.Select
                    value={formData.subscriptionPlan}
                    onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value })}
                    className="bg-secondary border-secondary text-white py-2"
                    style={{ borderRadius: '10px' }}
                  >
                    <option value="free">Free</option>
                    <option value="basic">Basic</option>
                    <option value="pro">Pro</option>
                    <option value="elite">Elite</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mt-4">
                  <Form.Label className="text-muted small text-uppercase fw-bold">Default Theme</Form.Label>
                  <div className="d-flex gap-3">
                    <Form.Check 
                      type="radio"
                      label="Dark Mode"
                      name="theme"
                      id="theme-dark"
                      checked={formData.theme === 'dark'}
                      onChange={() => setFormData({ ...formData, theme: 'dark' })}
                      className="text-white"
                    />
                    <Form.Check 
                      type="radio"
                      label="Light Mode"
                      name="theme"
                      id="theme-light"
                      checked={formData.theme === 'light'}
                      onChange={() => setFormData({ ...formData, theme: 'light' })}
                      className="text-white"
                    />
                  </div>
                </Form.Group>
              </Form>
            </Tab>
            <Tab eventKey="benefits" title="Track Benefits">
              <div className="mt-3">
                {loadingBenefits ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-cyan" role="status"></div>
                  </div>
                ) : (
                  <div className="user-benefits-list">
                    {userBenefits.map((benefit) => (
                      <div key={benefit.benefitId} className="benefit-track-item p-3 mb-2 rounded border border-secondary bg-surface">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <div className="fw-bold text-white small text-uppercase">{benefit.benefitText}</div>
                          <Badge className={`admin-badge admin-badge-${benefit.planId}`}>{benefit.planId}</Badge>
                        </div>
                        <Row className="g-2">
                          <Col md={4}>
                            <Form.Label className="text-muted" style={{ fontSize: '0.65rem' }}>USED</Form.Label>
                            <Form.Control 
                              type="number" 
                              size="sm" 
                              value={benefit.usedCount}
                              onChange={(e) => {
                                const newBenefits = [...userBenefits];
                                const idx = newBenefits.findIndex(b => b.benefitId === benefit.benefitId);
                                newBenefits[idx].usedCount = parseInt(e.target.value) || 0;
                                setUserBenefits(newBenefits);
                                handleUpdateUserBenefit(newBenefits[idx]);
                              }}
                              className="bg-dark border-secondary text-white"
                            />
                          </Col>
                          <Col md={4}>
                            <Form.Label className="text-muted" style={{ fontSize: '0.65rem' }}>MAX</Form.Label>
                            <Form.Control 
                              type="number" 
                              size="sm" 
                              value={benefit.maxCount}
                              onChange={(e) => {
                                const newBenefits = [...userBenefits];
                                const idx = newBenefits.findIndex(b => b.benefitId === benefit.benefitId);
                                newBenefits[idx].maxCount = parseInt(e.target.value) || 0;
                                setUserBenefits(newBenefits);
                                handleUpdateUserBenefit(newBenefits[idx]);
                              }}
                              className="bg-dark border-secondary text-white"
                            />
                          </Col>
                          <Col md={4}>
                            <Form.Label className="text-muted" style={{ fontSize: '0.65rem' }}>EXPIRY</Form.Label>
                            <Form.Control 
                              type="date" 
                              size="sm" 
                              value={benefit.expiresAt ? benefit.expiresAt.split('T')[0] : ''}
                              onChange={(e) => {
                                const newBenefits = [...userBenefits];
                                const idx = newBenefits.findIndex(b => b.benefitId === benefit.benefitId);
                                newBenefits[idx].expiresAt = e.target.value || null;
                                setUserBenefits(newBenefits);
                                handleUpdateUserBenefit(newBenefits[idx]);
                              }}
                              className="bg-dark border-secondary text-white"
                            />
                          </Col>
                        </Row>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Tab>
          </Tabs>
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

      {/* Benefit Edit Modal */}
      <Modal
        show={showBenefitModal}
        onHide={() => setShowBenefitModal(false)}
        centered
        contentClassName="dash-card border-0"
        className="admin-modal"
      >
        <Modal.Header className="bg-transparent border-bottom border-secondary px-4 py-3">
          <Modal.Title className="text-white fs-5 fw-bold">
            <FontAwesomeIcon icon={editingBenefit ? faEdit : faPlus} className="text-cyan me-2" />
            {editingBenefit ? 'Edit Benefit' : 'Add New Benefit'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 py-4">
          <Form>
            <Form.Group className="mb-4">
              <Form.Label className="text-muted small text-uppercase fw-bold">Benefit Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. 24/7 Gym Access"
                value={benefitFormData.benefitText}
                onChange={(e) => setBenefitFormData({ ...benefitFormData, benefitText: e.target.value })}
                className="bg-secondary border-secondary text-white py-2"
                style={{ borderRadius: '10px' }}
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className="text-muted small text-uppercase fw-bold">Target Plan</Form.Label>
                  <Form.Select
                    value={benefitFormData.planId}
                    onChange={(e) => setBenefitFormData({ ...benefitFormData, planId: e.target.value })}
                    className="bg-secondary border-secondary text-white py-2"
                    style={{ borderRadius: '10px' }}
                  >
                    <option value="basic">Basic</option>
                    <option value="pro">Pro</option>
                    <option value="elite">Elite</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className="text-muted small text-uppercase fw-bold">Availability</Form.Label>
                  <Form.Check
                    type="switch"
                    label={benefitFormData.isIncluded ? "Included" : "Excluded"}
                    checked={benefitFormData.isIncluded}
                    onChange={(e) => setBenefitFormData({ ...benefitFormData, isIncluded: e.target.checked })}
                    className="text-white pt-2 custom-switch"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer className="bg-transparent border-top border-secondary px-4 py-3">
          <Button variant="link" className="text-muted text-decoration-none fw-bold me-auto" onClick={() => setShowBenefitModal(false)}>
            Cancel
          </Button>
          <Button variant="cyan" className="px-4 py-2 fw-bold" style={{ borderRadius: '10px' }} onClick={handleSaveBenefit}>
            <FontAwesomeIcon icon={faSave} className="me-2" />
            Save Benefit
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
