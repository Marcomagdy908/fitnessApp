import { Container, Card, Form, Button } from "react-bootstrap";

export default function TrainerSettings() {
  return (
    <Container fluid className="page-container">
      <h2 className="page-title">Settings</h2>

      <Card className="stat-card">
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control />
          </Form.Group>

          <Button>Save</Button>
        </Form>
      </Card>
    </Container>
  );
}
